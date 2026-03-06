"""
Secure Flask REST API for House Price Prediction
"""
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import joblib
import pandas as pd
import logging
import sys
import os
import secrets
import hashlib
import hmac
from datetime import datetime
from functools import wraps
from pydantic import BaseModel, Field, ValidationError

# Ensure local modules can be imported
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Configure secure logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Security configurations
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
app.config['JSON_SORT_KEYS'] = False

# CORS with restricted origins
ALLOWED_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={
    r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type", "X-API-Key"],
        "max_age": 3600
    }
})

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# API Key management
API_KEYS = {}
def load_api_keys():
    global API_KEYS
    env_keys = os.getenv('API_KEYS', '')
    if env_keys:
        for key in env_keys.split(','):
            if key:
                key_hash = hashlib.sha256(key.encode()).hexdigest()
                API_KEYS[key_hash] = {'created': datetime.now(), 'requests': 0}
    
    # Development key
    if not API_KEYS:
        dev_key = 'dev_' + secrets.token_urlsafe(32)
        key_hash = hashlib.sha256(dev_key.encode()).hexdigest()
        API_KEYS[key_hash] = {'created': datetime.now(), 'requests': 0}
        logger.warning(f"Dev API Key: {dev_key}")

load_api_keys()

# Input Validation
class HouseFeatures(BaseModel):
    MedInc: float = Field(..., ge=0, le=15)
    HouseAge: float = Field(..., ge=0, le=100)
    AveRooms: float = Field(..., ge=0, le=50)
    AveOccup: float = Field(..., gt=0, le=20)
    Population: float = Field(..., ge=0, le=50000)
    AveBedrms: float = Field(default=1.0, ge=0, le=20)
    Latitude: float = Field(..., ge=32, le=42)
    Longitude: float = Field(..., ge=-125, le=-114)

# Load model
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
            logger.info("Pipeline loaded")
        if metadata_path.exists():
            metadata = joblib.load(metadata_path)
    except Exception as e:
        logger.error(f"Failed to load: {e}")

load_artifacts()

# Security decorator
def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return jsonify({'error': 'API key required'}), 401
        
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        if key_hash not in API_KEYS:
            return jsonify({'error': 'Invalid API key'}), 401
        
        API_KEYS[key_hash]['requests'] += 1
        return f(*args, **kwargs)
    return decorated

# Security headers
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000'
    return response

@app.route('/health', methods=['GET'])
@limiter.limit("10 per minute")
def health():
    return jsonify({
        'status': 'healthy' if pipeline else 'degraded',
        'model_loaded': pipeline is not None
    })

@app.route('/api/predict', methods=['POST'])
@limiter.limit("30 per minute")
@require_api_key
def predict():
    if not pipeline:
        return jsonify({'error': 'Model not initialized'}), 503
    
    try:
        if not request.is_json:
            return jsonify({'error': 'JSON required'}), 400
        
        input_data = HouseFeatures(**request.get_json())
        data_dict = input_data.model_dump()
        
        feature_order = metadata.get('input_features', [
            'MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 
            'Population', 'AveOccup', 'Latitude', 'Longitude'
        ])
        input_df = pd.DataFrame([data_dict])[feature_order]
        
        prediction = pipeline.predict(input_df)[0]
        
        return jsonify({
            'prediction_value': float(prediction),
            'currency': 'USD',
            'scale': '100,000s'
        })
        
    except ValidationError as e:
        return jsonify({'error': 'Validation Error', 'details': e.errors()}), 422
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({'error': 'Prediction failed'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 8080)))
