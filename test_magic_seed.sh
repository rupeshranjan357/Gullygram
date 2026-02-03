#!/bin/bash

API_URL="http://localhost:8080/api"

echo "1. Triggering Magic Seed for INDIRANAGAR..."
SEED_RES=$(curl -s -X POST "$API_URL/admin/seed/magic?lat=12.9716&lon=77.6412")
echo $SEED_RES

# Need a token to read feed
echo -e "\n2. Logging in as Viewer..."
# Reuse a known user or create one
RANDOM_ID=$((1 + $RANDOM % 1000))
ALIAS="viewer_$RANDOM_ID"
EMAIL="viewer_$RANDOM_ID@test.com"
PHONE="96$((10000000 + $RANDOM % 90000000))"

curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{ \"alias\": \"$ALIAS\", \"email\": \"$EMAIL\", \"password\": \"password123\", \"realName\": \"Viewer\", \"phone\": \"$PHONE\" }" > /dev/null

LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{ \"email\": \"$EMAIL\", \"password\": \"password123\" }")
TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo -e "\n3. Checking Feed for Magic Content..."
FEED_RES=$(curl -s -X GET "$API_URL/feed?lat=12.9716&lon=77.6412&radiusKm=5" \
  -H "Authorization: Bearer $TOKEN")

# Verify Content
echo $FEED_RES | grep -o "Toit" && echo "✅ Found Context: Toit"
echo $FEED_RES | grep -o "Jazz" && echo "✅ Found Context: Jazz"

# Verify Comments
# We expect "commentCount": N where N > 0 for some posts
echo "Checking for comments..."
echo $FEED_RES | grep "\"commentCount\":[1-9]" && echo "✅ Found Posts with Comments!" || echo "❌ No comments found (Sim failed?)"
