# Backend Restart Required

## Issue
The signup endpoint is failing with: **"null identifier (com.gullygram.backend.entity.UserProfile)"**

This happens because the backend is running with old compiled code.

## Solution - Restart Backend with New Code

### Step 1: Stop Current Backend
Press `Ctrl+C` in the terminal where backend is running

OR kill the process:
```bash
lsof -ti:8080 | xargs kill
```

### Step 2: Clean and Recompile
```bash
cd /Users/rupeshsingh/Gullygram
./mvnw clean compile
```

### Step 3: Start Backend
```bash
./mvnw spring-boot:run
```

### Step 4: Wait for Startup
Wait for this message:
```
Started GullyGramApplication in X.XXX seconds
```

### Step 5: Verify Fix
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "alias": "testuser",
    "realName": "Test User"
  }'
```

Should return:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "...",
    "userId": "...",
    "alias": "testuser",
    "profileComplete": true
  }
}
```

## What Was Fixed

The issue was in `AuthService.java`:
- UserProfile creation with `@MapsId` annotation requires setting both `user` object and `userId` explicitly
- Added `HashSet<>()` initialization for interests collection
- Fixed both signup and OTP verification flows

## After Restart

Once backend is running with new code, I will:
1. Run complete Week 2 testing suite
2. Test all features (posts, feed, likes, comments)
3. Verify geo-filtering and ranking
4. Create comprehensive test report

---

**Please restart the backend following steps above, then let me know when it's ready!** 🚀
