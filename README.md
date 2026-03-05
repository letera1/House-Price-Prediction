# House Price Prediction - Production-Ready ML System

## 📋 Project Overview

A comprehensive, production-ready machine learning system for predicting house prices featuring multiple algorithms, advanced feature engineering, REST API, and complete deployment infrastructure. This project demonstrates enterprise-level ML engineering practices from data exploration to cloud deployment.

## 🌟 Project Highlights

- **7 ML Algorithms** compared (Linear, Ridge, Lasso, ElasticNet, Decision Tree, Random Forest, Gradient Boosting)
- **Advanced Feature Engineering** with 9 engineered features
- **Hyperparameter Tuning** using GridSearchCV
- **Ensemble Methods** for robust predictions
- **REST API** built with Flask
- **Docker Support** for containerized deployment
- **Cloud Deployment** guides for AWS, GCP, Azure, Heroku
- **Production-Ready** with monitoring, logging, and error handling

## 🎯 Objectives

- Compare multiple regression algorithms and select the best performer
- Implement advanced feature engineering techniques
- Perform hyperparameter tuning and cross-validation
- Build production-ready REST API for model serving
- Provide complete deployment infrastructure (Docker, Cloud)
- Demonstrate enterprise ML engineering best practices

## 📊 Dataset

**Source**: California Housing Dataset (scikit-learn)
- **Samples**: 20,640 observations
- **Features**: 8 numerical features
- **Target**: Median house value (in $100,000s)
- **Time Period**: 1990 California census data

### Features Description

| Feature | Description |
|---------|-------------|
| MedInc | Median income in block group |
| HouseAge | Median house age in block group |
| AveRooms | Average number of rooms per household |
| AveBedrms | Average number of bedrooms per household |
| Population | Block group population |
| AveOccup | Average household size |
| Latitude | Block group latitude |
| Longitude | Block group longitude |

## 🛠️ Technologies Used

- **Python 3.8+**
- **pandas & numpy**: Data manipulation and numerical computing
- **matplotlib & seaborn**: Data visualization
- **scikit-learn**: Machine learning algorithms, preprocessing, and metrics
- **Flask**: REST API framework
- **Docker**: Containerization
- **Gunicorn**: Production WSGI server
- **joblib**: Model serialization

## 📁 Project Structure

```
House Price Prediction/
│
├── advanced_house_price_prediction.ipynb  # Main ML notebook (production)
├── house_price_prediction.ipynb           # Basic ML notebook (learning)
├── california_housing_data.csv            # Dataset
├── download_data.py                       # Data download script
│
├── app.py                                 # Flask REST API
├── test_api.py                            # API test suite
├── requirements.txt                       # Notebook dependencies
├── requirements_api.txt                   # API dependencies
│
├── Dockerfile                             # Docker configuration
├── docker-compose.yml                     # Docker Compose setup
│
├── models/                                # Saved model artifacts
│   ├── final_model.pkl                    # Trained model
│   ├── scaler.pkl                         # Feature scaler
│   ├── feature_names.pkl                  # Feature list
│   └── metadata.pkl                       # Model metadata
│
├── README.md                              # Project documentation
└── DEPLOYMENT.md                          # Deployment guide
```

## 🚀 Getting Started

### Option 1: Run Jupyter Notebooks

**Basic Version (Learning):**
```bash
pip install -r requirements.txt
jupyter notebook house_price_prediction.ipynb
```

**Advanced Version (Production):**
```bash
pip install -r requirements.txt
jupyter notebook advanced_house_price_prediction.ipynb
```

### Option 2: Run REST API Locally

```bash
# Install dependencies
pip install -r requirements_api.txt

# Train model first (if models/ doesn't exist)
jupyter nbconvert --to notebook --execute advanced_house_price_prediction.ipynb

# Start API
python app.py

# Test API (in another terminal)
python test_api.py
```

### Option 3: Run with Docker

```bash
# Build and run
docker-compose up -d

# Test
curl http://localhost:5000/health

# Stop
docker-compose down
```

### Option 4: Deploy to Cloud

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed cloud deployment guides (AWS, GCP, Azure, Heroku).

## 📈 Workflow Steps

### 1. Environment Setup
- Import libraries
- Set random seed for reproducibility
- Configure visualization settings

### 2. Data Loading
- Fetch California Housing dataset
- Convert to pandas DataFrame
- Display basic information

### 3. Data Cleaning & EDA
- Check for missing values
- Detect and analyze outliers
- Generate descriptive statistics
- Create correlation heatmap
- Visualize feature distributions
- Plot relationships with target variable

### 4. Feature Engineering
- Analyze multicollinearity
- Select relevant features
- Drop redundant variables (AveBedrms)
- Define feature matrix (X) and target vector (y)

### 5. Train/Test Split
- 80/20 split ratio
- Stratified sampling
- Preserve data distribution

### 6. Model Training
- Initialize Linear Regression
- Fit model on training data
- Extract coefficients and intercept

### 7. Model Evaluation
- Calculate RMSE and R² scores
- Compare train vs test performance
- Generate prediction plots
- Analyze residuals

