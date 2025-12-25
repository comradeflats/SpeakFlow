import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpeakFlow | AI-Powered English Speaking Practice',
  description:
    'Master English speaking with AI-powered conversations. Get CEFR-based feedback on Range, Accuracy, Fluency, Interaction, and Coherence using ElevenLabs voice AI.',
  keywords: [
    'English speaking',
    'CEFR',
    'speaking practice',
    'English learning',
    'AI conversation',
    'pronunciation',
    'fluency',
    'language learning',
  ],
  authors: [{ name: 'SpeakFlow Team' }],
  openGraph: {
    title: 'SpeakFlow - AI English Speaking Practice',
    description: 'Master English speaking with AI conversations and CEFR-based feedback',
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
