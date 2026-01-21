#!/bin/bash

echo "🚀 Starting GullyGram Application..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL with PostGIS
echo "📦 Starting PostgreSQL with PostGIS..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is healthy
until docker exec gully_postgres pg_isready -U gully_user > /dev/null 2>&1; do
    echo "⏳ Still waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"
echo ""

# Build and run the application
echo "🔨 Building the application..."
./mvnw clean install -DskipTests

echo ""
echo "🎉 Starting Spring Boot application..."
echo "📍 API will be available at: http://localhost:8080"
echo "📖 Check README.md for API documentation"
echo ""

./mvnw spring-boot:run
