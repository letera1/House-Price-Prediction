"""
Modernized training script for House Price Prediction.
Trains a pipeline with feature engineering, scaling, and regression.
"""

from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error
import joblib
import logging

try:
    from preprocessing import FeatureEngineer
except ImportError:
    # If not found (e.g., when running interactively incorrectly), try importing from current dir
    import sys
    sys.path.append(str(Path(__file__).parent))
    from preprocessing import FeatureEngineer

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    try:
        # Setup paths
        BASE_DIR = Path(__file__).resolve().parent
        DATA_FILE = BASE_DIR / 'california_housing_data.csv'
        MODELS_DIR = BASE_DIR / 'models'
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        
        logger.info("Starting model training pipeline...")

        # 1. Load Data
        if not DATA_FILE.exists():
            logger.error(f"Data file not found at {DATA_FILE}")
            return

        logger.info(f"Loading data from {DATA_FILE}...")
        df = pd.read_csv(DATA_FILE)
        logger.info(f"Loaded {len(df):,} samples.")

        # 2. Prepare X and y
        target_col = 'MedHouseVal'
        if target_col not in df.columns:
            logger.error(f"Target column '{target_col}' not found in dataset.")
            return

        # Explicitly drop target column
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        # Save input features reference
        input_features = X.columns.tolist()

        # 3. Train-Test Split
        logger.info("Splitting data...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # 4. Build Pipeline
        # FeatureEngineer -> StandardScaler -> RandomForest
        pipeline = Pipeline([
            ('engineer', FeatureEngineer(drop_features=['AveBedrms'])),
            ('scaler', StandardScaler()),
            ('regressor', RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1))
        ])

        # 5. Train Model
        logger.info("Training pipeline...")
        pipeline.fit(X_train, y_train)

        # 6. Evaluate
        logger.info("Evaluating model...")
        y_pred = pipeline.predict(X_test)
        r2 = r2_score(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        
        logger.info(f"Model Performance:")
        logger.info(f"  R2 Score: {r2:.4f}")
        logger.info(f"  MSE: {mse:.4f}")

        # 7. Save Artifacts
        logger.info("Saving artifacts...")
        
        # Save the entire pipeline (includes preprocessing and model)
        joblib.dump(pipeline, MODELS_DIR / 'final_pipeline.pkl')
        
        # Save metadata
        metadata = {
            'input_features': input_features,
            'metrics': {'r2': r2, 'mse': mse},
            'trained_at': pd.Timestamp.now().isoformat()
        }
        joblib.dump(metadata, MODELS_DIR / 'metadata.pkl')
        
        logger.info(f"✓ Training complete. Pipeline saved to {MODELS_DIR}")
        
    except Exception as e:
        logger.error(f"An error occurred during training: {e}", exc_info=True)

if __name__ == "__main__":
    main()
