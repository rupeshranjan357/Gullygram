# GullyGram - Hyperlocal Utility Network 🏙️

GullyGram is a next-generation social platform focusing on **Hyperlocal Utility**. Unlike global feeds (TikTok/Insta), GullyGram prioritizes **Proximity (1-50km)**. It serves as a digital noticeboard for neighborhoods, connecting users with local news, events, and trusted marketplace deals.

---

## 🚀 Implementation Status (Weeks 1-5)

### ✅ Week 1: Foundation & Identity
- **Auth**: JWT-based Signup/Login (Email & OTP).
- **Profile**: Dual Identity (Anonymous Alias vs "Real" Verified Neighbor).
- **Location**: Geohash-based user tracking.

### ✅ Week 2: Helper Feed & Discovery
- **Feed Algorithm**: Ranked by Proximity + Interests (not just engagement).
- **Posts**: Geotagged content creation.
- **Interests**: User-selected categories (e.g., Food, Tech, Sports).

### ✅ Week 3: Social Graph & Trust
- **Trust Network**: "Friend Requests" to unlock Real Identity.
- **Privacy**: "Friends Only" visibility toggle for posts.
- **Followers**: Public following for local influencers/creators.

### ✅ Week 4: Deployment & CI/CD
- **Cloud**: Dockerized application ready for AWS/Render.
- **CI/CD**: GitHub Actions pipeline for automated testing and build.
- **Media**: S3-compatible structure for image uploads.

### ✅ Week 5: Marketplace & Events (Current)
- **Marketplace**:
    - **Company Accounts**: Verification flow for local businesses.
    - **Rate Limits**: Strict "1 Ad Per Day" rule to prevent spam.
- **Events**:
    - **Discovery**: "In My City" vs "Near Me" (Radius Slider).
    - **Creation**: Date/Venue specific posts.
- **Growth**: Viral loops via Open Graph tags and Referral structures.

---

## 🛠️ Tech Stack

### Backend (Spring Boot 3.2)
- **Language**: Java 17+
- **Database**: PostgreSQL 15 + **PostGIS** (Spatial Queries).
- **Security**: Spring Security + JWT.
- **Build**: Maven.

### Frontend (React 18)
- **Language**: TypeScript.
- **Build**: Vite.
- **Styling**: TailwindCSS.
- **Mobile**: Capacitor (Hybrid Android App).
- **State**: React Query (TanStack) + Zustand.

---

## 📦 Prerequisites

- **Java 17+**
- **Node.js 18+**
- **Docker & Docker Compose** (for Database)
- **Maven** (optional, wrapper included)

---

## 🏃‍♂️ Quick Start (Local Dev)

### 1. Start Database
```bash
docker-compose up -d
# Starts PostgreSQL (5432) with PostGIS
```

### 2. Run Backend
```bash
./mvnw spring-boot:run
# Server starts at http://localhost:8080
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
# App accesible at http://localhost:3000
```

---

## 📱 Mobile Deployment (Android)

GullyGram uses **Capacitor** to wrap the React web app into a native Android APK.
See [ANDROID_DEPLOYMENT_GUIDE.md](ANDROID_DEPLOYMENT_GUIDE.md) for full instructions.

```bash
cd frontend
npm run build
npx cap sync
npx cap open android
```

---

## 📚 Documentation & Artifacts

- **API Collection**: [Week 5 Postman JSON](WEEK5_POSTMAN_COLLECTION.json)
- **Competitive Analysis**: [Why GullyGram Wins](COMPETITIVE_ANALYSIS.md)
- **Viral Strategy**: [Growth Roadmap](VIRAL_GROWTH_STRATEGY.md)
- **Implementation Details**: [WEEK5_IMPLEMENTATION.md](WEEK5_IMPLEMENTATION.md)

---

## 🧪 Testing

### Backend Verification
Run the automated script to test Auth, Posts, and Marketplace limits:
```bash
./verify_week5_backend.sh
```

### Frontend Testing
- **Events**: Verify radius slider at `/events`.
- **Signup**: Verify "Company" toggle at `/signup`.

---

## 👥 Roles & Permissions

| Role | Capabilities | Restrictions |
| :--- | :--- | :--- |
| **Individual** | Create Posts, Events, Friends | Cannot post Marketing Ads |
| **Company** | Create Ads, Events | 1 Marketing Post / Day |

---

## 🔮 Roadmap (Week 6+)
- **Chat**: Real-time messaging (WebSocket/Stomp).
- **Push Notifications**: Firebase integration.
- **Monetization**: "Boost Post" for small businesses.

---

**Built with ❤️ for Neighborhoods.**
