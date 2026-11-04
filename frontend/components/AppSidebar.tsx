'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building, Sparkles, BarChart3, Code2, History, Sun, Moon 
} from './Icons';

export default function AppSidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = (localStorage.getItem('propval_theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('propval_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const navItems = [
    { href: '/predict', label: 'Precision Valuation', icon: Sparkles },
    { href: '/dashboard', label: 'Market Intelligence', icon: BarChart3 },
    { href: '/developer', label: 'Developer Telemetry', icon: Code2 },
    { href: '/history', label: 'Audit History', icon: History },
  ];

  const isActive = (href: string) => {
    if (href === '/predict') {
      return pathname === '/predict' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="app-sidebar" aria-label="Application Navigation">
      <Link href="/predict" className="brand-badge" title="PropVal AI - Home" aria-label="PropVal AI Home">
        <Building size={24} />
      </Link>

      <nav className="nav-cluster" aria-label="Main Navigation">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-btn ${active ? 'active' : ''}`}
                  title={item.label}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  <IconComponent size={20} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button 
          type="button"
          className="nav-btn" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Charcoal Dark'}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Charcoal Dark'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </aside>
  );
}
