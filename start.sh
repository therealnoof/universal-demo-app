#!/bin/bash

echo "========================================"
echo "  Demo Showcase Application Launcher"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    echo "   Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Create necessary directories
mkdir -p videos database

echo "📦 Building and starting containers..."
echo ""

# Build and start with docker-compose
docker-compose up --build -d

echo ""
echo "✅ Application started successfully!"
echo ""
echo "Access the application at:"
echo "  🌐 Frontend: http://localhost"
echo "  🔧 Backend API: http://localhost:8000"
echo "  📚 API Docs: http://localhost:8000/docs"
echo ""
echo "To stop the application, run:"
echo "  docker-compose down"
echo ""
echo "To view logs, run:"
echo "  docker-compose logs -f"
echo ""
