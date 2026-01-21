# Testing Guide - GullyGram Week 1

This guide provides step-by-step instructions to test all Week 1 features.

## 🚀 Getting Started

### 1. Start the Application

```bash
cd /Users/rupeshsingh/Gullygram
./start.sh
```

Wait for the message: "Started GullyGramApplication"

### 2. Verify Database

```bash
# Check if PostgreSQL is running
docker ps | grep gully_postgres

# Connect to database (optional)
docker exec -it gully_postgres psql -U gully_user -d gullygram
# Then run: \dt to see tables
```

## 📝 Testing Scenarios

### Scenario 1: Email/Password Registration & Login

#### Step 1: Sign Up
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "alice123",
    "alias": "alice_rocks",
    "realName": "Alice Johnson"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "alias": "alice_rocks",
    "profileComplete": true
  }
}
```

**Save the `accessToken` for next steps!**

#### Step 2: Test Duplicate Email
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "different123",
    "alias": "alice_different"
  }'
```

**Expected Response:** Error "Email already registered"

#### Step 3: Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "alice123"
  }'
```

**Expected Response:** Same structure as signup with new token

#### Step 4: Test Wrong Password
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "wrongpassword"
  }'
```

**Expected Response:** 401 Unauthorized "Invalid credentials"

---

### Scenario 2: OTP-Based Registration

#### Step 1: Request OTP
```bash
curl -X POST http://localhost:8080/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": null
}
```

**Check Application Logs** to see the OTP code:
```
INFO: OTP for +919876543210: 123456
```

#### Step 2: Test Rate Limiting
```bash
# Send 4 OTP requests quickly
for i in {1..4}; do
  curl -X POST http://localhost:8080/api/auth/otp/request \
    -H "Content-Type: application/json" \
    -d '{"phone": "+919876543210"}'
  echo ""
done
```

**Expected:** 4th request should fail with "Too many OTP requests"

#### Step 3: Verify OTP (with wrong code)
```bash
curl -X POST http://localhost:8080/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "otpCode": "000000",
    "alias": "phone_bob",
    "realName": "Bob Smith"
  }'
```

**Expected Response:** Error "Invalid OTP code"

#### Step 4: Verify OTP (with correct code)
```bash
# Use the OTP from application logs
curl -X POST http://localhost:8080/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "otpCode": "123456",
    "alias": "phone_bob",
    "realName": "Bob Smith"
  }'
```

**Expected Response:** Auth response with token (save this token!)

---

### Scenario 3: Profile Management

**Use Alice's token from Scenario 1**

#### Step 1: Get Profile
```bash
TOKEN="YOUR_TOKEN_HERE"

curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "userId": "...",
    "email": "alice@example.com",
    "alias": "alice_rocks",
    "realName": "Alice Johnson",
    "defaultRadiusKm": 10,
    "interests": []
  }
}
```

#### Step 2: Update Profile
```bash
curl -X PATCH http://localhost:8080/api/me/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Love exploring local events in Bangalore! 🎉",
    "defaultRadiusKm": 20,
    "dob": "1995-05-15"
  }'
```

**Expected Response:** Updated profile with new values

#### Step 3: Test Invalid Token
```bash
curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer invalid_token_12345"
```

**Expected Response:** 401 Unauthorized or 403 Forbidden

#### Step 4: Update Location
```bash
curl -X POST http://localhost:8080/api/me/location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

**Expected Response:** Success message

#### Step 5: Verify Location Updated
```bash
curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Response should show `lastSeenLat`, `lastSeenLon`, and `lastSeenAt`

---

### Scenario 4: Interest Management

#### Step 1: Get All Available Interests (No Auth Required)
```bash
curl -X GET http://localhost:8080/api/interests
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {"id": 1, "name": "Bodybuilding", "description": "..."},
    {"id": 2, "name": "Books", "description": "..."},
    ...
  ]
}
```

**Note the IDs** (e.g., 1, 2, 3, 5, 7)

#### Step 2: Update User Interests
```bash
curl -X PUT http://localhost:8080/api/me/interests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "interestIds": [1, 2, 3, 5, 7]
  }'
```

**Expected Response:** List of selected interests

#### Step 3: Get My Interests
```bash
curl -X GET http://localhost:8080/api/me/interests \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:** Same 5 interests

#### Step 4: Test Invalid Interest ID
```bash
curl -X PUT http://localhost:8080/api/me/interests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "interestIds": [1, 999, 3]
  }'
```

**Expected Response:** Error "One or more interest IDs are invalid"

#### Step 5: Verify Interests in Profile
```bash
curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Profile includes `interests` array with details

