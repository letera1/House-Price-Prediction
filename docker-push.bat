@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   PropVal AI - Docker Hub Packaging & Push Wizard
echo ===================================================
echo.

set /p DOCKER_USER="Enter your Docker Hub username (e.g. letera): "
if "%DOCKER_USER%"=="" (
    echo Error: Docker Hub username cannot be empty.
    pause
    exit /b 1
)

set IMAGE_NAME=%DOCKER_USER%/house-price-prediction
set TAG=2.0.0

echo.
echo [1/4] Authenticating with Docker Hub...
docker login
if %errorlevel% neq 0 (
    echo Docker login failed. Please verify credentials.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Building hardened production image: %IMAGE_NAME%:%TAG%...
docker build -t %IMAGE_NAME%:%TAG% -t %IMAGE_NAME%:latest -f backend/Dockerfile backend/
if %errorlevel% neq 0 (
    echo Build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Testing container healthcheck locally...
docker run --rm -d --name propval-test-container -p 8080:8080 %IMAGE_NAME%:%TAG%
timeout /t 5 /nobreak >nul
curl -f http://localhost:8080/health
if %errorlevel% neq 0 (
    echo Healthcheck failed on test container.
    docker stop propval-test-container
    pause
    exit /b 1
)
docker stop propval-test-container
echo [PASS] Container verified and healthy!

echo.
echo [4/4] Pushing images to Docker Hub...
docker push %IMAGE_NAME%:%TAG%
docker push %IMAGE_NAME%:latest

echo.
echo ===================================================
echo   Successfully pushed to Docker Hub!
echo   Image: %IMAGE_NAME%:%TAG%
echo   Image: %IMAGE_NAME%:latest
echo ===================================================
pause
