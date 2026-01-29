# Postman Testing Guide - Week 2 Complete

## Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select file: `GullyGram-Week2-Complete.postman_collection.json`
4. Collection will appear with all folders

## Setup

The collection uses variables that auto-save tokens and post IDs:
- `alice_token` - Auto-saved after Alice signup/login
- `bob_token` - Auto-saved after Bob signup/login  
- `post_1_id`, `post_2_id`, `post_3_id` - Auto-saved when creating posts

## Testing Flow (Recommended Order)

### Phase 1: Setup Users ✅

Run these in order:

1. **Week 1 - Authentication** folder:
   - `Signup - Alice` → Auto-saves alice_token
   - `Signup - Bob` → Auto-saves bob_token

2. **Week 1 - Profile & Location** folder:
   - `Update Location - Alice (MG Road)`
   - `Update Location - Bob (Hebbal ~7km)`

3. **Week 1 - Interests** folder:
   - `Update Interests - Alice (Bodybuilding, Books)`
   - `Update Interests - Bob (Technology, Gaming)`

### Phase 2: Create Posts 📝

4. **Week 2 - Posts** folder:
   - `Create Post 1 - Alice at MG Road` → Saves post_1_id
   - `Create Post 2 - Bob at Hebbal` → Saves post_2_id
   - `Create Post 3 - Alice at Koramangala` → Saves post_3_id
   - `Create Post 4 - Alice at Whitefield`

### Phase 3: Test Feed 📱

5. **Week 2 - Feed (Geo-Filtered)** folder:
   - `Feed - Alice 10km Radius` → Should see 3 posts (exclude Whitefield)
   - `Feed - Alice 20km Radius` → Should see all 4 posts
   - `Feed - With Interest Boost` → Posts with Bodybuilding/Books rank higher
   - `Feed - Bob's View` → Different results based on Bob's location
   - `Feed - Pagination Page 2` → Test pagination

### Phase 4: Test Likes ❤️

6. **Week 2 - Likes** folder:
   - `Alice Likes Post 2` → Like count: 1
   - `Bob Likes Post 2` → Like count: 2
   - `Alice Unlikes Post 2` → Like count: 1 (toggle)
   - `Bob Likes Post 1` → Test cross-user likes

### Phase 5: Test Comments 💬

7. **Week 2 - Comments** folder:
   - `Bob Comments on Post 1`
   - `Alice Replies to Her Own Post`
   - `Get Comments for Post 1` → Should show 2 comments
   - `Alice Comments on Post 2`

### Phase 6: Error Testing ⚠️

8. **Error Testing** folder:
   - `Invalid Latitude` → Should return 400 error
   - `Radius Too Large` → Should return 400 error
   - `Unauthorized Post Creation` → Should return 403 error

## Expected Results

### Feed - Alice 10km Radius
```json
{
  "success": true,
  "data": {
    "content": [
      // Post 1: Alice at MG Road (0km) ✅
      // Post 2: Bob at Hebbal (~7km) ✅
      // Post 3: Alice at Koramangala (~5km) ✅
      // Post 4: Whitefield (~15km) ❌ EXCLUDED
    ],
    "totalElements": 3
  }
}
```

### Feed - Alice 20km Radius
```json
{
  "data": {
    "totalElements": 4  // All posts included
  }
}
```

### Like Response
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

### Comment Response
```json
{
  "success": true,
  "message": "Comment added",
  "data": {
    "id": "...",
    "text": "Great job! Keep it up! 💪",
    "authorAlias": "bob_north_test",
    "createdAt": "2026-01-29T..."
  }
}
```

## Verification Checklist

✅ **Signup Fix**
- [ ] Alice signup successful (no "null identifier" error)
- [ ] Bob signup successful
- [ ] Tokens auto-saved in collection variables

✅ **Geo-Filtering**
- [ ] 10km radius excludes Whitefield post (~15km away)
- [ ] 20km radius includes all posts
- [ ] Distance calculation is accurate (Haversine)

✅ **Feed Ranking**
- [ ] Without interestBoost: Sorted by recency
- [ ] With interestBoost=true: Posts with matching interests rank higher
- [ ] Engagement affects ranking (posts with likes/comments score higher)

✅ **Likes**
- [ ] Like adds to count
- [ ] Unlike (toggle) reduces count
- [ ] Multiple users can like same post
- [ ] Get post shows correct like count and "liked" status

✅ **Comments**
- [ ] Comment created successfully
- [ ] Author info included (alias, avatar)
- [ ] Comments sorted by creation time
- [ ] Pagination works

✅ **Error Handling**
- [ ] Invalid coordinates return 400
- [ ] Radius > 50km returns 400
- [ ] Unauthorized requests return 403
- [ ] Missing required fields return 400 with validation errors

## Troubleshooting

### Tokens Not Saving
- Check Console tab in Postman after signup/login
- Should see: "Alice token saved: ..."
- Manually copy token to collection variables if needed

### Post IDs Not Saving
- Verify post creation returns `"id"` field in response
- Check Postman Console for save messages

### Feed Returns Empty
- Verify posts were created successfully
- Check latitude/longitude values
- Ensure radius is sufficient (try 20km first)

### 403 Errors
- Token might have expired (create new user)
- Check Authorization header format: `Bearer {token}`
- Ensure token variable is set correctly

## Quick Test Script

If you prefer command line:

```bash
# Export tokens after running signup in Postman
export ALICE_TOKEN="paste_token_here"
export BOB_TOKEN="paste_token_here"

# Test feed
curl -X GET "http://localhost:8080/api/feed?lat=12.9716&lon=77.5946&radiusKm=10" \
  -H "Authorization: Bearer $ALICE_TOKEN" | jq

# Test post creation
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test from CLI",
    "type": "GENERAL",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "visibilityRadiusKm": 10
  }' | jq
```

## Success Metrics

After completing all tests:
- ✅ 0 authentication errors (signup works!)
- ✅ All posts created successfully
- ✅ Geo-filtering accurate
- ✅ Feed ranking working
- ✅ Likes toggle correctly
- ✅ Comments appear properly
- ✅ Pagination functional
- ✅ Error handling robust

---

**Ready to test!** 🚀

Import the collection and follow Phase 1-6 in order for best results.
