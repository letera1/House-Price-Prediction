# PropVal AI — California House Price Prediction API

[![Docker Image Version](https://img.shields.io/badge/docker%20image-2.0.0-blue?logo=docker)](https://hub.docker.com/r/tuta699/house-price-prediction-api)
[![Python Version](https://img.shields.io/badge/python-3.11--slim-yellow?logo=python)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Security: Hardened](https://img.shields.io/badge/security-non--root%20%7C%20read--only-emerald)](#security--hardening)
[![Pydantic v2](https://img.shields.io/badge/validation-Pydantic%20v2-red)](https://docs.pydantic.dev/)

> **PropVal AI** is a production-grade machine learning inference microservice for California residential real estate appraisal. It serves a 100-tree Scikit-Learn **Random Forest Regressor** behind a hardened **Gunicorn WSGI** HTTP server with **Pydantic v2** schema validation, sub-25ms inference latency, and enterprise-grade Docker security controls.

---

## ⚡ Quick Start

### 1. Pull from Docker Hub
```bash
docker pull tuta699/house-price-prediction-api:2.0.0
```

### 2. Run the Container
```bash
docker run -d \
  --name propval-api \
  -p 127.0.0.1:8080:8080 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  tuta699/house-price-prediction-api:2.0.0
```

### 3. Verify Health
```bash
curl -f http://localhost:8080/health
```

---

## 🚀 Docker Compose (Recommended)

Run the full stack with an **isolated CIDR bridge network** (`172.28.0.0/16`) and defense-in-depth security:

```yaml
version: '3.8'

services:
  propval-api:
    image: tuta699/house-price-prediction-api:2.0.0
    container_name: propval-ml-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"
    environment:
      - PORT=8080
      - FLASK_ENV=production
      - LOG_LEVEL=INFO
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=64m
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1024M
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; exit(0 if urllib.request.urlopen('http://localhost:8080/health').getcode() == 200 else 1)"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 15s
    networks:
      propval-tier:
        ipv4_address: 172.28.0.10

networks:
  propval-tier:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.28.0.0/16
          gateway: 172.28.0.1
```

Launch with:
```bash
docker compose up -d
```

---

## 📡 REST API Reference

### `POST /predict` (or `/api/predict`)
Generates an algorithmic appraisal for a California census block group.

#### Request Headers:
```http
Content-Type: application/json
```

#### Request Payload:
```json
{
  "MedInc": 8.5,
  "HouseAge": 18.0,
  "AveRooms": 6.8,
  "AveBedrms": 1.1,
  "Population": 1400.0,
  "AveOccup": 2.7,
  "Latitude": 37.85,
  "Longitude": -122.25
}
```

#### Input Parameter Specification:
| Field | Type | Bounds | Description |
| :--- | :--- | :--- | :--- |
| `MedInc` | `float` | $\ge 0.0$ | Median household income (in \$10,000s, e.g. 8.5 = \$85,000/yr) |
| `HouseAge` | `float` | $\ge 0.0$ | Median structure age in years |
| `AveRooms` | `float` | $\ge 0.0$ | Average number of rooms per household |
| `AveBedrms`| `float` | $\ge 0.0$ | Average number of bedrooms per household |
| `Population`| `float`| $\ge 0.0$ | Total block group population count |
| `AveOccup` | `float` | $> 0.0$ | Average number of household occupants |
| `Latitude` | `float` | $[32.0, 42.0]$ | California geographical latitude |
| `Longitude`| `float` | $[-125.0, -114.0]$ | California geographical longitude |

#### Response (`200 OK`):
```json
{
  "prediction_value": 3.55823,
  "currency": "USD",
  "scale": "100,000s",
  "input_received": {
    "MedInc": 8.5,
    "HouseAge": 18.0,
    "AveRooms": 6.8,
    "AveBedrms": 1.1,
    "Population": 1400.0,
    "AveOccup": 2.7,
    "Latitude": 37.85,
    "Longitude": -122.25
  }
}
```
*Note: `prediction_value: 3.55823` represents **\$355,823 USD** ($3.55823 \times \$100,000$).*

---

### `GET /health`
Liveness probe and model metadata inspection.

#### Response (`200 OK`):
```json
{
  "status": "healthy",
  "model_loaded": true,
  "metadata": {
    "r2": 0.7324,
    "mse": 0.3511
  }
}
```

---

## 🔒 Security & Hardening Architecture

This image is engineered with security-first production standards:

- **Non-Root User Enforcement**: Executes under dedicated unprivileged user `appuser:appgroup` (`UID:GID 10001:10001`). No root privileges exist inside the running container.
- **Immutable Read-Only Filesystem**: Container root can be safely mounted read-only (`--read-only`), preventing disk manipulation and unauthorized binary execution.
- **Ephemeral In-Memory Scratch Space**: Uses `/tmp` tmpfs mount (`size=64m,noexec,nosuid`) for Gunicorn socket locks.
- **Kernel Capability Stripping**: Runs with `--cap-drop ALL`, revoking raw network, administrative, and system modification capabilities.
- **Privilege Escalation Blocked**: `no-new-privileges:true` prevents `setuid` privilege escalation.
- **Zero Secrets / Bloat**: Built via multi-stage Docker build; `.dockerignore` filters out `.git`, `.env`, tests, virtual environments, and caches.
- **Explicit CIDR IPAM Subnetting**: Supports isolated Docker bridge networks (`172.28.0.0/16`) to prevent default bridge snooping and LAN address collisions.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `8080` | Port Gunicorn listens on inside the container |
| `FLASK_ENV` | `production` | Execution environment mode |
| `LOG_LEVEL` | `INFO` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `PYTHONUNBUFFERED` | `1` | Ensures real-time stdout/stderr log streaming |

---

## 🧠 Machine Learning Model Specs

- **Algorithm**: Scikit-Learn `RandomForestRegressor` (100 estimators)
- **Feature Engineering**: Ratio transforms (`RoomsPerPerson`, `BedroomsRatio`), demographic binning, and centroid geospatial distance calculation
- **Benchmark Evaluation**:
  - $R^2 \text{ Score}$: **0.7324** (Cross-validated)
  - $\text{Mean Squared Error (MSE)}$: **0.3511**

---

## 👤 Maintainer

- **Developer**: Letera Tujo ([@tuta699](https://hub.docker.com/u/tuta699))
- **Project**: PropVal AI California Real Estate Valuation
- **License**: MIT
