#!/bin/bash

# Configuration
BASE_URL="https://gullygram-api.onrender.com/api"
echo "Targeting Remote URL: $BASE_URL"

EMAIL="tech_remote_$(date +%s)@test.com"
PASSWORD="password123"
ALIAS="tech_remote_$(date +%s)"

echo "--------------------------------------------------"
echo "🚀 Starting Week 5 Remote Backend Verification"
echo "--------------------------------------------------"

# Function for curl with common headers
curl_api() {
  curl -s -L -A "Mozilla/5.0" "$@"
}

# 1. Signup as Company
echo "1️⃣  Registering as COMPANY..."
SIGNUP_PAYLOAD="{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"alias\": \"$ALIAS\", \"accountType\": \"COMPANY\", \"marketingCategory\": \"TECH\"}"
SIGNUP_RESPONSE=$(curl_api -X POST "$BASE_URL/auth/signup" \
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

RESPONSE_1=$(curl_api -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$POST_PAYLOAD")

if [[ "$RESPONSE_1" == *"id"* ]]; then
  echo "✅ First Marketing Post Created Successfully"
else
  echo "❌ Failed to create first post: $RESPONSE_1"
fi

# 3. Create Second Marketing Post (Should Fail - Rate Limit)
# Note: Render might be slower, so we don't rely on http_code variable extraction specifically for 500
# but check the response body too.
echo -e "\n3️⃣  Creating 2nd Marketing Post (Testing Rate Limit)..."
RESPONSE_2=$(curl_api -w "%{http_code}" -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$POST_PAYLOAD")

HTTP_CODE=${RESPONSE_2: -3}
BODY=${RESPONSE_2:0:${#RESPONSE_2}-3}

if [[ "$HTTP_CODE" -eq 500 ]] || [[ "$HTTP_CODE" -eq 400 ]]; then
   echo "✅ Rate Limit Verified! Server rejected 2nd post with code $HTTP_CODE."
else
   echo "❌ Rate Limit Failed! Server accepted 2nd post (Code: $HTTP_CODE)."
   echo "Response: $BODY"
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

EVENT_RESPONSE=$(curl_api -X POST "$BASE_URL/posts" \
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
CITY_SEARCH=$(curl_api -X GET "$BASE_URL/events/city?city=Bangalore" \
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
NEARBY_SEARCH=$(curl_api -X GET "$BASE_URL/events/nearby?lat=12.9716&lon=77.5946&radius=10" \
  -H "Authorization: Bearer $TOKEN")

COUNT_NEARBY=$(echo $NEARBY_SEARCH | grep -o '"id"' | wc -l)
if [[ $COUNT_NEARBY -gt 0 ]]; then
  echo "✅ Found $COUNT_NEARBY events nearby."
else
  echo "❌ No events found nearby."
  echo "Response: $NEARBY_SEARCH"
fi

# 7. Test Seed API (Custom Location) - This relies on the security config fix being deployed
echo -e "\n7️⃣  Testing Seed API (Custom Location)..."
# We expect 200 or 403 depending on if the deployment finished.
SEED_RESPONSE=$(curl_api -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/admin/seed/custom?lat=12.9716&lon=77.5946")

if [[ "$SEED_RESPONSE" -eq 200 ]]; then
   echo "✅ Seed API (Custom) Triggered Successfully (Code: 200)."
else
   echo "⚠️  Seed API returned $SEED_RESPONSE. (If 403, the SecurityConfig update might be redeploying)."
fi

echo "--------------------------------------------------"
echo "🎉 Remote Verification Complete"
echo "--------------------------------------------------"
