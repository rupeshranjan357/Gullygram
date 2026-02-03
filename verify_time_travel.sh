#!/bin/bash
API_URL="http://localhost:8080/api"

# 1. Trigger Magic Seed again
echo "Seeding..."
curl -s -X POST "$API_URL/admin/seed/magic?lat=12.97&lon=77.64" > /dev/null

# 2. Login
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{ "email": "viewer_1@test.com", "password": "password123" }')
TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 3. Fetch specific recent posts directly from DB ? No, via API.
echo "Fetching Feed..."
FEED_RES=$(curl -s -X GET "$API_URL/feed?lat=12.97&lon=77.64&radiusKm=5&page=0&size=50" \
  -H "Authorization: Bearer $TOKEN")

# 4. Extract CreatedAt timestamps
echo "Timestamps found in feed:"
echo $FEED_RES | grep -o '"createdAt":"[^"]*"' | cut -d'"' -f4 | sort
