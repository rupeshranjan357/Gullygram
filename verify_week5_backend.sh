#!/bin/bash

# Configuration
BASE_URL="http://localhost:8080/api"
EMAIL="tech_company_$(date +%s)@test.com"
PASSWORD="password123"
ALIAS="tech_co_$(date +%s)"

echo "--------------------------------------------------"
echo "🚀 Starting Week 5 Backend Verification"
echo "--------------------------------------------------"

# 1. Signup as Company
echo "1️⃣  Registering as COMPANY..."
SIGNUP_PAYLOAD="{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"alias\": \"$ALIAS\", \"accountType\": \"COMPANY\", \"marketingCategory\": \"TECH\"}"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "$SIGNUP_PAYLOAD")

TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Signup Failed: $SIGNUP_RESPONSE"
  exit 1
else
  echo "✅ Signup Success! Token received."
fi

# 2. Create First Marketing Post (Should Succeed)
echo -e "\n2️⃣  Creating 1st Marketing Post..."
POST_PAYLOAD='{
  "text": "Best Tech Deals! #Sale",
  "type": "MARKETING",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "visibilityRadiusKm": 10
}'

RESPONSE_1=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$POST_PAYLOAD")

if [[ "$RESPONSE_1" == *"id"* ]]; then
  echo "✅ First Marketing Post Created Successfully"
else
  echo "❌ Failed to create first post: $RESPONSE_1"
fi

# 3. Create Second Marketing Post (Should Fail - Rate Limit)
echo -e "\n3️⃣  Creating 2nd Marketing Post (Testing Rate Limit)..."
RESPONSE_2=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$POST_PAYLOAD")

HTTP_CODE=${RESPONSE_2: -3}
BODY=${RESPONSE_2:0:${#RESPONSE_2}-3}

if [[ "$HTTP_CODE" -eq 500 ]] || [[ "$HTTP_CODE" -eq 400 ]]; then
   echo "✅ Rate Limit Verified! Server rejected 2nd post with code $HTTP_CODE."
   echo "   Response: $BODY"
else
   echo "❌ Rate Limit Failed! Server accepted 2nd post (Code: $HTTP_CODE)."
fi

# 4. Create Event Post (Bangalore)
echo -e "\n4️⃣  Creating Event Post in Bangalore..."
EVENT_PAYLOAD='{
  "text": "Live Music Concert!",
  "type": "EVENT_PROMO",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "visibilityRadiusKm": 50,
  "eventDate": "2026-12-31T20:00:00",
  "eventCity": "Bangalore",
  "eventLocationName": "Cubbon Park"
}'

EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$EVENT_PAYLOAD")

if [[ "$EVENT_RESPONSE" == *"id"* ]]; then
  echo "✅ Event Post Created Successfully"
else
  echo "❌ Failed to create event: $EVENT_RESPONSE"
fi

# 5. Search Events by City
echo -e "\n5️⃣  Searching Events in 'Bangalore'..."
CITY_SEARCH=$(curl -s -X GET "$BASE_URL/events/city?city=Bangalore" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo $CITY_SEARCH | grep -o '"id"' | wc -l)
if [[ $COUNT -gt 0 ]]; then
  echo "✅ Found $COUNT events in Bangalore."
else
  echo "❌ No events found in Bangalore."
  echo "Response: $CITY_SEARCH"
fi

# 6. Search Events Nearby (Radius)
echo -e "\n6️⃣  Searching Events Nearby (10km Radius)..."
NEARBY_SEARCH=$(curl -s -X GET "$BASE_URL/events/nearby?lat=12.9716&lon=77.5946&radius=10" \
  -H "Authorization: Bearer $TOKEN")

COUNT_NEARBY=$(echo $NEARBY_SEARCH | grep -o '"id"' | wc -l)
if [[ $COUNT_NEARBY -gt 0 ]]; then
  echo "✅ Found $COUNT_NEARBY events nearby."
else
  echo "❌ No events found nearby."
  echo "Response: $NEARBY_SEARCH"
fi

echo "--------------------------------------------------"
echo "🎉 Verification Complete"
echo "--------------------------------------------------"
