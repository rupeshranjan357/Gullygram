#!/bin/bash
API_URL="https://gullygram.onrender.com/api"

echo "1. Checking Remote Health..."
curl -s "$API_URL/health" || echo "Health check failed (or 404)"

echo -e "\n2. Logging in as Viewer (Remote)..."
# Using a static test user for consistency
EMAIL="viewer_remote_test@test.com"
PASSWORD="password123"

# Try login first
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{ \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\" }" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# If login fails, signup
if [ -z "$TOKEN" ]; then
    echo "Creating new remote user..."
    curl -s -X POST "$API_URL/auth/signup" \
      -H "Content-Type: application/json" \
      -d "{ \"alias\": \"remote_viewer\", \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"realName\": \"Remote Viewer\", \"phone\": \"9988776655\" }" > /dev/null
    
    TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{ \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\" }" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
fi

echo "Token acquired: ${TOKEN:0:10}..."

echo -e "\n3. Checking Feed for Indiranagar (Post-Seeding)..."
# Indiranagar check
FEED_RES=$(curl -s -X GET "$API_URL/feed?lat=12.9716&lon=77.6412&radiusKm=10&page=0&size=5" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo $FEED_RES | grep -o '"totalElements":[0-9]*' | cut -d':' -f2)

if [ "$COUNT" -gt "0" ]; then
    echo "✅ SUCCESS: Found $COUNT posts in Indiranagar feed!"
    echo "Sample Post:"
    echo $FEED_RES | grep -o '"text":"[^"]*"' | head -n 1
else 
    echo "❌ FAILURE: Feed is empty ($COUNT posts)."
fi
