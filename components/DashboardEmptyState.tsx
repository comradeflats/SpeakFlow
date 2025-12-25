import React from 'react';
import { ChartLine, ArrowLeft } from 'lucide-react';
import Button from './ui/Button';
import Link from 'next/link';

const DashboardEmptyState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-medium hover:text-slate-dark transition-smooth mb-8"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl p-12 text-center shadow-lg">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ChartLine className="text-gray-400" size={40} />
          </div>

          <h2 className="text-2xl font-bold text-slate-dark mb-3">
            No practice sessions yet
          </h2>

          <p className="text-slate-medium mb-8 leading-relaxed">
            Start your first practice session to see your progress and track your improvement over time.
          </p>

          <Link href="/practice">
            <Button variant="primary" size="lg" className="w-full">
              Start Practicing
            </Button>
          </Link>

          <p className="text-xs text-slate-medium mt-6">
            You'll see detailed analytics, progress charts, and personalized recommendations after completing your first session.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmptyState;
