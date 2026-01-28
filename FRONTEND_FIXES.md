# Frontend API Integration Fixes

## Issue Summary
The frontend types and API service layer didn't match the backend response structure, causing signup (Step 2) to fail. The backend returns a wrapped response with `success`, `message`, and `data` fields, but the frontend was expecting a flat structure.

## Fixes Applied

### 1. Updated Type Definitions (`src/types/index.ts`)

#### AuthResponse
**Before:**
```typescript
{
  token: string;
  user: User;
  profile: Profile;
}
```

**After:**
```typescript
{
  accessToken: string;
  tokenType: string;
  userId: string;
  alias: string;
  profileComplete: boolean;
}
```

#### ProfileResponse
**Before:**
```typescript
{
  user: User;
  profile: Profile;
  interests: Interest[];
}
```

**After:**
```typescript
{
  userId: string;
  email?: string;
  phone?: string;
  alias: string;
  realName?: string;
  bio?: string;
  avatarUrlAlias?: string;
  avatarUrlReal?: string;
  dob?: string;
  homeLat?: number;
  homeLon?: number;
  defaultRadiusKm: number;
  lastSeenLat?: number;
  lastSeenLon?: number;
  lastSeenAt?: string;
  interests: Interest[];
}
```

#### Interest
**Before:**
```typescript
{
  id: number;
  name: string;
  icon: string;
  colorClass?: string;
}
```

**After:**
```typescript
{
  id: number;
  name: string;
  description?: string;
}
```
*Note: Icons and colors are now mapped on the frontend side in InterestSelection.tsx*

#### UpdateProfileRequest
**Before:**
```typescript
{
  avatarUrl?: string;
  realAvatarUrl?: string;
  dateOfBirth?: string;
  defaultRadius?: number;
}
```

**After:**
```typescript
{
  avatarUrlAlias?: string;
  avatarUrlReal?: string;
  dob?: string;
  defaultRadiusKm?: number;
}
```

#### AuthState
**Before:**
```typescript
{
  user: User | null;
  profile: Profile | null;
  token: string | null;
  login: (response: AuthResponse) => void;
  updateProfile: (profile: Profile) => void;
}
```

**After:**
```typescript
{
  userId: string | null;
  alias: string | null;
  token: string | null;
  profileComplete: boolean;
  login: (response: AuthResponse) => void;
  setProfileComplete: (complete: boolean) => void;
}
```

### 2. Updated Service Layer

#### authService.ts
All endpoints now unwrap the `ApiResponse<T>` wrapper:

```typescript
async signup(data: SignupRequest): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/signup', data);
  return response.data.data; // Extract data from wrapper
}
```

#### profileService.ts
Updated to handle wrapped responses:

```typescript
async getProfile(): Promise<ProfileResponse> {
  const response = await api.get<ApiResponse<ProfileResponse>>('/me');
  return response.data.data;
}
```

#### interestService.ts
Updated to handle wrapped responses:

```typescript
async getAllInterests(): Promise<Interest[]> {
  const response = await api.get<ApiResponse<Interest[]>>('/interests');
  return response.data.data;
}
```

### 3. Updated Auth Store (`src/store/authStore.ts`)

Changed from storing full `User` and `Profile` objects to only storing essential auth data:

```typescript
{
  userId: response.userId,
  alias: response.alias,
  token: response.accessToken,
  isAuthenticated: true,
  profileComplete: response.profileComplete,
  isNewUser: isSignup,
}
```

### 4. Updated Components

#### Profile.tsx
- Changed from using `auth.profile` to fetching profile data via API
- Updated to use `profileData?.alias` instead of `profile?.alias`
- Fixed avatar initial display
- Fixed bio and realName display

#### RadiusSelection.tsx
- Removed `updateProfile` call from auth store
- Added `setProfileComplete` call instead
- Fixed field name: `defaultRadius` → `defaultRadiusKm`

## Backend Response Format

All backend endpoints return:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Actual response data here
  }
}
```

## Testing Instructions

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd /Users/rupeshsingh/Gullygram
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd /Users/rupeshsingh/Gullygram/frontend
npm run dev
```

### 2. Test the Complete Flow

1. **Navigate to http://localhost:3000/signup**
   - Fill in:
     - Email: `newuser_fix_v2@gullygram.com`
     - Password: `Test123!`
     - Alias: `newuser_fix_v2`
     - Real Name: `New User Fix V2`
   - Click "Continue"
   - ✅ Should redirect to `/onboarding/interests` (NOT `/profile`)

2. **On /onboarding/interests:**
   - Select at least 3 interests (e.g., Music, Photography, Technology)
   - Click "Next"
   - ✅ Should redirect to `/onboarding/radius`

3. **On /onboarding/radius:**
   - Select "20km"
   - Click "Get Started"
   - ✅ Should redirect to `/profile`

4. **On /profile:**
   - ✅ Verify you see your alias and profile
   - Reload the page (F5 or Cmd+R)
   - ✅ Verify you're STILL on `/profile` (auth persisted)

### 3. Verify API Calls (Browser DevTools)

Open DevTools → Network tab and verify:

**Signup Request:**
```
POST http://localhost:8080/api/auth/signup
Response: 201 Created
Body includes: accessToken, userId, alias, profileComplete
```

**Interests Request:**
```
GET http://localhost:8080/api/interests
Response: 200 OK
Body includes array of interests with id, name, description
```

**Update Interests:**
```
PUT http://localhost:8080/api/me/interests
Body: { "interestIds": [1, 2, 3] }
Response: 200 OK
```

**Update Profile:**
```
PATCH http://localhost:8080/api/me/profile
Body: { "defaultRadiusKm": 20 }
Response: 200 OK
```

**Get Profile:**
```
GET http://localhost:8080/api/me
Response: 200 OK
Body includes: userId, alias, interests[], defaultRadiusKm, etc.
```

## Files Modified

```
frontend/src/types/index.ts
frontend/src/services/authService.ts
frontend/src/services/profileService.ts
frontend/src/services/interestService.ts
frontend/src/store/authStore.ts
frontend/src/pages/Profile.tsx
frontend/src/pages/RadiusSelection.tsx
```

## Build Status

✅ TypeScript compilation: **SUCCESS**
✅ Vite build: **SUCCESS**
✅ No type errors
✅ No linter errors

## Next Steps

1. Start both servers (backend + frontend)
2. Test the complete signup → onboarding → profile flow
3. Verify auth persistence (page reload)
4. Check browser console for any errors
5. Verify Network tab shows correct API calls

All type mismatches have been resolved and the frontend now correctly communicates with the backend API! 🎉
