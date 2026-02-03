#!/bin/bash
API_URL="http://localhost:8080/api"

# 1. Signup/Get Token (Robust)
RANDOM_ID=$((1 + $RANDOM % 1000))
ALIAS="time_tester_$RANDOM_ID"
EMAIL="time_$RANDOM_ID@test.com"
PHONE="95$((10000000 + $RANDOM % 90000000))"

curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{ \"alias\": \"$ALIAS\", \"email\": \"$EMAIL\", \"password\": \"password123\", \"realName\": \"Time Tester\", \"phone\": \"$PHONE\" }" > /dev/null

LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{ \"email\": \"$EMAIL\", \"password\": \"password123\" }")
TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 2. Trigger Magic Seed (Indiranagar)
curl -s -X POST "$API_URL/admin/seed/magic?lat=12.97&lon=77.64" > /dev/null

# 3. Fetch Feed
FEED_RES=$(curl -s -X GET "$API_URL/feed?lat=12.97&lon=77.64&radiusKm=5&page=0&size=50" \
  -H "Authorization: Bearer $TOKEN")

# 4. Extract CreatedAt timestamps
echo "Timestamps (Recent to Oldest):"
echo $FEED_RES | grep -o '"createdAt":"[^"]*"' | cut -d'"' -f4 | sort -r | head -n 10
