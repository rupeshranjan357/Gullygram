#!/bin/bash

# Base URL
API_URL="http://localhost:8080/api"

echo "1. Registering User..."
# Use a random username to avoid conflict on re-run
RANDOM_ID=$((1 + $RANDOM % 1000))
# Alias must be letters, numbers, underscores
ALIAS="tester_$RANDOM_ID"
EMAIL="radius_$RANDOM_ID@test.com"
# Random phone
PHONE="98$((10000000 + $RANDOM % 90000000))"

REGISTER_RES=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"alias\": \"$ALIAS\",
    \"email\": \"$EMAIL\",
    \"password\": \"password123\",
    \"realName\": \"Radius Tester\",
    \"phone\": \"$PHONE\"
  }")
echo $REGISTER_RES

echo -e "\n2. Logging in..."
# Use EMAIL for login
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\", 
    \"password\": \"password123\"
  }")

TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "Login failed"
  exit 1
fi

echo -e "\n3. Creating Post at Whitefield (12.9698, 77.7499)..."
# PostController accepts JSON
POST_RES=$(curl -s -X POST "$API_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello Whitefield!",
    "latitude": 12.9698,
    "longitude": 77.7499,
    "type": "GENERAL",
    "visibility": "PUBLIC"
  }')
echo $POST_RES

echo -e "\n\n4. fetching Feed NEARBY (Radius 5km)..."
# Should see the post
curl -s -X GET "$API_URL/feed?lat=12.9698&lon=77.7499&radiusKm=5" \
  -H "Authorization: Bearer $TOKEN" | grep "Hello Whitefield" && echo "SUCCESS: Post found nearby" || echo "FAILURE: Post not found nearby"

echo -e "\n5. fetching Feed FAR AWAY (10km away) with SMALL Radius (5km)..."
# Should NOT see the post
# 12.87 is roughly 10km south
curl -s -X GET "$API_URL/feed?lat=12.8700&lon=77.7499&radiusKm=5" \
  -H "Authorization: Bearer $TOKEN" | grep "Hello Whitefield" && echo "FAILURE: Post found (should be hidden within 5km)" || echo "SUCCESS: Post correctly hidden (outside 5km)"

echo -e "\n6. fetching Feed FAR AWAY (10km away) with LARGE Radius (50km)..."
# Should see the post now because radius is 50km
curl -s -X GET "$API_URL/feed?lat=12.8700&lon=77.7499&radiusKm=50" \
  -H "Authorization: Bearer $TOKEN" | grep "Hello Whitefield" && echo "SUCCESS: Post found with Global Radius" || echo "FAILURE: Post not found even with large radius"
