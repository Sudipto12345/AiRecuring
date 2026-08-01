# on-device face check (YuNet + SFace, no cloud)
from __future__ import annotations

import urllib.request
from pathlib import Path

import cv2
import numpy as np

MODELS_DIR = Path(__file__).resolve().parents[2] / "models"
DETECTOR_FILE = MODELS_DIR / "face_detection_yunet_2023mar.onnx"
RECOGNIZER_FILE = MODELS_DIR / "face_recognition_sface_2021dec.onnx"

DETECTOR_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
RECOGNIZER_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"

# SFace cosine similarity: >= 0.363 is treated as the same identity.
SAME_IDENTITY_COSINE = 0.36
MAX_FRAMES = 60

_detector: cv2.FaceDetectorYN | None = None
_recognizer: cv2.FaceRecognizerSF | None = None


def _ensure_models() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    for path, url in ((DETECTOR_FILE, DETECTOR_URL), (RECOGNIZER_FILE, RECOGNIZER_URL)):
        if not path.exists():
            urllib.request.urlretrieve(url, path)


def _models():
    global _detector, _recognizer
    if _detector is None or _recognizer is None:
        _ensure_models()
        _detector = cv2.FaceDetectorYN_create(str(DETECTOR_FILE), "", (320, 320), 0.7, 0.3, 5000)
        _recognizer = cv2.FaceRecognizerSF_create(str(RECOGNIZER_FILE), "")
    return _detector, _recognizer


def _l2(v: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(v)
    return v / norm if norm else v


def _detect(detector, frame):
    h, w = frame.shape[:2]
    detector.setInputSize((w, h))
    _, faces = detector.detect(frame)
    return faces if faces is not None else np.empty((0, 15), dtype=np.float32)


def embed_image(data: bytes) -> list[float] | None:
    """Return the L2-normalised embedding of the largest face in an image, or None."""
    detector, recognizer = _models()
    arr = np.frombuffer(data, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return None
    faces = _detect(detector, img)
    if len(faces) == 0:
        return None
    largest = max(faces, key=lambda f: f[2] * f[3])
    aligned = recognizer.alignCrop(img, largest)
    feat = recognizer.feature(aligned).flatten()
    return _l2(feat).astype(float).tolist()


class _Cluster:
    __slots__ = ("centroid", "count")

    def __init__(self, emb: np.ndarray):
        self.centroid = emb.copy()
        self.count = 1

    def add(self, emb: np.ndarray) -> None:
        self.centroid = _l2(self.centroid * self.count + emb)
        self.count += 1


def analyze_video(path: str, reference_embedding: list[float] | None = None) -> dict:
    detector, recognizer = _models()
    capture = cv2.VideoCapture(path)
    if not capture.isOpened():
        return empty_result()

    total = int(capture.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    step = max(1, total // MAX_FRAMES) if total else 5

    frames_total = with_face = multi_face = no_face = 0
    timeline: list[str] = []
    clusters: list[_Cluster] = []
    ref = _l2(np.array(reference_embedding, dtype=np.float32)) if reference_embedding else None
    ref_sims: list[float] = []

    index = 0
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        if index % step == 0:
            frames_total += 1
            faces = _detect(detector, frame)
            count = len(faces)
            if count == 0:
                no_face += 1
                timeline.append("no_face")
            else:
                if count == 1:
                    with_face += 1
                    timeline.append("focus")
                else:
                    multi_face += 1
                    timeline.append("multi")
                largest = max(faces, key=lambda f: f[2] * f[3])
                try:
                    aligned = recognizer.alignCrop(frame, largest)
                    emb = _l2(recognizer.feature(aligned).flatten())
                except cv2.error:
                    emb = None
                if emb is not None:
                    if ref is not None:
                        ref_sims.append(float(np.dot(ref, emb)))
                    best_i, best_sim = -1, -1.0
                    for i, c in enumerate(clusters):
                        sim = float(np.dot(c.centroid, emb))
                        if sim > best_sim:
                            best_sim, best_i = sim, i
                    if best_i >= 0 and best_sim >= SAME_IDENTITY_COSINE:
                        clusters[best_i].add(emb)
                    else:
                        clusters.append(_Cluster(emb))
            if frames_total >= MAX_FRAMES:
                break
        index += 1
    capture.release()

    if frames_total == 0:
        return empty_result()

    focus_score = round(with_face / frames_total * 100, 1)
    penalty = (multi_face * 1.5 + no_face) / frames_total * 100
    integrity_score = round(max(0.0, 100 - penalty), 1)

    embedded_frames = sum(c.count for c in clusters)
    min_support = max(2, round(0.15 * embedded_frames)) if embedded_frames else 1
    significant = [c for c in clusters if c.count >= min_support] or clusters
    distinct_identities = len(significant)
    primary = max(clusters, key=lambda c: c.count) if clusters else None
    identity_consistency = round(primary.count / embedded_frames * 100, 1) if primary and embedded_frames else 0.0

    identity_verified: bool | None = None
    identity_match_score = 0.0
    if ref is not None:
        identity_match_score = round(max(ref_sims) * 100, 1) if ref_sims else 0.0
        identity_verified = identity_match_score >= SAME_IDENTITY_COSINE * 100

    events: list[dict] = []
    if multi_face:
        events.append({"type": "Multiple Faces Detected", "count": multi_face, "severity": "high"})
    if distinct_identities > 1:
        events.append({"type": "Different People Detected", "count": distinct_identities, "severity": "high"})
    if no_face:
        events.append({"type": "No Face Detected", "count": no_face, "severity": "medium"})
    if identity_verified is False:
        events.append({"type": "Identity Not Verified", "count": 1, "severity": "high"})

    risk_level = "low"
    if integrity_score < 60 or distinct_identities > 1 or identity_verified is False:
        risk_level = "high"
    elif integrity_score < 82 or identity_consistency < 85:
        risk_level = "medium"

    return {
        "frames_total": frames_total,
        "frames_with_face": with_face,
        "frames_multi_face": multi_face,
        "frames_no_face": no_face,
        "face_detected": with_face > 0 or multi_face > 0,
        "focus_score": focus_score,
        "integrity_score": integrity_score,
        "risk_level": risk_level,
        "identity_verified": identity_verified,
        "identity_match_score": identity_match_score,
        "identity_consistency": identity_consistency,
        "distinct_identities": distinct_identities,
        "events": events,
        "timeline": timeline[:60],
    }


def empty_result() -> dict:
    return {
        "frames_total": 0,
        "frames_with_face": 0,
        "frames_multi_face": 0,
        "frames_no_face": 0,
        "face_detected": False,
        "focus_score": 0.0,
        "integrity_score": 0.0,
        "risk_level": "low",
        "identity_verified": None,
        "identity_match_score": 0.0,
        "identity_consistency": 0.0,
        "distinct_identities": 0,
        "events": [],
        "timeline": [],
    }
