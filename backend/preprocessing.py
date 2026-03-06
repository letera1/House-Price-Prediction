import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin

class FeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Custom transformer for feature engineering on California Housing dataset.
    """
    def __init__(self, drop_features=None):
        if drop_features is None:
            self.drop_features = ['AveBedrms']
        else:
            self.drop_features = drop_features

    def fit(self, X, y=None):
        return self

    def transform(self, X_in):
        # Handle input types
        if isinstance(X_in, pd.DataFrame):
            X = X_in.copy()
        elif isinstance(X_in, dict):
             X = pd.DataFrame([X_in])
        else:
            X = pd.DataFrame(X_in)
        
        # 1. Ratio features
        # RoomsPerPerson
        if 'AveOccup' in X.columns and 'AveRooms' in X.columns:
            X['RoomsPerPerson'] = X['AveRooms'] / X['AveOccup']
            
        # PopulationPerHousehold
        if 'Population' in X.columns and 'AveOccup' in X.columns:
            X['PopulationPerHousehold'] = X['Population'] / X['AveOccup']
            
        # BedroomsRatio (AveBedrms usually dropped after calculation)
        if 'AveRooms' in X.columns:
            # Look for AveBedrms, default to 1.0 if missing (matching previous logic)
            ave_bedrms = X['AveBedrms'] if 'AveBedrms' in X.columns else 1.0
            X['BedroomsRatio'] = ave_bedrms / X['AveRooms']

        # 2. Categorical / Binning features
        if 'MedInc' in X.columns:
            X['IncomeCategory'] = pd.cut(X['MedInc'], 
                                       bins=[-np.inf, 2.5, 4.5, 6, np.inf], 
                                       labels=[1, 2, 3, 4]).astype(int)
            
        if 'HouseAge' in X.columns:
            X['AgeCategory'] = pd.cut(X['HouseAge'], 
                                    bins=[-np.inf, 10, 25, 40, np.inf], 
                                    labels=[1, 2, 3, 4]).astype(int)
        
        # 3. Geospatial features
        if 'Latitude' in X.columns and 'Longitude' in X.columns:
            X['DistanceFromCenter'] = np.sqrt((X['Latitude'] - 36.7783)**2 + (X['Longitude'] + 119.4179)**2)
            X['CoastalProximity'] = (X['Longitude'] > -121).astype(int)
            
        # 4. Interaction features
        if 'MedInc' in X.columns and 'AveRooms' in X.columns:
             X['IncomeRoomsInteraction'] = X['MedInc'] * X['AveRooms']
             
        if 'MedInc' in X.columns and 'HouseAge' in X.columns:
             X['IncomeAgeInteraction'] = X['MedInc'] * X['HouseAge']

        # Drop columns configured to be dropped
        if self.drop_features:
            cols_to_remove = [col for col in self.drop_features if col in X.columns]
            if cols_to_remove:
                X = X.drop(columns=cols_to_remove)
            
        return X
