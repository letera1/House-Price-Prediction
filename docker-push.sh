#!/usr/bin/env bash
set -e

echo "==================================================="
echo "  PropVal AI - Docker Hub Packaging & Push Script"
echo "==================================================="

read -rp "Enter your Docker Hub username: " DOCKER_USER
if [ -z "$DOCKER_USER" ]; then
    echo "Error: Docker Hub username cannot be empty."
    exit 1
fi

IMAGE_NAME="${DOCKER_USER}/house-price-prediction"
TAG="2.0.0"

echo ""
echo "[1/4] Authenticating with Docker Hub..."
docker login

echo ""
echo "[2/4] Building production image: ${IMAGE_NAME}:${TAG}..."
docker build -t "${IMAGE_NAME}:${TAG}" -t "${IMAGE_NAME}:latest" -f backend/Dockerfile backend/

echo ""
echo "[3/4] Verifying container health..."
CONTAINER_ID=$(docker run --rm -d -p 8080:8080 "${IMAGE_NAME}:${TAG}")
sleep 4
if curl -fs "http://localhost:8080/health" > /dev/null; then
    echo "✓ Healthcheck passed!"
    docker stop "$CONTAINER_ID"
else
    echo "❌ Healthcheck failed."
    docker stop "$CONTAINER_ID"
    exit 1
fi

echo ""
echo "[4/4] Pushing images to Docker Hub..."
docker push "${IMAGE_NAME}:${TAG}"
docker push "${IMAGE_NAME}:latest"

echo ""
echo "==================================================="
echo "✓ Successfully pushed to Docker Hub!"
echo "  Repository: https://hub.docker.com/r/${IMAGE_NAME}"
echo "==================================================="
