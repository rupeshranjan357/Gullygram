# Week 4 Testing Guide: Engagement & Performance

## Overview
Week 4 added the "Life" to the social network with Media, Notifications, and Search, while ensuring the "Engine" runs fast with Performance updates.

## Pre-requisites
1.  **Backend Running**: `./mvnw spring-boot:run`
2.  **Frontend Running**: `npm run dev`
3.  **Two Test Accounts**: User A and User B.

---

## 1. Media Uploads (The "Visual" Test) 📸
**Goal**: Verify images can be posted and viewed without 403 errors.

### Steps
1.  **Create Post**:
    *   Click the "+" button in navigation.
    *   Click user avatar/upload icon to select an image from your computer.
    *   Add a caption and click **Post**.
2.  **Feed Verification**:
    *   Check your local Feed.
    *   **Crucial Check**: Does the image appear? (No broken icon).
    *   *Technical Check*: Right-click image -> "Open in new tab". URL should look like `http://localhost:3000/uploads/posts/...`.
3.  **Profile Picture**:
    *   Go to Profile -> Edit Profile.
    *   Upload a new Avatar.
    *   Refresh page. Does the new avatar stick?

---

## 2. Notifications System 🔔
**Goal**: Verify real-time(ish) updates for user interactions.

### Steps
1.  **Login User A** in Browser Window 1. Note the current notification count (e.g., bell icon).
2.  **Login User B** in Browser Window 2 (Incognito).
3.  **Interaction**:
    *   User B searches for User A.
    *   User B **Likes** a post by User A.
    *   User B **Comments** "Nice pic!" on a post.
4.  **Verification (User A)**:
    *   Wait 15 seconds (Polling interval).
    *   **Check**: Does the red badge appear on the bell icon? 🔴
    *   Click the Bell. Do you see "User B liked your post" and "User B commented..."?
    *   Click the notification. Does it take you to the correct Post?

---

## 3. Search & Discovery 🔍
**Goal**: Verify Finding things works + UX improvements.

### Steps
1.  **Go to Search Tab**.
2.  **Test People Search**:
    *   Type a name (e.g., "Rupesh" or the name of User B).
    *   **Debounce Check**: Notice search only runs after you stop typing for ~300ms.
    *   Verify User B appears in list.
3.  **Test Post Search**:
    *   Switch tab to **"Posts"**.
    *   Type a word you used in a caption (e.g., "Hello").
    *   Verify the post appears.
4.  **Skeleton Loader Test** (Performance):
    *   Refresh the page.
    *   Type a new query.
    *   **Check**: Do you see a gray "shimmering" skeleton box briefly before results load? (Instead of a spinner).

---

## 4. Performance Verification ⚡
**Goal**: Confirm the app is faster and lighter.

### Steps
1.  **Initial Load (Code Splitting)**:
    *   Open `Network` tab in Browser Developer Tools (F12).
    *   Hard Refresh (`Cmd+Shift+R`).
    *   **Check**: Look at the JS bundle size. It should be smaller.
    *   Navigate to **Settings** page.
    *   **Check**: Watch Network tab. A new small JS chunk should download *just now* (Lazy loading).
2.  **Feed Scrolling (N+1 Fix)**:
    *   Scroll down the feed.
    *   It should feel snappy. The backend is now fetching likes/comments efficiently (in batches of 20) instead of spamming 100 queries.

---

## Troubleshooting
- **Images Broken?**
    - Check if Backend is running.
    - Check if `SecurityConfig.java` has `.requestMatchers("/uploads/**").permitAll()`.
- **Notifications not showing?**
    - Wait >15 seconds.
    - Check Browser Network tab for `unread-count` API call (should be 200 OK).
