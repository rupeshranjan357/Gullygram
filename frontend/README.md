# GullyGram Frontend

A beautiful, modern React frontend for GullyGram - Connect Locally, Discover Nearby.

## 🚀 Tech Stack

- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack React Query** - Server state management
- **Zustand** - Lightweight state management
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8080`

## 🛠️ Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` if your backend is running on a different port:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── InterestCard.tsx
│   │   └── InterestPill.tsx
│   └── ProtectedRoute.tsx
├── pages/
│   ├── Landing.tsx      # Welcome screen
│   ├── Signup.tsx       # User registration
│   ├── Login.tsx        # User login
│   ├── InterestSelection.tsx  # Onboarding step 1
│   ├── RadiusSelection.tsx    # Onboarding step 2
│   └── Profile.tsx      # User profile
├── services/
│   ├── api.ts           # Axios instance with interceptors
│   ├── authService.ts   # Authentication APIs
│   ├── profileService.ts # Profile management APIs
│   └── interestService.ts # Interest management APIs
├── store/
│   ├── authStore.ts     # Zustand auth state
│   └── onboardingStore.ts # Onboarding state
├── types/
│   └── index.ts         # TypeScript definitions
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 🎨 Design System

### Colors
- **Primary Purple**: `#6B46C1`
- **Primary Blue**: `#3B82F6`
- **Gradients**: Purple-to-blue brand gradient
- **Interest Colors**: Each interest has a unique gradient

### Typography
- **Font**: Inter (loaded from Google Fonts)
- **Sizes**: xs (12px) to 4xl (36px)

### Components
- **Button**: Primary, secondary, outline variants
- **Input**: With icon support, password toggle
- **Card**: Regular and glassmorphism variants
- **InterestCard**: Colorful, selectable cards
- **InterestPill**: Tags with color coding

## 🔐 Authentication Flow

1. **Landing Page** → Sign Up or Login
2. **Sign Up** → Create account with email/password + alias
3. **Login** → Authenticate existing user
4. **Onboarding** (new users):
   - Step 1: Select interests
   - Step 2: Choose radius (10km or 20km)
5. **Profile** → Main app screen

## 🌐 API Integration

All API calls use the backend at `http://localhost:8080/api`:

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Authenticate user
- `GET /me` - Get current user profile
- `PATCH /me/profile` - Update profile
- `GET /interests` - Get all interests
- `PUT /me/interests` - Update user interests

JWT tokens are automatically included in request headers.

## 🎯 Week 1 Features

✅ Landing page with gradient design  
✅ Email/password signup  
✅ Login  
✅ Interest selection (onboarding)  
✅ Radius selection (onboarding)  
✅ Profile page with stats and tabs  
✅ JWT authentication  
✅ Protected routes  
✅ Responsive design  

## 📱 Screen Flow

```
Landing
  ├─> Signup ──> Interests ──> Radius ──> Profile
  └─> Login ──────────────────────────────> Profile
```

## 🧪 Testing

### Manual Testing Flow

1. Start backend: `cd .. && ./start.sh`
2. Start frontend: `npm run dev`
3. Open `http://localhost:3000`
4. Test signup → onboarding → profile flow
5. Test login → profile flow

### Build for Production

```bash
npm run build
npm run preview
```

## 🎨 Design Mockups

The frontend closely matches the provided design mockups:
- Landing screen with purple-blue gradient
- Clean signup/login forms
- Colorful interest selection grid
- Visual radius selection with map
- Profile with gradient header and stats

## 🚧 Future Enhancements

- Feed screen with posts
- Events discovery
- Marketplace
- Real-time location tracking
- Dark mode
- Progressive Web App (PWA)

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - TypeScript type checking

## 🤝 Backend Integration

Make sure the Spring Boot backend is running:
```bash
cd ..
./start.sh
```

The frontend proxies API requests to `http://localhost:8080` automatically.

---

**Built with ❤️ for GullyGram - Connect Locally, Discover Nearby**
