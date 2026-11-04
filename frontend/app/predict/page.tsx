'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppHeader from '../../components/AppHeader';
import { 
  Loader, Sparkles, Shield, ArrowRight, XCircle, Sliders 
} from '../../components/Icons';
import { PropertyForm, ValuationResponse, ValuationRecord, ARCHETYPES } from '../../lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function PredictContent() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeArchetype, setActiveArchetype] = useState<number>(0);

  const [form, setForm] = useState<PropertyForm>({
    MedInc: 8.5,
    HouseAge: 18,
    AveRooms: 6.8,
    AveBedrms: 1.1,
    Population: 1400,
    AveOccup: 2.7,
    Latitude: 37.85,
    Longitude: -122.25,
  });

  const [prediction, setPrediction] = useState<ValuationResponse | null>({
    prediction_value: 3.55823,
    currency: 'USD',
    scale: '100,000s',
  });

  useEffect(() => {
    const pMedInc = searchParams.get('MedInc');
    if (pMedInc) {
      setForm({
        MedInc: parseFloat(pMedInc) || 8.5,
        HouseAge: parseInt(searchParams.get('HouseAge') || '18') || 18,
        AveRooms: parseFloat(searchParams.get('AveRooms') || '6.8') || 6.8,
        AveBedrms: parseFloat(searchParams.get('AveBedrms') || '1.1') || 1.1,
        Population: parseInt(searchParams.get('Population') || '1400') || 1400,
        AveOccup: parseFloat(searchParams.get('AveOccup') || '2.7') || 2.7,
        Latitude: parseFloat(searchParams.get('Latitude') || '37.85') || 37.85,
        Longitude: parseFloat(searchParams.get('Longitude') || '-122.25') || -122.25,
      });
      setActiveArchetype(-1);
    }
  }, [searchParams]);

  const handleFieldChange = (field: keyof PropertyForm, value: number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setActiveArchetype(-1);
  };

  const applyArchetype = (index: number) => {
    setActiveArchetype(index);
    setForm(ARCHETYPES[index].data);
  };

  const saveHistoryRecord = (predVal: number, inputs: PropertyForm) => {
    try {
      const existing = localStorage.getItem('propval_history');
      const records: ValuationRecord[] = existing ? JSON.parse(existing) : [];
      const newRecord: ValuationRecord = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        priceUSD: Math.round(predVal * 100000),
        inputs: { ...inputs },
      };
      const updated = [newRecord, ...records].slice(0, 30);
      localStorage.setItem('propval_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save valuation history:', e);
    }
  };

  const handleValuationSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setPrediction(data);
        saveHistoryRecord(data.prediction_value, form);
      } else {
        setError(data.error || data.message || 'Calculation rejected by server');
      }
    } catch {
      setError('Cannot reach prediction API. Check http://localhost:8080.');
    } finally {
      setLoading(false);
    }
  };

  const priceUSD = useMemo(() => {
    return prediction ? Math.round(prediction.prediction_value * 100000) : 355823;
  }, [prediction]);

  const lowEstimateUSD = Math.round(priceUSD * 0.88);
  const highEstimateUSD = Math.round(priceUSD * 1.12);

  const estimatedMortgage = useMemo(() => {
    const principal = priceUSD * 0.80;
    const monthlyRate = 0.0675 / 12;
    const n = 360;
    const pAndI = (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1);
    const taxesAndInsurance = (priceUSD * 0.015) / 12;
    return Math.round(pAndI + taxesAndInsurance);
  }, [priceUSD]);

  const pricePerRoom = useMemo(() => {
    return form.AveRooms > 0 ? Math.round(priceUSD / form.AveRooms) : 0;
  }, [priceUSD, form.AveRooms]);

  const affordabilityRatio = useMemo(() => {
    const annualIncome = form.MedInc * 10000;
    return annualIncome > 0 ? (priceUSD / annualIncome).toFixed(1) : '4.5';
  }, [priceUSD, form.MedInc]);

  const scalePercentage = useMemo(() => {
    const min = 80000;
    const max = 800000;
    const clamped = Math.min(Math.max(priceUSD, min), max);
    return Math.round(((clamped - min) / (max - min)) * 100);
  }, [priceUSD]);

  return (
    <>
      <AppHeader 
        title="House Price Predictor"
        subtitle="California Census Block Group Valuation Model"
      />

      <div className="predict-container">
        {/* Left Column: Form & Attribute Configuration */}
        <div className="clean-card">
          <div className="card-title-row" style={{ marginBottom: '10px' }}>
            <h2 className="card-title">
              <Sliders size={15} style={{ color: 'var(--accent-emerald)' }} />
              <span>Property Features</span>
            </h2>
          </div>

          {/* Minimalist Segmented Archetype Tabs */}
          <div className="preset-segmented" role="tablist" aria-label="Quick Archetype Presets">
            {ARCHETYPES.map((arch, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={activeArchetype === i}
                className={`preset-tab ${activeArchetype === i ? 'active' : ''}`}
                onClick={() => applyArchetype(i)}
              >
                {arch.name}
              </button>
            ))}
          </div>

          <form onSubmit={handleValuationSubmit}>
            <div className="compact-matrix">
              {/* MedInc */}
              <div className="compact-cell">
                <div className="compact-cell-header">
                  <label htmlFor="field-medinc" className="compact-label">Median Income</label>
                  <span className="compact-badge">${(form.MedInc * 10).toFixed(0)}k/yr</span>
                </div>
                <input 
                  id="field-medinc"
                  type="range" 
                  min="1" 
                  max="15" 
                  step="0.1"
                  value={form.MedInc} 
                  onChange={(e) => handleFieldChange('MedInc', parseFloat(e.target.value))}
                  className="range-slider"
                />
              </div>

              {/* HouseAge */}
              <div className="compact-cell">
                <div className="compact-cell-header">
                  <label htmlFor="field-houseage" className="compact-label">House Age</label>
                  <span className="compact-badge">{form.HouseAge} yrs</span>
                </div>
                <input 
                  id="field-houseage"
                  type="range" 
                  min="1" 
                  max="52" 
                  step="1"
                  value={form.HouseAge} 
                  onChange={(e) => handleFieldChange('HouseAge', parseInt(e.target.value))}
                  className="range-slider"
                />
              </div>

              {/* AveRooms */}
              <div className="compact-cell">
                <div className="compact-cell-header">
                  <label htmlFor="field-averooms" className="compact-label">Average Rooms</label>
                  <span className="compact-badge">{form.AveRooms.toFixed(1)}</span>
                </div>
                <input 
                  id="field-averooms"
                  type="range" 
                  min="2" 
                  max="12" 
                  step="0.1"
                  value={form.AveRooms} 
                  onChange={(e) => handleFieldChange('AveRooms', parseFloat(e.target.value))}
                  className="range-slider"
                />
              </div>

              {/* AveBedrms */}
              <div className="compact-cell">
                <div className="compact-cell-header">
                  <label htmlFor="field-avebedrms" className="compact-label">Bedrooms</label>
                  <span className="compact-badge">{form.AveBedrms.toFixed(1)}</span>
                </div>
                <input 
                  id="field-avebedrms"
                  type="range" 
                  min="0.5" 
                  max="4" 
                  step="0.1"
                  value={form.AveBedrms} 
                  onChange={(e) => handleFieldChange('AveBedrms', parseFloat(e.target.value))}
                  className="range-slider"
                />
              </div>

              {/* Population */}
              <div className="compact-cell">
                <div className="compact-cell-header">
                  <label htmlFor="field-population" className="compact-label">Population</label>
                  <span className="compact-badge">{form.Population}</span>
                </div>
                <input 
                  id="field-population"
                  type="range" 
                  min="100" 
                  max="6000" 
                  step="50"
                  value={form.Population} 
                  onChange={(e) => handleFieldChange('Population', parseInt(e.target.value))}
                  className="range-slider"
                />
              </div>

              {/* AveOccup */}
              <div className="compact-cell">
                <div className="compact-cell-header">
                  <label htmlFor="field-aveoccup" className="compact-label">Occupancy</label>
                  <span className="compact-badge">{form.AveOccup.toFixed(1)} / hse</span>
                </div>
                <input 
                  id="field-aveoccup"
                  type="range" 
                  min="1" 
                  max="6" 
                  step="0.1"
                  value={form.AveOccup} 
                  onChange={(e) => handleFieldChange('AveOccup', parseFloat(e.target.value))}
                  className="range-slider"
                />
              </div>

              {/* Latitude */}
              <div className="compact-cell">
                <div className="compact-cell-header">
                  <label htmlFor="field-latitude" className="compact-label">Latitude</label>
                  <span className="compact-badge">{form.Latitude.toFixed(2)}° N</span>
                </div>
                <input 
                  id="field-latitude"
                  type="range" 
                  min="32.5" 
                  max="42.0" 
                  step="0.05"
                  value={form.Latitude} 
                  onChange={(e) => handleFieldChange('Latitude', parseFloat(e.target.value))}
                  className="range-slider"
                />
              </div>

              {/* Longitude */}
              <div className="compact-cell">
                <div className="compact-cell-header">
                  <label htmlFor="field-longitude" className="compact-label">Longitude</label>
                  <span className="compact-badge">{form.Longitude.toFixed(2)}° W</span>
                </div>
                <input 
                  id="field-longitude"
                  type="range" 
                  min="-124.5" 
                  max="-114.5" 
                  step="0.05"
                  value={form.Longitude} 
                  onChange={(e) => handleFieldChange('Longitude', parseFloat(e.target.value))}
                  className="range-slider"
                />
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={14} className="spinner" />
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Predict Valuation</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '6px', background: 'var(--accent-rose-light)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <XCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Streamlined Single Valuation Card */}
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title-row" style={{ marginBottom: '8px' }}>
              <span className="card-title" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Estimated Market Value
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Random Forest
              </span>
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(priceUSD)}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} style={{ color: 'var(--accent-emerald)' }} />
              <span>Range: ${(lowEstimateUSD / 1000).toFixed(0)}k – ${(highEstimateUSD / 1000).toFixed(0)}k (±$48K spread)</span>
            </div>

            {/* Clean Valuation Benchmark Meter */}
            <div style={{ margin: '14px 0 6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Scale Position</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{scalePercentage}%</span>
              </div>
              <div className="scale-track" style={{ margin: '4px 0' }}>
                <div 
                  className="scale-pin"
                  style={{ left: `${scalePercentage}%` }}
                />
              </div>
              <div className="scale-markers" style={{ fontSize: '10px' }}>
                <span>$80K</span>
                <span>$400K</span>
                <span>$800K+</span>
              </div>
            </div>

            {/* Clean 3-Tile Metrics Row */}
            <div className="metrics-strip-3">
              <div className="metric-tile">
                <div className="metric-tile-title">Est. Monthly</div>
                <div className="metric-tile-value">${estimatedMortgage.toLocaleString()}</div>
              </div>

              <div className="metric-tile">
                <div className="metric-tile-title">Price / Room</div>
                <div className="metric-tile-value">${pricePerRoom.toLocaleString()}</div>
              </div>

              <div className="metric-tile">
                <div className="metric-tile-title">Income Ratio</div>
                <div className="metric-tile-value">{affordabilityRatio}x</div>
              </div>
            </div>
          </div>

          {/* Quick Sub-Links */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link
              href="/dashboard"
              style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
            >
              <span>Market Trends</span>
              <ArrowRight size={11} />
            </Link>

            <Link
              href="/developer"
              style={{ color: 'var(--accent-blue)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 500 }}
            >
              <span>API Inspector</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PredictPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}><Loader size={20} className="spinner" /></div>}>
      <PredictContent />
    </Suspense>
  );
}
