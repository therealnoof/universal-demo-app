#!/bin/bash
set -e

echo "=================================="
echo "Multi-Architecture Build & Push"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Build and push ARM64 (native, fast)
echo -e "${BLUE}[1/4] Building ARM64 images (native, fast)...${NC}"
cd /home/noof/Projects/universal-demo-app
docker-compose build --no-cache

echo -e "${GREEN}✓ ARM64 images built${NC}"
echo ""

# Step 2: Tag ARM64 images
echo -e "${BLUE}[2/4] Tagging ARM64 images...${NC}"
docker tag hd1912/universal-demo-backend:latest hd1912/universal-demo-backend:arm64
docker tag hd1912/universal-demo-frontend:latest hd1912/universal-demo-frontend:arm64

echo -e "${GREEN}✓ ARM64 images tagged${NC}"
echo ""

# Step 3: Push ARM64 images
echo -e "${BLUE}[3/4] Pushing ARM64 images to Docker Hub...${NC}"
docker login
docker push hd1912/universal-demo-backend:arm64
docker push hd1912/universal-demo-frontend:arm64

echo -e "${GREEN}✓ ARM64 images pushed${NC}"
echo ""

# Step 4: Install QEMU if not already installed
echo -e "${BLUE}[4/4] Setting up QEMU for AMD64 builds...${NC}"
if ! command -v qemu-x86_64-static &> /dev/null; then
    echo "Installing QEMU..."
    sudo apt-get update
    sudo apt-get install -y qemu-user-static binfmt-support
    docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
    echo -e "${GREEN}✓ QEMU installed${NC}"
else
    echo -e "${GREEN}✓ QEMU already installed${NC}"
    docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
fi
echo ""

# Step 5: Update configs for AMD64
echo -e "${BLUE}[5/4] Updating configurations for AMD64...${NC}"
# This will be done via Claude in the next step
echo "Run the AMD64 build commands next..."
echo ""

echo -e "${GREEN}=================================="
echo "ARM64 Build Complete!"
echo "==================================${NC}"
echo ""
echo "Next steps:"
echo "1. Run: cd /home/noof/Projects/universal-demo-app"
echo "2. Build AMD64: docker-compose -f docker-compose.amd64.yml build --no-cache"
echo "3. Push AMD64: docker push hd1912/universal-demo-backend:amd64"
echo "4.             docker push hd1912/universal-demo-frontend:amd64"
