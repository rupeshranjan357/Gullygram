# GullyGram - Local Social Media Platform

GullyGram is a location-based social media platform that focuses on local connections, events, and marketplace within a user-defined radius.

## 🚀 Week 1 Implementation Status

Week 1 features have been completed:
- ✅ User Authentication (Email/Password & OTP-based)
- ✅ User Profile Management
- ✅ Interest Selection & Management
- ✅ Location Updates
- ✅ JWT-based Security

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- Docker & Docker Compose
- PostgreSQL with PostGIS extension (handled via Docker)

## 🛠️ Setup Instructions

### 1. Start PostgreSQL with PostGIS

```bash
docker-compose up -d
```

This will start PostgreSQL with PostGIS extension on port 5432.

### 2. Build the Project

```bash
./mvnw clean install
```

### 3. Run the Application

```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

## 📚 API Documentation

### Authentication Endpoints

#### 1. Sign Up (Email/Password)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "alias": "cool_user",
  "realName": "John Doe"
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "alias": "cool_user",
    "profileComplete": true
  }
}
```

#### 3. Request OTP
```http
POST /api/auth/otp/request
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

**Note:** OTP will be logged in console (for development). Integrate SMS service for production.

#### 4. Verify OTP
```http
POST /api/auth/otp/verify
Content-Type: application/json

{
  "phone": "+919876543210",
  "otpCode": "123456",
  "alias": "cool_user",
  "realName": "John Doe"
}
```

#### 5. Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Profile Endpoints

#### 1. Get My Profile
```http
GET /api/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "phone": "+919876543210",
    "alias": "cool_user",
    "realName": "John Doe",
    "bio": "Love exploring local events!",
    "avatarUrlAlias": "https://example.com/avatar.jpg",
    "defaultRadiusKm": 10,
    "lastSeenLat": 12.9716,
    "lastSeenLon": 77.5946,
    "lastSeenAt": "2026-01-22T10:30:00",
    "interests": [
      {
        "id": 1,
        "name": "Bodybuilding",
        "description": "Fitness and bodybuilding enthusiasts"
      }
    ]
  }
}
```

#### 2. Update Profile
```http
PATCH /api/me/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "realName": "John Updated",
  "bio": "Exploring Bangalore!",
  "defaultRadiusKm": 20,
  "avatarUrlAlias": "https://example.com/new-avatar.jpg"
}
```

#### 3. Update Location
```http
POST /api/me/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

### Interest Endpoints

#### 1. Get All Interests
```http
GET /api/interests
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Bodybuilding",
      "description": "Fitness and bodybuilding enthusiasts"
    },
    {
      "id": 2,
      "name": "Books",
      "description": "Book lovers and readers"
    }
  ]
}
```

#### 2. Get My Interests
```http
GET /api/me/interests
Authorization: Bearer <token>
```

#### 3. Update My Interests
```http
PUT /api/me/interests
Authorization: Bearer <token>
Content-Type: application/json

{
  "interestIds": [1, 2, 3, 5]
}
```

## 🗄️ Database Schema

### Tables Created (Week 1)

1. **users** - User authentication data
2. **user_profile** - User profile information and location
3. **interest** - Available interests (pre-populated)
4. **user_interest** - User-Interest many-to-many relationship
5. **otp_verification** - OTP verification records

### Pre-populated Interests

- Bodybuilding
- Books
- Dance
- Music
- Sports
- Technology
- Travel
- Food
- Photography
- Gaming
- Art
- Movies
- Fitness
- Cooking
- Fashion

## 🔐 Security

- JWT-based authentication
- BCrypt password hashing
- OTP rate limiting (max 3 OTPs per 5 minutes)
- Stateless session management
- CORS enabled (configure in production)

## 📁 Project Structure

```
src/main/java/com/gullygram/backend/
├── controller/          # REST API controllers
├── service/            # Business logic
├── repository/         # Database repositories
├── entity/            # JPA entities
├── dto/               # Data Transfer Objects
│   ├── request/       # Request DTOs
│   └── response/      # Response DTOs
├── security/          # JWT & Security configuration
└── exception/         # Exception handlers
```

## 🧪 Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "alias": "test_user",
    "realName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (Replace TOKEN)
```bash
curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Location
```bash
curl -X POST http://localhost:8080/api/me/location \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

## 🔧 Configuration

Key configuration in `application.yml`:

```yaml
app:
  jwt:
    secret: ${JWT_SECRET:gullygram-super-secret-key-change-in-production-minimum-256-bits}
    expiration-ms: 86400000  # 24 hours
  otp:
    expiration-minutes: 5
    length: 6
```

### Environment Variables

- `JWT_SECRET` - JWT signing key (change in production!)
- `SPRING_DATASOURCE_URL` - Database URL
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password

## 📝 Next Steps (Week 2+)

- [ ] Posts & Feed with radius filtering
- [ ] Likes & Comments
- [ ] Relationship/Trust system
- [ ] Events management
- [ ] Marketplace listings
- [ ] Media upload (S3/MinIO)
- [ ] Redis caching
- [ ] PostGIS geo queries

## 🐛 Common Issues

### Port 5432 already in use
```bash
# Stop existing PostgreSQL
docker-compose down
# Or change port in docker-compose.yml
```

### Flyway migration fails
```bash
# Clean and rebuild
./mvnw clean
docker-compose down -v
docker-compose up -d
./mvnw spring-boot:run
```

## 📄 License

This project is for educational purposes.

## 👥 Contact

For issues and questions, please create an issue in the repository.
