# Complete Setup Guide - IELTS AI Practice

This guide walks you through everything needed to get your hackathon submission live and fully functional.

## Table of Contents
1. [API Setup](#api-setup)
2. [Local Development](#local-development)
3. [GitHub Preparation](#github-preparation)
4. [Vercel Deployment](#vercel-deployment)
5. [Testing & QA](#testing--qa)
6. [Demo Video Creation](#demo-video-creation)
7. [Devpost Submission](#devpost-submission)

---

## API Setup

### 1. ElevenLabs Configuration

#### Create ElevenLabs Account
1. Go to https://elevenlabs.io
2. Sign up for a free account
3. Navigate to your dashboard

#### Create Conversational AI Agent
1. In ElevenLabs, go to **Agents**
2. Click **Create Agent**
3. Configure your agent:
   - **Name**: "IELTS Speaking Examiner"
   - **Prompt**: Use this system prompt:
   ```
   You are an expert IELTS speaking examiner with 20+ years of experience. Your role is to conduct IELTS Speaking practice tests that are indistinguishable from real exams.

   Guidelines:
   - Be conversational but professional
   - Ask follow-up questions naturally
   - Don't be robotic or formulaic
   - Respond to what the candidate says, not just reading from a script
   - For Part 1: Ask warm-up questions about familiar topics
   - For Part 2: Give them a cue card and let them talk for 1-2 minutes
   - For Part 3: Ask more abstract follow-up questions

   Remember: Your goal is to help them practice, not to make them feel judged. Be encouraging while maintaining exam standards.
   ```
   - **Voice**: Choose your preferred voice (e.g., "Antoni" for male, "Anya" for female)
   - **Language**: English (en-US or en-GB)

4. Save and note your **Agent ID** (looks like: `abc123def456...`)

#### Get Your API Key
1. Go to **Account Settings** → **API Keys**
2. Create a new API key or use the default
3. Copy your **API Key**

#### Store Credentials
```env
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here
```

### 2. Google Gemini API Configuration

#### Get Gemini API Key
1. Go to https://ai.google.dev
2. Click **Get API Key**
3. Create a new project or select existing
4. Copy your **API Key**
5. Enable the Generative AI API in Google Cloud Console

#### Test Your Key
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts":[{"text": "Hello"}]
    }]
  }'
```

#### Store Credential
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

### 3. Verify API Connectivity

Before deploying, test both APIs locally:

```bash
# In your Next.js app, create a test file
# lib/test-apis.ts

import { analyzeESLSpeech } from '@/lib/gemini';
import { useConversation } from '@elevenlabs/react';

export async function testAPIs() {
  try {
    // Test Gemini
    const analysis = await analyzeESLSpeech(
      "This is a test response for the IELTS speaking exam.",
      "1"
    );
    console.log("✅ Gemini API working:", analysis);

    // Test ElevenLabs
    console.log("✅ ElevenLabs Agent ID:", process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID);

    return true;
  } catch (error) {
    console.error("❌ API Error:", error);
    return false;
  }
}
```

---

## Local Development

### 1. Clone & Install

```bash
cd ielts-practice-ai
npm install
```

### 2. Configure Environment

```bash
# Copy example file
cp .env.example .env.local

# Edit with your actual keys
nano .env.local
```

Add:
```env
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_xxx...
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxx...
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Test the Application

- [ ] Homepage loads correctly
- [ ] Click "Start Free Practice"
- [ ] Select Part 1, 2, or 3
- [ ] Voice input works (allow microphone access)
- [ ] Conversation flows naturally
- [ ] Feedback displays after completion
- [ ] No console errors

---

## GitHub Preparation

### 1. Initialize Git Repository

```bash
git init
git config user.email "your.email@example.com"
git config user.name "Your Name"
```

### 2. Create .gitignore

```bash
# Add to .gitignore if not already present
node_modules/
.env.local
.env
.next/
out/
dist/
*.log
.DS_Store
```

### 3. Create GitHub Repository

1. Go to https://github.com/new
2. Create repository named: `ielts-practice-ai`
3. Add description: "AI-powered IELTS speaking practice using ElevenLabs and Google Gemini"
4. **Make it PUBLIC** (required for hackathon)
5. Don't initialize with README (we have one)

### 4. Push to GitHub

```bash
git add .
git commit -m "Initial commit: IELTS AI Practice application

- ElevenLabs Conversational AI integration
- Google Gemini 2.5 Flash analysis
- IELTS band scoring engine
- Real-time feedback system
- Beautiful Next.js UI
"

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ielts-practice-ai.git
git push -u origin main
```

### 5. Verify MIT License

On GitHub:
1. Go to your repository
2. Check that **LICENSE** file appears in the About section
3. License should show as "MIT"

---

## Vercel Deployment

### 1. Connect to Vercel

Option A: **Via GitHub** (Recommended)
1. Go to https://vercel.com
2. Click **New Project**
3. Import your GitHub repository
4. Select `ielts-practice-ai`

Option B: **Via CLI**
```bash
npm install -g vercel
vercel
```

### 2. Configure Environment Variables

In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add three variables:
   - `NEXT_PUBLIC_ELEVENLABS_API_KEY` = your key
   - `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` = your agent ID
   - `NEXT_PUBLIC_GEMINI_API_KEY` = your key

### 3. Deploy

GitHub method:
```bash
git push origin main
# Vercel auto-deploys
```

CLI method:
```bash
vercel --prod
```

### 4. Configure Custom Domain (Optional)

In Vercel:
1. Go to **Settings** → **Domains**
2. Add custom domain (e.g., `ielts-practice-ai.com`)
3. Follow DNS setup instructions

For hackathon, `your-project.vercel.app` is fine.

### 5. Test Deployment

After deployment:
1. Visit your Vercel URL
2. Test all features work
3. Check browser console for errors
4. Test voice input and API calls
5. Verify feedback generation works

---

## Testing & QA

### Checklist Before Submission

- [ ] **Landing Page**
  - [ ] All features clearly described
  - [ ] CTA buttons work
  - [ ] Responsive on mobile
  - [ ] No broken links

- [ ] **Practice Interface**
  - [ ] Can select all 3 parts
  - [ ] Microphone access requested
  - [ ] Voice input captures correctly
  - [ ] Conversation flows naturally
  - [ ] Can stop and analyze

- [ ] **Feedback Display**
  - [ ] All four scores show (fluency, lexical, grammar, pronunciation)
  - [ ] Overall band score displays
  - [ ] Feedback text is specific and helpful
  - [ ] Strengths and improvements listed
  - [ ] Styling looks polished

- [ ] **Code Quality**
  - [ ] No console errors
  - [ ] TypeScript compiles without warnings
  - [ ] All dependencies installed
  - [ ] `.env.local` not committed to GitHub

- [ ] **Performance**
  - [ ] Page loads in <3 seconds
  - [ ] Analysis completes in <1 minute
  - [ ] Smooth animations and transitions
  - [ ] No memory leaks (check DevTools)

- [ ] **Deployment**
  - [ ] Vercel deployment successful
  - [ ] All environment variables set
  - [ ] No build errors
  - [ ] Website publicly accessible

### Test Conversations

Try these with your deployed app:

**Part 1 Test**
```
Examiner: "Tell me about your hometown."
Your response: "I'm from Tokyo, Japan. It's a vibrant city with..."
```

**Part 2 Test**
```
Topic: "Describe a hobby you enjoy"
Your response: "Well, I really enjoy reading. I started reading novels when..."
```

**Part 3 Test**
```
Question: "Do you think hobbies are important for mental health?"
Your response: "Yes, I absolutely think so. Hobbies provide..."
```

Each should generate feedback within 30 seconds.

---

## Demo Video Creation

### 1. Prepare Your Demo Script (3 minutes max)

**Scene 1: Homepage (30 seconds)**
```
"Welcome to IELTS AI Practice. Three million students take the IELTS exam every year,
but quality preparation is expensive. Our AI-powered platform uses ElevenLabs voice AI
and Google's Gemini 2.5 to provide expert-level feedback in real-time."
```

**Scene 2: Part Selection (15 seconds)**
```
"Students can practice all three parts of the IELTS speaking exam. Let's start with Part 1."
```

**Scene 3: Live Practice (60 seconds)**
```
[Screen recording of conversation]
"Now I'm practicing with our AI examiner. The conversation flows naturally, just like a real exam."
```

**Scene 4: Feedback Results (45 seconds)**
```
"In seconds, I get expert feedback across four criteria: fluency, vocabulary, grammar, and pronunciation.
Each score includes specific improvements and actionable suggestions."
```

**Scene 5: Progress Tracking (15 seconds)**
```
"Over time, I can track my progress with detailed analytics to see my band score improvement."
```

**Scene 6: Technology Stack (15 seconds)**
```
"Built with ElevenLabs Conversational AI, Google Gemini 2.5 Flash, and Next.js on Google Cloud."
```

### 2. Recording Steps

**Option A: Screen Recording (Easiest)**
```bash
# macOS
QuickTime Player → File → New Screen Recording

# Windows
Windows + Shift + S → Record

# Linux
OBS Studio (https://obsproject.com)
```

**Option B: Professional Video Editing**
- Add your voice narration
- Include background music (free: Epidemic Sound, YouTube Audio Library)
- Add title slides with logos
- Smooth transitions between scenes

### 3. Upload to YouTube

1. Go to https://youtube.com
2. Click **Create** → **Upload video**
3. Upload your demo video
4. Set visibility to **Public**
5. Title: "IELTS AI Practice - AI Partner Catalyst Hackathon"
6. Description:
   ```
   IELTS AI Practice: Real-time speaking practice with expert AI feedback.

   Built for the AI Partner Catalyst Hackathon using:
   - ElevenLabs Conversational AI
   - Google Gemini 2.5 Flash
   - Next.js on Google Cloud

   Try it: [your-vercel-url]
   Code: https://github.com/your-username/ielts-practice-ai
   ```
7. Copy your YouTube URL

---

## Devpost Submission

### 1. Create Devpost Account

1. Go to https://devpost.com
2. Sign up for an account
3. Join the "AI Partner Catalyst" hackathon

### 2. Prepare Submission Materials

Gather these files:
- [ ] **Hosted URL**: https://your-app.vercel.app
- [ ] **GitHub URL**: https://github.com/your-username/ielts-practice-ai
- [ ] **Demo Video URL**: https://youtube.com/watch?v=...
- [ ] **Project Description** (see below)
- [ ] **Screenshot/Thumbnail** of your application

### 3. Project Description Template

```
IELTS AI Practice: Expert-Level Speaking Preparation

PROBLEM
3 million students take the IELTS exam yearly, but:
- Traditional prep costs $200+
- Limited access to expert feedback
- No 24/7 practice available
- Anxiety from high-stakes testing

SOLUTION
An AI-powered platform that provides real-time conversational practice with
expert-level feedback using cutting-edge technology.

KEY FEATURES
✅ Real-time voice practice with adaptive AI examiner
✅ Expert analysis across 4 IELTS criteria (fluency, lexical, grammar, pronunciation)
✅ Band score calculation aligned with official IELTS standards
✅ Specific, actionable feedback for improvement
✅ Progress tracking and analytics
✅ Beautiful, responsive UI

TECHNOLOGY STACK
- ElevenLabs Conversational AI (voice interaction)
- Google Gemini 2.5 Flash (native audio analysis)
- Next.js 14 (full-stack framework)
- TypeScript (type safety)
- Tailwind CSS (modern design)
- Vercel (deployment)

IMPACT
- Democratizes access to quality test preparation
- Helps millions of ESL learners achieve their goals
- Reduces barriers to international education and employment
- Scalable 24/7 availability

TECHNICAL ACHIEVEMENTS
- Real-time WebRTC voice communication
- Native audio processing with Gemini 2.5
- IELTS-aligned band scoring algorithm
- Responsive, polished UI with smooth interactions
- Zero-latency voice feedback

LINK TO PROJECT
Website: https://your-app.vercel.app
GitHub: https://github.com/your-username/ielts-practice-ai
```

### 4. Fill Out Devpost Form

1. Project Name: `IELTS AI Practice`
2. Project Tagline: `AI-powered IELTS speaking practice with expert feedback`
3. Description: (Use template above)
4. Team: (Your name and role)
5. Challenge: Select "ElevenLabs Challenge"
6. Hosted URL: Your Vercel deployment
7. GitHub Repository: Your public repo
8. Demo Video: Your YouTube video
9. Additional Notes:
   ```
   This submission fulfills the ElevenLabs Challenge by:
   - Using ElevenLabs Conversational AI Agents for real-time voice interaction
   - Integrating Google Cloud Vertex AI (Gemini 2.5 Flash)
   - Making the app fully conversational, intelligent, and voice-driven
   - Enabling users to interact entirely through speech
   ```

### 5. Submit

- [ ] Review all information
- [ ] Verify links work
- [ ] Check video is public
- [ ] Confirm GitHub repo is public with MIT license
- [ ] Click **SUBMIT**

---

## Post-Submission Checklist

After you submit:

- [ ] **Tell the world!**
  - Share on Twitter/LinkedIn with link to Devpost
  - Use hashtag #AIPartnerCatalyst #ElevenLabs
  - Tag @ElevenLabs and @GoogleCloud

- [ ] **Gather feedback**
  - Ask friends to test the app
  - Collect beta feedback
  - Note any issues for future improvements

- [ ] **Prepare for live demo** (if advancing)
  - Practice your pitch (2-3 minutes)
  - Prepare talking points about technology
  - Have demo ready to show
  - Have backup video in case of internet issues

- [ ] **Monitor your submission**
  - Check for comments on Devpost
  - Respond to judge questions
  - Update project with new features if needed

---

## Troubleshooting

### Common Issues

**Issue**: Voice input not working
```
Solution:
1. Check browser permissions for microphone
2. Verify ElevenLabs agent is active
3. Check API key is correct
4. Test with https:// (not http://)
```

**Issue**: Gemini analysis fails
```
Solution:
1. Verify API key is set correctly
2. Check Google Cloud quota usage
3. Ensure API is enabled in Google Cloud Console
4. Try with shorter transcript
```

**Issue**: Vercel deployment fails
```
Solution:
1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify next.config.js is valid
4. Check for TypeScript errors: npm run build
```

**Issue**: CORS errors in browser
```
Solution:
1. ElevenLabs should handle CORS
2. Check browser console for specific error
3. Ensure API calls are to /api/... endpoints
4. Clear browser cache and try again
```

---

## Success Metrics

After submission, track:
- [ ] **Views**: Target 500+ Devpost views
- [ ] **Upvotes**: Aim for 50+ votes
- [ ] **Comments**: Respond to all feedback
- [ ] **Social shares**: Track mentions
- [ ] **Live user tests**: Get beta testers

---

## Questions?

- ElevenLabs Docs: https://elevenlabs.io/docs
- Gemini Docs: https://ai.google.dev/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs

Good luck with your submission! 🚀
