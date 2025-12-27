'use client';

import Link from 'next/link';
import { ChevronLeft, Play, Github, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const YOUTUBE_VIDEO_ID = '5Wla6PfmglQ';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 mb-8 font-semibold transition-smooth"
        >
          <ChevronLeft size={20} />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Play className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-dark mb-3">
            SpeakFlow Demo
          </h1>
          <p className="text-lg text-slate-medium max-w-2xl mx-auto">
            Watch a comprehensive walkthrough of SpeakFlow's AI-powered English speaking practice and CEFR assessment features.
          </p>
        </div>

        {/* Video Embed Card */}
        <Card className="mb-8 p-0 overflow-hidden">
          <div
            className="relative w-full bg-gray-900"
            style={{ paddingBottom: '56.25%' }}
          >
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
              title="SpeakFlow Demo - AI-Powered English Speaking Practice"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </Card>

        {/* Video Description */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-slate-dark mb-4">
            What You'll See in This Demo
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-slate-dark mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">1</span>
                CEFR Level Assessment
              </h3>
              <p className="text-sm text-slate-medium mb-4">
                Real-time AI conversation that accurately determines your English speaking level from A1 (beginner) to C2 (proficient).
              </p>

              <h3 className="font-semibold text-slate-dark mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">2</span>
                Detailed Feedback Analysis
              </h3>
              <p className="text-sm text-slate-medium mb-4">
                Comprehensive breakdown across 5 speaking criteria: Range, Accuracy, Fluency, Interaction, and Coherence.
              </p>

              <h3 className="font-semibold text-slate-dark mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">3</span>
                Practice Sessions
              </h3>
              <p className="text-sm text-slate-medium">
                Topic-based conversations adapted to your CEFR level with instant feedback and improvement suggestions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-dark mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">4</span>
                Technology Stack
              </h3>
              <p className="text-sm text-slate-medium mb-4">
                ElevenLabs Conversational AI, Google Vertex AI Gemini 2.0 Flash, Firebase, and Next.js working together seamlessly.
              </p>

              <h3 className="font-semibold text-slate-dark mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">5</span>
                Progress Tracking
              </h3>
              <p className="text-sm text-slate-medium mb-4">
                Dashboard with session history, improvement trends, and comprehensive analytics.
              </p>

              <h3 className="font-semibold text-slate-dark mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">6</span>
                Multilingual Support
              </h3>
              <p className="text-sm text-slate-medium">
                Receive feedback in 40+ languages to accelerate your learning.
              </p>
            </div>
          </div>
        </Card>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link href="/practice">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <ExternalLink className="w-5 h-5 mr-2" />
              Try Live Demo
            </Button>
          </Link>

          <a
            href="https://github.com/comradeflats/SpeakFlow"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <Github className="w-5 h-5 mr-2" />
              View Source Code
            </Button>
          </a>
        </div>

        {/* Technical Highlights */}
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <h2 className="text-xl font-bold text-slate-dark mb-4">
            Key Technical Features
          </h2>
          <ul className="space-y-2 text-sm text-slate-medium">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span><strong>Native Audio Analysis:</strong> Vertex AI Gemini 2.0 Flash processes raw audio directly for pronunciation and prosody insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span><strong>Official Cambridge CEFR Descriptors:</strong> Evidence-based assessment using authentic university standards</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span><strong>Zero Anchor Bias:</strong> Accurately evaluates full A1-C2 range without preset expectations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span><strong>Real-time Conversations:</strong> ElevenLabs Conversational AI provides natural, low-latency voice interactions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span><strong>Production-Ready:</strong> Full authentication, database persistence, and deployment on Vercel</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
