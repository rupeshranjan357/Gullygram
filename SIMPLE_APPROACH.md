# Simple Approach - Week 2 Frontend Setup

## 🎯 Your Plan (CLEANER!)

1. Merge `week2goal` (Week 2 backend) → `dev`
2. Create new branch `week2-frontend` from `dev`
3. Start building Week 2 frontend features

This way `dev` has everything, and you work in a clean new branch!

## 🚀 Quick Commands

```bash
cd /Users/rupeshsingh/Gullygram

# Step 1: Switch to dev branch
git checkout dev

# Step 2: Merge week2goal backend into dev
git merge week2goal -m "merge: Add Week 2 backend (posts, feed, likes, comments) into dev"

# Step 3: Create new branch for Week 2 frontend development
git checkout -b week2-frontend

# Step 4: Push new branch (optional, to backup your work)
git push -u origin week2-frontend
```

## ✅ What You'll Have

```
dev (updated)
└── Week 1 Frontend ✅
└── Week 2 Backend ✅

week2-frontend (new branch)
└── Week 1 Frontend ✅ (ready to use)
└── Week 2 Backend ✅ (ready to use)
└── Week 2 Frontend ⏳ (you'll build here!)
```

## 📝 Step-by-Step

### Step 1: Commit any current work
```bash
git checkout week2goal
git status
# If you have changes:
git add -A
git commit -m "checkpoint: Week 2 backend ready"
```

### Step 2: Go to dev and merge week2goal
```bash
git checkout dev
git merge week2goal -m "merge: Add Week 2 backend into dev"
```

If conflicts appear (likely in backend files):
- Keep dev version for frontend files
- Keep week2goal version for backend files
- Then: `git add .` and `git merge --continue`

### Step 3: Create your working branch
```bash
git checkout -b week2-frontend
```

### Step 4: Verify everything works
```bash
# Test backend
./mvnw clean compile
./mvnw spring-boot:run

# Test frontend (in another terminal)
cd frontend
npm install
npm run dev

# Visit http://localhost:3000 - Week 1 should work!
```

### Step 5: Start building Week 2 frontend!
```bash
# You're now on week2-frontend branch
# All Week 1 frontend + Week 2 backend is here
# Start coding!
```

## 🎨 Start Building Week 2 Frontend

### Create Feed Page
```bash
# Create new files
touch frontend/src/pages/Feed.tsx
touch frontend/src/services/feedService.ts
touch frontend/src/services/postService.ts
touch frontend/src/components/PostCard.tsx
```

### Update Routes
```typescript
// frontend/src/App.tsx
<Route path="/feed" element={<Feed />} />
<Route path="/create-post" element={<CreatePost />} />
<Route path="/post/:id" element={<PostDetail />} />
```

## 📊 Branch Strategy Going Forward

```
main
  └── dev (has Week 1 frontend + Week 2 backend after merge)
       └── week2-frontend (your active development branch)
            └── (build Week 2 frontend here)
            └── when done → merge back to dev
```

## 🔄 When Week 2 Frontend is Done

```bash
# From week2-frontend branch
git add -A
git commit -m "feat: Complete Week 2 frontend - feed, posts, likes, comments"

# Merge back to dev
git checkout dev
git merge week2-frontend -m "merge: Add Week 2 frontend to dev"

# Optional: Delete the branch
git branch -d week2-frontend
```

## ⚡ Super Quick Version

```bash
cd /Users/rupeshsingh/Gullygram
git checkout dev
git merge week2goal
git checkout -b week2-frontend
# Start coding Week 2 frontend!
```

## 🎯 Advantages of This Approach

✅ **Cleaner**: dev branch has everything  
✅ **Safer**: Work in separate week2-frontend branch  
✅ **Simpler**: No complex conflict resolution  
✅ **Standard**: This is how most teams work  
✅ **Flexible**: Easy to create PR from week2-frontend → dev later

---

## 🚦 Ready?

Run these 4 commands:

```bash
git checkout dev
git merge week2goal -m "merge: Week 2 backend into dev"
git checkout -b week2-frontend
npm install --prefix frontend
```

Done! Start building Week 2 frontend! 🎉
