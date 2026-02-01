# Week 5: Marketplace & Events Implementation Guide

## Executive Summary
This document outlines the implementation of Week 5 features for **GullyGram**:
1.  **Community Marketplace**: Allowing companies to post marketing content (ads) with rate limits.
2.  **Event Discovery**: Enabling users to find events by City or via Proximity (Radius).

---

## 1. Marketplace (Marketing) 📢

### Overview
We introduced a specific workflow for **Company Accounts**:
-   Companies are a distinct `AccountType`.
-   They can post `MARKETING` content.
-   **Constraint**: Maximum **1 marketing post per day** to prevent spam.

### Architecture Changes
*   **Database (`users` table)**:
    *   `account_type`: Enum (`INDIVIDUAL`, `COMPANY`).
    *   `marketing_category`: String (e.g., "TECH", "FASHION").
    *   `last_marketing_post_at`: Timestamp to track daily limits.
*   **Backend Logic**:
    *   `MarketplaceService`: Intercepts post creation. If `type == MARKETING`, it validates the rate limit against `last_marketing_post_at`.

### User Flow
1.  User signs up and toggles **"Register as Company"**.
2.  User selects a **Category** (e.g., "Food").
3.  User goes to **Create Post** -> Selects **Marketing**.
4.  System allows 1 post. Subsequent attempts on the same day are blocked.

---

## 2. Events Discovery 📅

### Overview
Users can now discover local events using two primary filters: **City-wide** (for major events) and **Nearby** (location-based).

### Architecture Changes
*   **Database (`post` table)**:
    *   `event_date`: DateTime of the event.
    *   `event_city`: Normalized city name.
    *   `event_location_name`: Specific venue name.
*   **API Endpoints**:
    *   `GET /api/events/city?city=Bangalore`
    *   `GET /api/events/nearby?lat=...&lon=...&radius=10`

### User Flow
1.  **Create Event**: User creates a post with type `Event`. Inputs Date and Venue.
2.  **Discover**: User goes to the new **Events Tab**.
    *   **"In My City"**: Shows events matching the typed city name.
    *   **"Near Me"**: Shows events within the selected radius (default 10km) of the user's current GPS location.

---

## 3. Verification & Testing

### automated_tests.sh / verify_week5_backend.sh
We verified the following scenarios via `curl` scripts:
*   ✅ **Company Signup**: Successfully registers with correct roles.
*   ✅ **Rate Limit**: First ad succeeds, second ad fails (HTTP 500).
*   ✅ **Event Creation**: Event fields are persisted correctly.
*   ✅ **City Search**: Returns events matching the city string.
*   ✅ **Radius Search**: Returns events within the Haversine distance.

### Manual Verification Steps
1.  **Run Server**: `./mvnw spring-boot:run`
2.  **Login**: As a Company user.
3.  **Test Limit**: Post an ad, then try immediately again. Confirm rejection.
4.  **Events**: Create an event. Go to "Events" tab. Check if it appears in "In My City".

---

## 4. Migration Details
*   **Script**: `src/main/resources/db/migration/V9__add_marketplace_events.sql`
*   **Status**: Applied. Schema version is now **9**.
