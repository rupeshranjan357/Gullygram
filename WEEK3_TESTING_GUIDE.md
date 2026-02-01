# Week 3 Testing Guide: Trust & Relationships

## Overview
Week 3 introduced the "Circle of Trust" mechanics. The core feature is that users have two identities: an **Alias** (for strangers) and a **Real Name** (revealed only to friends).

## Pre-requisites
1.  **Backend Running**: `./mvnw spring-boot:run`
2.  **Frontend Running**: `npm run dev`
3.  **Two Test Accounts**:
    *   **User A**: `test1@gmail.com` / `123456`
    *   **User B**: `test2@gmail.com` / `123456` (Create if not exists)

---

## 1. Identity Reveal Test (The "Trust Protocol") 🕵️‍♂️
**Goal**: Verify that strangers see Aliens (Alias), and friends see Humans (Real Name).

### Steps
1.  **Login as User A** (Incognito Window 1).
2.  **Login as User B** (Incognito Window 2).
3.  **User A**: Post something ("Hello World").
4.  **User B**: View the Feed.
    *   **Check**: Does the author name show as an **Alias** (e.g., "NeonWalker")? ✅
    *   *Note: If it shows Real Name, you might already be friends. Unfriend first.*
5.  **User B**: Go to User A's profile and click **"Connect"** (Send Friend Request).
6.  **User A**: Go to Notifications/Requests and **Accept** the request.
7.  **User B**: Refresh the Feed.
    *   **Check**: Does the author name now change to **User A's Real Name**? ✅

---

## 2. Friend Request Flow 🤝
**Goal**: Test the full lifecycle of a connection.

### Steps
1.  **Send**: Search for a user or find them in "Discover". Click "Connect".
    *   *Verify*: Button changes to "Requested".
2.  **Receive**: Login as the other user. Check the "Network" or "Notifications" tab.
    *   *Verify*: You see a pending request card.
3.  **Action**:
    *   **Accept**: Verify connection is formed.
    *   **Reject**: Verify request disappears; users remain strangers.

---

## 3. People Suggestions 👥
**Goal**: Verify the recommendation algorithm works.

### Steps
1.  Go to the **"Discover"** tab.
2.  Look at the "Suggested People" section.
3.  **Check matching logic**:
    *   Are the people suggested nearby?
    *   Do they share your Interests (selected during onboarding)?
    *   *Example*: "Suggested because you both like Cricket".

---

## 4. Blocking Functionality 🚫
**Goal**: Ensure a blocked user creates a "black hole" (no interactions possible).

### Steps
1.  **User A**: Go to User B's profile.
2.  Click the "Three Dots" menu -> select **Block**.
3.  **Verify Immediate Effect**:
    *   User A should no longer see User B in Feed.
    *   User A should not find User B in Search.
4.  **User B's Perspective**:
    *   User B searches for User A -> No results found.
    *   User B tries to view User A's profile link directly -> Should show an error or empty state.
5.  **Unblock**:
    *   User A goes to Settings -> Blocked Users -> Click **Unblock**.
    *   Verify they can search/see each other again (as strangers).
