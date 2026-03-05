"""
Test script for House Price Prediction API
"""

import requests
import json

# API base URL
BASE_URL = 'http://localhost:5000'

def test_health():
    """Test health endpoint"""
    print("\n" + "="*80)
    print("Testing /health endpoint")
    print("="*80)
    
    response = requests.get(f'{BASE_URL}/health')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    

def test_model_info():
    """Test model info endpoint"""
    print("\n" + "="*80)
    print("Testing /model_info endpoint")
    print("="*80)
    
    response = requests.get(f'{BASE_URL}/model_info')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_single_prediction():
    """Test single prediction"""
    print("\n" + "="*80)
    print("Testing /predict endpoint (Single Prediction)")
    print("="*80)
    
    # Luxury Bay Area home
    data = {
        'MedInc': 8.5,
        'HouseAge': 15,
        'AveRooms': 7.5,
        'AveOccup': 2.5,
        'Population': 1200,
        'Latitude': 37.88,
        'Longitude': -122.23
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    response = requests.post(f'{BASE_URL}/predict', json=data)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_batch_prediction():
    """Test batch prediction"""
    print("\n" + "="*80)
    print("Testing /batch_predict endpoint (Batch Prediction)")
    print("="*80)
    
    data = {
        'houses': [
            {
                'MedInc': 8.5,
                'HouseAge': 15,
                'AveRooms': 7.5,
                'AveOccup': 2.5,
                'Population': 1200,
                'Latitude': 37.88,
                'Longitude': -122.23
            },
            {
                'MedInc': 3.2,
                'HouseAge': 35,
                'AveRooms': 4.2,
                'AveOccup': 3.8,
                'Population': 2500,
                'Latitude': 34.05,
                'Longitude': -118.24
            },
            {
                'MedInc': 5.0,
                'HouseAge': 25,
                'AveRooms': 6.0,
                'AveOccup': 2.8,
                'Population': 1800,
                'Latitude': 36.50,
                'Longitude': -121.50
            }
        ]
    }
    
    print(f"Input: {len(data['houses'])} houses")
    
    response = requests.post(f'{BASE_URL}/batch_predict', json=data)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_invalid_input():
    """Test invalid input handling"""
    print("\n" + "="*80)
    print("Testing Invalid Input Handling")
    print("="*80)
    
    # Missing required field
    data = {
        'MedInc': 8.5,
        'HouseAge': 15
        # Missing other required fields
    }
    
    print(f"Input (missing fields): {json.dumps(data, indent=2)}")
    
    response = requests.post(f'{BASE_URL}/predict', json=data)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def run_all_tests():
    """Run all API tests"""
    print("\n" + "="*80)
    print("HOUSE PRICE PREDICTION API - TEST SUITE")
    print("="*80)
    
    try:
        test_health()
        test_model_info()
        test_single_prediction()
        test_batch_prediction()
        test_invalid_input()
        
        print("\n" + "="*80)
        print("✓ All tests completed successfully!")
        print("="*80)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to API")
        print("Make sure the Flask app is running: python app.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == '__main__':
    run_all_tests()
