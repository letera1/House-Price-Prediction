'use client';

import React from 'react';
import Link from 'next/link';
import AppHeader from '../../components/AppHeader';
import { 
  TrendingUp, Layers, Building, MapPin, 
  Calendar, DoorOpen, Users, DollarSign, ArrowRight 
} from '../../components/Icons';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { FEATURE_IMPORTANCES, MARKET_TRENDS } from '../../lib/types';

const COUNTY_BENCHMARKS = [
  { region: 'San Francisco Bay Area', medianPrice: '$860,000', pricePerSqFt: '$680', trend: '+4.2%' },
  { region: 'Silicon Valley Corridor', medianPrice: '$1,180,000', pricePerSqFt: '$820', trend: '+5.8%' },
  { region: 'Orange County Coastal', medianPrice: '$940,000', pricePerSqFt: '$710', trend: '+3.9%' },
  { region: 'San Diego Metro', medianPrice: '$780,000', pricePerSqFt: '$590', trend: '+3.1%' },
  { region: 'Sacramento Capital Region', medianPrice: '$460,000', pricePerSqFt: '$340', trend: '+1.8%' },
  { region: 'Central Valley Inland', medianPrice: '$345,000', pricePerSqFt: '$240', trend: '+0.9%' },
];

export default function DashboardPage() {
  return (
    <>
      <AppHeader 
        title="Market Intelligence & Geospatial Analytics"
        subtitle="Empirical Distribution & Machine Learning Feature Attributions"
      />

      {/* Regional Macro Benchmarks */}
      <div className="kpi-strip">
        <div className="kpi-unit">
          <div className="kpi-header">
            <span>Statewide Median</span>
            <DollarSign size={16} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div className="kpi-number" style={{ color: 'var(--accent-emerald)' }}>
            $485,000
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>+3.4%</span>
            <span>Annual Value Momentum</span>
          </div>
        </div>

        <div className="kpi-unit">
          <div className="kpi-header">
            <span>Median Structure Age</span>
            <Calendar size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div className="kpi-number">
            28.6 yrs
          </div>
          <div className="kpi-footer">
            <span>Built 1960 - 1995 era</span>
          </div>
        </div>

        <div className="kpi-unit">
          <div className="kpi-header">
            <span>Avg Total Rooms</span>
            <DoorOpen size={16} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div className="kpi-number">
            5.42 rms
          </div>
          <div className="kpi-footer">
            <span>1.1 bedrooms average</span>
          </div>
        </div>

        <div className="kpi-unit">
          <div className="kpi-header">
            <span>Coastal Premium</span>
            <MapPin size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <div className="kpi-number">
            +38.4%
          </div>
          <div className="kpi-footer">
            <span>Over Inland Centroid</span>
          </div>
        </div>
      </div>

      <div className="grid-cols-12">
        {/* Main Chart: Income Tier vs Market Price Curve */}
        <div className="col-span-8">
          <div className="clean-card">
            <div className="card-title-row">
              <div>
                <h2 className="card-title">
                  <TrendingUp size={18} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Income vs Property Valuation Curve</span>
                </h2>
                <p className="card-caption">Correlation between median block group household earnings and property value</p>
              </div>
            </div>

            <div style={{ height: '340px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MARKET_TRENDS} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="incomeTier" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(val) => `$${val}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      borderColor: 'var(--border-color)', 
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-mono)'
                    }}
                    formatter={(val: any) => [`$${val},000`, 'Estimated Median Value']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgPrice" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#priceGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Benchmarks Table */}
          <div className="clean-card" style={{ marginTop: '24px' }}>
            <div className="card-title-row">
              <div>
                <h3 className="card-title">
                  <Building size={18} style={{ color: 'var(--accent-blue)' }} />
                  <span>Key California Regional Benchmark Indices</span>
                </h3>
                <p className="card-caption">Baseline reference points used by our valuation model</p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th scope="col" style={{ padding: '10px 12px' }}>Region / Metropolitan Area</th>
                    <th scope="col" style={{ padding: '10px 12px' }}>Median Home Value</th>
                    <th scope="col" style={{ padding: '10px 12px' }}>Est. Price / Sq Ft</th>
                    <th scope="col" style={{ padding: '10px 12px' }}>12-Mo Momentum</th>
                  </tr>
                </thead>
                <tbody>
                  {COUNTY_BENCHMARKS.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{item.region}</td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>{item.medianPrice}</td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>{item.pricePerSqFt}</td>
                      <td style={{ padding: '12px', color: 'var(--accent-emerald)', fontWeight: 600 }}>{item.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Feature Weights & Quick Action */}
        <div className="col-span-4">
          <div className="clean-card">
            <h3 className="card-title" style={{ marginBottom: '16px', fontSize: '1rem' }}>
              <Layers size={16} style={{ color: 'var(--accent-blue)' }} />
              <span>Model Feature Attributions</span>
            </h3>
            <p className="card-caption" style={{ marginBottom: '16px' }}>
              Relative contribution weights calculated from the 100-tree Random Forest Regressor
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {FEATURE_IMPORTANCES.map((item, i) => (
                <div key={i}>
                  <div className="feature-weight-row">
                    <span style={{ color: 'var(--text-secondary)' }}>{item.feature}</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{item.weight}%</span>
                  </div>
                  <div className="feature-bar-bg">
                    <div 
                      className="feature-bar-fill" 
                      style={{ width: `${item.weight}%`, backgroundColor: item.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '28px', padding: '16px', borderRadius: '12px', background: 'var(--bg-inset)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                Test These Dynamics
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Simulate how altering household income or coastal proximity influences the property valuation in real time.
              </p>
              <Link
                href="/predict"
                className="btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <span>Launch Valuation Tool</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
