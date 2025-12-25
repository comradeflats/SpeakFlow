'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mic, Brain, TrendingUp, Award, ArrowRight, Zap, BarChart3 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AuthButton from '@/components/AuthButton';
import AuthModal from '@/components/AuthModal';

export default function HomePageClient({ user }: { user: any }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const features = [
    {
      icon: <Mic size={48} />,
      title: 'Real-Time Voice Practice',
      description: 'Speak naturally with our AI conversation partner powered by ElevenLabs',
      color: 'bg-ocean-600',
    },
    {
      icon: <Brain size={48} />,
      title: 'CEFR-Based Feedback',
      description: 'Get detailed analysis on Range, Accuracy, Fluency, Interaction & Coherence',
      color: 'bg-ocean-700',
    },
    {
      icon: <TrendingUp size={48} />,
      title: 'Progress Tracking',
      description: 'Watch your CEFR level improve from A1 to C2 across all criteria',
      color: 'bg-ocean-600',
    },
    {
      icon: <Award size={48} />,
      title: 'Level Advancement',
      description: 'Actionable insights to reach the next CEFR proficiency level',
      color: 'bg-ocean-700',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-4 md:px-8 py-6 bg-white border-b border-gray-200">
        <div className="text-xl font-bold flex items-center gap-3 text-slate-dark">
          <div className="w-10 h-10 bg-gradient-to-br from-ocean-600 to-ocean-700 rounded-lg flex items-center justify-center">
            <Zap className="text-white" size={24} />
          </div>
          <span>SpeakFlow</span>
        </div>
        {user ? (
          <AuthButton user={user} />
        ) : (
          <Button variant="primary" size="md" onClick={() => setIsAuthModalOpen(true)}>
            Sign In
          </Button>
        )}
      </nav>

      {/* Hero Section */}
      <section className="w-full px-4 md:px-8 py-32 md:py-48 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ocean-50 rounded-full blur-3xl opacity-40 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10"></div>

        <div className="text-center max-w-4xl relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-slate-dark leading-tight">
            Master English Speaking with AI
          </h1>
          <p className="text-lg md:text-xl text-slate-medium mb-12 leading-relaxed max-w-2xl mx-auto">
            Practice natural conversations with AI. Get CEFR-based feedback on Range, Accuracy, Fluency, Interaction, and Coherence.
          </p>
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/practice">
                <Button variant="primary" size="lg" className="inline-flex items-center gap-3 text-base md:text-lg px-8 md:px-10 py-3 md:py-4">
                  Start Practicing Now
                  <ArrowRight size={24} />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="inline-flex items-center gap-3 text-base md:text-lg px-8 md:px-10 py-3 md:py-4">
                  View Progress
                  <BarChart3 size={24} />
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="inline-flex items-center gap-3 text-base md:text-lg px-8 md:px-10 py-3 md:py-4"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Start Practicing Now
              <ArrowRight size={24} />
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-4 md:px-8 py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-dark mb-4">What You Get</h2>
            <p className="text-slate-medium text-lg">Everything you need to improve your English speaking skills</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} hoverable className="flex flex-col">
                <div className={`${feature.color} text-white rounded-xl p-5 mb-6 flex items-center justify-center w-16 h-16`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-dark mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-medium leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 md:px-8 py-32 flex items-center justify-center bg-gradient-to-b from-white to-ocean-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-ocean-50 rounded-full blur-3xl opacity-30 -z-10"></div>

        <div className="text-center max-w-3xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-dark">Ready to Practice?</h2>
          <p className="text-lg text-slate-medium mb-12 leading-relaxed">
            Join thousands of English learners improving their speaking skills with AI-powered practice and expert feedback.
          </p>
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/practice">
                <Button variant="primary" size="lg" className="inline-flex items-center gap-3 text-base md:text-lg px-8 md:px-10 py-3 md:py-4">
                  Start Your Free Practice
                  <ArrowRight size={24} />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="inline-flex items-center gap-3 text-base md:text-lg px-8 md:px-10 py-3 md:py-4">
                  View Progress
                  <BarChart3 size={24} />
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="inline-flex items-center gap-3 text-base md:text-lg px-8 md:px-10 py-3 md:py-4"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Start Your Free Practice
              <ArrowRight size={24} />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-slate-medium bg-white">
        <p className="text-sm">
          © 2025 SpeakFlow AI. Powered by ElevenLabs &amp; Google Vertex AI
        </p>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
