from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

def test_api_root():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["message"] == "TimeBank API is running"
