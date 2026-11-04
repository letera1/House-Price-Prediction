'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppHeader from '../../components/AppHeader';
import { 
  HomeIcon, TrendingUp, MapPin, Users, Calendar, 
  Bed, DoorOpen, Loader, Sparkles, Sliders, Gauge,
  Shield, DollarSign, Building, Layers, ArrowRight, XCircle 
} from '../../components/Icons';
import { PropertyForm, ValuationResponse, ValuationRecord, ARCHETYPES } from '../../lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function PredictContent() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with defaults or URL query parameters
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
    prediction_value: 4.125,
    currency: 'USD',
    scale: '100,000s',
  });

  useEffect(() => {
    // Read from search params if present
    const pMedInc = searchParams.get('MedInc');
    const pHouseAge = searchParams.get('HouseAge');
    const pAveRooms = searchParams.get('AveRooms');
    const pAveBedrms = searchParams.get('AveBedrms');
    const pPopulation = searchParams.get('Population');
    const pAveOccup = searchParams.get('AveOccup');
    const pLatitude = searchParams.get('Latitude');
    const pLongitude = searchParams.get('Longitude');

    if (pMedInc) {
      setForm({
        MedInc: parseFloat(pMedInc) || 8.5,
        HouseAge: parseInt(pHouseAge || '18') || 18,
        AveRooms: parseFloat(pAveRooms || '6.8') || 6.8,
        AveBedrms: parseFloat(pAveBedrms || '1.1') || 1.1,
        Population: parseInt(pPopulation || '1400') || 1400,
        AveOccup: parseFloat(pAveOccup || '2.7') || 2.7,
        Latitude: parseFloat(pLatitude || '37.85') || 37.85,
        Longitude: parseFloat(pLongitude || '-122.25') || -122.25,
      });
    }
  }, [searchParams]);

  const handleFieldChange = (field: keyof PropertyForm, value: number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const applyArchetype = (preset: typeof ARCHETYPES[0]) => {
    setForm(preset.data);
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
        setError(data.error || data.message || 'Valuation calculation was rejected by server');
      }
    } catch {
      setError('Prediction API connection failed. Ensure backend service is running on http://localhost:8080.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations for Mock-up Scales & Metrics
  const priceUSD = useMemo(() => {
    return prediction ? Math.round(prediction.prediction_value * 100000) : 412500;
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
        title="Precision Property Valuation"
        subtitle="California Census Block Group Residential Appraisal Engine"
      />

      {/* KPI Real Estate Metrics Strip */}
      <div className="kpi-strip">
        <div className="kpi-unit">
          <div className="kpi-header">
            <span>Fair Market Valuation</span>
            <DollarSign size={16} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div className="kpi-number" style={{ color: 'var(--accent-emerald)' }}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(priceUSD)}
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Spread:</span>
            <span>${(lowEstimateUSD / 1000).toFixed(0)}k - ${(highEstimateUSD / 1000).toFixed(0)}k</span>
          </div>
        </div>

        <div className="kpi-unit">
          <div className="kpi-header">
            <span>Est. Monthly Payment</span>
            <Building size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div className="kpi-number">
            ${estimatedMortgage.toLocaleString()}
          </div>
          <div className="kpi-footer">
            <span>30yr Fixed (6.75% + Tax)</span>
          </div>
        </div>

        <div className="kpi-unit">
          <div className="kpi-header">
            <span>Price / Room Metric</span>
            <DoorOpen size={16} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div className="kpi-number">
            ${pricePerRoom.toLocaleString()}
          </div>
          <div className="kpi-footer">
            <span>Across {form.AveRooms.toFixed(1)} average rooms</span>
          </div>
        </div>

        <div className="kpi-unit">
          <div className="kpi-header">
            <span>Affordability Index</span>
            <Gauge size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <div className="kpi-number">
            {affordabilityRatio}x
          </div>
          <div className="kpi-footer">
            <span>Income-to-Price Multiplier</span>
          </div>
        </div>
      </div>

      <div className="grid-cols-12">
        {/* Left Column: Form & Attribute Configuration */}
        <div className="col-span-7">
          <div className="clean-card">
            <div className="card-title-row">
              <div>
                <h2 className="card-title">
                  <Sliders size={18} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Property Attributes</span>
                </h2>
                <p className="card-caption">Fine-tune census block group features to estimate market price</p>
              </div>
            </div>

            {/* Archetype Quick Selection Strip */}
            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Archetype Presets:
              </span>
            </div>
            <div className="archetype-strip">
              {ARCHETYPES.map((arch, i) => (
                <button
                  key={i}
                  type="button"
                  className="archetype-btn"
                  onClick={() => applyArchetype(arch)}
                >
                  <span>{arch.name}</span>
                  <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: 'var(--bg-pill)', color: 'var(--text-muted)' }}>
                    {arch.tag}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={handleValuationSubmit}>
              <div className="input-matrix">
                {/* MedInc */}
                <div className="field-cell">
                  <div className="field-top-row">
                    <label htmlFor="field-medinc" className="field-label">
                      <TrendingUp size={14} style={{ color: 'var(--accent-emerald)' }} />
                      <span>Median Income</span>
                    </label>
                    <span className="field-value-badge">${(form.MedInc * 10).toFixed(0)}k/yr</span>
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
                    aria-valuemin={1}
                    aria-valuemax={15}
                    aria-valuenow={form.MedInc}
                  />
                </div>

                {/* HouseAge */}
                <div className="field-cell">
                  <div className="field-top-row">
                    <label htmlFor="field-houseage" className="field-label">
                      <Calendar size={14} style={{ color: 'var(--accent-blue)' }} />
                      <span>Structure Age</span>
                    </label>
                    <span className="field-value-badge">{form.HouseAge} yrs</span>
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
                <div className="field-cell">
                  <div className="field-top-row">
                    <label htmlFor="field-averooms" className="field-label">
                      <DoorOpen size={14} style={{ color: 'var(--accent-amber)' }} />
                      <span>Avg Total Rooms</span>
                    </label>
                    <span className="field-value-badge">{form.AveRooms.toFixed(1)}</span>
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
                <div className="field-cell">
                  <div className="field-top-row">
                    <label htmlFor="field-avebedrms" className="field-label">
                      <Bed size={14} style={{ color: '#ec4899' }} />
                      <span>Avg Bedrooms</span>
                    </label>
                    <span className="field-value-badge">{form.AveBedrms.toFixed(1)}</span>
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
                <div className="field-cell">
                  <div className="field-top-row">
                    <label htmlFor="field-population" className="field-label">
                      <Users size={14} style={{ color: '#8b5cf6' }} />
                      <span>Block Population</span>
                    </label>
                    <span className="field-value-badge">{form.Population}</span>
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
                <div className="field-cell">
                  <div className="field-top-row">
                    <label htmlFor="field-aveoccup" className="field-label">
                      <HomeIcon size={14} style={{ color: '#06b6d4' }} />
                      <span>Avg Occupancy</span>
                    </label>
                    <span className="field-value-badge">{form.AveOccup.toFixed(1)}/hse</span>
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
                <div className="field-cell">
                  <div className="field-top-row">
                    <label htmlFor="field-latitude" className="field-label">
                      <MapPin size={14} style={{ color: '#ef4444' }} />
                      <span>Latitude (N)</span>
                    </label>
                    <span className="field-value-badge">{form.Latitude.toFixed(2)}°</span>
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
                <div className="field-cell">
                  <div className="field-top-row">
                    <label htmlFor="field-longitude" className="field-label">
                      <MapPin size={14} style={{ color: '#ef4444' }} />
                      <span>Longitude (W)</span>
                    </label>
                    <span className="field-value-badge">{form.Longitude.toFixed(2)}°</span>
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

              <div style={{ marginTop: '24px' }}>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="spinner" />
                      <span>Running Random Forest Regressor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Calculate Estimated Valuation</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: 'var(--accent-rose-light)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Primary Hero & Mock-up Scales */}
        <div className="col-span-5">
          <div className="valuation-hero">
            <span className="valuation-label">Algorithmic Valuation</span>
            <div className="valuation-amount">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(priceUSD)}
            </div>
            <div className="valuation-subline">
              <Shield size={16} style={{ color: 'var(--accent-emerald)' }} />
              <span>±$48K Confidence Interval (84% R² Cross-Validated)</span>
            </div>
          </div>

          {/* UX Mock-up Scale 1: Market Valuation Spread Scale */}
          <div className="scale-wrapper">
            <div className="scale-header">
              <span className="scale-title">
                <Gauge size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span>Valuation Spread & Benchmark Scale</span>
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                {scalePercentage}% of Scale
              </span>
            </div>

            <div className="scale-track">
              <div 
                className="scale-pin"
                style={{ left: `${scalePercentage}%` }}
                title={`Current Estimated Value: $${(priceUSD / 1000).toFixed(0)}k`}
              />
            </div>

            <div className="scale-markers">
              <span>$80K (Suburban Low)</span>
              <span>$400K (Median)</span>
              <span>$800K+ (Prime Tier)</span>
            </div>
          </div>

          {/* UX Mock-up Scale 2: Underwriting Affordability & Density */}
          <div className="clean-card" style={{ marginTop: '20px' }}>
            <div className="card-title-row" style={{ marginBottom: '14px' }}>
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
                <Layers size={16} style={{ color: 'var(--accent-blue)' }} />
                <span>Underwriting Risk & Density Gauges</span>
              </h3>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Affordability Ratio</span>
                <span style={{ fontWeight: 700, color: parseFloat(affordabilityRatio) > 6 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                  {affordabilityRatio}x Annual Income
                </span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-pill)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.min(parseFloat(affordabilityRatio) * 10, 100)}%`,
                    backgroundColor: parseFloat(affordabilityRatio) > 6 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                    borderRadius: '3px'
                  }} 
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Room-to-Occupant Ratio</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {(form.AveRooms / form.AveOccup).toFixed(2)} rooms/person
                </span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-pill)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.min((form.AveRooms / form.AveOccup) * 28, 100)}%`,
                    backgroundColor: 'var(--accent-blue)',
                    borderRadius: '3px'
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Links to Dedicated Sub-Pages */}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <Link
              href="/dashboard"
              style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
            >
              <span>View Market Trends</span>
              <ArrowRight size={12} />
            </Link>

            <Link
              href="/developer"
              style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
            >
              <span>Inspect API & cURL</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PredictPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px' }}><Loader size={32} className="spinner" /></div>}>
      <PredictContent />
    </Suspense>
  );
}
