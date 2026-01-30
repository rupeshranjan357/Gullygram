# Frontend Merge Strategy - Week 2

## Current Situation

✅ **week2goal** - Has Week 2 backend (posts, feed, likes, comments)  
✅ **dev** - Has Week 1 frontend (working signup, profile, interests)  
🎯 **Goal** - Merge frontend from dev into week2goal to start Week 2 frontend

## Git Branch Structure

```
main
  └── week_1goal (Week 1 backend + frontend fixes)
       └── dev (Week 1 complete, frontend merged)
  └── week2goal (Week 2 backend only)
```

## Strategy: Merge Frontend from Dev

### Option 1: Merge Dev into Week2goal (RECOMMENDED)

This brings all frontend changes from dev into week2goal:

```bash
# Make sure you're on week2goal
cd /Users/rupeshsingh/Gullygram
git checkout week2goal

# Commit any uncommitted changes first
git status
git add -A
git commit -m "chore: checkpoint before merging frontend from dev"

# Merge dev branch (brings frontend)
git merge dev -m "merge: Bring Week 1 frontend from dev into week2goal"

# If there are conflicts, resolve them:
# - Keep week2goal backend code
# - Keep dev frontend code
# - Run: git merge --continue
```

### Option 2: Cherry-pick Frontend Commits (Precise Control)

Pick only the frontend-related commits from dev:

```bash
# On week2goal branch
git checkout week2goal

# Cherry-pick the frontend commits (found earlier)
git cherry-pick f164a99  # week-1 goal -1 frontend added
git cherry-pick baaf336  # fix: Frontend API integration

# Resolve any conflicts if they arise
```

### Option 3: Copy Frontend Folder (Manual, Less Recommended)

If git merge has too many conflicts:

```bash
# Save current week2goal backend work
git checkout week2goal
git add -A
git commit -m "checkpoint: Week 2 backend before frontend merge"

# Get frontend from dev
git checkout dev -- frontend/

# Commit the frontend
git add frontend/
git commit -m "merge: Add Week 1 frontend from dev branch"
```

## Recommended Steps (Option 1)

### Step 1: Prepare Week2goal Branch
```bash
cd /Users/rupeshsingh/Gullygram
git checkout week2goal
git status

# If you have uncommitted changes:
git add src/main/java/com/gullygram/backend/service/AuthService.java
git commit -m "fix: UserProfile creation matching week_1goal pattern"
```

### Step 2: Fetch Latest Dev
```bash
git fetch origin dev
```

### Step 3: Merge Dev into Week2goal
```bash
git merge dev -m "merge: Bring Week 1 frontend from dev branch"
```

### Step 4: Resolve Conflicts (if any)

**Common conflicts:**
- `pom.xml` - Keep week2goal version (has Week 2 dependencies)
- `application.yml` - Keep week2goal version
- Backend Java files - Keep week2goal version
- **Frontend files** - Keep dev version (newer)

To resolve:
```bash
# For each conflict file:
git checkout --theirs <file>  # Use dev version (for frontend)
git checkout --ours <file>    # Use week2goal version (for backend)

# After resolving all:
git add .
git merge --continue
```

### Step 5: Verify Everything Works

**Backend:**
```bash
./mvnw spring-boot:run
# Test: http://localhost:8080/api/interests
```

**Frontend:**
```bash
cd frontend
npm install  # Install any new dependencies
npm run dev
# Visit: http://localhost:3000
```

### Step 6: Test Week 1 Frontend Features

1. Signup flow works
2. Interest selection works
3. Profile page loads
4. Location update works

## What You'll Have After Merge

```
week2goal/
├── src/main/java/          # ✅ Week 2 Backend
│   ├── controller/
│   │   ├── PostController.java      (NEW Week 2)
│   │   ├── FeedController.java      (NEW Week 2)
│   │   ├── AuthController.java      (Week 1)
│   │   └── ProfileController.java   (Week 1)
│   ├── service/
│   │   ├── PostService.java         (NEW Week 2)
│   │   ├── FeedService.java         (NEW Week 2)
│   │   └── AuthService.java         (Week 1, fixed)
│   └── entity/
│       ├── Post.java                (NEW Week 2)
│       ├── Comment.java             (NEW Week 2)
│       └── User.java                (Week 1)
└── frontend/                # ✅ Week 1 Frontend from dev
    ├── src/
    │   ├── pages/
    │   │   ├── Signup.tsx
    │   │   ├── Login.tsx
    │   │   ├── Profile.tsx
    │   │   └── InterestSelection.tsx
    │   ├── services/
    │   │   ├── authService.ts
    │   │   ├── profileService.ts
    │   │   └── interestService.ts    (Fixed API integration)
    │   └── store/
    │       └── authStore.ts          (Fixed types)
    └── package.json
```

## Next Steps: Week 2 Frontend Development

Once frontend is merged, you can start building Week 2 features:

### New Frontend Components Needed:

1. **Feed Page** (`src/pages/Feed.tsx`)
   - Display posts from backend feed API
   - Geo-filtered based on user location
   - Infinite scroll or pagination

2. **Post Creation** (`src/pages/CreatePost.tsx`)
   - Text input
   - Location picker
   - Interest tagging
   - Post type selection

3. **Post Card** (`src/components/PostCard.tsx`)
   - Show post content
   - Like button (with count)
   - Comment button (with count)
   - Author info (alias, avatar)
   - Distance from user

4. **Comments Section** (`src/components/Comments.tsx`)
   - List comments
   - Add comment input
   - Show author info

5. **New Services** (`src/services/`)
   - `postService.ts` - Create posts, get post
   - `feedService.ts` - Get feed with filters
   - `likeService.ts` - Like/unlike posts
   - `commentService.ts` - Add/get comments

## Conflict Resolution Example

If you see conflicts like this:

```
<<<<<<< HEAD (week2goal)
// Week 2 backend code
=======
// Dev frontend code
>>>>>>> dev
```

**Decision Tree:**
- Backend files (Java) → Keep HEAD (week2goal)
- Frontend files (TypeScript/React) → Keep dev
- Config files → Merge manually or keep week2goal

## Verification Checklist

After merge:
- [ ] Backend compiles: `./mvnw clean compile`
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] No git conflicts remaining: `git status`
- [ ] Week 1 frontend works (signup, profile)
- [ ] Week 2 backend works (posts, feed API)
- [ ] Ready to start Week 2 frontend development

## Quick Command Summary

```bash
# Execute these in order:
cd /Users/rupeshsingh/Gullygram
git checkout week2goal
git add -A
git commit -m "checkpoint before frontend merge"
git merge dev -m "merge: Add Week 1 frontend from dev"
# Resolve conflicts if needed
git status
./mvnw clean compile
cd frontend && npm install && npm run build
cd ..
git status
```

## If Merge Goes Wrong

Don't panic! You can always abort:

```bash
# Abort the merge
git merge --abort

# Go back to before merge
git reset --hard HEAD

# Try Option 2 (cherry-pick) or Option 3 (manual copy) instead
```

---

**Ready to merge?** Follow Option 1 steps above! 🚀
