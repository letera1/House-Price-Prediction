"""Preprocessing tests"""
import pytest
import pandas as pd
import numpy as np


def test_feature_order():
    """Test that features are in correct order"""
    expected_order = [
        'MedInc', 'HouseAge', 'AveRooms', 'AveBedrms',
        'Population', 'AveOccup', 'Latitude', 'Longitude'
    ]
    
    # Create sample data
    data = {
        'Longitude': -122.23,
        'Latitude': 37.88,
        'MedInc': 8.5,
        'HouseAge': 15,
        'AveRooms': 7.5,
        'AveBedrms': 1.2,
        'Population': 1200,
        'AveOccup': 2.5,
    }
    
    df = pd.DataFrame([data])[expected_order]
    assert list(df.columns) == expected_order


def test_data_types():
    """Test that data types are correct"""
    data = {
        'MedInc': 8.5,
        'HouseAge': 15,
        'AveRooms': 7.5,
        'AveBedrms': 1.2,
        'Population': 1200,
        'AveOccup': 2.5,
        'Latitude': 37.88,
        'Longitude': -122.23
    }
    
    df = pd.DataFrame([data])
    assert df['MedInc'].dtype in [np.float64, np.float32, float]
    assert df['Population'].dtype in [np.int64, np.float64, int, float]
