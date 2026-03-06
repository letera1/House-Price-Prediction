# Use official Python runtime as base image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements_api.txt .
RUN pip install --no-cache-dir -r requirements_api.txt

# Create a non-root user for security
RUN adduser --disabled-password --gecos '' appuser

# Copy project files
# Ensure preprocessing.py is copied!
COPY app.py preprocessing.py ./
COPY models/ models/

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Run with Gunicorn (Production Server)
# 4 workers is a good default for typical web apps
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "--access-logfile", "-", "app:app"]
