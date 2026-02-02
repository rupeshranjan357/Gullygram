#!/bin/bash

# Cloudinary Credentials
export STORAGE_TYPE=cloudinary
export CLOUDINARY_CLOUD_NAME=dbvn3qjbk
export CLOUDINARY_API_KEY=974262514382165
export CLOUDINARY_API_SECRET=aL8pRbWkGxsy0b9eH3F57wQaViE

export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home

# Kill existing process on port 8080
echo "Checking for existing process on port 8080..."
PID=$(lsof -ti :8080)
if [ -n "$PID" ]; then
  echo "Killing process $PID on port 8080..."
  kill -9 $PID
else
  echo "Port 8080 is free."
fi

# Run the backend
echo "Starting GullyGram Backend with Cloudinary support..."
./mvnw spring-boot:run
