# Quick Start - Get Live in 2 Hours

This is the **fastest path** to get your app live and submitted to the hackathon.

## Phase 1: Get API Keys (20 minutes)

### Step 1: ElevenLabs Agent
1. Go to https://elevenlabs.io → Sign up
2. Create **Conversational AI Agent**:
   - Name: "IELTS Speaking Examiner"
   - Copy the **Agent ID**
3. Get your **API Key** from Account Settings

### Step 2: Google Gemini
1. Go to https://ai.google.dev
2. Click **Get API Key**
3. Copy your **Gemini API Key**

### Step 3: Add Keys to .env.local
```bash
nano .env.local
```

Add:
```env
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

## Phase 2: Test Locally (15 minutes)

```bash
npm run dev
# Visit http://localhost:3000
# Test: Try the practice flow
```

**Quick Test:**
1. Click "Start Free Practice"
2. Select Part 1
3. Allow microphone
4. Say something (test voice input)
5. Click finish
6. Check feedback loads

## Phase 3: Deploy to Vercel (15 minutes)

### Option A: Via GitHub (Recommended)

```bash
# Push to GitHub
git init
git add .
git commit -m "IELTS AI Practice - AI Partner Catalyst Hackathon"
git remote add origin https://github.com/YOUR_USERNAME/ielts-practice-ai.git
git push -u origin main
```

Then:
1. Go to https://vercel.com
2. Click **Import**
3. Select your repo
4. Add environment variables
5. Deploy

### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel --prod
# Add environment variables when prompted
# Get URL from output
```

**Result:** Your app is now live at `https://your-app.vercel.app`

## Phase 4: Record 3-Min Demo (30 minutes)

Quick demo script:

```
[0-30s] Show homepage - "AI-powered IELTS practice"
[30-60s] Select Part 1 - Click start
[60-120s] Screen record yourself practicing (show transcript)
[120-150s] Show feedback results with scores
[150-180s] Summary - "Built with ElevenLabs & Gemini. Try at [URL]"
```

Record using:
- **macOS**: QuickTime (Cmd+Shift+5)
- **Windows**: Built-in recorder (Win+Shift+S)
- **Any OS**: OBS Studio (free)

Upload to YouTube (make it **PUBLIC**)

## Phase 5: Devpost Submission (30 minutes)

1. Go to https://devpost.com
2. Create account & join "AI Partner Catalyst"
3. Create project:
   - Name: `IELTS AI Practice`
   - GitHub: `https://github.com/your-username/ielts-practice-ai`
   - Hosted: `https://your-app.vercel.app`
   - Video: `https://youtube.com/watch?v=...`
   - Challenge: **ElevenLabs Challenge**

## Verify Submission

- [ ] GitHub repo is **PUBLIC**
- [ ] LICENSE file exists
- [ ] Website loads and works
- [ ] Video is public
- [ ] All three links work

## What You've Built

✅ Real-time voice conversation with AI
✅ IELTS expert feedback system
✅ Band score calculation
✅ Beautiful responsive UI
✅ Live on the internet
✅ Submitted to hackathon

## Common Issues Quick Fixes

| Problem | Fix |
|---------|-----|
| Microphone not working | Allow browser permission |
| API key error | Check .env.local format |
| Deploy fails | Run `npm run build` locally |
| Video upload slow | Use smaller file size |

## Support

- **ElevenLabs**: https://elevenlabs.io/docs
- **Gemini**: https://ai.google.dev/docs
- **Vercel**: https://vercel.com/docs

## Next Steps (After Submission)

- [ ] Share on Twitter/LinkedIn
- [ ] Collect user feedback
- [ ] Optimize for better performance
- [ ] Add user authentication
- [ ] Add progress dashboard
- [ ] Expand to mobile app

---

**You've got this! 🚀 Your submission is ready in 2 hours. Now go win the hackathon!**
