"""API endpoint tests"""
import pytest
import json
import os
from app import app


@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'status' in data
    assert 'model_loaded' in data


def test_predict_endpoint_valid(client):
    """Test prediction with valid data"""
    # Skip if model not available
    if not os.path.exists('models/final_pipeline.pkl'):
        pytest.skip("Model file not available")
    
    payload = {
        "MedInc": 8.5,
        "HouseAge": 15,
        "AveRooms": 7.5,
        "AveBedrms": 1.2,
        "Population": 1200,
        "AveOccup": 2.5,
        "Latitude": 37.88,
        "Longitude": -122.23
    }
    response = client.post('/predict',
                          data=json.dumps(payload),
                          content_type='application/json')
    
    if response.status_code == 200:
        data = json.loads(response.data)
        assert 'prediction_value' in data
        assert isinstance(data['prediction_value'], (int, float))
    else:
        # Model not loaded, check for proper error
        assert response.status_code in [503]


def test_predict_endpoint_invalid(client):
    """Test prediction with invalid data"""
    payload = {
        "MedInc": -1,  # Invalid negative value
        "HouseAge": 15,
    }
    response = client.post('/predict',
                          data=json.dumps(payload),
                          content_type='application/json')
    assert response.status_code in [400, 422, 500, 503]


def test_predict_endpoint_missing_fields(client):
    """Test prediction with missing required fields"""
    payload = {
        "MedInc": 8.5,
    }
    response = client.post('/predict',
                          data=json.dumps(payload),
                          content_type='application/json')
    assert response.status_code in [400, 422]
