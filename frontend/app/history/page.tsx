'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AppHeader from '../../components/AppHeader';
import { 
  History, Download, Trash2, ArrowRight, DollarSign, 
  TrendingUp, Calendar, DoorOpen, MapPin, Users 
} from '../../components/Icons';
import { ValuationRecord } from '../../lib/types';

export default function HistoryPage() {
  const [history, setHistory] = useState<ValuationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('propval_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  const handleDeleteItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('propval_history', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear the entire valuation audit ledger?')) {
      setHistory([]);
      localStorage.removeItem('propval_history');
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Record_ID', 'Timestamp', 'Price_USD', 'MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 'Population', 'AveOccup', 'Latitude', 'Longitude'];
    const rows = history.map(item => [
      item.id,
      item.timestamp,
      item.priceUSD,
      item.inputs.MedInc,
      item.inputs.HouseAge,
      item.inputs.AveRooms,
      item.inputs.AveBedrms,
      item.inputs.Population,
      item.inputs.AveOccup,
      item.inputs.Latitude,
      item.inputs.Longitude,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `propval_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(item => {
      const priceStr = item.priceUSD.toString();
      const dateStr = new Date(item.timestamp).toLocaleDateString().toLowerCase();
      const incomeStr = item.inputs.MedInc.toString();
      return priceStr.includes(q) || dateStr.includes(q) || incomeStr.includes(q);
    });
  }, [history, searchQuery]);

  const stats = useMemo(() => {
    if (history.length === 0) {
      return { total: 0, avgPrice: 0, maxPrice: 0 };
    }
    const prices = history.map(h => h.priceUSD);
    const total = history.length;
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / total);
    const maxPrice = Math.max(...prices);
    return { total, avgPrice, maxPrice };
  }, [history]);

  return (
    <>
      <AppHeader 
        title="Valuation Audit Ledger"
        subtitle="Persistent Historical Log of Algorithmic Real Estate Appraisals"
      />

      {/* Summary Stats Strip */}
      <div className="kpi-strip">
        <div className="kpi-unit">
          <div className="kpi-header">
            <span>Appraisals Logged</span>
            <History size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div className="kpi-number">
            {stats.total}
          </div>
          <div className="kpi-footer">
            <span>Stored in Local Ledger</span>
          </div>
        </div>

        <div className="kpi-unit">
          <div className="kpi-header">
            <span>Average Portfolio Value</span>
            <DollarSign size={16} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div className="kpi-number" style={{ color: 'var(--accent-emerald)' }}>
            {stats.avgPrice > 0 ? `$${stats.avgPrice.toLocaleString()}` : '$0'}
          </div>
          <div className="kpi-footer">
            <span>Across logged sessions</span>
          </div>
        </div>

        <div className="kpi-unit">
          <div className="kpi-header">
            <span>Peak Appraisal</span>
            <TrendingUp size={16} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div className="kpi-number">
            {stats.maxPrice > 0 ? `$${stats.maxPrice.toLocaleString()}` : '$0'}
          </div>
          <div className="kpi-footer">
            <span>Highest predicted valuation</span>
          </div>
        </div>
      </div>

      <div className="clean-card">
        <div className="card-title-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="card-title">
              <History size={18} style={{ color: 'var(--accent-emerald)' }} />
              <span>Valuation Records</span>
            </h2>
            <p className="card-caption">All algorithmic appraisals generated by the machine learning pipeline</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="text"
              placeholder="Filter by price or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-inset)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '7px 14px',
                color: 'var(--text-main)',
                fontSize: '0.825rem',
                outline: 'none',
              }}
            />

            <button 
              type="button" 
              className="archetype-btn"
              onClick={handleExportCSV}
              disabled={history.length === 0}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button 
              type="button" 
              className="archetype-btn"
              onClick={handleClearAll}
              disabled={history.length === 0}
              style={{ color: 'var(--accent-rose)' }}
            >
              <Trash2 size={14} />
              <span>Clear Ledger</span>
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <History size={52} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              No Records Found
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
              Run a valuation calculation in the Precision Predictor to record appraisal entries in the audit ledger.
            </p>
            <Link href="/predict" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}>
              <span>Open Precision Predictor</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredHistory.map((record) => {
              const queryParams = new URLSearchParams({
                MedInc: record.inputs.MedInc.toString(),
                HouseAge: record.inputs.HouseAge.toString(),
                AveRooms: record.inputs.AveRooms.toString(),
                AveBedrms: record.inputs.AveBedrms.toString(),
                Population: record.inputs.Population.toString(),
                AveOccup: record.inputs.AveOccup.toString(),
                Latitude: record.inputs.Latitude.toString(),
                Longitude: record.inputs.Longitude.toString(),
              }).toString();

              return (
                <div key={record.id} className="history-row">
                  <div>
                    <div className="history-price">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(record.priceUSD)}
                    </div>
                    <div className="history-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                      <span>{new Date(record.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="field-value-badge" style={{ fontSize: '0.75rem', padding: '1px 6px' }}>
                        Income: ${(record.inputs.MedInc * 10).toFixed(0)}k/yr
                      </span>
                      <span>•</span>
                      <span>{record.inputs.HouseAge} yrs old</span>
                      <span>•</span>
                      <span>{record.inputs.AveRooms.toFixed(1)} rooms</span>
                      <span>•</span>
                      <span>{record.inputs.Latitude.toFixed(2)}°N, {record.inputs.Longitude.toFixed(2)}°W</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link
                      href={`/predict?${queryParams}`}
                      className="archetype-btn"
                      style={{ textDecoration: 'none' }}
                      title="Pre-populate valuation inputs with this record"
                    >
                      <span>Load in Predictor</span>
                      <ArrowRight size={14} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(record.id)}
                      className="copy-btn"
                      style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                      title="Delete this record"
                      aria-label="Delete this record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
