@echo off
echo ========================================
echo   Demo Showcase Application Launcher
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed. Please install Docker Desktop.
    echo Visit: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker is installed and running
echo.

REM Create necessary directories
if not exist "videos" mkdir videos
if not exist "database" mkdir database

echo Building and starting containers...
echo.

REM Build and start with docker-compose
docker-compose up --build -d

echo.
echo Application started successfully!
echo.
echo Access the application at:
echo   Frontend: http://localhost
echo   Backend API: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo To stop the application, run:
echo   docker-compose down
echo.
echo To view logs, run:
echo   docker-compose logs -f
echo.
pause
