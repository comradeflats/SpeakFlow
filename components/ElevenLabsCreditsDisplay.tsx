'use client';

import React, { useState, useEffect } from 'react';
import { ElevenLabsCreditsInfo } from '@/lib/elevenlabs-types';
import ProgressBar from './ui/ProgressBar';
import Alert from './ui/Alert';
import Spinner from './ui/Spinner';
import Button from './ui/Button';
import { RefreshCw } from 'lucide-react';

interface ElevenLabsCreditsDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  showRefresh?: boolean;
  onError?: (error: string) => void;
  className?: string;
}

const ElevenLabsCreditsDisplay: React.FC<ElevenLabsCreditsDisplayProps> = ({
  size = 'md',
  showRefresh = false,
  onError,
  className = '',
}) => {
  const [credits, setCredits] = useState<ElevenLabsCreditsInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchCredits = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/elevenlabs-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch credits');
      }

      const data: ElevenLabsCreditsInfo = await response.json();
      setCredits(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch credits';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const handleRefresh = () => {
    fetchCredits(true);
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const getProgressBarColor = (percentageUsed: number): 'ocean' | 'warning' | 'error' => {
    if (percentageUsed <= 50) return 'ocean';
    if (percentageUsed <= 80) return 'warning';
    return 'error';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          title: 'text-xs',
          value: 'text-sm',
          subtext: 'text-xs',
        };
      case 'lg':
        return {
          container: 'p-6',
          title: 'text-sm',
          value: 'text-lg',
          subtext: 'text-sm',
        };
      default: // md
        return {
          container: 'p-4',
          title: 'text-xs',
          value: 'text-base',
          subtext: 'text-xs',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Loading state
  if (loading && !credits) {
    return (
      <div className={`bg-white rounded-lg border border-slate-light ${sizeClasses.container} flex items-center justify-center ${className}`}>
        <Spinner size={size} />
      </div>
    );
  }

  // Error state
  if (error && !credits) {
    return (
      <Alert variant="error" className={className}>
        <div className="flex-1">
          <p className="font-semibold">ElevenLabs Credits Unavailable</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </Alert>
    );
  }

  // No credits data
  if (!credits) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border border-slate-light ${sizeClasses.container} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className={`font-semibold text-slate-dark uppercase tracking-wide ${sizeClasses.title}`}>
            ElevenLabs API Credits
          </p>
          {credits.is_stale && (
            <p className="text-xs text-warning mt-1">
              Data may be outdated
            </p>
          )}
        </div>
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Character count display */}
        <div>
          <p className={`font-bold text-slate-dark ${sizeClasses.value}`}>
            {formatNumber(credits.character_count)} / {formatNumber(credits.character_limit)}
          </p>
          <p className={`text-slate-medium ${sizeClasses.subtext}`}>
            Characters used
          </p>
        </div>

        {/* Progress bar */}
        <ProgressBar
          value={credits.percentage_used}
          max={100}
          color={getProgressBarColor(credits.percentage_used)}
        />

        {/* Percentage remaining */}
        <div className="flex items-center justify-between">
          <p className={`text-slate-medium ${sizeClasses.subtext}`}>
            {credits.percentage_remaining.toFixed(1)}% remaining
          </p>
          {credits.next_reset_unix > 0 && (
            <p className={`text-slate-medium ${sizeClasses.subtext}`}>
              Resets {new Date(credits.next_reset_unix * 1000).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsCreditsDisplay;
