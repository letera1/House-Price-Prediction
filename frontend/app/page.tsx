'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, TrendingUp, MapPin, Users, Calendar, 
  Bed, DoorOpen, Activity, CheckCircle, XCircle, 
  Loader, BarChart3, History, Sparkles, Sun, Moon
} from '../components/Icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';

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

const chartData = [
  { month: 'Jan', value: 450 },
  { month: 'Feb', value: 480 },
  { month: 'Mar', value: 520 },
  { month: 'Apr', value: 490 },
  { month: 'May', value: 550 },
  { month: 'Jun', value: 580 },
];

export default function HousePricePredictor() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'predict' | 'history' | 'insights'>('dashboard');
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
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
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
    { name: 'MedInc', label: 'Median Income', icon: TrendingUp, min: 0, step: 0.1 },
    { name: 'HouseAge', label: 'House Age', icon: Calendar, min: 0, step: 1 },
    { name: 'AveRooms', label: 'Avg Rooms', icon: DoorOpen, min: 0, step: 0.1 },
    { name: 'AveBedrms', label: 'Avg Bedrooms', icon: Bed, min: 0, step: 0.1 },
    { name: 'Population', label: 'Population', icon: Users, min: 0, step: 1 },
    { name: 'AveOccup', label: 'Avg Occupancy', icon: HomeIcon, min: 0.1, step: 0.1 },
    { name: 'Latitude', label: 'Latitude', icon: MapPin, min: 32, max: 42, step: 0.01 },
    { name: 'Longitude', label: 'Longitude', icon: MapPin, min: -125, max: -114, step: 0.01 },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <button className="sidebar-icon sidebar-logo">
          <HomeIcon size={24} />
        </button>
        
        <button 
          className={`sidebar-icon ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          title="Dashboard"
        >
          <BarChart3 size={22} />
        </button>
        
        <button 
          className={`sidebar-icon ${activeTab === 'predict' ? 'active' : ''}`}
          onClick={() => setActiveTab('predict')}
          title="Predict"
        >
          <Sparkles size={22} />
        </button>
        
        <button 
          className={`sidebar-icon ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          title="History"
        >
          <History size={22} />
        </button>
        
        <button 
          className={`sidebar-icon ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
          title="Insights"
        >
          <TrendingUp size={22} />
        </button>
        
        <div className="sidebar-divider" />
        
        <button 
          className="sidebar-icon" 
          onClick={toggleTheme} 
          style={{ marginTop: 'auto' }}
          title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        >
          {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <div className="header">
          <div>
            <h1 className="header-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'predict' && 'Price Prediction'}
              {activeTab === 'history' && 'Prediction History'}
              {activeTab === 'insights' && 'Market Insights'}
            </h1>
            <p className="header-subtitle">California House Price Predictor</p>
          </div>
          
          <div className="header-actions">
            <div className={`badge ${apiStatus === 'healthy' ? 'badge-success' : apiStatus === 'error' ? 'badge-error' : 'badge-warning'}`}>
              {apiStatus === 'healthy' ? <CheckCircle size={14} /> : apiStatus === 'error' ? <XCircle size={14} /> : <Loader size={14} className="spinner" />}
              {apiStatus === 'checking' && 'Checking'}
              {apiStatus === 'healthy' && 'Connected'}
              {apiStatus === 'error' && 'Offline'}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Overview Card */}
              <div className="overview-card" style={{ marginBottom: '24px' }}>
                <div className="overview-header">
                  <h2 className="overview-title">Overview</h2>
                  <select style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}>
                    <option>Monthly</option>
                    <option>Weekly</option>
                    <option>Yearly</option>
                  </select>
                </div>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="rgba(255,255,255,0.8)" 
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="stats-row">
                  <div className="stat-box">
                    <div className="stat-label">Total Time</div>
                    <div className="stat-value">748 Hr</div>
                    <div className="stat-subtitle">April</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Total Steps</div>
                    <div className="stat-value">9.178 St</div>
                    <div className="stat-subtitle">April</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Target</div>
                    <div className="stat-value">9.200 St</div>
                    <div className="stat-subtitle">April</div>
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid-2">
                <motion.div 
                  className="feature-card card-gradient" 
                  onClick={() => setActiveTab('predict')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="feature-icon icon-purple">
                    <Sparkles size={32} />
                  </div>
                  <div className="feature-content">
                    <h3 className="feature-title" style={{ color: 'white' }}>Price Prediction</h3>
                    <p className="feature-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Get instant house price estimates
                    </p>
                    <div className="progress-container">
                      <div className="progress-header">
                        <span className="progress-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Accuracy</span>
                        <span className="progress-value" style={{ color: 'white' }}>84%</span>
                      </div>
                      <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <motion.div 
                          className="progress-fill" 
                          style={{ background: 'rgba(255,255,255,0.8)' }}
                          initial={{ width: 0 }}
                          animate={{ width: '84%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="feature-card card-pink"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="feature-icon icon-pink">
                    <TrendingUp size={32} />
                  </div>
                  <div className="feature-content">
                    <h3 className="feature-title" style={{ color: 'white' }}>Market Analysis</h3>
                    <p className="feature-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      View market trends and insights
                    </p>
                    <div className="progress-container">
                      <div className="progress-header">
                        <span className="progress-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Time</span>
                        <span className="progress-value" style={{ color: 'white' }}>748 hr</span>
                      </div>
                      <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <motion.div 
                          className="progress-fill" 
                          style={{ background: 'rgba(255,255,255,0.8)' }}
                          initial={{ width: 0 }}
                          animate={{ width: '60%' }}
                          transition={{ duration: 1, delay: 0.7 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Stats Grid */}
              <div className="grid-3" style={{ marginTop: '24px' }}>
                {[
                  { icon: Activity, title: 'Model Performance', subtitle: '15 km / month', progress: 45, days: '2 days left', color: 'purple' },
                  { icon: BarChart3, title: 'Predictions Made', subtitle: `${history.length} total predictions`, progress: 13, days: '17 days left', color: 'blue' },
                  { icon: CheckCircle, title: 'Accuracy Rate', subtitle: '84% model accuracy', progress: 60, days: '3 days left', color: 'purple' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    whileHover={{ y: -8 }}
                  >
                    <div className={`feature-icon icon-${stat.color}`} style={{ marginBottom: '16px' }}>
                      <stat.icon size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>
                      {stat.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      {stat.subtitle}
                    </p>
                    <div className="progress-container">
                      <div className="progress-header">
                        <span className="progress-label">Progress</span>
                        <span className="progress-value">{stat.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div 
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>{index === 0 ? '0 / 30km' : index === 1 ? '2 / 15km' : '3200/ 4800 steps'}</span>
                      <span className={`badge ${index === 0 ? 'badge-error' : index === 1 ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.75rem' }}>
                        {stat.days}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Predict Tab */}
          {activeTab === 'predict' && (
            <motion.div
              key="predict"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid-2">
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Property Details</h2>
                    <button onClick={loadSample} className="btn btn-secondary btn-sm">
                      Load Sample
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="grid-2" style={{ marginBottom: '24px' }}>
                      {formFields.map((field) => (
                        <div key={field.name}>
                          <label>
                            <field.icon size={16} style={{ color: 'var(--primary)' }} />
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
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                      style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}
                    >
                      {loading ? (
                        <>
                          <Loader size={20} className="spinner" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          Predict Price
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="card">
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Result</h2>
                  
                  {!result && !error && !loading && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                      <HomeIcon size={60} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                      <p>Enter property details to get prediction</p>
                    </div>
                  )}

                  {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <Loader size={50} className="spinner" style={{ color: 'var(--primary)' }} />
                    </div>
                  )}

                  {result && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <div className="result-display">
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
                          Estimated Value
                        </p>
                        <div className="price-value">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                          }).format(result.prediction_value * 100000)}
                        </div>
                      </div>

                      <div className="grid-3" style={{ marginTop: '20px' }}>
                        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>84%</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Accuracy</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>±$48K</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Avg Error</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>ML</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Ensemble</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '2px solid var(--error)',
                      padding: '20px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <XCircle size={24} style={{ color: 'var(--error)' }} />
                      <div>
                        <p style={{ fontWeight: '600', color: 'var(--error)' }}>Error</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{error}</p>
                      </div>
                    </div>
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
            >
              <div className="card">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>
                  Recent Predictions
                </h2>
                
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                    <History size={60} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                    <p>No predictions yet</p>
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
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
                      >
                        <div>
                          <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)' }}>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0,
                            }).format(item.prediction_value * 100000)}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="badge badge-primary">Income: ${item.inputs.MedInc}</span>
                          <span className="badge badge-primary">Age: {item.inputs.HouseAge}y</span>
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
            >
              <div className="card">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>
                  Market Trends
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#7c3aed" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
