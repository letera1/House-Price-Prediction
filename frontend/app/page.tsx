'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, TrendingUp, MapPin, Users, Calendar, 
  Bed, DoorOpen, Activity, CheckCircle, XCircle, 
  Loader, BarChart3, History, Sparkles, Sun, Moon
} from '../components/Icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface HistoryItem extends PredictionResult {
  timestamp: string;
  inputs: FormData;
}

const marketData = [
  { month: 'Jan', value: 450000 },
  { month: 'Feb', value: 480000 },
  { month: 'Mar', value: 520000 },
  { month: 'Apr', value: 490000 },
  { month: 'May', value: 550000 },
  { month: 'Jun', value: 580000 },
];

export default function HousePricePredictor() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'predict' | 'history' | 'insights'>('predict');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
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
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    checkHealth();
    loadHistory();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      setApiStatus(data.status === 'healthy' ? 'healthy' : 'error');
    } catch {
      setApiStatus('error');
    }
  };

  const loadHistory = () => {
    const saved = localStorage.getItem('predictionHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  };

  const saveToHistory = (prediction: PredictionResult, inputs: FormData) => {
    const item: HistoryItem = {
      ...prediction,
      timestamp: new Date().toISOString(),
      inputs,
    };
    const newHistory = [item, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('predictionHistory', JSON.stringify(newHistory));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadSample = () => {
    setFormData({
      MedInc: '8.5',
      HouseAge: '25',
      AveRooms: '6.5',
      AveBedrms: '1.2',
      Population: '1500',
      AveOccup: '3.0',
      Latitude: '37.5',
      Longitude: '-122.0',
    });
  };

  const clearForm = () => {
    setFormData({
      MedInc: '',
      HouseAge: '',
      AveRooms: '',
      AveBedrms: '1.0',
      Population: '',
      AveOccup: '',
      Latitude: '',
      Longitude: '',
    });
    setResult(null);
    setError(null);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        saveToHistory(data, formData);
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      setError('Network error. Make sure the API is running.');
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { name: 'MedInc', label: 'Median Income', icon: TrendingUp, min: 0, step: 0.1, hint: 'Block group median income' },
    { name: 'HouseAge', label: 'House Age', icon: Calendar, min: 0, step: 1, hint: 'Years' },
    { name: 'AveRooms', label: 'Avg Rooms', icon: DoorOpen, min: 0, step: 0.1, hint: 'Per household' },
    { name: 'AveBedrms', label: 'Avg Bedrooms', icon: Bed, min: 0, step: 0.1, hint: 'Per household' },
    { name: 'Population', label: 'Population', icon: Users, min: 0, step: 1, hint: 'Block group' },
    { name: 'AveOccup', label: 'Avg Occupancy', icon: HomeIcon, min: 0.1, step: 0.1, hint: 'Members' },
    { name: 'Latitude', label: 'Latitude', icon: MapPin, min: 32, max: 42, step: 0.01, hint: '32-42' },
    { name: 'Longitude', label: 'Longitude', icon: MapPin, min: -125, max: -114, step: 0.01, hint: '-125 to -114' },
  ];

  return (
    <>
      {/* Background elements */}
      <div className="hero-gradient" />
      <div className="floating-shape shape-1" />
      <div className="floating-shape shape-2" />
      <div className="floating-shape shape-3" />

      {/* Theme toggle */}
      <div className="theme-toggle">
        <button onClick={toggleTheme} className="btn btn-icon btn-secondary">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="container">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '40px' }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex'
            }}>
              <HomeIcon size={40} style={{ color: 'white' }} />
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0 }} className="gradient-text">
              House Price AI
            </h1>
          </motion.div>
          
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '700px', 
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            Predict California house prices with 84% accuracy using advanced machine learning
          </p>

          {/* Status badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className={`badge ${apiStatus === 'healthy' ? 'badge-success' : apiStatus === 'error' ? 'badge-error' : 'badge-warning'}`}>
              {apiStatus === 'healthy' ? <CheckCircle size={16} /> : apiStatus === 'error' ? <XCircle size={16} /> : <Loader size={16} className="spinner" />}
              {apiStatus === 'checking' && 'Checking API'}
              {apiStatus === 'healthy' && 'API Connected'}
              {apiStatus === 'error' && 'API Offline'}
            </div>
            <div className="badge badge-success">
              <Activity size={16} />
              84% Accuracy
            </div>
            <div className="badge badge-primary">
              <Sparkles size={16} />
              ML Powered
            </div>
          </div>
        </motion.header>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ maxWidth: '600px', margin: '0 auto 40px' }}
        >
          <div className="tabs">
            <button
              onClick={() => setActiveTab('predict')}
              className={`tab ${activeTab === 'predict' ? 'active' : ''}`}
            >
              <TrendingUp size={18} />
              Predict
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            >
              <History size={18} />
              History
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              Insights
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Predict Tab */}
          {activeTab === 'predict' && (
            <motion.div
              key="predict"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid-2">
                {/* Form Card */}
                <div className="card glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
                      Property Details
                    </h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={loadSample} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
                        Load Sample
                      </button>
                      <button onClick={clearForm} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
                        Clear
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="grid-2" style={{ marginBottom: '28px' }}>
                      {formFields.map((field) => (
                        <div key={field.name} className="form-group">
                          <label>
                            <field.icon size={18} style={{ color: 'var(--primary)' }} />
                            {field.label}
                          </label>
                          <input
                            type="number"
                            name={field.name}
                            step={field.step}
                            min={field.min}
                            max={field.max}
                            required
                            value={formData[field.name as keyof FormData]}
                            onChange={handleChange}
                            placeholder={field.hint}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                      style={{ width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700' }}
                    >
                      {loading ? (
                        <>
                          <Loader size={22} className="spinner" />
                          Analyzing Property...
                        </>
                      ) : (
                        <>
                          <Sparkles size={22} />
                          Predict House Price
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Result Card */}
                <div className="card glass-card">
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '28px' }}>
                    Prediction Result
                  </h2>
                  
                  {!result && !error && !loading && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '80px 20px', 
                      color: 'var(--text-secondary)' 
                    }}>
                      <div style={{ 
                        width: '120px', 
                        height: '120px', 
                        margin: '0 auto 24px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <HomeIcon size={60} style={{ opacity: 0.3 }} />
                      </div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                        Ready to Predict
                      </h3>
                      <p>Fill in the property details and click predict to see the estimated value</p>
                    </div>
                  )}

                  {loading && (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                      <Loader size={60} className="spinner" style={{ color: 'var(--primary)', margin: '0 auto 24px' }} />
                      <p style={{ color: 'var(--text-secondary)' }}>Analyzing property data...</p>
                    </div>
                  )}

                  {result && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <div className="result-card">
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <p style={{ 
                            fontSize: '0.875rem', 
                            color: 'var(--text-secondary)', 
                            marginBottom: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}>
                            Estimated Value
                          </p>
                          <div className="price-display">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0,
                            }).format(result.prediction_value * 100000)}
                          </div>
                          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
                            Based on California housing market data
                          </p>
                        </div>
                      </div>

                      <div className="grid-3" style={{ marginTop: '24px' }}>
                        <div className="stat-card">
                          <div className="stat-value">84%</div>
                          <div className="stat-label">Model Accuracy</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">±$48K</div>
                          <div className="stat-label">Avg Error</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">Ensemble</div>
                          <div className="stat-label">ML Model</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid var(--error)',
                        padding: '24px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <XCircle size={32} style={{ color: 'var(--error)', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--error)' }}>
                          Prediction Failed
                        </p>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{error}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card glass-card">
                <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '28px' }}>
                  Prediction History
                </h2>
                
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
                    <History size={60} style={{ margin: '0 auto 24px', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                      No Predictions Yet
                    </h3>
                    <p>Your prediction history will appear here</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {history.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="card"
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          flexWrap: 'wrap', 
                          gap: '20px',
                          background: 'var(--bg-secondary)'
                        }}
                      >
                        <div>
                          <p style={{ 
                            fontSize: '1.75rem', 
                            fontWeight: '800', 
                            color: 'var(--success)',
                            marginBottom: '6px'
                          }}>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0,
                            }).format(item.prediction_value * 100000)}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="badge badge-primary">Income: ${item.inputs.MedInc}</span>
                          <span className="badge badge-primary">Age: {item.inputs.HouseAge}y</span>
                          <span className="badge badge-primary">Rooms: {item.inputs.AveRooms}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid-2">
                <div className="card glass-card">
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '28px' }}>
                    Market Trends
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={marketData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--text-secondary)" />
                      <YAxis stroke="var(--text-secondary)" />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'var(--bg-card)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '12px',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="card glass-card">
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '28px' }}>
                    Key Statistics
                  </h2>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {[
                      { label: 'Average Price', value: '$520K', change: '+12%', positive: true },
                      { label: 'Total Predictions', value: history.length.toString(), change: 'Lifetime', positive: true },
                      { label: 'Model Accuracy', value: '84%', change: 'Validated', positive: true },
                      { label: 'Avg Error', value: '±$48K', change: 'RMSE', positive: true },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="stat-card"
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          textAlign: 'left'
                        }}
                      >
                        <div>
                          <div className="stat-label" style={{ marginBottom: '8px' }}>{stat.label}</div>
                          <div className="stat-value" style={{ fontSize: '2rem' }}>{stat.value}</div>
                        </div>
                        <span className={`badge ${stat.positive ? 'badge-success' : 'badge-error'}`}>
                          {stat.change}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ 
            textAlign: 'center', 
            marginTop: '80px', 
            paddingTop: '40px', 
            borderTop: '1px solid var(--border)',
            paddingBottom: '40px'
          }}
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '12px' }}>
            Powered by Machine Learning • Built with Next.js 16 & Flask
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            © 2026 House Price AI. All rights reserved.
          </p>
        </motion.footer>
      </div>
    </>
  );
}
