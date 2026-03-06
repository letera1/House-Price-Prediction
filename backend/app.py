"""
Modern Flask REST API for House Price Prediction
"""
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import logging
import sys
from pydantic import BaseModel, Field, ValidationError

# Ensure local modules can be imported
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

try:
    from preprocessing import FeatureEngineer
except ImportError:
    pass

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Consider restricting origins later

# Input Validation Model (Pydantic V2 style)
class HouseFeatures(BaseModel):
    MedInc: float = Field(..., ge=0, description="Median Income in block group")
    HouseAge: float = Field(..., ge=0, description="Median House Age in block group")
    AveRooms: float = Field(..., ge=0, description="Average number of rooms per household")
    AveOccup: float = Field(..., gt=0, description="Average number of household members")
    Population: float = Field(..., ge=0, description="Block group population")
    AveBedrms: float = Field(default=1.0, ge=0, description="Average number of bedrooms (optional)")
    Latitude: float = Field(..., ge=32, le=42, description="Block group latitude")
    Longitude: float = Field(..., ge=-125, le=-114, description="Block group longitude")

# Global variables
pipeline = None
metadata = None

def load_artifacts():
    global pipeline, metadata
    try:
        models_dir = BASE_DIR / 'models'
        pipeline_path = models_dir / 'final_pipeline.pkl'
        metadata_path = models_dir / 'metadata.pkl'
        
        if pipeline_path.exists():
            pipeline = joblib.load(pipeline_path)
            logger.info(f"✓ Pipeline loaded from {pipeline_path}")
        else:
            logger.warning(f"Pipeline not found at {pipeline_path}. Please run train_model.py first.")
            
        if metadata_path.exists():
            metadata = joblib.load(metadata_path)
            logger.info(f"✓ Metadata loaded")
    except Exception as e:
        logger.error(f"Failed to load artifacts: {e}", exc_info=True)

load_artifacts()

@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({'error': 'Validation Error', 'details': e.errors()}), 422

@app.errorhandler(400)
def bad_request(e):
    return jsonify({'error': 'Bad Request', 'message': str(e)}), 400

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal Server Error', 'message': 'An unexpected error occurred'}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    status = 'healthy' if pipeline is not None else 'degraded'
    return jsonify({
        'status': status,
        'model_loaded': pipeline is not None,
        'metadata': metadata.get('metrics', {}) if metadata else {}
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Prediction endpoint with validation"""
    if pipeline is None:
        return jsonify({'error': 'Model not initialized'}), 503
    
    try:
        # Pydantic validation
        # Pydantic V2 uses model_validate for dicts, or just init with kwargs
        # Flask request.json returns a dict
        input_data = HouseFeatures(**request.get_json())
        
        # Convert to DataFrame with correct column order
        # model_dump() is V2, dict() is V1
        data_dict = input_data.model_dump()
        
        # Ensure correct feature order from metadata
        feature_order = metadata.get('input_features', [
            'MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 
            'Population', 'AveOccup', 'Latitude', 'Longitude'
        ])
        input_df = pd.DataFrame([data_dict])[feature_order]
        
        # Predict
        prediction = pipeline.predict(input_df)[0]
        
        return jsonify({
            'prediction_value': float(prediction),
            'currency': 'USD',
            'scale': '100,000s',
            'input_received': data_dict
        })
        
    except ValidationError as e:
        return jsonify({'error': 'Validation Error', 'details': e.errors()}), 422
    except TypeError as e:
         return jsonify({'error': 'Validation Error', 'details': str(e)}), 422
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({'error': 'Prediction failed', 'details': str(e)}), 500

if __name__ == '__main__':
    # Only for local development
    # Using port 8080 to avoid Windows port 5000 restrictions
    app.run(host='0.0.0.0', port=8080)
