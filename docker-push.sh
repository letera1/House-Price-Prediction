#!/usr/bin/env bash
set -e

echo "=============================================================================="
echo "  PropVal AI - Enterprise Docker Hub Packaging & Push Script"
echo "=============================================================================="
echo ""

read -rp "Enter your Docker Hub username [default: tuta699]: " DOCKER_USER
DOCKER_USER=${DOCKER_USER:-tuta699}

TAG="2.0.0"
API_IMAGE="${DOCKER_USER}/house-price-prediction-api"
WEB_IMAGE="${DOCKER_USER}/house-price-prediction-frontend"

echo ""
echo "Target Images:"
echo "  - Backend API:  ${API_IMAGE}:${TAG} and ${API_IMAGE}:latest"
echo "  - Frontend UI:  ${WEB_IMAGE}:${TAG} and ${WEB_IMAGE}:latest"
echo ""

echo "Select deployment mode:"
echo "  1. Backend ML Inference API only"
echo "  2. Full Stack (Backend API + Frontend Web)"
echo "  3. Frontend Web only"
read -rp "Enter choice (1/2/3) [default: 2]: " CHOICE
CHOICE=${CHOICE:-2}

echo ""
echo "[1/4] Authenticating with Docker Hub..."
docker login

build_api() {
    echo ""
    echo "[2/4] Building hardened backend API: ${API_IMAGE}:${TAG}..."
    docker build -t "${API_IMAGE}:${TAG}" -t "${API_IMAGE}:latest" -f backend/Dockerfile backend/

    echo ""
    echo "[3/4] Verifying container health..."
    CONTAINER_ID=$(docker run --rm -d -p 8080:8080 "${API_IMAGE}:${TAG}")
    sleep 5
    if curl -fs "http://localhost:8080/health" > /dev/null; then
        echo "✓ Backend healthcheck passed!"
        docker stop "$CONTAINER_ID"
    else
        echo "❌ Backend healthcheck failed."
        docker stop "$CONTAINER_ID"
        exit 1
    fi
}

build_web() {
    echo ""
    echo "Building optimized frontend Next.js: ${WEB_IMAGE}:${TAG}..."
    docker build -t "${WEB_IMAGE}:${TAG}" -t "${WEB_IMAGE}:latest" -f frontend/Dockerfile frontend/
}

push_api() {
    echo ""
    echo "Pushing backend API to Docker Hub (${DOCKER_USER})..."
    docker push "${API_IMAGE}:${TAG}"
    docker push "${API_IMAGE}:latest"
}

push_web() {
    echo ""
    echo "Pushing frontend web to Docker Hub (${DOCKER_USER})..."
    docker push "${WEB_IMAGE}:${TAG}"
    docker push "${WEB_IMAGE}:latest"
}

if [ "$CHOICE" = "1" ]; then
    build_api
    push_api
elif [ "$CHOICE" = "2" ]; then
    build_api
    build_web
    push_api
    push_web
elif [ "$CHOICE" = "3" ]; then
    build_web
    push_web
fi

echo ""
echo "=============================================================================="
echo "✓ Successfully pushed to Docker Hub!"
echo "  Registry: https://hub.docker.com/u/${DOCKER_USER}"
echo "=============================================================================="
