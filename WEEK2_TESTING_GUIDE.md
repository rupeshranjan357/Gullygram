# Week 2 Testing Guide - Posts, Feed, Likes & Comments

This guide provides step-by-step instructions to test all Week 2 features including posts, geo-filtered feed, likes, and comments.

## Prerequisites

1. **Start PostgreSQL with PostGIS**:
   ```bash
   docker-compose up -d
   ```

2. **Run the Application**:
   ```bash
   export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
   ./mvnw spring-boot:run
   ```

3. **Application should be running on**: `http://localhost:8080`

## Test Flow Overview

1. Create test users
2. Set user locations
3. Create posts at different locations
4. Test feed with radius filtering
5. Test likes and comments
6. Verify feed ranking (recency + interests + engagement)

---

## Step-by-Step Testing

### 1. Create Test Users

#### User 1 - Alice (Bangalore Central)
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123",
    "alias": "alice_blr",
    "realName": "Alice Smith"
  }'
```

**Save the token from response** as `ALICE_TOKEN`

#### User 2 - Bob (Bangalore North)
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "password": "password123",
    "alias": "bob_north",
    "realName": "Bob Johnson"
  }'
```

**Save the token from response** as `BOB_TOKEN`

---

### 2. Set User Interests

#### Alice - Interested in Bodybuilding & Books (IDs: 1, 2)
```bash
curl -X PUT http://localhost:8080/api/me/interests \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "interestIds": [1, 2]
  }'
```

#### Bob - Interested in Technology & Gaming (IDs: 6, 10)
```bash
curl -X PUT http://localhost:8080/api/me/interests \
  -H "Authorization: Bearer BOB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "interestIds": [6, 10]
  }'
```

---

### 3. Update User Locations

#### Alice - MG Road, Bangalore (12.9716, 77.5946)
```bash
curl -X POST http://localhost:8080/api/me/location \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

#### Bob - Hebbal, Bangalore North (13.0358, 77.5970) - ~7km from Alice
```bash
curl -X POST http://localhost:8080/api/me/location \
  -H "Authorization: Bearer BOB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 13.0358,
    "longitude": 77.5970
  }'
```

---

### 4. Create Posts at Different Locations

#### Post 1 - Alice at MG Road (0km from Alice)
```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Great workout session at the gym today! 💪",
    "type": "GENERAL",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "visibilityRadiusKm": 10,
    "interestIds": [1]
  }'
```

**Save post ID from response** as `POST_1_ID`

#### Post 2 - Bob at Hebbal (~7km from Alice)
```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer BOB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "New tech meetup happening at Hebbal this weekend!",
    "type": "EVENT_PROMO",
    "latitude": 13.0358,
    "longitude": 77.5970,
    "visibilityRadiusKm": 20,
    "interestIds": [6]
  }'
```

**Save post ID from response** as `POST_2_ID`

#### Post 3 - Alice at Koramangala (~5km from Alice's location)
```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Book club meeting at Koramangala cafe. Anyone interested?",
    "type": "GENERAL",
    "latitude": 12.9352,
    "longitude": 77.6245,
    "visibilityRadiusKm": 15,
    "interestIds": [2]
  }'
```

**Save post ID from response** as `POST_3_ID`

#### Post 4 - Alice at Whitefield (~15km from Alice, outside 10km radius)
```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Selling furniture in Whitefield area",
    "type": "MARKETPLACE",
    "latitude": 12.9698,
    "longitude": 77.7500,
    "visibilityRadiusKm": 20,
    "interestIds": []
  }'
```

**Save post ID from response** as `POST_4_ID`

---

### 5. Test Feed with Radius Filtering

#### Test 1: Alice's Feed with 10km radius
**Expected**: Should see Posts 1, 2, 3 (within 10km)

```bash
curl -X GET "http://localhost:8080/api/feed?lat=12.9716&lon=77.5946&radiusKm=10&page=0&size=10" \
  -H "Authorization: Bearer ALICE_TOKEN"
```

**Verify**:
- Post 1 should be included (0km away)
- Post 2 should be included (~7km away)
- Post 3 should be included (~5km away)
- Post 4 should be excluded (~15km away)

#### Test 2: Alice's Feed with 20km radius
**Expected**: Should see all posts (1, 2, 3, 4)

```bash
curl -X GET "http://localhost:8080/api/feed?lat=12.9716&lon=77.5946&radiusKm=20&page=0&size=10" \
  -H "Authorization: Bearer ALICE_TOKEN"
