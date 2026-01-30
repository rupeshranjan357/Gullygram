# Week 2 Frontend Development - Getting Started

## 📋 Summary

You have:
- ✅ **Week 2 Backend** complete in `week2goal` branch (posts, feed, likes, comments)
- ✅ **Week 1 Frontend** ready in `dev` branch (signup, profile, interests with API fixes)
- 🎯 **Goal**: Merge frontend into week2goal and start Week 2 frontend development

## 🚀 Quick Start (3 Commands)

```bash
cd /Users/rupeshsingh/Gullygram
./merge_frontend.sh  # Auto-merge frontend from dev
# Follow prompts, resolve conflicts if any
```

OR manually:

```bash
cd /Users/rupeshsingh/Gullygram
git checkout week2goal
git merge dev -m "merge: Add Week 1 frontend from dev"
```

## 📊 What's in Each Branch

### `week_1goal` 
- ✅ Week 1 Backend (Auth, Profile, Interests, Location)
- ✅ Week 1 Frontend (initial version)

### `dev`
- ✅ Week 1 Backend merged
- ✅ Week 1 Frontend with API fixes (working signup, profile, interests)

### `week2goal` (current)
- ✅ Week 2 Backend (Posts, Feed, Likes, Comments)
- ❌ No frontend yet (needs merge from dev)

## 🎯 After Merge You'll Have

```
week2goal/
├── Backend (Java/Spring Boot)
│   ├── Week 1: Auth, Profile, Interests ✅
│   └── Week 2: Posts, Feed, Likes, Comments ✅
└── Frontend (React/TypeScript)
    ├── Week 1: Signup, Login, Profile, Interests ✅
    └── Week 2: (To be built) ⏳
        ├── Feed page
        ├── Create post
        ├── Like/Unlike
        └── Comments
```

## 📝 Week 2 Frontend Features to Build

### 1. Feed Page (`/feed`)
**Components:**
- `src/pages/Feed.tsx` - Main feed page
- `src/components/PostCard.tsx` - Individual post display
- `src/components/FeedFilters.tsx` - Radius, interest boost toggle

**Services:**
```typescript
// src/services/feedService.ts
async getFeed(lat, lon, radiusKm, interestBoost?, page?, size?)
```

**Features:**
- Display posts from feed API
- Show distance from user
- Like button (with count)
- Comment count
- Filter by radius (10km/20km)
- Interest boost toggle
- Pagination or infinite scroll

### 2. Create Post Page (`/create-post`)
**Components:**
- `src/pages/CreatePost.tsx` - Post creation form

**Services:**
```typescript
// src/services/postService.ts
async createPost(data: CreatePostRequest)
```

