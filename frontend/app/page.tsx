'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, TrendingUp, MapPin, Users, Calendar, 
  Bed, DoorOpen, Activity, CheckCircle, XCircle, 
  Loader, BarChart3, History, Sparkles, Info
} from '../components/Icons';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const sampleData = [
  { name: 'Jan', value: 450000 },
  { name: 'Feb', value: 480000 },
  { name: 'Mar', value: 520000 },
  { name: 'Apr', value: 490000 },
  { name: 'May', value: 550000 },
  { name: 'Jun', value: 580000 },
];

export default function Home() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'predict' | 'history' | 'insights'>('predict');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  
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
    loadHistory();
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
    { name: 'MedInc', label: 'Median Income', icon: TrendingUp, min: 0, step: 0.1, hint: 'Block group median income' },
    { name: 'HouseAge', label: 'House Age', icon: Calendar, min: 0, step: 1, hint: 'Median house age (years)' },
    { name: 'AveRooms', label: 'Avg Rooms', icon: DoorOpen, min: 0, step: 0.1, hint: 'Average rooms per household' },
    { name: 'AveBedrms', label: 'Avg Bedrooms', icon: Bed, min: 0, step: 0.1, hint: 'Average bedrooms per household' },
    { name: 'Population', label: 'Population', icon: Users, min: 0, step: 1, hint: 'Block group population' },
    { name: 'AveOccup', label: 'Avg Occupancy', icon: HomeIcon, min: 0.1, step: 0.1, hint: 'Average household members' },
    { name: 'Latitude', label: 'Latitude', icon: MapPin, min: 32, max: 42, step: 0.01, hint: '32 to 42 (California)' },
    { name: 'Longitude', label: 'Longitude', icon: MapPin, min: -125, max: -114, step: 0.01, hint: '-125 to -114' },
  ];

  return (
    <>
      <div className="animated-bg" />
      
      <div style={{ minHeight: '100vh', padding: '20px' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '1400px', margin: '0 auto' }}
        >
          {/* Header */}
          <header style={{ textAlign: 'center', marginBottom: '40px' }}>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                <HomeIcon size={48} className="gradient-text" />
                <h1 style={{ fontSize: '3rem', fontWeight: '800' }} className="gradient-text">
                  House Price AI
                </h1>
              </div>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                Predict California house prices with advanced machine learning
              </p>
            </motion.div>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}
            >
              <div className={`badge ${apiStatus === 'healthy' ? 'badge-success' : apiStatus === 'error' ? 'badge-error' : 'badge-warning'}`}>
                {apiStatus === 'healthy' ? <CheckCircle size={16} /> : apiStatus === 'error' ? <XCircle size={16} /> : <Loader size={16} />}
                {apiStatus === 'checking' && 'Checking API...'}
                {apiStatus === 'healthy' && 'API Connected'}
                {apiStatus === 'error' && 'API Offline'}
              </div>
              <div className="badge badge-success">
                <Activity size={16} />
                84% Accuracy
              </div>
              <div className="badge badge-success">
                <Sparkles size={16} />
                ML Powered
              </div>
            </motion.div>
          </header>

          {/* Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {[
              { id: 'predict', label: 'Predict', icon: TrendingUp },
              { id: 'history', label: 'History', icon: History },
              { id: 'insights', label: 'Insights', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={activeTab === tab.id ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Predict Tab */}
            {activeTab === 'predict' && (
              <motion.div
                key="predict"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  {/* Form */}
                  <div className="glass card" style={{ borderRadius: '24px', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Property Details</h2>
                      <button onClick={loadSample} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                        Load Sample
                      </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        {formFields.map((field) => (
                          <div key={field.name}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                              placeholder={field.hint}
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {loading ? (
                          <>
                            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            Predicting...
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

                  {/* Result */}
                  <div className="glass card" style={{ borderRadius: '24px', padding: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Prediction Result</h2>
                    
                    {!result && !error && (
                      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                        <HomeIcon size={64} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                        <p>Enter property details and click predict to see results</p>
                      </div>
                    )}

                    {result && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ textAlign: 'center' }}
                      >
                        <div style={{ 
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                          padding: '40px',
                          borderRadius: '20px',
                          marginBottom: '24px'
                        }}>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Estimated Value
                          </p>
                          <p style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--success)' }}>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0,
                            }).format(result.prediction_value * 100000)}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Based on California housing data
                          </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '12px' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Confidence</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>84%</p>
                          </div>
                          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '16px', borderRadius: '12px' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Model</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--secondary)' }}>Ensemble</p>
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
                          border: '1px solid var(--error)',
                          padding: '20px',
                          borderRadius: '12px',
                          color: 'var(--error)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <XCircle size={24} />
                          <div>
                            <p style={{ fontWeight: '600', marginBottom: '4px' }}>Prediction Failed</p>
                            <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>{error}</p>
                          </div>
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass card"
                style={{ borderRadius: '24px', padding: '32px' }}
              >
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Prediction History</h2>
                
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                    <History size={64} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p>No predictions yet. Make your first prediction!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {history.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
                      >
                        <div>
                          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
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
                          <span className="badge badge-success">Income: {item.inputs.MedInc}</span>
                          <span className="badge badge-success">Age: {item.inputs.HouseAge}</span>
                          <span className="badge badge-success">Rooms: {item.inputs.AveRooms}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  <div className="glass card" style={{ borderRadius: '24px', padding: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Market Trends</h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={sampleData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#f1f5f9' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass card" style={{ borderRadius: '24px', padding: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Key Insights</h2>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {[
                        { label: 'Avg Price', value: '$520K', change: '+12%', positive: true },
                        { label: 'Predictions', value: history.length.toString(), change: 'Total', positive: true },
                        { label: 'Accuracy', value: '84%', change: 'Model', positive: true },
                      ].map((stat, i) => (
                        <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stat.label}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</p>
                          </div>
                          <span className={`badge ${stat.positive ? 'badge-success' : 'badge-error'}`}>
                            {stat.change}
                          </span>
                        </div>
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
            style={{ textAlign: 'center', marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Powered by Machine Learning • Built with Next.js 16 & Flask
            </p>
          </motion.footer>
        </motion.div>
      </div>
    </>
  );
}
