'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mic, Brain, TrendingUp, Award, ArrowRight, Zap } from 'lucide-react';

const HomePage = () => {
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: <Mic size={48} />,
      title: 'Real-Time Voice Practice',
      description: 'Speak naturally with our AI examiner powered by ElevenLabs',
      color: 'bg-teal-500',
    },
    {
      icon: <Brain size={48} />,
      title: 'Expert Feedback',
      description: 'Get detailed analysis on fluency, grammar, lexical range & pronunciation',
      color: 'bg-cyan-500',
    },
    {
      icon: <TrendingUp size={48} />,
      title: 'Progress Tracking',
      description: 'Watch your band scores improve across all speaking parts',
      color: 'bg-teal-500',
    },
    {
      icon: <Award size={48} />,
      title: 'Band Score Targeting',
      description: 'Actionable insights to reach your target IELTS band',
      color: 'bg-cyan-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white border-b border-gray-100">
        <div className="text-xl font-bold flex items-center gap-3 text-slate-900">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Zap className="text-white" size={24} />
          </div>
          <span>IELTS AI</span>
        </div>
        <div className="flex gap-6 items-center">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition font-medium text-sm">
            About
          </button>
          <button className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold text-sm shadow-md hover:shadow-lg">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full px-8 py-40 flex items-center justify-center bg-white">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-slate-900 leading-tight">
            Master Your IELTS Speaking Skills
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            Practice with an AI examiner powered by ElevenLabs. Get expert feedback on fluency, grammar, vocabulary, and pronunciation.
          </p>
          <Link
            href="/practice"
            className="inline-flex items-center gap-3 px-8 py-4 bg-teal-600 text-white rounded-lg font-semibold text-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            Start Practicing Now
            <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-8 py-32 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">What You Get</h2>
            <p className="text-gray-600 text-lg">Everything you need to improve your IELTS speaking score</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 flex flex-col items-center text-center border border-gray-100"
              >
                <div className={`${feature.color} text-white rounded-lg p-4 mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-8 py-32 flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
        <div className="text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Ready to Practice?</h2>
          <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            Join thousands of IELTS students improving their speaking skills with AI-powered practice and expert feedback.
          </p>
          <Link
            href="/practice"
            className="inline-flex items-center gap-3 px-8 py-4 bg-teal-600 text-white rounded-lg font-semibold text-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            Start Your Free Practice
            <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-gray-600 bg-white">
        <p className="text-sm">
          © 2025 IELTS AI Practice. Powered by ElevenLabs &amp; Google Gemini
        </p>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full p-6 relative border border-white border-opacity-20">
            <button
              onClick={() => setShowDemo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4">How IELTS AI Practice Works</h3>
            <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center mb-4">
              <div className="text-center">
                <Mic size={64} className="mx-auto mb-4 text-blue-400" />
                <p className="text-gray-400">Demo video will be available after deployment</p>
              </div>
            </div>
            <button
              onClick={() => setShowDemo(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