```

**Verify**:
- All 4 posts should be included

#### Test 3: Feed with interest boost enabled
**Expected**: Posts matching Alice's interests (Bodybuilding, Books) should rank higher

```bash
curl -X GET "http://localhost:8080/api/feed?lat=12.9716&lon=77.5946&radiusKm=20&interestBoost=true&page=0&size=10" \
  -H "Authorization: Bearer ALICE_TOKEN"
```

**Verify**:
- Post 1 (Bodybuilding) and Post 3 (Books) should rank higher due to interest match

---

### 6. Test Likes

#### Alice likes Post 2
```bash
curl -X POST http://localhost:8080/api/posts/POST_2_ID/like \
  -H "Authorization: Bearer ALICE_TOKEN"
```

**Response should show**:
```json
{
  "success": true,
  "message": "Post liked",
  "data": {
    "liked": true,
    "likeCount": 1
  }
}
```

#### Bob likes Post 2 (same post)
```bash
curl -X POST http://localhost:8080/api/posts/POST_2_ID/like \
  -H "Authorization: Bearer BOB_TOKEN"
```

**Response should show**:
```json
{
  "data": {
    "liked": true,
    "likeCount": 2
  }
}
```

#### Alice unlikes Post 2 (toggle)
```bash
curl -X POST http://localhost:8080/api/posts/POST_2_ID/like \
  -H "Authorization: Bearer ALICE_TOKEN"
```

**Response should show**:
```json
{
  "message": "Post unliked",
  "data": {
    "liked": false,
    "likeCount": 1
  }
}
```

---

### 7. Test Comments

#### Add comment to Post 1
```bash
curl -X POST http://localhost:8080/api/posts/POST_1_ID/comment \
  -H "Authorization: Bearer BOB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Great job! Keep it up! 💪"
  }'
```

#### Add another comment to Post 1
```bash
curl -X POST http://localhost:8080/api/posts/POST_1_ID/comment \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Thanks! Consistency is key!"
  }'
```

#### Get comments for Post 1
```bash
curl -X GET "http://localhost:8080/api/posts/POST_1_ID/comments?page=0&size=20" \
  -H "Authorization: Bearer ALICE_TOKEN"
```

**Expected**: Should return 2 comments with author info (alias, avatar)

---

### 8. Test Get Single Post

```bash
curl -X GET http://localhost:8080/api/posts/POST_1_ID \
  -H "Authorization: Bearer ALICE_TOKEN"
```

**Response should include**:
- Post details
- Like count
- Comment count
- Whether current user liked it
- Author info (alias, avatar)
- Interests tagged

---

### 9. Test Feed Ranking Algorithm

The feed uses a scoring algorithm:
- **Recency**: Newer posts score higher (100 points - hours since creation)
- **Interest Match**: +100 points per matching interest (if interestBoost=true)
- **Engagement**: +0.5 points per like/comment (capped at 100)

#### Create posts to test ranking

```bash
# Recent post with Alice's interest (Bodybuilding)
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer BOB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bodybuilding competition next week!",
    "type": "GENERAL",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "visibilityRadiusKm": 10,
    "interestIds": [1]
  }'
```

#### Check feed with interestBoost=true
```bash
curl -X GET "http://localhost:8080/api/feed?lat=12.9716&lon=77.5946&radiusKm=10&interestBoost=true" \
  -H "Authorization: Bearer ALICE_TOKEN"
```

**Verify**: The new post with Bodybuilding interest should rank high due to:
- High recency score (just created)
- Interest match (Bodybuilding)

---

## Pagination Testing

### Test pagination with page and size parameters

```bash
# Page 0, 2 items per page
curl -X GET "http://localhost:8080/api/feed?lat=12.9716&lon=77.5946&radiusKm=20&page=0&size=2" \
  -H "Authorization: Bearer ALICE_TOKEN"

# Page 1, 2 items per page
curl -X GET "http://localhost:8080/api/feed?lat=12.9716&lon=77.5946&radiusKm=20&page=1&size=2" \
  -H "Authorization: Bearer ALICE_TOKEN"
