# Multi-Architecture Build Guide

This guide explains how to build and push both ARM64 and AMD64 images to Docker Hub.

## Quick Start

Run the automated script:
```bash
cd /home/noof/Projects/universal-demo-app
./build-and-push-multiarch.sh
```

## Manual Step-by-Step

### Step 1: Build and Push ARM64 (Native - Fast)

```bash
cd /home/noof/Projects/universal-demo-app

# Build ARM64 images
docker-compose build --no-cache

# Login to Docker Hub
docker login

# Push ARM64 images
docker push hd1912/universal-demo-backend:arm64
docker push hd1912/universal-demo-frontend:arm64
```

### Step 2: Install QEMU for Cross-Platform Builds

```bash
sudo apt-get update
sudo apt-get install -y qemu-user-static binfmt-support
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
```

### Step 3: Build and Push AMD64 (Emulated - Slower)

```bash
cd /home/noof/Projects/universal-demo-app

# Build AMD64 images
docker-compose -f docker-compose.amd64.yml build --no-cache

# Push AMD64 images
docker push hd1912/universal-demo-backend:amd64
docker push hd1912/universal-demo-frontend:amd64
```

## Available Images

After building, you'll have:

- `hd1912/universal-demo-backend:arm64` - ARM64 backend
- `hd1912/universal-demo-backend:amd64` - AMD64 backend
- `hd1912/universal-demo-frontend:arm64` - ARM64 frontend
- `hd1912/universal-demo-frontend:amd64` - AMD64 frontend

## Deployment

### On ARM64 systems (Apple Silicon, Raspberry Pi, etc.):
```bash
docker-compose up -d
```

### On AMD64 systems (Intel/AMD x86_64):
```bash
docker-compose -f docker-compose.amd64.yml up -d
```

### Pull-only deployment (no build):
```bash
docker-compose -f docker-compose.hub.yml up -d
```

## File Structure

- `Dockerfile` - ARM64 Dockerfiles (in backend/ and frontend/)
- `Dockerfile.amd64` - AMD64 Dockerfiles (in backend/ and frontend/)
- `docker-compose.yml` - ARM64 build configuration
- `docker-compose.amd64.yml` - AMD64 build configuration
- `docker-compose.hub.yml` - Pull-only configuration
- `build-and-push-multiarch.sh` - Automated build script

## Troubleshooting

### "exec format error"
- Make sure QEMU is installed and configured
- Run: `docker run --rm --privileged multiarch/qemu-user-static --reset -p yes`

### Build is very slow
- AMD64 builds on ARM64 are slower due to emulation (this is normal)
- ARM64 builds should be fast (native)

### Permission denied
- Add your user to docker group: `sudo usermod -aG docker $USER`
- Then logout and login again, or run: `newgrp docker`
