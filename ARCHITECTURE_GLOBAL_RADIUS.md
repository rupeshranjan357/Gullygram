# HLD: Global Radius & Location Architecture 🌍

## 1. System Overview
The **Global Radius System** fundamentally changes GullyGram from a *page-based* location app to a *state-based* location app.
Instead of each page (Feed, Marketplace) managing its own location logic, a central **Global Location Store** drives the entire application state.

### Core Philosophy
*   **Source of Truth**: The Store is the single source of truth for "Where am I?".
*   **Passive vs Active**: The system prefers Passive (GPS) but supports Active (Manual Input) seamlessly.
*   **Radius as God Mode**: Changing the radius in the store triggers a cascading update across all active views.

---

## 2. High-Level Data Flow

```mermaid
graph TD
    User[User Interaction] -->|1. Permissions / Input| Sensors[GPS / Geocoding]
    Sensors -->|2. Coordinates (Lat/Lon)| Store[Global Location Store (Zustand)]
    
    subgraph "Global State"
        Store -->|Lat, Lon, Radius| State_loc[Current Location]
        Store -->|Mode: GPS/Manual| State_mode[Tracking Mode]
    end

    Store -->|3. Reactive Update| Feed_Page[Feed Page]
    Store -->|3. Reactive Update| Events_Page[Events Page]
    Store -->|3. Reactive Update| Market_Page[Marketplace Page]

    Feed_Page -->|4. API Query (Lat/Lon/Radius)| Backend_Feed[Feed API]
    Events_Page -->|4. API Query (Lat/Lon/Radius)| Backend_Event[Events API]
    Market_Page -->|4. API Query (Lat/Lon/Radius)| Backend_Market[Market API]

    Backend_Feed -->|5. Filtered Data| UI[User Interface]
```

---

## 3. Component Architecture

### A. Frontend Layer

#### 1. `useLocationStore` (Zustand)
The brain of the operation.
*   **State**:
    *   `coords`: `{ lat: number, lon: number }`
    *   `radius`: `number` (Default: 5km)
    *   `mode`: `'GPS' | 'MANUAL'`
    *   `addressLabel`: `string` (e.g., "Indiranagar, Bangalore")
    *   `isLocating`: `boolean`
*   **Actions**:
    *   `refreshGPS()`: Triggers browser geolocation.
    *   `setManualLocation(searchQuery)`: Calls Geocoding API -> Updates Coords.
    *   `setRadius(km)`: Updates radius -> Triggers app refresh.

#### 2. `LocationService` (Utility)
*   **Geocoding**: Wrapper around **OpenStreetMap (Nominatim)** API.
    *   `getCoordsFromText("Whitefield")` -> returns `{ lat, lon }`.
    *   `getTextFromCoords(lat, lon)` -> returns "Whitefield".
*   **Persistence**: Saves last known location to `localStorage` to prevent "Empty Start" on reload.

#### 3. UX Components
*   **`LocationHeader`**:
    *   Displays: `📍 [AddressLabel] ( [Radius]km )`
    *   Behavior: Click opens Settings.
*   **`LocationSettings`**:
    *   **Toggle**: "Use GPS" vs "Set Manually".
    *   **Input**: Text box (Active only in Manual mode).
    *   **Slider**: Radius Control (1km - 50km).

---

## 4. Backend Layer (Existing Support)

The backend is already "Stateless" and ready for this. It accepts Lat/Lon/Radius on every request.

*   `GET /api/feed?lat=...&lon=...&radius=...`
*   `GET /api/events/nearby?lat=...&lon=...&radius=...`
*   `GET /api/marketplace?lat=...&lon=...&radius=...`

**No major backend changes required.** This is purely a client-side architecture shift.

---

## 5. Failover & Reliability Strategy

### Scenario A: GPS Denied / Fails
1.  **Detection**: Browser returns `PERMISSION_DENIED` or `TIMEOUT`.
2.  **Fallback**: App switches `mode` to `'MANUAL'`.
3.  **UI**: Shows modal: *"We can't find you. Enter your city to continue."*
4.  **Recovery**: User types "Mumbai". App proceeds normally.

### Scenario B: "Empty Map" (Rural Area)
1.  **Detection**: API returns `posts: []`.
2.  **Logic**: Frontend detects empty list.
3.  **Auto-Expand**: App temporarily suggests/toasts: *"Quiet here! Expanding radius to 50km..."* and auto-refetches.

---

## 6. Implementation Steps

1.  **Step 1**: Create `source/store/locationStore.ts`.
2.  **Step 2**: Create `source/services/geocodingService.ts`.
3.  **Step 3**: Build `LocationSettings.tsx` component.
4.  **Step 4**: Integrate store into `Feed.tsx`, `Marketplace.tsx`, `Events.tsx`.
5.  **Step 5**: Update Header to reflect Global State.
