'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle, XCircle, Loader, Terminal } from './Icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface AppHeaderProps {
  title: string;
  subtitle: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  const pathname = usePathname();
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'error'>('checking');

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data.status === 'healthy' ? 'healthy' : 'error');
      } else {
        setApiStatus('error');
      }
    } catch {
      setApiStatus('error');
    }
  };

  const isDevPage = pathname === '/developer';

  return (
    <header className="top-header">
      <div className="header-meta">
        <h1>
          <span>{title}</span>
          <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', border: '1px solid var(--accent-emerald-border)', fontWeight: 600 }}>
            v2.0.0
          </span>
        </h1>
        <p>{subtitle}</p>
      </div>

      <div className="header-pill-group">
        <div 
          className={`status-pill ${apiStatus === 'healthy' ? 'online' : apiStatus === 'error' ? 'offline' : ''}`}
          role="status"
          aria-live="polite"
        >
          {apiStatus === 'healthy' ? (
            <>
              <CheckCircle size={13} />
              <span>Model Online (8080)</span>
            </>
          ) : apiStatus === 'error' ? (
            <>
              <XCircle size={13} />
              <span>API Disconnected</span>
            </>
          ) : (
            <>
              <Loader size={13} className="spinner" />
              <span>Verifying API</span>
            </>
          )}
        </div>

        <Link
          href={isDevPage ? '/predict' : '/developer'}
          className={`dev-toggle-btn ${isDevPage ? 'active' : ''}`}
          title={isDevPage ? 'Back to Predictor' : 'Open Developer Inspector'}
        >
          <Terminal size={13} />
          <span>{isDevPage ? 'Predictor' : 'Dev Inspector'}</span>
        </Link>
      </div>
    </header>
  );
}
