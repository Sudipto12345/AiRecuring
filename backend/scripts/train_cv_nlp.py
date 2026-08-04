import os
import random
import spacy
from spacy.training.example import Example
from pathlib import Path

# A simple script to train a custom spaCy NER model for Resume parsing.
# In a real-world scenario, you would load a large open-source dataset 
# (e.g. from HuggingFace using the `datasets` library) such as "dataturks/resume_entities"
# and convert it to spaCy's training format.

MODEL_OUTPUT_DIR = Path(__file__).parent.parent / "models" / "cv_nlp_model"

# Example synthetic training data for CV entities
TRAIN_DATA = [
    ("Senior Software Engineer with 5 years of experience in Python and JavaScript.", {"entities": [(0, 24, "TITLE"), (30, 37, "EXPERIENCE"), (53, 59, "SKILL"), (64, 74, "SKILL")]}),
    ("I have a PhD in Computer Science and 10 years experience using React and Node.js.", {"entities": [(9, 12, "EDUCATION"), (37, 45, "EXPERIENCE"), (63, 68, "SKILL"), (73, 80, "SKILL")]}),
    ("Proficient in AWS, Docker, and CI/CD with 2 yrs experience.", {"entities": [(14, 17, "SKILL"), (19, 25, "SKILL"), (31, 36, "SKILL"), (42, 47, "EXPERIENCE")]}),
    ("Data Scientist with 3 years of experience. Skills: SQL, Machine Learning, TensorFlow.", {"entities": [(0, 14, "TITLE"), (20, 27, "EXPERIENCE"), (51, 54, "SKILL"), (56, 72, "SKILL"), (74, 84, "SKILL")]}),
    ("Graduated with a Bachelor's degree. 1 year experience in HTML, CSS.", {"entities": [(17, 34, "EDUCATION"), (36, 42, "EXPERIENCE"), (57, 61, "SKILL"), (63, 66, "SKILL")]})
]

def train_ner_model(output_dir: Path, iterations: int = 30):
    print("Initializing blank English spaCy model...")
    nlp = spacy.blank("en")
    
    # Add NER pipeline
    if "ner" not in nlp.pipe_names:
        ner = nlp.add_pipe("ner", last=True)
    else:
        ner = nlp.get_pipe("ner")
        
    # Add labels
    for _, annotations in TRAIN_DATA:
        for ent in annotations.get("entities"):
            ner.add_label(ent[2])
            
    # Train the model
    print(f"Training model for {iterations} iterations...")
    optimizer = nlp.begin_training()
    
    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != "ner"]
    with nlp.disable_pipes(*other_pipes):
        for itn in range(iterations):
            random.shuffle(TRAIN_DATA)
            losses = {}
            for text, annotations in TRAIN_DATA:
                doc = nlp.make_doc(text)
                example = Example.from_dict(doc, annotations)
                nlp.update([example], drop=0.3, sgd=optimizer, losses=losses)
            if itn % 5 == 0:
                print(f"Iteration {itn} Losses:", losses)
                
    # Save the model
    if not output_dir.exists():
        output_dir.mkdir(parents=True)
    nlp.to_disk(output_dir)
    print(f"Saved custom NLP model to {output_dir}")

def test_model(model_dir: Path):
    if not model_dir.exists():
        print("Model directory not found.")
        return
        
    print(f"Loading model from {model_dir}...")
    nlp = spacy.load(model_dir)
    
    test_text = "Experienced DevOps Engineer with 4 years experience in AWS, Kubernetes, and Python. Holds a Master's degree."
    doc = nlp(test_text)
    
    print("\nTest Text:", test_text)
    print("Extracted Entities:")
    for ent in doc.ents:
        print(f" - {ent.label_}: {ent.text}")

if __name__ == "__main__":
    train_ner_model(MODEL_OUTPUT_DIR)
    test_model(MODEL_OUTPUT_DIR)
