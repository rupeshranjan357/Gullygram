#!/bin/bash

# Simple Setup: Merge week2goal into dev, then create week2-frontend branch
# Usage: ./setup_week2_frontend.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Week 2 Frontend Setup (Simple Approach)${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Check we're in right directory
if [ ! -f "pom.xml" ]; then
    echo -e "${RED}❌ Error: Not in GullyGram root${NC}"
    exit 1
fi

echo -e "${YELLOW}Plan:${NC}"
echo "1. Merge week2goal → dev (adds Week 2 backend)"
echo "2. Create new branch: week2-frontend"
echo "3. You start building Week 2 frontend there!"
echo ""

# Step 1: Commit any current work
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}Current branch: $CURRENT_BRANCH${NC}"

if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Committing current work...${NC}"
    git add -A
    git commit -m "checkpoint: before merging to dev"
    echo -e "${GREEN}✅ Committed${NC}\n"
fi

# Step 2: Switch to dev
echo -e "${BLUE}Switching to dev branch...${NC}"
git checkout dev
echo -e "${GREEN}✅ On dev branch${NC}\n"

# Step 3: Merge week2goal into dev
echo -e "${BLUE}Merging week2goal (Week 2 backend) into dev...${NC}"
if git merge week2goal -m "merge: Add Week 2 backend (posts, feed, likes, comments) into dev"; then
    echo -e "${GREEN}✅ Week 2 backend merged into dev!${NC}\n"
else
    echo -e "${YELLOW}⚠️  Merge conflicts detected!${NC}"
    echo -e "Please resolve conflicts, then run:"
    echo -e "  ${BLUE}git add .${NC}"
    echo -e "  ${BLUE}git merge --continue${NC}"
    echo -e "  ${BLUE}git checkout -b week2-frontend${NC}"
    exit 1
fi

# Step 4: Create week2-frontend branch
echo -e "${BLUE}Creating week2-frontend branch...${NC}"
git checkout -b week2-frontend
echo -e "${GREEN}✅ Created and switched to week2-frontend${NC}\n"

# Step 5: Install frontend dependencies
if [ -d "frontend" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}\n"
    cd ..
fi

# Step 6: Verify
echo -e "${BLUE}Verifying setup...${NC}"
echo -e "  Backend: ${GREEN}Week 1 + Week 2 ✅${NC}"
echo -e "  Frontend: ${GREEN}Week 1 ✅${NC}"
echo -e "  Branch: ${GREEN}week2-frontend ✅${NC}\n"

# Done!
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${BLUE}================================================${NC}\n"

echo -e "${YELLOW}You are now on: ${GREEN}week2-frontend${YELLOW} branch${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Start backend:  ${GREEN}./mvnw spring-boot:run${NC}"
echo -e "  2. Start frontend: ${GREEN}cd frontend && npm run dev${NC}"
echo -e "  3. Start coding Week 2 frontend!"
echo ""
echo -e "${BLUE}Files to create:${NC}"
echo -e "  - frontend/src/pages/Feed.tsx"
echo -e "  - frontend/src/pages/CreatePost.tsx"
echo -e "  - frontend/src/services/feedService.ts"
echo -e "  - frontend/src/services/postService.ts"
echo -e "  - frontend/src/components/PostCard.tsx"
echo ""
echo -e "${GREEN}🚀 Happy coding!${NC}"
