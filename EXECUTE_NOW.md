# 🚀 EXECUTE NOW - Your Winning Hackathon Submission

Your app is built and ready to launch. Follow these steps to get live and submitted within **3 hours**.

---

## STEP 1: Get Your API Keys (30 min)

### ElevenLabs (15 min)
```bash
# 1. Go to: https://elevenlabs.io
# 2. Sign up with email
# 3. Verify email
# 4. Navigate to "Agents" → "Create Agent"
# 5. Fill in:
#    - Name: IELTS Speaking Examiner
#    - Choose a voice (e.g., Antoni or Anya)
# 6. Click "Create"
# 7. Copy your Agent ID (appears in URL or dashboard)
# 8. Go to Account Settings → API Keys
# 9. Copy your API Key

# Store these values:
# ELEVENLABS_API_KEY = sk_xxxxxxx...
# ELEVENLABS_AGENT_ID = agent_xxxxxxx...
```

### Google Gemini (15 min)
```bash
# 1. Go to: https://ai.google.dev
# 2. Click "Get API Key"
# 3. Create new project or select existing
# 4. Copy your API Key
# 5. Go to console.cloud.google.com
# 6. Enable "Generative AI API" if not already enabled

# Store this value:
# GEMINI_API_KEY = AIzaSyxxxxxxx...
```

---

## STEP 2: Configure Local Environment (5 min)

```bash
# Edit your .env.local file
nano .env.local

# Add these three lines exactly:
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_xxxxxxx
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxxxxxx
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyxxxxxxx

# Save: Ctrl+O, Enter, Ctrl+X
```

---

## STEP 3: Test Locally (10 min)

```bash
# Run the app
npm run dev

# Visit: http://localhost:3000
# Click "Start Free Practice"
# Select Part 1
# Speak something and test the flow
# If it works → continue to Step 4
# If it fails → check API keys in .env.local
```

---

## STEP 4: Deploy to Vercel (20 min)

### Option A: GitHub + Vercel (RECOMMENDED)

```bash
# 1. Initialize git
git init
git config user.email "your@email.com"
git config user.name "Your Name"

# 2. Add all files
git add .
git commit -m "IELTS AI Practice - Ready for hackathon submission

- ElevenLabs Conversational AI integration
- Google Gemini 2.5 Flash analysis
- Real-time IELTS speaking practice
- Expert-level feedback system"

# 3. Create GitHub repo:
# - Go to: https://github.com/new
# - Name it: ielts-practice-ai
# - Make it PUBLIC ⚠️ IMPORTANT
# - Don't initialize with README
# - Click "Create"

# 4. Push to GitHub
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ielts-practice-ai.git
git push -u origin main

# 5. Deploy to Vercel:
# - Go to: https://vercel.com
# - Click "New Project"
# - Import your GitHub repo
# - Select the ielts-practice-ai repo
# - Add Environment Variables:
#   NEXT_PUBLIC_ELEVENLABS_API_KEY = your_key
#   NEXT_PUBLIC_ELEVENLABS_AGENT_ID = your_agent_id
#   NEXT_PUBLIC_GEMINI_API_KEY = your_gemini_key
# - Click "Deploy"

# Your app is now live! 🎉
# Vercel will give you a URL like:
# https://ielts-practice-ai.vercel.app
```

### Option B: Vercel CLI (FASTER)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# When prompted, add environment variables:
# NEXT_PUBLIC_ELEVENLABS_API_KEY
# NEXT_PUBLIC_ELEVENLABS_AGENT_ID
# NEXT_PUBLIC_GEMINI_API_KEY

# Your live URL will be displayed
```

---

## STEP 5: Record Demo Video (30 min)

### Quick Script
```
[0-30s] "Welcome to IELTS AI Practice. Help students prepare for their exams using AI."
[30-90s] [Screen record: select Part 1, speak, see conversation]
[90-120s] [Show feedback: band score, strengths, improvements]
[120-180s] "Built with ElevenLabs and Google Gemini. Try it at [YOUR_URL]"
```

### Record
```bash
# macOS: QuickTime
# - Press Cmd+Shift+5
# - Select screen
# - Record 3 minutes
# - Stop recording

