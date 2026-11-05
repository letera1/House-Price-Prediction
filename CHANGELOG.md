# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - 2026-11-05

### Added
- 🐳 **Docker Hub Production Packaging**: Multi-stage, non-root OCI images for backend API (`tuta699/house-price-prediction-api:2.0.0`) and standalone Next.js frontend (`tuta699/house-price-prediction-frontend:2.0.0`).
- 🌐 **RFC 1918 CIDR Network Isolation**: Custom bridge network (`propval-custom-bridge`) with dedicated IPAM subnet (`172.28.0.0/16`) and static container IPs.
- 🔒 **Defense-in-Depth Container Hardening**: Read-only root filesystem (`read_only: true`), execution-stripped memory temp storage (`tmpfs: /tmp`), Linux capability dropping (`cap_drop: [ALL]`), and privilege escalation blocking (`no-new-privileges:true`).
- 🛡️ **Resource Quotas**: Hard CPU limits (2.0 cores) and memory caps (1024MB) preventing resource exhaustion / DoS attacks.
- 🚀 **Push Automation Wizards**: Interactive Windows (`docker-push.bat`) and POSIX (`docker-push.sh`) scripts with local container healthcheck verification.
- 📜 **Open-Source Governance Suite**: Added `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1), overhauled `SECURITY.md` with vulnerability triage SLA, enhanced `CONTRIBUTING.md`, and added GitHub issue/PR templates.

---

## [2.1.0] - 2026-11-04

### Added
- 🎨 **Supabase-Inspired Design System**: Architectural Charcoal Dark (`#121212` / `#181818` with `#3ecf8e` green) and Platinum Light themes with compact typography (11–13px) and 32–36px controls.
- ✨ **Standardized Lucide Icons**: Replaced all custom SVGs with official `lucide-react` icons across the entire platform.
- ⚡ **Interactive Live Mode**: Real-time 120ms debounced valuation calculations toggled via native HTML accessible switch (`role="switch"`).
- 📍 **California Geospatial Context Engine**: Dynamic submarket resolver that maps latitude/longitude coordinates to Bay Area, Silicon Valley, SoCal Coastal, or Central Valley tiers.
- 🔨 **"What-If" Renovation Lift Simulator**: One-click scenario chips (`+1 Room`, `Modernize (-10y)`, `Lower Density (-0.5)`, `Income Lift (+$20k)`, `Reset`) calculating real-time value deltas.
- 📊 **Valuation Driver Attribution**: Visual breakdown attributing property value to income, location, structural size, and age.
- 📋 **Persistent Valuation Audit Ledger (`/history`)**: Local audit storage with real-time text filtering, portfolio KPI summaries, and 1-click CSV export.
- 🖨️ **Appraisal Report Exporter**: One-click executive summary clipboard copy and print-ready appraisal sheets.

### Fixed
- 🐛 **Grid Layout Column Collapse**: Resolved CSS grid squishing on `/developer` and `/dashboard` by introducing dedicated `.developer-container` and `.dashboard-container` classes.
- 📦 **Next.js 16 Standalone Build**: Configured `output: 'standalone'` in `next.config.ts`, reducing production image sizes from 1.2GB to ~160MB.

---

## [2.0.0] - 2026-03-06

### Added
- ⚛️ Next.js 16 frontend with TypeScript.
- 🔌 Flask REST API with Pydantic v2 input validation.
- 🔒 Security headers (`nosniff`, `DENY`, `X-XSS-Protection`) and 16MB payload cap.
- 🧪 API health check endpoint (`/health`).
- 📁 Multi-stage project structure (clean frontend/backend decoupling).

---

## [1.0.0] - 2026-03-04

### Added
- 🤖 Scikit-Learn machine learning pipeline comparing 7 regression algorithms.
- 🎯 Trained Random Forest Regressor ($R^2 = 0.7324$, $\text{MSE} = 0.3511$).
- 🔧 Custom feature engineering module (`preprocessing.py`) computing demographic ratios, age bins, and centroid distances.
- 💾 Serialized model pipeline artifact (`final_pipeline.pkl`) with joblib.
