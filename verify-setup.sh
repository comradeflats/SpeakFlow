#!/bin/bash

# IELTS AI Practice - Setup Verification Script
# Run this to verify your environment is ready for deployment

echo "🔍 Verifying IELTS AI Practice Setup..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
CHECKS_PASSED=0
CHECKS_FAILED=0

# Helper function
check_item() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ $2${NC}"
        ((CHECKS_FAILED++))
    else
        echo -e "${GREEN}✅ $2${NC}"
        ((CHECKS_PASSED++))
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ Found: $1${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌ Missing: $1${NC}"
        ((CHECKS_FAILED++))
    fi
}

# Start checks
echo "📦 Checking Project Files..."
check_file "package.json"
check_file "tsconfig.json"
check_file "next.config.js"
check_file "tailwind.config.js"
check_file "LICENSE"
check_file "README.md"
check_file ".env.example"
check_file "app/page.tsx"
check_file "app/practice/page.tsx"
check_file "components/ConversationInterface.tsx"
check_file "lib/gemini.ts"
check_file "lib/ielts-scoring.ts"

echo ""
echo "📚 Checking Documentation..."
check_file "README.md"
check_file "SETUP_GUIDE.md"
check_file "QUICK_START.md"
check_file "PROJECT_SUMMARY.md"

echo ""
echo "📦 Checking Dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ node_modules missing${NC}"
    echo -e "${YELLOW}   Run: npm install${NC}"
    ((CHECKS_FAILED++))
fi

echo ""
echo "🔐 Checking Environment Variables..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    ((CHECKS_PASSED++))

    if grep -q "NEXT_PUBLIC_ELEVENLABS_API_KEY" .env.local; then
        echo -e "${GREEN}✅ ElevenLabs API key configured${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠️  ElevenLabs API key missing${NC}"
        echo -e "   Run: nano .env.local and add your key"
        ((CHECKS_FAILED++))
    fi

    if grep -q "NEXT_PUBLIC_ELEVENLABS_AGENT_ID" .env.local; then
        echo -e "${GREEN}✅ ElevenLabs Agent ID configured${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠️  ElevenLabs Agent ID missing${NC}"
        echo -e "   Run: nano .env.local and add your agent ID"
        ((CHECKS_FAILED++))
    fi

    if grep -q "NEXT_PUBLIC_GEMINI_API_KEY" .env.local; then
        echo -e "${GREEN}✅ Gemini API key configured${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠️  Gemini API key missing${NC}"
        echo -e "   Run: nano .env.local and add your key"
        ((CHECKS_FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo -e "   Run: cp .env.example .env.local"
    ((CHECKS_FAILED++))
fi

echo ""
echo "🔨 Checking Build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build succeeds${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ Build fails${NC}"
    echo -e "   Run: npm run build (to see errors)"
    ((CHECKS_FAILED++))
fi

echo ""
echo "════════════════════════════════════════"
echo -e "${GREEN}✅ Passed: $CHECKS_PASSED${NC}"
if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed: $CHECKS_FAILED${NC}"
else
    echo -e "${GREEN}❌ Failed: $CHECKS_FAILED${NC}"
fi
echo "════════════════════════════════════════"

echo ""
if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Setup looks good! Ready to deploy.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Initialize git: git init"
    echo "2. Commit: git add . && git commit -m 'Initial commit'"
    echo "3. Push to GitHub"
    echo "4. Deploy to Vercel"
    echo "5. Record demo video"
    echo "6. Submit to Devpost"
    exit 0
else
    echo -e "${YELLOW}⚠️  Please fix the issues above before deploying${NC}"
    exit 1
fi
