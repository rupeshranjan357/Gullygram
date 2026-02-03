#!/bin/bash

# Base URL
API_URL="http://localhost:8080/api"

# 1. Login as Demo User (Use the one from seed if possible, or create temp)
# We will use the 'gully_explorer' alias pattern if we can find it, or just register a new ranking tester
RANDOM_ID=$((1 + $RANDOM % 1000))
ALIAS="rank_tester_$RANDOM_ID"
EMAIL="rank_$RANDOM_ID@test.com"
PHONE="97$((10000000 + $RANDOM % 90000000))"

echo "1. Registering Ranking Tester..."
REGISTER_RES=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"alias\": \"$ALIAS\",
    \"email\": \"$EMAIL\",
    \"password\": \"password123\",
    \"realName\": \"Ranking Tester\",
    \"phone\": \"$PHONE\"
  }")

LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{ \"email\": \"$EMAIL\", \"password\": \"password123\" }")
TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then echo "Login failed"; exit 1; fi

# 2. Add specific test posts if not present, but better to rely on seed data + filtering
# We know seed data has:
# Whitefield (0km from 12.9698, 77.7499)
# Koramangala (15km)
# Indiranagar (12km)

echo -e "\n2. Fetching Huge Radius Feed (50km)..."
# We expect Koramangala (furthest) to be near TOP if our boost working?
# Distance: Whitefield (0) < Indiranagar (12) < Koramangala (15)
# Boost: +2 per km. 
# Koramangala Bonus = 30 points. Indiranagar = 24 points. Whitefield = 0.
# Unless recency overrides (all posted same time).
# So Koramangala should be #1.

RESPONSE=$(curl -s -X GET "$API_URL/feed?lat=12.9698&lon=77.7499&radiusKm=50" \
  -H "Authorization: Bearer $TOKEN")

echo "Top 3 Posts:"
echo $RESPONSE | grep -o '"text":"[^"]*"' | head -n 3

echo -e "\n3. Checking specific phrases..."
echo $RESPONSE | grep -o "Koramangala" && echo "✅ Found Koramangala"
echo $RESPONSE | grep -o "Indiranagar" && echo "✅ Found Indiranagar"
