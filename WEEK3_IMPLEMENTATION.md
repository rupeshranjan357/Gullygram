# Week 3 Implementation Complete - Trust & Relationships

## Overview

Week 3 focuses on the **Trust & Relationships** system for GullyGram. This includes:

1. **Friend Requests** - Send, accept, reject friend requests
2. **Identity Reveal** - Real name visible only to friends (alias for strangers)
3. **Block Functionality** - Users can block/unblock other users
4. **People Suggestions** - Interest-based suggestions with scoring

---

## New Files Created

### Database Migration
- `src/main/resources/db/migration/V3__relationships_and_trust.sql`

### Entity
- `src/main/java/com/gullygram/backend/entity/Relationship.java`

### Repository
- `src/main/java/com/gullygram/backend/repository/RelationshipRepository.java`

### DTOs
- `src/main/java/com/gullygram/backend/dto/request/FriendRequestDTO.java`
- `src/main/java/com/gullygram/backend/dto/response/RelationshipResponse.java`
- `src/main/java/com/gullygram/backend/dto/response/UserSummary.java`
- `src/main/java/com/gullygram/backend/dto/response/PeopleSuggestionResponse.java`

### Services
- `src/main/java/com/gullygram/backend/service/AuthorViewService.java`
- `src/main/java/com/gullygram/backend/service/RelationshipService.java`
- `src/main/java/com/gullygram/backend/service/PeopleSuggestionService.java`

### Controllers
- `src/main/java/com/gullygram/backend/controller/RelationshipController.java`
- `src/main/java/com/gullygram/backend/controller/PeopleController.java`

---

## Modified Files

- `UserProfile.java` - Added `trustScore` and `trustLevel` fields
- `AuthorView.java` - Added `realName`, `realAvatarUrl`, `isFriend`, `trustLevel`
- `ProfileResponse.java` - Added trust fields and relationship counts
- `PostService.java` - Uses `AuthorViewService` for identity reveal
- `CommentService.java` - Uses `AuthorViewService` for identity reveal
- `ProfileService.java` - Includes trust and relationship counts
- `PostController.java` - Passes viewer ID for comment identity reveal

---

## API Endpoints

### Relationship Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/relationships/request` | Send friend request |
| POST | `/api/relationships/{id}/accept` | Accept friend request |
| POST | `/api/relationships/{id}/reject` | Reject friend request |
| DELETE | `/api/relationships/{id}` | Cancel sent request |
| DELETE | `/api/relationships/friend/{friendId}` | Remove friend (unfriend) |
| GET | `/api/relationships` | Get friends list |
| GET | `/api/relationships/requests` | Get pending requests received |
| GET | `/api/relationships/sent` | Get sent requests |
| GET | `/api/relationships/counts` | Get relationship counts |
| GET | `/api/relationships/status/{userId}` | Check relationship status |

### Block Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/block/{userId}` | Block a user |
| DELETE | `/api/block/{userId}` | Unblock a user |

### People Discovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/people/suggestions` | Get suggested people |
| GET | `/api/people/{userId}` | Get user profile |

---

## Identity Reveal Logic

The `AuthorViewService` implements the following rules:

1. **Self**: Always see full profile (real name, real avatar)
2. **Friends** (ACCEPTED relationship): See real name and real avatar
3. **Strangers**: Only see alias and alias avatar
4. **Blocked**: Should not see each other at all

When viewing posts, comments, or user profiles:
- The system checks the relationship between viewer and author
- If friends or self → reveals `realName` and `realAvatarUrl`
- Otherwise → only shows `alias` and `avatarUrl`

---

## People Suggestion Algorithm

The scoring algorithm for people suggestions:

| Factor | Points |
|--------|--------|
| Same top interest | +40 |
| 2+ shared interests | +20 |
| Close distance (<3km) | +20 |
| Recently active (48h) | +10 |
| High trust level (4+) | +10 |

Suggestions also include a "Why suggested" explanation:
- "Both into Music and Fitness • 2 km away • active today"

---

## Testing

### 1. Start the Backend

```bash
cd /Users/rupeshsingh/Gullygram
./mvnw spring-boot:run
```

### 2. Test Friend Request Flow

```bash
# Set tokens (replace with actual tokens)
export TOKEN1="your_user1_token"
export TOKEN2="your_user2_token"
export USER2_ID="user2_uuid"

# User 1 sends friend request to User 2
curl -X POST http://localhost:8080/api/relationships/request \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"receiverId": "'$USER2_ID'", "message": "Hey, want to connect?"}'

# User 2 views pending requests
curl -X GET http://localhost:8080/api/relationships/requests \
  -H "Authorization: Bearer $TOKEN2"

# User 2 accepts the request (replace REQUEST_ID)
curl -X POST http://localhost:8080/api/relationships/REQUEST_ID/accept \
  -H "Authorization: Bearer $TOKEN2"

# Both users now see each other in their friends list
curl -X GET http://localhost:8080/api/relationships \
  -H "Authorization: Bearer $TOKEN1"
```

### 3. Verify Identity Reveal

```bash
# Before friendship: Feed shows only alias
# After friendship: Feed shows realName for friend's posts

curl -X GET "http://localhost:8080/api/feed?lat=12.97&lon=77.59&radiusKm=10" \
  -H "Authorization: Bearer $TOKEN1"
```

### 4. Test People Suggestions

```bash
curl -X GET "http://localhost:8080/api/people/suggestions?lat=12.97&lon=77.59&radiusKm=20" \
  -H "Authorization: Bearer $TOKEN1"
```

### 5. Test Block Functionality

```bash
# Block a user
curl -X POST http://localhost:8080/api/block/$USER2_ID \
  -H "Authorization: Bearer $TOKEN1"

# Verify blocked user doesn't appear in suggestions or feed
```

---

## What's Next (Week 4)

- Events Management
- Trust Score earning mechanics
- Event attendance tracking
- Activity-based bonding