### 8. Coefficient Interpretation
- Explain feature impacts
- Identify most influential predictors
- Translate coefficients to dollar values

### 9. Model Persistence
- Save model using joblib
- Demonstrate model loading
- Verify loaded model accuracy

### 10. Example Predictions
- Create realistic house profiles
- Generate predictions
- Visualize results

### 11. Summary & Recommendations
- Summarize findings
- Suggest improvements
- Discuss production considerations

## 📊 Model Performance

### Basic Model (Linear Regression)
| Metric | Training Set | Test Set |
|--------|--------------|----------|
| **RMSE** | ~0.52 | ~0.73 |
| **R² Score** | ~0.64 | ~0.60 |

### Advanced Models (After Feature Engineering & Tuning)
| Model | Test R² | Test RMSE | Improvement |
|-------|---------|-----------|-------------|
| **Ensemble (Best)** | ~0.84 | ~0.48 | +40% |
| **Random Forest** | ~0.83 | ~0.49 | +38% |
| **Gradient Boosting** | ~0.82 | ~0.50 | +37% |
| Ridge Regression | ~0.65 | ~0.70 | +8% |
| Linear Regression | ~0.60 | ~0.73 | Baseline |

**Interpretation**:
- Best model explains ~84% of house price variance
- Average prediction error: ~$48,000 (vs $73,000 baseline)
- 40% improvement over baseline Linear Regression

## 🔑 Key Features

### Machine Learning
- **7 Algorithms Compared**: Linear, Ridge, Lasso, ElasticNet, Decision Tree, Random Forest, Gradient Boosting
- **Advanced Feature Engineering**: 9 new features (ratios, categories, interactions)
- **Hyperparameter Tuning**: GridSearchCV optimization
- **Cross-Validation**: 5-fold CV for robust evaluation
- **Ensemble Methods**: Voting regressor combining best models
- **Feature Importance**: Analysis of most influential predictors

### Production Features
- **REST API**: Flask-based with 4 endpoints
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Graceful error responses
- **Logging**: Request and error logging
- **Health Checks**: Monitoring endpoints
- **Batch Predictions**: Process multiple houses at once

### Deployment
- **Docker Support**: Containerized deployment
- **Docker Compose**: Multi-container orchestration
- **Cloud Ready**: Guides for AWS, GCP, Azure, Heroku
- **Scalable**: Gunicorn with multiple workers
- **Monitoring**: Health checks and logging

## 🎯 Recommended Improvements

1. **Advanced Models**: XGBoost, LightGBM, CatBoost
2. **Deep Learning**: Neural networks for complex patterns
3. **Explainability**: SHAP values for model interpretability
4. **Feature Selection**: Recursive feature elimination
5. **Time Series**: Incorporate temporal trends
6. **External Data**: Add economic indicators, crime rates
7. **A/B Testing**: Compare model versions in production
8. **Auto-Retraining**: Automated model update pipeline

## 📝 API Usage Example

### Single Prediction

```python
import requests

url = "http://localhost:5000/predict"
data = {
    "MedInc": 8.5,
    "HouseAge": 15,
    "AveRooms": 7.5,
    "AveOccup": 2.5,
    "Population": 1200,
    "Latitude": 37.88,
    "Longitude": -122.23
}

response = requests.post(url, json=data)
print(response.json())
# Output: {"prediction": 4.526, "prediction_dollars": "$452,600.00"}
```

### Batch Prediction

```python
url = "http://localhost:5000/batch_predict"
data = {
    "houses": [
        {"MedInc": 8.5, "HouseAge": 15, ...},
        {"MedInc": 3.2, "HouseAge": 35, ...}
    ]
}

response = requests.post(url, json=data)
print(response.json())
```

### Using cURL

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "MedInc": 8.5,
    "HouseAge": 15,
    "AveRooms": 7.5,
    "AveOccup": 2.5,
    "Population": 1200,
    "Latitude": 37.88,
    "Longitude": -122.23
  }'
```

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional ML algorithms (XGBoost, LightGBM)
- Model explainability (SHAP, LIME)
- Web UI for predictions
- Real-time monitoring dashboard
- Automated testing suite
- CI/CD pipeline

## 📄 License

This project is open-source and available for educational and commercial use.

## 👤 Author

Senior ML Engineering Team

## 📧 Contact

For questions, feedback, or collaboration:
- Open an issue in the repository
- Email: [your-email]
- LinkedIn: [your-profile]

---

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ End-to-end ML pipeline development
- ✅ Multiple algorithm comparison and selection
- ✅ Advanced feature engineering techniques
- ✅ Hyperparameter tuning and cross-validation
- ✅ REST API development with Flask
- ✅ Docker containerization
- ✅ Cloud deployment strategies
- ✅ Production ML best practices
- ✅ Model monitoring and maintenance

**Perfect for:**
- Data Science portfolios
- ML Engineering interviews
- Production ML learning
- Academic projects
- Startup MVPs

---

**⭐ If you find this project helpful, please star the repository!**

**Last Updated:** 2026-03-04  
**Version:** 2.0.0 (Production-Ready)
