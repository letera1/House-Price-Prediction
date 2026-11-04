# ==============================================================================
# PropVal AI - Production Container
# Multi-stage, non-root, security-hardened container for Docker Hub
# ==============================================================================

# Build Stage
FROM python:3.11-slim AS builder

WORKDIR /install

# Install build dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements_api.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements_api.txt

# Final Runtime Stage
FROM python:3.11-slim AS runner

# OCI Standard Metadata Labels for Docker Hub
LABEL org.opencontainers.image.title="PropVal AI - House Price Prediction API" \
      org.opencontainers.image.description="Production-grade ML inference engine for California residential valuation" \
      org.opencontainers.image.version="2.0.0" \
      org.opencontainers.image.vendor="Letera Tujo" \
      org.opencontainers.image.licenses="MIT"

# Security & Optimization Environment Variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080 \
    FLASK_ENV=production

WORKDIR /app

# Copy pre-built dependencies from builder
COPY --from=builder /install /usr/local

# Create non-root dedicated service user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/false -M -d /app appuser

# Copy application artifacts
COPY --chown=appuser:appgroup app.py preprocessing.py ./
COPY --chown=appuser:appgroup models/ models/

# Enforce secure non-root permissions
USER 10001:10001

# Document container port
EXPOSE 8080

# Native healthcheck using python standard library (no curl dependency required)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; sys_exit = 0 if urllib.request.urlopen('http://localhost:8080/health').getcode() == 200 else 1; exit(sys_exit)" || exit 1

# Launch with Gunicorn WSGI production server
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "4", "--threads", "2", "--timeout", "60", "--access-logfile", "-", "--error-logfile", "-", "app:app"]
