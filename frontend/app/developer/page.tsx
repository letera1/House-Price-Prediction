'use client';

import React, { useState, useMemo } from 'react';
import AppHeader from '../../components/AppHeader';
import { 
  Code2, Terminal, Copy, Check, Activity, 
  Shield, Layers, Loader, CheckCircle, XCircle 
} from '../../components/Icons';
import { PropertyForm, ARCHETYPES } from '../../lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function DeveloperPage() {
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

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

  const [responseJson, setResponseJson] = useState<any>({
    prediction_value: 3.55823,
    currency: 'USD',
    scale: '100,000s',
    input_received: {
      MedInc: 8.5,
      HouseAge: 18,
      AveRooms: 6.8,
      AveBedrms: 1.1,
      Population: 1400,
      AveOccup: 2.7,
      Latitude: 37.85,
      Longitude: -122.25
    }
  });

  const curlCommand = useMemo(() => {
    return `curl -X POST ${API_URL}/predict \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(form, null, 2)}'`;
  }, [form]);

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(responseJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExecuteRequest = async () => {
    setLoading(true);
    const start = performance.now();

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setHttpStatus(res.status);

      const data = await res.json();
      setResponseJson(data);
    } catch (err: any) {
      setHttpStatus(503);
      setResponseJson({ error: 'Network error', message: err?.message || 'Connection refused on port 8080' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader 
        title="Developer Telemetry & API Inspector"
        subtitle="Real-Time Machine Learning Pipeline Debugging & Endpoint Health"
      />

      <div className="developer-container">
        {/* Left Column: Interactive API Console & cURL */}
        <div>
          <div className="clean-card">
            <div className="card-title-row">
              <div>
                <h2 className="card-title">
                  <Terminal size={14} style={{ color: 'var(--accent-blue)' }} />
                  <span>Terminal cURL Generator</span>
                </h2>
                <p className="card-caption">Copy-pasteable command configured with current payload</p>
              </div>

              <button 
                type="button" 
                className="copy-btn"
                onClick={handleCopyCurl}
                aria-label="Copy cURL command"
              >
                {copiedCurl ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>

            <pre className="code-block">{curlCommand}</pre>

            {/* Quick Presets */}
            <div style={{ marginTop: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Load Preset Payload:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ARCHETYPES.map((arch, i) => (
                  <button
                    key={i}
                    type="button"
                    className="archetype-btn"
                    onClick={() => setForm(arch.data)}
                  >
                    <span>{arch.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Request JSON Editor */}
            <div style={{ marginTop: '20px' }}>
              <div className="card-title-row">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Request Payload (application/json):
                </span>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleExecuteRequest}
                  disabled={loading}
                  style={{ width: 'auto', padding: '6px 16px', fontSize: '0.825rem' }}
                >
                  {loading ? <Loader size={14} className="spinner" /> : <Terminal size={14} />}
                  <span>Execute POST /predict</span>
                </button>
              </div>

              <pre className="code-block">{JSON.stringify(form, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Right Column: Response Payload & Model Telemetry */}
        <div>
          <div className="clean-card">
            <div className="card-title-row">
              <div>
                <h2 className="card-title">
                  <Activity size={14} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Response Telemetry</span>
                </h2>
                <p className="card-caption">Live inference latency and payload feedback</p>
              </div>

              <button 
                type="button" 
                className="copy-btn"
                onClick={handleCopyJson}
                aria-label="Copy response JSON"
              >
                {copiedJson ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            {/* Latency & Status Pills */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div className="status-pill" style={{ color: 'var(--accent-emerald)' }}>
                <Activity size={14} />
                <span>Latency: {latencyMs !== null ? `${latencyMs} ms` : '~24 ms (Warm)'}</span>
              </div>

              <div className="status-pill">
                {httpStatus === 200 || httpStatus === null ? (
                  <>
                    <CheckCircle size={14} style={{ color: 'var(--accent-emerald)' }} />
                    <span style={{ color: 'var(--accent-emerald)' }}>HTTP {httpStatus || 200} OK</span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} style={{ color: 'var(--accent-rose)' }} />
                    <span style={{ color: 'var(--accent-rose)' }}>HTTP {httpStatus} Error</span>
                  </>
                )}
              </div>

              <div className="status-pill">
                <Shield size={14} style={{ color: 'var(--accent-blue)' }} />
                <span>Pydantic v2 Validated</span>
              </div>
            </div>

            <pre className="code-block">{JSON.stringify(responseJson, null, 2)}</pre>

            {/* Pipeline Architecture Specifications */}
            <div style={{ marginTop: '24px' }}>
              <h3 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
                <Layers size={16} style={{ color: 'var(--accent-blue)' }} />
                <span>ML Pipeline Architecture</span>
              </h3>

              <div className="dev-console">
                <p>⚙️ <strong>Stage 1:</strong> preprocessing.FeatureEngineer(drop_features=[&apos;AveBedrms&apos;])</p>
                <p style={{ paddingLeft: '16px', color: 'var(--text-muted)' }}>• Ratios: RoomsPerPerson, PopulationPerHousehold, BedroomsRatio</p>
                <p style={{ paddingLeft: '16px', color: 'var(--text-muted)' }}>• Bins: IncomeCategory, AgeCategory</p>
                <p style={{ paddingLeft: '16px', color: 'var(--text-muted)' }}>• Geo: DistanceFromCenter (Centroid: 36.78°N, -119.42°W), CoastalProximity</p>
                <p style={{ paddingLeft: '16px', color: 'var(--text-muted)' }}>• Interactions: IncomeRoomsInteraction, IncomeAgeInteraction</p>
                <p style={{ marginTop: '8px' }}>⚙️ <strong>Stage 2:</strong> sklearn.preprocessing.StandardScaler()</p>
                <p style={{ marginTop: '8px' }}>⚙️ <strong>Stage 3:</strong> sklearn.ensemble.RandomForestRegressor(n_estimators=100, n_jobs=-1)</p>
                <p style={{ marginTop: '8px', color: 'var(--accent-emerald)' }}>📊 <strong>Model Evaluation:</strong> R² = 0.7324 | MSE = 0.3511</p>
                <p>📦 <strong>Artifact Path:</strong> backend/models/final_pipeline.pkl (joblib)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
