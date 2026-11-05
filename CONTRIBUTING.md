# Contributing to PropVal AI

First off, thank you for considering contributing to **PropVal AI**! 🎉 

PropVal AI is an enterprise-grade California residential property valuation engine featuring machine learning pipelines, a compact Supabase-inspired Next.js 16 interface, and security-hardened Docker containerization.

---

## 🧭 Code of Conduct

All contributors and participants are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## 🛠️ Development Setup

### Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 20.x or 22.x LTS
- **Docker & Docker Compose**: v28.0+ (optional, for container validation)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/tuta699/house-price-prediction.git
cd "House Price Prediction"
```

### 2. Backend Environment (Python 3.11)
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements_api.txt
pip install -r requirements.txt

# Run backend development server (port 8080)
python app.py
```
Verify backend health: `curl http://localhost:8080/health`

### 3. Frontend Environment (Next.js 16 + React 19)
```bash
cd ../frontend

# Install dependencies (use --legacy-peer-deps for React 19 compatibility)
npm install --legacy-peer-deps

# Start Next.js Turbopack development server (port 3000)
npm run dev
```
Open [http://localhost:3000/predict](http://localhost:3000/predict) in your browser.

---

## 🧪 Testing & Verification

Before opening a pull request, run all automated checks:

```bash
# Frontend type check & production build verification
cd frontend
npm run build

# Docker Compose integration test
cd ..
docker compose up -d --build
curl -f http://localhost:8080/health
curl -f http://localhost:3000/predict
docker compose down
```

---

## 🌿 Git Branching & Commit Conventions

### Branch Naming
- `feat/feature-name` (New features)
- `fix/bug-fix-name` (Bug fixes)
- `perf/optimization` (Performance enhancements)
- `docs/doc-update` (Documentation changes)
- `refactor/cleanup` (Code refactoring)

### Conventional Commits
Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
```
feat(predict): add live debounced sensitivity simulator
fix(grid): resolve column squishing with dedicated developer container
docs(docker): document CIDR subnet allocation in security guide
perf(build): enable Next.js standalone output for minimal image size
```

---

## 📐 Coding Standards

### Backend (Python)
- Follow **PEP 8** style guidelines.
- Enforce strict type hints and Pydantic v2 schemas for all API payloads.
- Write docstrings for all functions, modules, and pipeline transformers.
- Handle exceptions gracefully with appropriate HTTP status codes (400, 422, 500).

### Frontend (TypeScript / Next.js)
- Use **Next.js 16 App Router** with TypeScript.
- Follow the **Supabase / Linear compact design system** (11–13px typography, 32–36px controls, neutral charcoal dark theme).
- Use official **`lucide-react`** components for all icons (no custom hand-drawn or generated SVGs).
- Always include accessible labels, `role="switch"`, `aria-checked`, and keyboard navigation landmarks.

---

## 🚀 Pull Request Checklist

When submitting a PR:
1. Ensure your branch is rebased onto the latest `main`.
2. Verify that `npm run build` succeeds with zero errors.
3. Update documentation (`README.md`, `CHANGELOG.md`) if introducing new user-facing features or API parameters.
4. Follow the PR template and provide a concise summary of your changes.

Thank you for helping build PropVal AI! 🌟
