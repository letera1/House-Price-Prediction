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

# Ensure local modules can be imported
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

try:
    from preprocessing import FeatureEngineer
except ImportError:
    # This might happen if run from a different directory context
    pass

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for artifacts
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

# Load on startup
load_artifacts()

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
    """Prediction endpoint"""
    if pipeline is None:
        return jsonify({'error': 'Model not initialized. Please run training script first.'}), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Convert dictionary to DataFrame
        # The pipeline handles feature engineering and validation implicitly
        input_df = pd.DataFrame([data])
        
        # Generate prediction
        prediction = pipeline.predict(input_df)
        
        # Return result
        return jsonify({
            'prediction_value': float(prediction[0]),
            'currency': 'USD',
            'scale': '100,000s',
            'input_received': data
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
