'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface FormData {
  MedInc: string;
  HouseAge: string;
  AveRooms: string;
  AveBedrms: string;
  Population: string;
  AveOccup: string;
  Latitude: string;
  Longitude: string;
}

interface PredictionResult {
  prediction_value: number;
  currency: string;
  scale: string;
}

export default function Home() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    MedInc: '',
    HouseAge: '',
    AveRooms: '',
    AveBedrms: '1.0',
    Population: '',
    AveOccup: '',
    Latitude: '',
    Longitude: '',
  });

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      setApiStatus(data.status === 'healthy' ? 'healthy' : 'error');
    } catch {
      setApiStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const payload = {
      MedInc: parseFloat(formData.MedInc),
      HouseAge: parseFloat(formData.HouseAge),
      AveRooms: parseFloat(formData.AveRooms),
      AveBedrms: parseFloat(formData.AveBedrms),
      Population: parseFloat(formData.Population),
      AveOccup: parseFloat(formData.AveOccup),
      Latitude: parseFloat(formData.Latitude),
      Longitude: parseFloat(formData.Longitude),
    };

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      setError('Network error. Make sure the API is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🏠 California House Price Predictor</h1>
        <p className="subtitle">Predict house prices based on location and features</p>
      </header>

      <div className="status">
        <span className={`status-indicator ${apiStatus === 'healthy' ? 'healthy' : apiStatus === 'error' ? 'error' : ''}`}></span>
        <span>
          {apiStatus === 'checking' && 'Checking API...'}
          {apiStatus === 'healthy' && 'API Connected'}
          {apiStatus === 'error' && 'API Offline - Please start the backend'}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="MedInc">Median Income</label>
            <input
              type="number"
              id="MedInc"
              name="MedInc"
              step="0.01"
              min="0"
              required
              value={formData.MedInc}
              onChange={handleChange}
            />
            <small>Block group median income</small>
          </div>

          <div className="form-group">
            <label htmlFor="HouseAge">House Age</label>
            <input
              type="number"
              id="HouseAge"
              name="HouseAge"
              step="1"
              min="0"
              required
              value={formData.HouseAge}
              onChange={handleChange}
            />
            <small>Median house age (years)</small>
          </div>

          <div className="form-group">
            <label htmlFor="AveRooms">Average Rooms</label>
            <input
              type="number"
              id="AveRooms"
              name="AveRooms"
              step="0.1"
              min="0"
              required
              value={formData.AveRooms}
              onChange={handleChange}
            />
            <small>Avg rooms per household</small>
          </div>

          <div className="form-group">
            <label htmlFor="AveBedrms">Average Bedrooms</label>
            <input
              type="number"
              id="AveBedrms"
              name="AveBedrms"
              step="0.1"
              min="0"
              value={formData.AveBedrms}
              onChange={handleChange}
            />
            <small>Avg bedrooms per household</small>
          </div>

          <div className="form-group">
            <label htmlFor="Population">Population</label>
            <input
              type="number"
              id="Population"
              name="Population"
              step="1"
              min="0"
              required
              value={formData.Population}
              onChange={handleChange}
            />
            <small>Block group population</small>
          </div>

          <div className="form-group">
            <label htmlFor="AveOccup">Average Occupancy</label>
            <input
              type="number"
              id="AveOccup"
              name="AveOccup"
              step="0.1"
              min="0.1"
              required
              value={formData.AveOccup}
              onChange={handleChange}
            />
            <small>Avg household members</small>
          </div>

          <div className="form-group">
            <label htmlFor="Latitude">Latitude</label>
            <input
              type="number"
              id="Latitude"
              name="Latitude"
              step="0.01"
              min="32"
              max="42"
              required
              value={formData.Latitude}
              onChange={handleChange}
            />
            <small>32 to 42 (California)</small>
          </div>

          <div className="form-group">
            <label htmlFor="Longitude">Longitude</label>
            <input
              type="number"
              id="Longitude"
              name="Longitude"
              step="0.01"
              min="-125"
              max="-114"
              required
              value={formData.Longitude}
              onChange={handleChange}
            />
            <small>-125 to -114 (California)</small>
          </div>
        </div>

        <button type="submit" className="btn-predict" disabled={loading}>
          {loading ? 'Predicting...' : 'Predict Price'}
        </button>
      </form>

      {result && (
        <div className="result">
          <h2>Predicted Price</h2>
          <div className="price">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            }).format(result.prediction_value * 100000)}
          </div>
          <div className="details">Prediction based on California housing data</div>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}
