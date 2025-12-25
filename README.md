# SpeakFlow

**AI-Powered English Speaking Practice with Real-Time CEFR Assessment**

SpeakFlow is an intelligent language learning platform that helps English learners improve their speaking skills through natural AI conversations and comprehensive, evidence-based feedback aligned with the Common European Framework of Reference for Languages (CEFR).

---

## Features

### Core Capabilities

- **Real-Time Voice Conversations**: Practice speaking English with AI conversation partners powered by ElevenLabs' advanced voice technology
- **Adaptive CEFR Levels**: Six difficulty levels (A1-C2) that adapt to your proficiency with + levels for granular assessment
- **Comprehensive Level Assessment**: Automated placement test that accurately determines your CEFR level from A1 (beginner) to C2 (proficient)
- **Official Cambridge Descriptors**: Assessment based on authentic Cambridge University ESOL CEFR rubrics
- **Multi-Criteria Feedback**: Detailed analysis across five key speaking dimensions:
  - **Range**: Vocabulary breadth and flexibility
  - **Accuracy**: Grammatical control and error frequency
  - **Fluency**: Speech tempo, pausing patterns, and continuity
  - **Interaction**: Turn-taking and conversational effectiveness
  - **Coherence**: Discourse organization and cohesive devices
- **Multilingual Feedback**: Receive feedback in 40+ languages for better comprehension
- **Diverse Topics**: Practice conversations across multiple domains (casual, business, academic, travel, technology, health)
- **Progress Tracking**: Monitor improvement over time with session history and analytics
- **Audio Analysis**: Native multimodal speech assessment using Google Vertex AI Gemini 2.0 Flash

### Technical Highlights

- Built with Next.js 16 (App Router) and React 19
- Firebase Authentication and Firestore database
- Real-time voice interaction via ElevenLabs Conversational AI
- Native audio analysis with Google Cloud Vertex AI
- Responsive design with Tailwind CSS
- TypeScript for type safety

---

## Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: Latest React with improved performance
- **TypeScript**: Type-safe development
- **Tailwind CSS 3**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Recharts**: Data visualization for progress tracking
- **Lucide React**: Modern icon library

### Backend & AI
- **ElevenLabs Conversational AI**: Real-time voice conversations with ultra-low latency
- **Google Cloud Vertex AI**: Gemini 2.0 Flash for native audio analysis
- **Firebase Admin SDK**: Server-side authentication
- **Firestore**: NoSQL database for user data and session history

### Authentication & Database
- **Firebase Authentication**: Secure user authentication with Google Sign-In
- **Firestore**: Cloud-hosted NoSQL database with real-time capabilities

---

## Installation

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Platform account with Vertex AI enabled
- ElevenLabs account with Conversational AI API access
- Firebase project with Authentication and Firestore enabled

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/speakflow.git
   cd speakflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin (Service Account)
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # Google Cloud Vertex AI
   GCP_PROJECT_ID=your_gcp_project_id
   GCP_LOCATION=us-central1

   # ElevenLabs Conversational AI Agents
   NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_default_agent_id
   NEXT_PUBLIC_ELEVENLABS_AGENT_A1=agent_id_for_a1_level
   NEXT_PUBLIC_ELEVENLABS_AGENT_A2=agent_id_for_a2_level
   NEXT_PUBLIC_ELEVENLABS_AGENT_B1=agent_id_for_b1_level
   NEXT_PUBLIC_ELEVENLABS_AGENT_B2=agent_id_for_b2_level
   NEXT_PUBLIC_ELEVENLABS_AGENT_C1=agent_id_for_c1_level
   NEXT_PUBLIC_ELEVENLABS_AGENT_C2=agent_id_for_c2_level
   NEXT_PUBLIC_ELEVENLABS_ASSESSMENT_AGENT=agent_id_for_assessment
   ```

4. **Set up Google Cloud Application Default Credentials**
   ```bash
   gcloud auth application-default login
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## Architecture

### Assessment Flow

1. **Level Assessment**
   - User initiates a 1.5-minute conversation with the assessment agent
   - Audio is recorded and transcribed in real-time
   - Upon completion, audio + transcript are sent to Vertex AI Gemini 2.0 Flash
   - AI analyzes speech using official Cambridge CEFR descriptors
   - System determines overall level and criterion-specific scores
   - User's preferred level is saved to Firestore

2. **Practice Sessions**
   - User selects topic and CEFR level (or uses assessed level)
   - ElevenLabs agent is configured with topic-specific prompts and CEFR-appropriate language
   - Real-time voice conversation begins with adaptive responses
   - Session audio and transcript are saved
   - Post-session, Vertex AI analyzes performance against selected CEFR level
   - Detailed feedback is generated and displayed

