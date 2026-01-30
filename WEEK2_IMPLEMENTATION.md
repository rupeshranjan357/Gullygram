# Week 2 Implementation Summary - GullyGram

## ✅ Completed Features

### 1. Posts Module

#### Post Creation
- Create posts with text, media URLs, and location
- Support for multiple post types (GENERAL, LOCAL_NEWS, MARKETING, EVENT_PROMO, MARKETPLACE)
- Geolocation tagging (latitude, longitude, geohash)
- Customizable visibility radius (1-50km)
- Interest tagging for posts
- Automatic geohash generation for efficient geo-queries

#### Post Operations
- Get post by ID with full details
- Soft delete posts (author only)
- Media URL validation and JSON storage
- Get post with engagement metrics (likes, comments)

### 2. Feed Module

#### Geo-Filtered Feed
- **Bounding Box Optimization**: Initial filtering using latitude/longitude bounding box
- **Haversine Distance Calculation**: Precise distance filtering after bounding box
- **Radius-Based Discovery**: Users can specify radius (default 10km, max 50km)
- **Pagination Support**: Page-based navigation with metadata (hasNext, hasPrevious, totalPages)

#### Feed Ranking Algorithm
Intelligent feed scoring based on three factors:

**Formula**: `score = (recency × 1.0) + (interestMatch × 2.0) + (engagement × 0.5)`

1. **Recency Score** (Weight: 1.0)
   - Newer posts rank higher
   - Score: `max(0, 100 - hours_since_creation)`
   - Decays linearly over time

2. **Interest Match Score** (Weight: 2.0)
   - Matches user's selected interests with post tags
   - Score: `matching_interests × 50`
   - Optional via `interestBoost` parameter
   - Higher weight prioritizes relevant content

3. **Engagement Score** (Weight: 0.5)
   - Based on likes + comments
   - Score: `min(likes + comments, 100)`
   - Capped at 100 to prevent viral posts from dominating

**Example**:
- Post A: 2 hours old, 1 interest match, 8 engagement → **202 points**
- Post B: 1 hour old, 0 interest match, 15 engagement → **106.5 points**
- Post A ranks higher due to interest matching

### 3. Likes System

#### Like Operations
- Toggle like/unlike on posts
- Real-time like count
- Check if current user liked a post
- Composite key (post_id, user_id) prevents duplicates
- Automatic timestamp tracking

### 4. Comments System

#### Comment Operations
- Add comments to posts
- Get paginated comments for a post
- Soft delete support
- Author information included (alias, avatar)
- Chronological ordering (oldest first)

### 5. Geo Utilities

#### GeoUtil Class
- **Haversine Distance Calculation**: Accurate distance between two geo-points
- **Bounding Box Generation**: Efficient preliminary filtering
- **Geohash Generation**: Simple 6-character geohash for spatial indexing
- **Coordinate Validation**: Latitude (-90 to 90), Longitude (-180 to 180)

#### Distance Accuracy
Formula uses Earth radius (6371 km) and accounts for spherical geometry:
```
distance = R × 2 × arctan2(√a, √(1-a))
where a = sin²(Δφ/2) + cos φ1 × cos φ2 × sin²(Δλ/2)
```

---

## 🏗️ Technical Architecture

### Entities Created
```
Post → User (author, ManyToOne)
Post → Interest (ManyToMany via post_interest_tag)
Post → PostLike (OneToMany)
Post → Comment (OneToMany)
PostLike → User (ManyToOne)
PostLike → Post (ManyToOne)
Comment → User (author, ManyToOne)
Comment → Post (ManyToOne)
```

### Database Enhancements

#### New Tables
1. **post** - Post content with geo fields (lat, lon, geohash)
2. **post_interest_tag** - Post-Interest junction table
3. **post_like** - Likes with composite primary key
4. **comment** - Comments with soft delete

#### Indexes Added
- `idx_post_location` - Geo queries (lat, lon)
- `idx_post_geohash` - Geohash-based queries
- `idx_post_created` - Feed sorting by time
- `idx_post_location_time` - Composite for feed optimization
- `idx_post_like_post` - Like count queries
- `idx_comment_post` - Comment retrieval

### Layered Architecture
```
Controller Layer (PostController, FeedController)
       ↓
Service Layer (PostService, FeedService, LikeService, CommentService)
       ↓
Repository Layer (PostRepository, PostLikeRepository, CommentRepository)
       ↓
Utility Layer (GeoUtil)
       ↓
Database (PostgreSQL with PostGIS)
```

---

## 📡 API Endpoints

### Posts (6 endpoints)
```
POST   /api/posts                    - Create post with location
GET    /api/posts/{id}               - Get post details
DELETE /api/posts/{id}               - Soft delete post (author only)
POST   /api/posts/{id}/like          - Toggle like/unlike
POST   /api/posts/{id}/comment       - Add comment
GET    /api/posts/{id}/comments      - Get comments (paginated)
```

### Feed (1 endpoint)
```
GET    /api/feed                     - Get geo-filtered, ranked feed
       Query params:
       - lat: User's latitude (required)
       - lon: User's longitude (required)
       - radiusKm: Search radius (default: 10, max: 50)
       - interestBoost: Enable interest matching (default: true)
       - page: Page number (default: 0)
       - size: Page size (default: 10)
```

---

## 🛠️ Technology Stack

