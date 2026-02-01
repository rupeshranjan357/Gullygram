# Week 4: Engagement & Discovery Implementation Guide

## Executive Summary
This week focused on transforming GullyGram into a fully engaging social platform. We implemented three core pillars: **Notifications** (to drive re-engagement), **Media Uploads** (to enrich content), and **Search & Discovery** (to connect users). We concluded with **Performance Optimizations** to ensure scalability.

---

## 1. Notification System 🔔
**Goal:** Notify users of interactions (Likes, Comments, Follows).

### Technical Implementation
*   **Database (`V6__create_notifications.sql`):**
    *   Created `notification` table with fields: `recipient_id`, `actor_id`, `type`, `entity_id`, `is_read`.
    *   Indexed `recipient_id` for fast fetching.
*   **Backend (`NotificationService.java`):**
    *   **Trigger Points:** Injected logic into `PostService` (on like/comment) and `RelationshipService` (on follow) to asynchronously create notifications.
    *   **Polling:** Implemented a simple persistent-polling compatible API (`GET /api/notifications/unread-count`).
*   **Frontend (`Notifications.tsx`):**
    *   Created a dedicated page displaying a list of notifications.
    *   **Polling Hook:** `App.tsx` polls every 15s to update the badge count in the bottom navigation.

### How to Retrace/Test
1.  Login as User A.
2.  Login as User B (incognito) and like User A's post.
3.  User A sees the bell icon badge update within 15s.

---

## 2. Media Uploads 📸
**Goal:** Allow users to upload images for Profiles and Posts.

### Technical Implementation
*   **Storage Strategy:**
    *   Implemented `LocalStorageServiceImpl` for development (saves to `root/uploads`).
    *   Designed clean interface `StorageService` for easy swap to S3 in production.
*   **Security Fix (Crucial):**
    *   **Issue:** Browser blocked images (403 Forbidden) because `<img>` tags don't send auth headers.
    *   **Fix:** Updated `SecurityConfig.java` to explicitly `.permitall()` requests to `/uploads/**`.
*   **Frontend:**
    *   **PostCard:** Updated to correctly prepend backend base URL to relative image paths.
    *   **Upload UI:** Integrated file picker in `CreatePost.tsx` and `Profile.tsx`.

### How to Retrace/Test
1.  Go to `Create Post`.
2.  Select an image file.
3.  Post it.
4.  Verify it appears in the Feed immediately and persists after refresh.

---

## 3. Search & Discovery 🔍
**Goal:** Enable finding users, posts, and hashtags.

### Technical Implementation
*   **Database (`V8__add_search_indexes.sql`):**
    *   **Users:** Added `pg_trgm` (trigram) indexes for fuzzy matching on names (handles typos).
    *   **Posts:** Added GIN index on `to_tsvector('english', text)` for full-text search.
*   **Backend (`SearchService.java`):**
    *   Implemented efficient SQL queries using `ILIKE` (users) and `@@ plainto_tsquery` (posts).
*   **Frontend (`Search.tsx`):**
    *   Implemented a tabbed interface (People, Posts, Hashtags).
    *   Added **Debouncing**: Search only triggers after user stops typing (preventing API spam).

### How to Retrace/Test
1.  Go to Search tab.
2.  Type "test".
3.  Switch between "People" and "Posts" to see filtered results.

---

## 4. Performance Optimizations ⚡
**Goal:** Improve load times and database efficiency.

### Technical Implementation
*   **Backend (N+1 Fix):**
    *   **Problem:** Fetching 20 posts caused 41 queries (1 for list + 20 for likes + 20 for comments).
    *   **Solution:** Added `@BatchSize(size = 20)` to `Post.java`. Now it fetches them in just 3 queries.
*   **Frontend (Code Splitting):**
    *   **Solution:** Converted all route imports in `App.tsx` to `React.lazy()`.
    *   **Result:** The browser downloads *only* the code for the current page, making the initial load much faster.
*   **Frontend (UX):**
    *   Replaced spinners with **Skeleton Loaders** in Search for a smoother "perceived" performance.

---

## Database Migrations Summary
files located in `src/main/resources/db/migration/`:
*   `V6`: Notifications schema.
*   `V7`: (Skipped/Merged) Media support.
*   `V8`: Search indexes (Trigram & Full-text).

---

## Future Development Notes
*   **Deployment:** When moving to production, update `application-prod.yml` to switch `StorageService` from local to S3 (AWS).
*   **Scaling:** If notifications become too heavy, move `NotificationService` to use a message queue (Kafka/RabbitMQ).