**Features:**
- Text input (with character limit)
- Post type selector (GENERAL, EVENT_PROMO, MARKETPLACE, etc.)
- Interest tags (multi-select from user's interests)
- Location (use current or pick on map)
- Visibility radius selector (10-50km)
- Image upload (optional for Week 3)

### 3. Post Detail Page (`/post/:id`)
**Components:**
- `src/pages/PostDetail.tsx` - Full post view
- `src/components/CommentsList.tsx` - Comments section
- `src/components/AddComment.tsx` - Comment input

**Services:**
```typescript
// src/services/postService.ts
async getPost(id: string)

// src/services/commentService.ts
async getComments(postId: string, page?, size?)
async addComment(postId: string, text: string)
```

**Features:**
- Full post content
- Author info (alias, avatar, distance)
- Like button (toggle)
- Comments list
- Add comment input
- Back navigation

### 4. Like Feature
**Services:**
```typescript
// src/services/likeService.ts
async toggleLike(postId: string)
```

**Integration:**
- Add to PostCard component
- Update like count in real-time
- Show if current user liked
- Optimistic UI updates

## 🏗️ Recommended Implementation Order

### Phase 1: Feed Display (Days 1-2)
1. Create `feedService.ts` with API integration
2. Build `Feed.tsx` page with basic layout
3. Create `PostCard.tsx` component
4. Display posts from API
5. Add pagination

### Phase 2: Post Creation (Days 3-4)
6. Create `postService.ts`
7. Build `CreatePost.tsx` form
8. Add interest tagging
9. Implement post submission
10. Redirect to feed after creation

### Phase 3: Interactions (Days 5-6)
11. Create `likeService.ts`
12. Add like button to PostCard
13. Create `commentService.ts`
14. Build comments UI
15. Add comment submission

### Phase 4: Polish (Days 7)
16. Add loading states
17. Error handling
18. Empty states
19. Pull-to-refresh
20. Animations

## 📦 New Dependencies Needed

```bash
cd frontend
npm install react-infinite-scroll-component  # For infinite scroll
npm install react-toastify                   # For notifications
npm install date-fns                         # For date formatting
```

## 🔗 API Endpoints to Use

All endpoints from `WEEK2_TESTING_GUIDE.md`:

**Posts:**
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get single post

**Feed:**
- `GET /api/feed?lat=X&lon=Y&radiusKm=Z&interestBoost=true&page=0&size=10`

**Likes:**
- `POST /api/posts/:id/like` - Toggle like

**Comments:**
- `GET /api/posts/:id/comments?page=0&size=20` - Get comments
- `POST /api/posts/:id/comment` - Add comment

## 📱 New Routes to Add

```typescript
// src/App.tsx or router config
<Route path="/feed" element={<Feed />} />
<Route path="/create-post" element={<CreatePost />} />
<Route path="/post/:id" element={<PostDetail />} />
```

## 🎨 UI/UX Considerations

1. **Location Permission**: Request user location on feed load
2. **Real-time Updates**: Consider polling or WebSocket for new posts
3. **Optimistic Updates**: Update UI before API confirms (likes)
4. **Error States**: Handle network errors gracefully
5. **Loading States**: Skeleton screens for better UX
6. **Distance Display**: Show "500m away", "2.3km away", etc.
7. **Relative Time**: "2 hours ago", "Just now", etc.

## 🧪 Testing After Merge

1. **Test Week 1 Frontend Still Works:**
   ```bash
   cd frontend
   npm run dev
   # Visit http://localhost:3000
   # Try: Signup → Interests → Profile
   ```

2. **Test Week 2 Backend:**
   ```bash
   # Import Postman collection
   # Run through all Week 2 tests
   ```

3. **Start Building Week 2 Frontend:**
   ```bash
   # Create new components
   # Integrate with backend APIs
   # Test end-to-end flow
   ```

## 📚 Reference Files

- `FRONTEND_MERGE_STRATEGY.md` - Detailed merge instructions
- `WEEK2_TESTING_GUIDE.md` - Backend API documentation
- `GullyGram-Week2-Complete.postman_collection.json` - API testing
- `POSTMAN_TESTING_GUIDE.md` - How to use Postman collection

## ⚠️ Important Notes

1. **Don't lose backend work**: Before merging, commit all week2goal backend changes
2. **Frontend uses Week 1 APIs**: Existing frontend won't break
3. **New features are additive**: You're adding feed/posts, not modifying existing pages
4. **Test incrementally**: Test each feature as you build it

## 🎯 Success Criteria

After Week 2 frontend is complete:
- [ ] Users can see feed of nearby posts
- [ ] Users can create new posts
- [ ] Users can like/unlike posts
- [ ] Users can add comments
- [ ] Feed filters by radius correctly
- [ ] Interest boost affects ranking
- [ ] All Week 1 features still work

---

## 🚦 Ready to Start?

1. Run `./merge_frontend.sh` to merge frontend from dev
2. Start backend: `./mvnw spring-boot:run`
3. Start frontend: `cd frontend && npm run dev`
4. Open `src/pages/Feed.tsx` and start coding! 🎉

**Questions?** Check `FRONTEND_MERGE_STRATEGY.md` for detailed git workflow.
