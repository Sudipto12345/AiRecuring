"""
AIRecruit API Contract Tests — Health, Security, Auth.
Run: pytest backend/tests/test_health.py -v
"""
import httpx

BASE = 'http://localhost:8000'


def test_health_endpoint():
    r = httpx.get(f'{BASE}/api/health')
    assert r.status_code == 200
    data = r.json()
    assert data['status'] == 'ok'
    assert 'security' in data


def test_security_headers():
    r = httpx.get(f'{BASE}/api/health')
    assert 'x-content-type-options' in r.headers
    assert 'x-frame-options' in r.headers
    assert r.headers.get('x-frame-options') == 'DENY'


def test_auth_required_routes():
    """Verify protected routes return 401/403 without token."""
    protected = ['/api/candidates', '/api/jobs', '/api/interviews', '/api/analytics']
    for path in protected:
        r = httpx.get(f'{BASE}{path}')
        assert r.status_code in (401, 403, 422), f'{path} should require auth, got {r.status_code}'


def test_no_nosql_injection():
    """NoSQL injection attempt should fail gracefully."""
    r = httpx.post(f'{BASE}/api/auth/login', json={'email': {'$gt': ''}, 'password': 'test'})
    assert r.status_code in (400, 422, 401), f'NoSQL injection should be rejected, got {r.status_code}'


def test_login_with_wrong_credentials():
    r = httpx.post(f'{BASE}/api/auth/login', json={'email': 'nobody@example.com', 'password': 'wrong'})
    assert r.status_code in (401, 403, 422)


def test_login_with_valid_credentials():
    r = httpx.post(f'{BASE}/api/auth/login', json={'email': 'owner@airecruit.io', 'password': 'owner12345'})
    assert r.status_code == 200
    data = r.json()
    assert 'access_token' in data or 'token' in data
