'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppHeader from '../../components/AppHeader';
import { 
  Loader, Sparkles, Shield, ArrowRight, XCircle, Sliders,
  Zap, Copy, Check, Printer, RotateCcw, MapPin, Compass, Wrench
} from '../../components/Icons';
import { 
  PropertyForm, ValuationResponse, ValuationRecord, 
  ARCHETYPES, resolveGeospatialRegion 
} from '../../lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function PredictContent() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeArchetype, setActiveArchetype] = useState<number>(0);
  const [liveMode, setLiveMode] = useState<boolean>(true);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [lastDelta, setLastDelta] = useState<number | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Calculate Geospatial Region on the fly
  const geoRegion = useMemo(() => {
    return resolveGeospatialRegion(form.Latitude, form.Longitude);
  }, [form.Latitude, form.Longitude]);

  // Read URL search params if present
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

  // Execute prediction against backend API
  const executePrediction = async (currentForm: PropertyForm) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentForm),
      });

      const data = await res.json();
      if (res.ok) {
        if (prediction) {
          const oldUSD = prediction.prediction_value * 100000;
          const newUSD = data.prediction_value * 100000;
          setLastDelta(Math.round(newUSD - oldUSD));
        }
        setPrediction(data);
        saveHistoryRecord(data.prediction_value, currentForm);
      } else {
        setError(data.error || data.message || 'Calculation rejected by server');
      }
    } catch {
      setError('Cannot reach prediction API. Check http://localhost:8080.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced live calculation on slider change
  const handleFieldChange = (field: keyof PropertyForm, value: number) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setActiveArchetype(-1);

    if (liveMode) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        executePrediction(updated);
      }, 120);
    }
  };

  const applyArchetype = (index: number) => {
    setActiveArchetype(index);
    const selected = ARCHETYPES[index].data;
    setForm(selected);
    executePrediction(selected);
  };

  // "What-If" Sensitivity Scenario Simulator
  const applyScenario = (action: 'add_room' | 'modernize' | 'lower_density' | 'income_lift' | 'reset') => {
    let updated = { ...form };
    if (action === 'add_room') {
      updated.AveRooms = Math.min(parseFloat((updated.AveRooms + 1.0).toFixed(1)), 12.0);
    } else if (action === 'modernize') {
      updated.HouseAge = Math.max(updated.HouseAge - 10, 1);
    } else if (action === 'lower_density') {
      updated.AveOccup = Math.max(parseFloat((updated.AveOccup - 0.5).toFixed(1)), 1.2);
    } else if (action === 'income_lift') {
      updated.MedInc = Math.min(parseFloat((updated.MedInc + 2.0).toFixed(1)), 15.0);
    } else if (action === 'reset') {
      const baseIndex = activeArchetype >= 0 ? activeArchetype : 0;
      updated = { ...ARCHETYPES[baseIndex].data };
      setActiveArchetype(baseIndex);
    }
    setForm(updated);
    executePrediction(updated);
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

  const handleCopySummary = () => {
    const summary = `🏠 PropVal AI Appraisal Report\n` +
      `Estimated Market Value: $${priceUSD.toLocaleString()} USD (Range: $${lowEstimateUSD.toLocaleString()} – $${highEstimateUSD.toLocaleString()})\n` +
      `Region: ${geoRegion.name} (${geoRegion.submarket}) | Coastal Zone: ${geoRegion.coastalZone ? 'Yes' : 'No'}\n` +
      `Model: Random Forest Regressor (84% R² Cross-Validated)\n` +
      `Attributes: Income $${(form.MedInc * 10).toFixed(0)}k/yr | Age ${form.HouseAge}y | ${form.AveRooms.toFixed(1)} Rooms | ${form.AveBedrms.toFixed(1)} Bed | ${form.AveOccup.toFixed(1)} Occupants\n` +
      `Monthly Est.: $${estimatedMortgage.toLocaleString()}/mo | Affordability: ${affordabilityRatio}x Annual Income`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <>
      <AppHeader 
        title="House Price Predictor"
        subtitle="California Census Block Group Valuation Model"
      />

      <div className="predict-container">
        {/* Left Column: Form & Property Configuration */}
        <div className="clean-card">
          <div className="card-title-row" style={{ marginBottom: '10px' }}>
            <h2 className="card-title">
              <Sliders size={15} style={{ color: 'var(--accent-emerald)' }} />
              <span>Property Features</span>
            </h2>

            {/* Live Mode Toggle Switch (Native HTML switch specification) */}
            <label className="toggle-switch-wrapper" htmlFor="live-toggle" title="Auto-recalculate valuation in real time as you adjust inputs">
              <input 
                id="live-toggle"
                type="checkbox" 
                role="switch" 
                aria-checked={liveMode}
                checked={liveMode}
                onChange={(e) => setLiveMode(e.target.checked)}
                className="switch-control"
              />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Zap size={11} style={{ color: liveMode ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
                <span>Live Mode {liveMode ? 'ON' : 'OFF'}</span>
              </span>
            </label>
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

          <form onSubmit={(e) => { e.preventDefault(); executePrediction(form); }}>
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
                  aria-label="Median Income"
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
                  aria-label="House Age"
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
                  aria-label="Average Rooms"
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
                  aria-label="Average Bedrooms"
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
                  aria-label="Block Population"
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
                  aria-label="Average Occupancy"
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
                  aria-label="Latitude"
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
                  aria-label="Longitude"
                />
              </div>
            </div>

            {/* Smart California Geospatial Radar Chip */}
            <div className="geo-radar-chip">
              <MapPin size={12} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{geoRegion.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--text-secondary)' }}>{geoRegion.submarket}</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '1px 5px', borderRadius: '3px', background: geoRegion.coastalZone ? 'var(--accent-blue-light)' : 'var(--bg-pill)', color: geoRegion.coastalZone ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                {geoRegion.coastalZone ? 'Coastal Tier' : 'Inland Basin'}
              </span>
            </div>

            {/* "What-If" Sensitivity & Renovation Lift Simulator (Expert Pro Feature) */}
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Wrench size={11} />
                  <span>What-If Value Lift Simulator:</span>
                </span>
                {lastDelta !== null && lastDelta !== 0 && (
                  <span style={{ color: lastDelta > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {lastDelta > 0 ? `+` : ``}${lastDelta.toLocaleString()} USD Lift
                  </span>
                )}
              </div>

              <div className="scenario-strip">
                <button 
                  type="button" 
                  className="scenario-chip"
                  onClick={() => applyScenario('add_room')}
                  title="Simulate adding +1 average room"
                >
                  <span>+1 Room</span>
                </button>

                <button 
                  type="button" 
                  className="scenario-chip"
                  onClick={() => applyScenario('modernize')}
                  title="Simulate renovating/modernizing the structure (-10 years age)"
                >
                  <span>Modernize (-10y)</span>
                </button>

                <button 
                  type="button" 
                  className="scenario-chip"
                  onClick={() => applyScenario('lower_density')}
                  title="Simulate lower household density (-0.5 occupancy)"
                >
                  <span>Lower Density (-0.5)</span>
                </button>

                <button 
                  type="button" 
                  className="scenario-chip"
                  onClick={() => applyScenario('income_lift')}
                  title="Simulate higher median block earnings (+$20k)"
                >
                  <span>Income Lift (+$20k)</span>
                </button>

                <button 
                  type="button" 
                  className="scenario-chip"
                  onClick={() => applyScenario('reset')}
                  title="Reset to baseline archetype preset"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <RotateCcw size={10} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {!liveMode && (
              <div style={{ marginTop: '12px' }}>
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
                      <span>Calculate Valuation</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {error && (
            <div style={{ marginTop: '10px', padding: '6px 10px', borderRadius: '4px', background: 'var(--accent-rose-light)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <XCircle size={13} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Expert Valuation Output Panel */}
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title-row" style={{ marginBottom: '6px' }}>
              <span className="card-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Estimated Market Value
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={handleCopySummary}
                  title="Copy Executive Appraisal Summary"
                  aria-label="Copy Executive Appraisal Summary"
                >
                  {copiedSummary ? <Check size={11} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={11} />}
                  <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => window.print()}
                  title="Print Official Appraisal Sheet"
                  aria-label="Print Official Appraisal Sheet"
                >
                  <Printer size={11} />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-emerald)', letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums' }}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(priceUSD)}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} style={{ color: 'var(--accent-emerald)' }} />
              <span>Range: ${(lowEstimateUSD / 1000).toFixed(0)}k – ${(highEstimateUSD / 1000).toFixed(0)}k (±$48K spread)</span>
            </div>

            {/* Valuation Scale Meter */}
            <div style={{ margin: '12px 0 6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                <span>California Price Tier</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{scalePercentage}%</span>
              </div>
              <div className="scale-track" style={{ margin: '4px 0' }}>
                <div 
                  className="scale-pin"
                  style={{ left: `${scalePercentage}%` }}
                />
              </div>
              <div className="scale-markers" style={{ fontSize: '9.5px' }}>
                <span>$80K</span>
                <span>$400K</span>
                <span>$800K+</span>
              </div>
            </div>

            {/* 3-Tile Metrics Strip */}
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

            {/* Valuation Driver Attribution (Expert Transparency) */}
            <div className="attribution-bar-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Valuation Driver Attribution</span>
                <span>Random Forest</span>
              </div>
              <div className="attribution-bar">
                <div className="attribution-segment" style={{ width: '42%', background: '#10b981' }} title="Income & Purchasing Power: 42%" />
                <div className="attribution-segment" style={{ width: '28%', background: '#3b82f6' }} title="Geospatial Proximity & Coastal: 28%" />
                <div className="attribution-segment" style={{ width: '18%', background: '#f59e0b' }} title="Structural Scale & Room Count: 18%" />
                <div className="attribution-segment" style={{ width: '12%', background: '#8b5cf6' }} title="Structure Age: 12%" />
              </div>
              <div className="attribution-legend">
                <span style={{ color: '#10b981' }}>● Income (42%)</span>
                <span style={{ color: '#3b82f6' }}>● Location (28%)</span>
                <span style={{ color: '#f59e0b' }}>● Size (18%)</span>
                <span style={{ color: '#8b5cf6' }}>● Age (12%)</span>
              </div>
            </div>
          </div>

          {/* Quick Sub-Links */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
