/**
 * ElevenLabs API Type Definitions
 * Types for interacting with the ElevenLabs subscription API
 */

/**
 * Raw response from ElevenLabs /v1/user/subscription endpoint
 */
export interface ElevenLabsSubscriptionData {
  character_count: number;
  character_limit: number;
  next_character_count_reset_unix: number;
  can_extend_character_limit: boolean;
}

/**
 * Processed credit information for UI display
 * Includes computed percentages and caching metadata
 */
export interface ElevenLabsCreditsInfo {
  character_count: number;
  character_limit: number;
  percentage_used: number;
  percentage_remaining: number;
  next_reset_unix: number;
  can_extend: boolean;
  cached_at: string;
  is_stale: boolean;
  error?: string;
}
