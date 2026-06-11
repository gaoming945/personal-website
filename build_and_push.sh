#!/bin/bash
# Build Docker image locally using Docker Buildx (if available) or use remote build

# Create a temporary build context
mkdir -p /tmp/docker-build
cp -r dist/ /tmp/docker-build/
cp nginx.conf /tmp/docker-build/
cp Dockerfile.deploy /tmp/docker-build/Dockerfile

# Try to build locally if docker is available
if command -v docker &> /dev/null; then
    cd /tmp/docker-build
    docker build -t personal-website:latest .
    docker save personal-website:latest | gzip > /tmp/personal-website.tar.gz
    echo "Image built locally"
else
    echo "Docker not available locally, will build on remote"
fi