### Core
- **Spring Boot 3.2.5**
- **Java 17/21**
- **PostgreSQL 15** with PostGIS
- **Hibernate/JPA**

### New Dependencies (Week 2)
- **Jackson ObjectMapper** - JSON serialization for media URLs
- **Lombok** - Boilerplate reduction

### Geo Processing
- Custom Haversine implementation
- Bounding box calculation
- Simple geohash generation (suitable for pilot)

---

## 📊 Data Model

### Post Entity Fields
- `id` (UUID) - Primary key
- `author_id` (UUID FK) - Post creator
- `type` (ENUM) - Post category
- `text` (TEXT) - Post content
- `media_urls` (JSONB) - Media attachments
- `lat`, `lon` (DOUBLE) - Geo coordinates
- `geohash` (VARCHAR) - Spatial index
- `visibility_radius_km` (INT) - Discovery radius
- `created_at`, `updated_at` - Timestamps
- `deleted_at` - Soft delete flag

### PostLike Composite Key
- `post_id` + `user_id` - Ensures one like per user per post

### Comment Entity
- Supports soft delete
- Ordered chronologically
- Includes author profile (alias, avatar)

---

## 🧪 Testing Coverage

### Test Scenarios
1. **Geo-Filtering**
   - Posts within radius included
   - Posts outside radius excluded
   - Accurate Haversine distance calculation

2. **Feed Ranking**
   - Recent posts rank higher
   - Interest-matched posts boosted
   - Engagement affects ranking
   - interestBoost parameter works

3. **Likes**
   - Like/unlike toggle
   - Like count accuracy
   - User's like status reflected

4. **Comments**
   - Add comments
   - Retrieve paginated comments
   - Author info displayed

5. **Pagination**
   - Page navigation
   - Metadata accuracy (totalPages, hasNext, etc.)

6. **Validation**
   - Invalid coordinates rejected
   - Radius limits enforced
   - Required fields validated

### Test Locations (Bangalore)
- **MG Road**: (12.9716, 77.5946) - Central reference
- **Hebbal**: (13.0358, 77.5970) - ~7km north
- **Koramangala**: (12.9352, 77.6245) - ~5km southeast
- **Whitefield**: (12.9698, 77.7500) - ~15km east

---

## 📝 Key Implementation Decisions

### 1. Geo-Query Strategy
- **Chosen**: Bounding box + Haversine
- **Rationale**: Sufficient for 50-100 user pilot, no external dependencies
- **Future**: Can upgrade to PostGIS `ST_DWithin` for better performance

### 2. Feed Ranking Weights
- **Interest Match (2.0)**: Highest priority for personalization
- **Recency (1.0)**: Balance between fresh and relevant
- **Engagement (0.5)**: Prevents echo chamber, allows discovery

### 3. Geohash Precision
- **Chosen**: 6 characters (~1.2km precision)
- **Rationale**: Adequate for neighborhood-level filtering
- **Future**: Use library like `ch.hsr:geohash` for production

### 4. Media URL Storage
- **Chosen**: JSON string in database
- **Rationale**: Simple for pilot, no S3 integration yet
- **Future**: Implement actual file upload to S3/MinIO

### 5. Soft Delete
- **Applied to**: Posts, Comments
- **Rationale**: Data retention, user privacy, audit trail
- **Implementation**: `deleted_at` timestamp field

---

## 🎯 Week 3 Preparation

Week 2 foundations enable Week 3 features:
- ✅ **Author System**: Ready for relationship-based name reveal
- ✅ **Post Visibility**: Foundation for trust-based filtering
- ✅ **Engagement Tracking**: Metrics for relationship-building
- ✅ **Location Tracking**: Ready for local connections

---

## 📈 Statistics

- **New Java Classes**: 18
  - Entities: 3 (Post, PostLike, Comment)
  - Repositories: 3
  - Services: 4
  - Controllers: 2
  - DTOs: 6
  - Utilities: 1

- **REST Endpoints**: +7 (Total: 20)
- **Database Tables**: +4 (Total: 9)
- **Lines of Code**: ~1500+
- **Build Time**: ~20 seconds
- **Compilation**: ✅ Success

---

## 🐛 Known Limitations

1. **Geohash**: Simple implementation, not library-quality
2. **Media URLs**: Stored as JSON strings, no actual upload
3. **Feed Caching**: No Redis cache yet
4. **Real-time Updates**: No WebSocket for likes/comments
5. **Soft Delete Cleanup**: No scheduled job to purge old data
6. **Rate Limiting**: No rate limiting on post creation
7. **Spam Detection**: No content moderation

---

## 🚀 Quick Start

```bash
# Start database
docker-compose up -d

# Run application
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
./mvnw spring-boot:run

# Run tests
./test_week2.sh

# Or manual testing
# See WEEK2_TESTING_GUIDE.md for detailed curl commands
```

---

## 📞 Next Steps for Week 3

1. Relationship/Trust system (requests, accept/reject)
2. Identity reveal (real name visible to friends)
3. Limited interaction before friendship
4. Block functionality
5. Mutual accept requirement

---

**Implementation Status**: ✅ COMPLETE  
**Build Status**: ✅ SUCCESS  
**Tests**: ✅ Ready (see WEEK2_TESTING_GUIDE.md)  
**Ready for Week 3**: ✅ YES
