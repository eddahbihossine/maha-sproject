#!/bin/bash

echo "🧪 Testing Student Accommodation Platform Setup"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Found $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check pnpm
echo -n "Checking pnpm... "
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓${NC} Found v$PNPM_VERSION"
else
    echo -e "${RED}✗${NC} pnpm not found. Install with: npm install -g pnpm"
    exit 1
fi

# Check Python
echo -n "Checking Python... "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Found $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python 3 not found. Please install Python 3.9+"
    exit 1
fi

# Check .env.local
echo -n "Checking .env.local... "
if [ -f ".env.local" ]; then
    if grep -q "your_supabase_project_url" .env.local; then
        echo -e "${YELLOW}⚠${NC}  Found but needs configuration"
    else
        echo -e "${GREEN}✓${NC} Configured"
    fi
else
    echo -e "${RED}✗${NC} Not found. Run: cp .env.example .env.local"
fi

# Check backend/.env
echo -n "Checking backend/.env... "
if [ -f "backend/.env" ]; then
    if grep -q "your_supabase_project_url" backend/.env; then
        echo -e "${YELLOW}⚠${NC}  Found but needs configuration"
    else
        echo -e "${GREEN}✓${NC} Configured"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Not found (optional for Supabase-only mode)"
fi

# Check node_modules
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC}  Not installed. Run: pnpm install"
fi

# Check backend venv
echo -n "Checking backend venv... "
if [ -d "backend/venv" ]; then
    echo -e "${GREEN}✓${NC} Created"
else
    echo -e "${YELLOW}⚠${NC}  Not found (optional)"
fi

# Check database
echo -n "Checking database... "
if [ -f "backend/db.sqlite3" ]; then
    echo -e "${GREEN}✓${NC} Migrations applied"
else
    echo -e "${YELLOW}⚠${NC}  No database. Run: python manage.py migrate"
fi

echo ""
echo "=============================================="
echo ""

# Summary
if [ -f ".env.local" ] && [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Core setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure Supabase credentials in .env.local"
    echo "2. Run: pnpm dev"
    echo "3. Visit: http://localhost:3000"
else
    echo -e "${YELLOW}⚠ Setup incomplete${NC}"
    echo ""
    echo "Run these commands:"
    echo "1. cp .env.example .env.local"
    echo "2. pnpm install"
    echo "3. Edit .env.local with your Supabase credentials"
fi

echo ""
echo "📖 Full guide: See SETUP_GUIDE.md"
