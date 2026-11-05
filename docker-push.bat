@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo   PropVal AI - Enterprise Docker Hub Packaging ^& Push Wizard
echo ==============================================================================
echo.

set /p DOCKER_USER="Enter your Docker Hub username [default: tuta699]: "
if "%DOCKER_USER%"=="" set DOCKER_USER=tuta699

set TAG=2.0.0
set API_IMAGE=%DOCKER_USER%/house-price-prediction-api
set WEB_IMAGE=%DOCKER_USER%/house-price-prediction-frontend

echo.
echo Target Images:
echo   - Backend API:  %API_IMAGE%:%TAG% and %API_IMAGE%:latest
echo   - Frontend UI:  %WEB_IMAGE%:%TAG% and %WEB_IMAGE%:latest
echo.

echo Select deployment mode:
echo   1. Backend ML Inference API only
echo   2. Full Stack (Backend API + Frontend Web)
echo   3. Frontend Web only
set /p CHOICE="Enter choice (1/2/3) [default: 2]: "
if "%CHOICE%"=="" set CHOICE=2

echo.
echo [1/4] Authenticating with Docker Hub...
docker login
if %errorlevel% neq 0 (
    echo [ERROR] Docker authentication failed. Please verify credentials.
    pause
    exit /b %errorlevel%
)

if "%CHOICE%"=="1" goto BUILD_API
if "%CHOICE%"=="2" goto BUILD_BOTH
if "%CHOICE%"=="3" goto BUILD_WEB

:BUILD_BOTH
:BUILD_API
echo.
echo [2/4] Building hardened backend API: %API_IMAGE%:%TAG%...
docker build -t %API_IMAGE%:%TAG% -t %API_IMAGE%:latest -f backend/Dockerfile backend/
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Testing container healthcheck locally...
docker run --rm -d --name propval-test-api -p 8080:8080 %API_IMAGE%:%TAG%
timeout /t 6 /nobreak >nul
curl -f http://localhost:8080/health
if %errorlevel% neq 0 (
    echo [ERROR] Healthcheck failed on test container.
    docker stop propval-test-api
    pause
    exit /b 1
)
docker stop propval-test-api
echo [PASS] Backend API container verified and healthy!

if "%CHOICE%"=="1" goto PUSH_API

:BUILD_WEB
echo.
echo Building optimized frontend Next.js: %WEB_IMAGE%:%TAG%...
docker build -t %WEB_IMAGE%:%TAG% -t %WEB_IMAGE%:latest -f frontend/Dockerfile frontend/
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b %errorlevel%
)

if "%CHOICE%"=="3" goto PUSH_WEB

:PUSH_BOTH
echo.
echo [4/4] Pushing all images to Docker Hub (%DOCKER_USER%)...
docker push %API_IMAGE%:%TAG%
docker push %API_IMAGE%:latest
docker push %WEB_IMAGE%:%TAG%
docker push %WEB_IMAGE%:latest
goto FINISHED

:PUSH_API
echo.
echo [4/4] Pushing backend API to Docker Hub (%DOCKER_USER%)...
docker push %API_IMAGE%:%TAG%
docker push %API_IMAGE%:latest
goto FINISHED

:PUSH_WEB
echo.
echo [4/4] Pushing frontend web to Docker Hub (%DOCKER_USER%)...
docker push %WEB_IMAGE%:%TAG%
docker push %WEB_IMAGE%:latest
goto FINISHED

:FINISHED
echo.
echo ==============================================================================
echo [SUCCESS] Docker images successfully verified and published to Docker Hub!
echo   Registry: https://hub.docker.com/u/%DOCKER_USER%
echo ==============================================================================
pause
