#!/bin/bash

# Quick Start Script for Week 2 Full Stack
# Starts both backend and frontend servers

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  GullyGram Week 2 - Full Stack Startup${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker not running. Starting PostgreSQL...${NC}"
    echo "Please start Docker first!"
    exit 1
fi

# Start PostgreSQL
echo -e "${BLUE}Starting PostgreSQL...${NC}"
docker-compose up -d
sleep 3
echo -e "${GREEN}✅ PostgreSQL running${NC}\n"

# Install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
    echo -e "${GREEN}✅ Dependencies installed${NC}\n"
fi

echo -e "${YELLOW}Starting servers...${NC}\n"

# Start backend in background
echo -e "${BLUE}Starting Backend (port 8080)...${NC}"
./mvnw spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Start frontend in background
echo -e "${BLUE}Starting Frontend (port 3000)...${NC}"
cd frontend && npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo -e "${GREEN}✅ Servers starting...${NC}\n"

# Wait for startup
echo -e "${YELLOW}Waiting for servers to initialize (30 seconds)...${NC}"
sleep 30

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎉 GullyGram is Ready!${NC}"
echo -e "${BLUE}================================================${NC}\n"

echo -e "${BLUE}🔗 Access Points:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:8080${NC}"
echo -e "  Database: ${GREEN}localhost:5432${NC}"
echo ""

echo -e "${BLUE}📊 Process IDs:${NC}"
echo -e "  Backend:  ${YELLOW}$BACKEND_PID${NC}"
echo -e "  Frontend: ${YELLOW}$FRONTEND_PID${NC}"
echo ""

echo -e "${BLUE}📝 Logs:${NC}"
echo -e "  Backend:  ${YELLOW}tail -f backend.log${NC}"
echo -e "  Frontend: ${YELLOW}tail -f frontend.log${NC}"
echo ""

echo -e "${BLUE}🛑 To Stop:${NC}"
echo -e "  ${YELLOW}kill $BACKEND_PID $FRONTEND_PID${NC}"
echo -e "  ${YELLOW}docker-compose down${NC}"
echo ""

echo -e "${GREEN}🚀 Open http://localhost:3000 and start testing!${NC}"