---

## 🧪 Advanced Testing

### Test Validation Errors

#### Invalid Email Format
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "pass123",
    "alias": "testuser"
  }'
```

**Expected:** 400 Bad Request with validation errors

#### Short Password
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "12",
    "alias": "testuser"
  }'
```

**Expected:** "Password must be at least 6 characters"

#### Invalid Alias
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "pass123",
    "alias": "ab"
  }'
```

**Expected:** "Alias must be between 3 and 50 characters"

#### Invalid Location
```bash
curl -X POST http://localhost:8080/api/me/location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 200,
    "longitude": 77.5946
  }'
```

**Expected:** "Latitude must be between -90 and 90"

---

## 📊 Database Verification

### Check Created Users
```bash
docker exec -it gully_postgres psql -U gully_user -d gullygram -c \
  "SELECT id, email, phone, status FROM users;"
```

### Check User Profiles
```bash
docker exec -it gully_postgres psql -U gully_user -d gullygram -c \
  "SELECT user_id, alias, real_name, bio, default_radius_km FROM user_profile;"
```

### Check User Interests
```bash
docker exec -it gully_postgres psql -U gully_user -d gullygram -c \
  "SELECT ui.user_id, i.name FROM user_interest ui JOIN interest i ON ui.interest_id = i.id;"
```

### Check OTP Logs
```bash
docker exec -it gully_postgres psql -U gully_user -d gullygram -c \
  "SELECT phone, otp_code, verified, expires_at FROM otp_verification ORDER BY created_at DESC LIMIT 5;"
```

---

## 📱 Postman Testing

### Import Collection
1. Open Postman
2. Click "Import"
3. Select `GullyGram-API.postman_collection.json`
4. Collection will appear in left sidebar

### Setup
1. Click on collection "GullyGram API - Week 1"
2. Go to Variables tab
3. Set `base_url` to `http://localhost:8080`
4. Click Save

### Run Tests
1. **Sign Up** - Creates user and auto-saves token
2. **Login** - Alternative login and auto-saves token
3. **Get My Profile** - Uses saved token
4. **Update Profile** - Modify user details
5. **Get All Interests** - See available interests
6. **Update My Interests** - Select interests
7. **Update Location** - Set current location

---

## ✅ Test Checklist

Use this checklist to verify all features:

### Authentication
- [ ] Sign up with email/password
- [ ] Login with email/password
- [ ] Duplicate email validation
- [ ] Duplicate phone validation
- [ ] Duplicate alias validation
- [ ] Wrong password rejection
- [ ] Request OTP for phone
- [ ] OTP rate limiting (3 per 5 min)
- [ ] Verify OTP (wrong code)
- [ ] Verify OTP (correct code)
- [ ] JWT token generation
- [ ] Token validation on protected routes

### Profile
- [ ] Get own profile
- [ ] Update profile (bio, realName, radius)
- [ ] Update location
- [ ] Location validation
- [ ] Profile without authentication fails

### Interests
- [ ] Get all interests (public)
- [ ] Get user interests
- [ ] Update user interests
- [ ] Invalid interest ID rejection
- [ ] Empty interest list rejection

### Security
- [ ] Invalid token rejected
- [ ] Missing token rejected
- [ ] Expired token rejected (wait 24 hours)
- [ ] Password encrypted in database

---

## 🐛 Troubleshooting

### Application won't start
```bash
# Check if port 8080 is in use
lsof -i :8080

# Kill existing process
kill -9 <PID>
```

### Database connection failed
```bash
# Restart database
docker-compose down
docker-compose up -d

# Check logs
docker logs gully_postgres
```

### Can't find OTP in logs
```bash
# Check application logs
./mvnw spring-boot:run | grep "OTP for"
```

### Reset Everything
```bash
# Stop app (Ctrl+C)
# Remove all data
docker-compose down -v
# Start fresh
./start.sh
```

---

## 📈 Performance Testing

### Load Test (using Apache Bench)
```bash
# Install Apache Bench (macOS)
brew install httpd

# Test signup endpoint
ab -n 100 -c 10 -p signup.json -T application/json \
  http://localhost:8080/api/auth/signup
```

---

## 🎉 Success Criteria

✅ Week 1 is successfully implemented if:
1. All test scenarios pass
2. No unhandled exceptions in logs
3. Database tables created correctly
4. JWT authentication works
5. All validation rules enforced
6. Profile and interests update successfully
7. Location tracking works
8. OTP rate limiting functions

**Status**: Ready for Week 2 Development! 🚀