### CEFR Assessment Methodology

SpeakFlow uses the official Cambridge University ESOL CEFR descriptors (Table 5.5) for rigorous, standards-based assessment:

- **A1 (Beginner)**: Very basic repertoire, simple phrases, limited grammatical control
- **A2 (Elementary)**: Basic sentences, memorized phrases, systematic basic mistakes
- **B1 (Intermediate)**: Sufficient vocabulary for familiar topics, reasonable accuracy in predictable situations
- **B2 (Upper-Intermediate)**: Clear descriptions, complex sentences, relatively high grammatical control
- **C1 (Advanced)**: Broad range of language, sophisticated expression, rare errors
- **C2 (Proficient)**: Full command of language, native-like precision, effortless fluency

Plus levels (A1+, A2+, B1+, B2+, C1+) indicate performance between main levels.

### Key Technical Decisions

- **Native Audio Analysis**: Vertex AI Gemini 2.0 Flash processes raw audio directly, enabling prosody, intonation, and pronunciation analysis beyond text transcription
- **No Anchor Bias**: Assessment function evaluates across the full A1-C2 range without preconceptions
- **Real-time Conversations**: ElevenLabs Conversational AI provides natural, low-latency interactions
- **Multi-language Feedback**: AI generates feedback in the user's preferred language for better comprehension

---

## Usage

### Getting Started

1. **Sign In**: Use Google Sign-In to create an account
2. **Assess Your Level**: Take the 1.5-minute placement test to determine your current CEFR level
3. **View Results**: Review your level, confidence score, and detailed feedback across all five criteria
4. **Start Practicing**: Choose a topic and begin conversing with the AI agent at your level
5. **Review Feedback**: After each session, analyze your performance and improvement areas
6. **Track Progress**: Monitor your growth over time in the dashboard

### Tips for Best Results

- Find a quiet environment for clear audio recording
- Speak naturally - the AI adapts to your level
- Review detailed feedback to understand specific areas for improvement
- Practice regularly to see measurable progress
- Try different topics to expand vocabulary range

---

## Project Structure

```
speakflow/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── analyze/              # Session analysis endpoint
│   │   ├── assess-level/         # Level assessment endpoint
│   │   └── auth/                 # Authentication endpoints
│   ├── dashboard/                # User dashboard
│   ├── practice/                 # Practice session page
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Homepage
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── ConversationInterface.tsx # Main conversation component
│   ├── LevelAssessment.tsx       # Assessment flow component
│   ├── FeedbackDisplay.tsx       # Feedback visualization
│   ├── ProgressChart.tsx         # Progress tracking charts
│   └── ...                       # Other components
├── lib/                          # Utility libraries
│   ├── vertex-ai.ts              # Vertex AI integration
│   ├── conversation-topics.ts    # Topic and CEFR configurations
│   ├── cefr-scoring.ts           # CEFR scoring logic
│   ├── firebase-client.ts        # Firebase client SDK
│   ├── firebase-admin.ts         # Firebase Admin SDK
│   ├── firestore-db.ts           # Firestore database operations
│   └── languages.ts              # Supported languages
└── public/                       # Static assets
```

---

## Hackathon Details

**Hackathon**: AI Partner Catalyst (Devpost)
**Category**: AI-Powered Education / Language Learning
**Technologies**: ElevenLabs Conversational AI, Google Cloud Vertex AI, Firebase, Next.js

### What Makes SpeakFlow Special

1. **Evidence-Based Assessment**: Uses official Cambridge University CEFR rubrics, not ad-hoc criteria
2. **Native Audio Analysis**: Analyzes audio directly for pronunciation, intonation, and prosody insights
3. **No Anchor Bias**: Assessment accurately identifies all levels from absolute beginners to near-native speakers
4. **Real Conversations**: Natural voice interactions with ultra-low latency, not robotic Q&A
5. **Actionable Feedback**: Specific, criterion-based suggestions tied to CEFR descriptors

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Acknowledgments

- **ElevenLabs**: For providing industry-leading Conversational AI technology
- **Google Cloud**: For Vertex AI Gemini 2.0 Flash multimodal capabilities
- **Cambridge University Press & Assessment**: For publishing the CEFR framework and descriptors
- **Firebase**: For authentication and database infrastructure

---

## Contact

For questions, feedback, or support:
- **GitHub Issues**: [Report a bug or request a feature](https://github.com/yourusername/speakflow/issues)
- **Email**: support@speakflow.ai

---

**Built with ❤️ for language learners worldwide**
