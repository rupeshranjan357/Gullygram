#!/bin/bash

# Frontend Merge Script - Merge Week 1 frontend from dev into week2goal
# Usage: ./merge_frontend.sh

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Frontend Merge: dev → week2goal${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Check if we're in the right directory
if [ ! -f "pom.xml" ]; then
    echo -e "${RED}❌ Error: Not in GullyGram root directory${NC}"
    exit 1
fi

# Step 1: Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}Current branch: $CURRENT_BRANCH${NC}"

if [ "$CURRENT_BRANCH" != "week2goal" ]; then
    echo -e "${YELLOW}Switching to week2goal branch...${NC}"
    git checkout week2goal
fi

# Step 2: Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}You have uncommitted changes.${NC}"
    echo -e "${YELLOW}Committing them before merge...${NC}"
    git add -A
    git commit -m "chore: checkpoint before merging frontend from dev"
    echo -e "${GREEN}✅ Changes committed${NC}\n"
else
    echo -e "${GREEN}✅ Working directory clean${NC}\n"
fi

# Step 3: Show what will be merged
echo -e "${BLUE}Frontend commits in dev but not in week2goal:${NC}"
git log --oneline week2goal..dev -- frontend/ | head -5
echo ""

# Step 4: Ask for confirmation
echo -e "${YELLOW}This will merge frontend from dev branch into week2goal.${NC}"
echo -e "${YELLOW}Continue? (y/n)${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Merge cancelled.${NC}"
    exit 0
fi

# Step 5: Perform merge
echo -e "\n${BLUE}Merging dev into week2goal...${NC}"
if git merge dev -m "merge: Bring Week 1 frontend from dev into week2goal"; then
    echo -e "${GREEN}✅ Merge successful!${NC}\n"
else
    echo -e "${RED}❌ Merge conflicts detected!${NC}"
    echo -e "${YELLOW}Please resolve conflicts manually:${NC}"
    echo -e "  1. Edit conflicted files"
    echo -e "  2. Run: ${BLUE}git add <resolved-files>${NC}"
    echo -e "  3. Run: ${BLUE}git merge --continue${NC}"
    echo -e "\n${YELLOW}Or abort merge: ${BLUE}git merge --abort${NC}"
    exit 1
fi

# Step 6: Install frontend dependencies
if [ -d "frontend" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd frontend
    if npm install; then
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}\n"
    else
        echo -e "${YELLOW}⚠️  npm install had issues (might be okay)${NC}\n"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠️  No frontend directory found${NC}\n"
fi

# Step 7: Verify backend compiles
echo -e "${BLUE}Verifying backend compiles...${NC}"
if ./mvnw clean compile -q; then
    echo -e "${GREEN}✅ Backend compiles successfully${NC}\n"
else
    echo -e "${RED}❌ Backend compilation failed${NC}"
    echo -e "${YELLOW}You may need to resolve issues manually${NC}\n"
fi

# Step 8: Show final status
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ Frontend merge complete!${NC}"
echo -e "${BLUE}================================================${NC}\n"

echo -e "${BLUE}What you now have in week2goal:${NC}"
echo -e "  ✅ Week 2 Backend (posts, feed, likes, comments)"
echo -e "  ✅ Week 1 Frontend (signup, profile, interests)"
echo -e ""

echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Start backend: ${GREEN}./mvnw spring-boot:run${NC}"
echo -e "  2. Start frontend: ${GREEN}cd frontend && npm run dev${NC}"
echo -e "  3. Test Week 1 frontend at: ${GREEN}http://localhost:3000${NC}"
echo -e "  4. Start building Week 2 frontend features!"
echo -e ""

echo -e "${YELLOW}Git status:${NC}"
git status --short | head -10
echo ""

echo -e "${GREEN}🎉 Ready to build Week 2 frontend!${NC}"