# Windows: Built-in Recorder
# - Press Win+Shift+S
# - Use Windows+Shift+R for video
# - Record your screen

# Any OS: OBS Studio
# - Download: obsproject.com
# - Add display source
# - Record 3 minutes
```

### Upload
```bash
# Go to: https://youtube.com
# Click "Create" → "Upload video"
# Upload your video
# Title: "IELTS AI Practice - AI Partner Catalyst Hackathon"
# Description: "Try it at [YOUR_URL]. Code: [YOUR_GITHUB_URL]"
# Visibility: PUBLIC ⚠️ IMPORTANT
# Upload complete → Copy your video URL
```

---

## STEP 6: Submit to Devpost (20 min)

### Register
```bash
# Go to: https://devpost.com
# Sign up for account
# Join "AI Partner Catalyst" hackathon
```

### Create Submission
```
Project Name: IELTS AI Practice

Tagline: AI-powered IELTS speaking practice with expert feedback

Description: [Use text below]

Challenge: ElevenLabs Challenge ⚠️ SELECT THIS

Hosted URL: https://your-app.vercel.app

GitHub URL: https://github.com/YOUR_USERNAME/ielts-practice-ai

Demo Video: https://youtube.com/watch?v=YOUR_VIDEO_ID

Team: [Your name]
```

### Description Template
```
IELTS AI Practice: Expert Speaking Preparation with AI

PROBLEM: 3 million students take IELTS yearly but:
- Prep costs $200+
- Limited access to expert feedback
- No 24/7 practice availability

SOLUTION: AI-powered platform using ElevenLabs voice AI and Google Gemini 2.5
to provide real-time conversational practice with expert-level feedback.

KEY FEATURES:
✅ Real-time voice conversations with AI examiner
✅ Expert analysis on fluency, vocabulary, grammar, pronunciation
✅ Official IELTS-aligned band scoring
✅ Specific, actionable feedback
✅ Progress tracking

TECHNOLOGY:
- ElevenLabs Conversational AI Agents
- Google Gemini 2.5 Flash
- Next.js 14
- Vercel deployment

IMPACT: Democratizes test prep for millions of learners globally
```

### Submit
- [ ] Verify all links work
- [ ] Confirm video is public
- [ ] Check GitHub is public
- [ ] Click "SUBMIT PROJECT"

---

## ✅ Final Verification Checklist

Before submitting, verify:

```
PROJECT LIVE
- [ ] https://your-app.vercel.app loads
- [ ] Can start a practice session
- [ ] Can get feedback
- [ ] No console errors

GITHUB
- [ ] Repository is PUBLIC
- [ ] Has LICENSE file (MIT)
- [ ] Has README.md
- [ ] All code is present

DEVPOST
- [ ] All three URLs work
- [ ] Video is PUBLIC
- [ ] Description is clear
- [ ] Challenge selected correctly
```

---

## 🎯 Timeline

- **Hour 1**: Get API keys, configure .env
- **Hour 2**: Deploy to Vercel, test live
- **Hour 3**: Record video, submit Devpost

**Total: 3 hours from now you could be submitted!**

---

## 🆘 Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| Microphone not working | Allow browser permission, use HTTPS |
| API key error | Check .env.local format, copy exactly |
| Deploy fails | Run `npm run build` locally to see errors |
| Conversation doesn't start | Check Agent ID is correct |
| Gemini analysis fails | Verify API key works via console |

---

## 🚀 You're Ready!

Your app is complete and production-ready.

**All you need now:**
1. ✅ ElevenLabs API key & Agent ID (get in 15 min)
2. ✅ Gemini API key (get in 15 min)
3. ✅ Deploy to Vercel (20 min)
4. ✅ Record demo (30 min)
5. ✅ Submit (20 min)

**Total time: 2-3 hours**

**Let's make this award-winning! 🏆**

---

**Questions?** Read these in order:
1. QUICK_START.md (if this is too detailed)
2. SETUP_GUIDE.md (complete guide)
3. README.md (understanding the project)

**Let's go! 🚀**
