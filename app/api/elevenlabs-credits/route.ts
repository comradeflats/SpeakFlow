import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { ElevenLabsSubscriptionData, ElevenLabsCreditsInfo } from '@/lib/elevenlabs-types';

// In-memory cache for ElevenLabs subscription data
interface CacheEntry {
  timestamp: number;
  data: ElevenLabsCreditsInfo;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches ElevenLabs subscription data from the API
 */
async function fetchElevenLabsSubscription(): Promise<ElevenLabsSubscriptionData> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_ELEVENLABS_API_KEY is not configured');
  }

  const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
    method: 'GET',
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Processes raw subscription data into UI-friendly format
 */
function processSubscriptionData(data: ElevenLabsSubscriptionData, cachedAt: string, isStale: boolean): ElevenLabsCreditsInfo {
  const percentageUsed = (data.character_count / data.character_limit) * 100;
  const percentageRemaining = 100 - percentageUsed;

  return {
    character_count: data.character_count,
    character_limit: data.character_limit,
    percentage_used: Math.round(percentageUsed * 100) / 100, // Round to 2 decimals
    percentage_remaining: Math.round(percentageRemaining * 100) / 100,
    next_reset_unix: data.next_character_count_reset_unix,
    can_extend: data.can_extend_character_limit,
    cached_at: cachedAt,
    is_stale: isStale,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session cookie
    const sessionCookie = request.cookies.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Verify session cookie
    await adminAuth.verifySessionCookie(sessionCookie);

    const cacheKey = 'elevenlabs_subscription';
    const now = Date.now();
    const cached = cache.get(cacheKey);

    // Check if cached data is fresh
    if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    // Fetch fresh data from ElevenLabs API
    try {
      const subscriptionData = await fetchElevenLabsSubscription();
      const cachedAt = new Date().toISOString();
      const processedData = processSubscriptionData(subscriptionData, cachedAt, false);

      // Update cache
      cache.set(cacheKey, {
        timestamp: now,
        data: processedData,
      });

      return NextResponse.json(processedData);
    } catch (apiError) {
      console.error('ElevenLabs API fetch error:', apiError);

      // If we have stale cached data, return it with stale flag
      if (cached) {
        const staleData = { ...cached.data, is_stale: true };
        return NextResponse.json(staleData);
      }

      // No cached data available, return error
      return NextResponse.json(
        {
          error: 'Failed to fetch ElevenLabs credits',
          details: apiError instanceof Error ? apiError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in elevenlabs-credits API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