```

**Verify**:
- `hasNext` and `hasPrevious` flags
- `totalPages` and `totalElements`
- Correct posts in each page

---

## Distance Verification

To verify the Haversine distance calculation is working correctly:

**MG Road to Hebbal**: ~7-8km
- MG Road: (12.9716, 77.5946)
- Hebbal: (13.0358, 77.5970)

**MG Road to Koramangala**: ~4-5km
- MG Road: (12.9716, 77.5946)
- Koramangala: (12.9352, 77.6245)

**MG Road to Whitefield**: ~14-16km
- MG Road: (12.9716, 77.5946)
- Whitefield: (12.9698, 77.7500)

Use 10km radius to exclude Whitefield, 20km to include all.

---

## Error Testing

### Invalid coordinates
```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test post",
    "type": "GENERAL",
    "latitude": 100.0,
    "longitude": 77.5946,
    "visibilityRadiusKm": 10
  }'
```

**Expected**: 400 Bad Request - "Invalid latitude"

### Radius too large
```bash
curl -X GET "http://localhost:8080/api/feed?lat=12.9716&lon=77.5946&radiusKm=100" \
  -H "Authorization: Bearer ALICE_TOKEN"
```

**Expected**: 400 Bad Request - "Radius cannot exceed 50km"

### Unauthorized access
```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test",
    "type": "GENERAL",
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

**Expected**: 403 Forbidden

---

## Feed Ranking Algorithm Details

### Scoring Formula

```
score = (recency_score × 1.0) + (interest_match × 2.0) + (engagement × 0.5)

where:
- recency_score = max(0, 100 - hours_since_creation)
- interest_match = number_of_matching_interests × 50 (if interestBoost=true)
- engagement = min(likes + comments, 100)
```

### Example Calculation

**Post A**: 2 hours old, 1 matching interest, 5 likes, 3 comments
- Recency: max(0, 100 - 2) = 98
- Interest: 1 × 50 = 50
- Engagement: min(5 + 3, 100) = 8
- **Total Score**: (98 × 1.0) + (50 × 2.0) + (8 × 0.5) = 98 + 100 + 4 = **202**

**Post B**: 1 hour old, 0 matching interests, 10 likes, 5 comments
- Recency: max(0, 100 - 1) = 99
- Interest: 0
- Engagement: min(10 + 5, 100) = 15
- **Total Score**: (99 × 1.0) + (0 × 2.0) + (15 × 0.5) = 99 + 0 + 7.5 = **106.5**

**Post A ranks higher** due to interest matching (weight = 2.0)

---

## Quick Test Script

Save this as `test_week2.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Week 2 API Testing ===${NC}\n"

# 1. Signup
echo -e "${GREEN}1. Creating test user...${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","alias":"tester","realName":"Test User"}')

TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 2. Update location
echo -e "\n${GREEN}2. Setting location...${NC}"
curl -s -X POST $BASE_URL/api/me/location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":12.9716,"longitude":77.5946}' | jq '.message'

# 3. Create post
echo -e "\n${GREEN}3. Creating post...${NC}"
POST_RESPONSE=$(curl -s -X POST $BASE_URL/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Test post!","type":"GENERAL","latitude":12.9716,"longitude":77.5946,"visibilityRadiusKm":10}')

POST_ID=$(echo $POST_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Post ID: $POST_ID"

# 4. Get feed
echo -e "\n${GREEN}4. Getting feed...${NC}"
curl -s -X GET "$BASE_URL/api/feed?lat=12.9716&lon=77.5946&radiusKm=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.totalElements'

# 5. Like post
echo -e "\n${GREEN}5. Liking post...${NC}"
curl -s -X POST $BASE_URL/api/posts/$POST_ID/like \
  -H "Authorization: Bearer $TOKEN" | jq '.data.likeCount'

# 6. Add comment
echo -e "\n${GREEN}6. Adding comment...${NC}"
curl -s -X POST $BASE_URL/api/posts/$POST_ID/comment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Great post!"}' | jq '.message'

echo -e "\n${BLUE}=== Testing Complete ===${NC}"
```

Make it executable: `chmod +x test_week2.sh`

Run it: `./test_week2.sh`

---

## Success Criteria

✅ All endpoints return successful responses  
✅ Geo-filtering correctly filters posts by radius  
✅ Feed ranking prioritizes recent posts and interest matches  
✅ Likes toggle correctly (like/unlike)  
✅ Comments are created and retrieved properly  
✅ Pagination works correctly  
✅ Invalid inputs return proper error messages  
✅ Authorization is enforced on protected endpoints
