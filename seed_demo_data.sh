#!/bin/bash

BASE_URL="http://localhost:8080/api"

# 1. Register/Login Demo User
echo "1. Creating Demo User 'GullyExplorer'..."
# Randomize to avoid conflict
SUFFIX=$((1 + $RANDOM % 1000))
EMAIL="demo_$SUFFIX@gully.com"
ALIAS="gully_explorer_$SUFFIX"

LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"alias\": \"$ALIAS\",
    \"email\": \"$EMAIL\",
    \"password\": \"password123\",
    \"realName\": \"Gully Explorer\",
    \"phone\": \"99$((10000000 + $RANDOM % 90000000))\"
  }")

TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    # Login if exists
    LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{ \"email\": \"$EMAIL\", \"password\": \"password123\" }")
    TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
fi
echo "Token Acquired."

create_post() {
    TEXT=$1
    LAT=$2
    LON=$3
    TYPE=$4
    
    curl -s -X POST "$BASE_URL/posts" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"text\": \"$TEXT\",
        \"latitude\": $LAT,
        \"longitude\": $LON,
        \"type\": \"$TYPE\",
        \"visibility\": \"PUBLIC\"
      }" > /dev/null
    echo "Posted: $TEXT at [$LAT, $LON]"
}

echo -e "\n2. Seeding Content for Slider Demo..."

# ZONE 1: WHITEFIELD (0-3km) - Visible at 5km radius
create_post "🚀 Just checked into GullyGram HQ! The view is amazing." 12.9698 77.7499 "GENERAL"
create_post "Anyone up for a cricket match at Whitefield Ground?" 12.9680 77.7500 "GENERAL"
create_post "Found a lost dog near ITPL main gate. Please share!" 12.9720 77.7450 "LOCAL_NEWS"

# ZONE 2: MARATHAHALLI (4-7km) - Edges of 5km, definitely in 10km
create_post "Traffic is crazy at Marathahalli bridge today! Avoid." 12.9591 77.6974 "LOCAL_NEWS"
create_post "Selling my guitar. DM for price. #Music" 12.9550 77.7000 "MARKETPLACE"

# ZONE 3: INDIRANAGAR (12km) - Needs 15-20km radius
create_post "Trying out the new cafe on 100ft Read. Best coffee in town! ☕️" 12.9716 77.6412 "GENERAL"
create_post "Live Jazz night happening tonight at The Humming Tree!" 12.9700 77.6400 "EVENT_PROMO"

# ZONE 4: KORAMANGALA (15km) - Needs 20km radius
create_post "Startup meetup in Koramangala 5th Block. Who is coming?" 12.9352 77.6245 "EVENT_PROMO"
create_post "Looking for a flatmate in Koramangala. 2BHK fully furnished." 12.9300 77.6200 "GENERAL"

echo -e "\n✅ Seed Complete! Try sliding the radius from 5km -> 20km to see these appear."
