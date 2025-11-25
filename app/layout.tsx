import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IELTS AI Practice | AI-Powered Speaking Practice',
  description:
    'Master your IELTS speaking skills with AI-powered practice, expert feedback, and real-time analysis using ElevenLabs voice AI and Google Gemini.',
  keywords: [
    'IELTS',
    'speaking practice',
    'English learning',
    'AI tutor',
    'pronunciation',
    'fluency',
  ],
  authors: [{ name: 'IELTS AI Practice Team' }],
  openGraph: {
    title: 'IELTS AI Practice',
    description: 'Master your IELTS speaking with AI-powered practice and expert feedback',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='50' font-size='70' text-anchor='middle' x='50' font-weight='bold' fill='%233b82f6' dominant-baseline='middle'>🎙️</text></svg>" />
      </head>
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
