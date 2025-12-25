# IELTS to CEFR Migration Documentation

**Date Started:** December 24, 2024
**Status:** In Progress (Phase 1 partially complete)

## Overview

This document outlines the complete migration from IELTS band scoring (4 criteria, 0-9 scale) to CEFR level assessment (5 criteria, A1-C2 scale) across the entire application.

## CEFR Framework Reference

### 5 Assessment Criteria (Official Cambridge ESOL)

1. **Range** - Vocabulary range and flexibility (replaces "Lexical Resource")
2. **Accuracy** - Grammatical accuracy (replaces "Grammatical Range & Accuracy")
3. **Fluency** - Speaking flow and smoothness (same as IELTS)
4. **Interaction** - Communication effectiveness with others (NEW - not in IELTS)
5. **Coherence** - Discourse organization and logical flow (NEW - not in IELTS)

### CEFR Levels

**Full Scale:** A1, A1+, A2, A2+, B1, B1+, B2, B2+, C1, C1+, C2

**Level Mapping to Numeric (for calculations):**
- A1 = 1.0
- A1+ = 1.5
- A2 = 2.0
- A2+ = 2.5
- B1 = 3.0
- B1+ = 3.5
- B2 = 4.0
- B2+ = 4.5
- C1 = 5.0
- C1+ = 5.5
- C2 = 6.0

### Key Differences from IELTS

| Aspect | IELTS | CEFR |
|--------|-------|------|
| Criteria Count | 4 | 5 |
| Scale | 0-9 (numeric) | A1-C2 (levels) |
| Pronunciation | Separate criterion | Integrated into other criteria |
| Interaction | Not assessed | Explicit criterion |
| Coherence | Part of fluency | Separate criterion |

## Migration Status

### ✅ Completed (Phase 1 - Partial)

1. **app/practice/page.tsx**
   - Changed import from `IELTSAnalysis` to `CEFRAnalysis`
   - Updated state type from `IELTSAnalysis | null` to `CEFRAnalysis | null`

2. **lib/firestore-db.ts** (Partial)
   - Added deprecation notice to legacy IELTS fields
   - Added import of CEFR utility functions (`cefrToNumeric`, `numericToCefr`)
   - Updated `getUserStats()` to handle both CEFR levels and legacy scores

### 🔄 In Progress

3. **lib/firestore-db.ts**
   - Need to update `calculateImprovementTrend()` function

### ⏳ Remaining Tasks

#### Phase 1: Core Data (Remaining)
4. Update `calculateImprovementTrend()` in lib/firestore-db.ts
5. Remove IELTS field saving in app/api/analyze/route.ts

#### Phase 2: Display Components (All Pending)
6. Update components/ui/ScoreDisplay.tsx for CEFR levels
7. Update components/DetailedFeedbackHeatmap.tsx for 5 CEFR criteria
8. Update components/FeedbackDisplay.tsx - remove all IELTS references
9. Update components/RecentSessionsList.tsx for 5 CEFR criteria columns
10. Update components/ProgressChart.tsx for CEFR level chart
11. Update components/DashboardClient.tsx - remove IELTS text

#### Phase 3: Cleanup & Testing
12. Add deprecation notice to lib/ielts-scoring.ts
13. Remove fallback IELTS function from lib/vertex-ai.ts
14. Run build to check for TypeScript errors
15. Test feedback display with CEFR criteria

## Detailed Implementation Guide

### File-by-File Changes

#### 1. app/practice/page.tsx ✅ DONE
```typescript
// OLD
import { IELTSAnalysis } from '@/lib/ielts-scoring';
const [analysis, setAnalysis] = useState<IELTSAnalysis | null>(null);

// NEW
import { CEFRAnalysis } from '@/lib/cefr-scoring';
const [analysis, setAnalysis] = useState<CEFRAnalysis | null>(null);
```

#### 2. lib/firestore-db.ts ✅ PARTIALLY DONE

**Completed:**
- Added deprecation comments to IELTS fields (lines 25-34)
- Imported CEFR utility functions
- Updated `getUserStats()` to use CEFR levels with fallback to legacy

**Still TODO:**
Update `calculateImprovementTrend()` (lines 370-400):
```typescript
export function calculateImprovementTrend(sessions: PracticeSession[]): {
  trend: 'improving' | 'stable' | 'declining';
  rate: number;
} {
  if (sessions.length < 2) {
    return { trend: 'stable', rate: 0 };
  }

  // Get overall levels (prefer CEFR, fallback to scores)
  const levels = sessions
    .map((s) => {
      if (s.overall_level) {
        return cefrToNumeric(s.overall_level as any);
      }
      return s.overall_score || 0;
    })
    .filter((l) => l > 0)
    .reverse(); // Chronological order

  if (levels.length < 2) {
    return { trend: 'stable', rate: 0 };
  }

  // Simple linear regression
  const n = levels.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = levels.reduce((a, b) => a + b, 0);
  const sumXY = levels.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  const trend = slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable';

  return { trend, rate: slope };
}
```

#### 3. app/api/analyze/route.ts ⏳ TODO

**Current (lines 62-97):**
```typescript
await savePracticeSession({
  user_id: userId,
  topic: topic,
  cefr_level: cefrLevel,
  transcript: analysis.verbatim_transcript || '',

  // CEFR fields
  overall_level: analysis.overall_level,
  range_level: analysis.range_level,
  accuracy_level: analysis.accuracy_level,
  fluency_level: analysis.fluency_level,
  interaction_level: analysis.interaction_level,
  coherence_level: analysis.coherence_level,

  range_feedback: analysis.range_feedback,
  accuracy_feedback: analysis.accuracy_feedback,
  fluency_feedback: analysis.fluency_feedback,
  interaction_feedback: analysis.interaction_feedback,
  coherence_feedback: analysis.coherence_feedback,

  // Legacy IELTS fields (if present, for backward compatibility) ❌ REMOVE THESE
  overall_score: analysis.overallScore,
  fluency_score: analysis.fluencyScore,
  lexical_score: analysis.lexicalScore,
  grammar_score: analysis.grammarScore,
  pronunciation_score: analysis.pronunciationScore,
  lexical_feedback: analysis.lexicalFeedback,
  grammar_feedback: analysis.grammarFeedback,
  pronunciation_feedback: analysis.pronunciationFeedback,

  // Common fields
  strengths: analysis.strengths || [],
  improvements: analysis.improvements || [],
  pronunciation_heatmap: analysis.detailed_feedback || [],
  verbatim_transcript: analysis.verbatim_transcript,
});
```

**Should be:**
```typescript
await savePracticeSession({
  user_id: userId,
  topic: topic,
  cefr_level: cefrLevel,
  transcript: analysis.verbatim_transcript || '',

  // CEFR fields only
  overall_level: analysis.overall_level,
  range_level: analysis.range_level,
  accuracy_level: analysis.accuracy_level,
  fluency_level: analysis.fluency_level,
  interaction_level: analysis.interaction_level,
  coherence_level: analysis.coherence_level,

  range_feedback: analysis.range_feedback,
  accuracy_feedback: analysis.accuracy_feedback,
  fluency_feedback: analysis.fluency_feedback,
  interaction_feedback: analysis.interaction_feedback,
  coherence_feedback: analysis.coherence_feedback,

  // Common fields
  strengths: analysis.strengths || [],
  improvements: analysis.improvements || [],
  pronunciation_heatmap: analysis.detailed_feedback || [],
  verbatim_transcript: analysis.verbatim_transcript,
});
```

#### 4. components/ui/ScoreDisplay.tsx ⏳ TODO

**Changes needed:**
- Line 12: Change label from "Band Score" to "CEFR Level"
- Lines 13-18: Replace band-based colors with CEFR level colors
- Display string level (e.g., "B2") instead of numeric score

**New implementation:**
```typescript
const cefrLevelColors: Record<string, string> = {
  'C2': 'text-purple-600',
  'C1': 'text-blue-600',
  'C1+': 'text-blue-500',
  'B2': 'text-green-600',
  'B2+': 'text-green-500',
  'B1': 'text-yellow-600',
  'B1+': 'text-yellow-500',
  'A2': 'text-orange-600',
  'A2+': 'text-orange-500',
  'A1': 'text-red-600',
  'A1+': 'text-red-500',
};
```

#### 5. components/DetailedFeedbackHeatmap.tsx ⏳ TODO

**Changes needed:**
- Line 4: Remove import of `IELTSCriterion`
- Lines 12-48: Update `criterionConfig` for 5 CEFR criteria:

```typescript
import { Users, Link } from 'lucide-react'; // Add these icons

const criterionConfig = {
  range: {
    icon: MessageSquare,
    color: 'purple',
    label: 'Range',
    description: 'Vocabulary breadth and flexibility'
  },
  accuracy: {
    icon: CheckCircle,
    color: 'red',
    label: 'Accuracy',
    description: 'Grammatical correctness'
  },
  fluency: {
    icon: Zap,
    color: 'blue',
    label: 'Fluency',
    description: 'Speaking flow and smoothness'
  },
  interaction: {
    icon: Users,
    color: 'green',
    label: 'Interaction',
    description: 'Communication with others'
  },
  coherence: {
    icon: Link,
    color: 'orange',
    label: 'Coherence',
    description: 'Discourse organization'
  }
};
```

- Line 336: Remove `bandImpact` field display
- Update type definitions to use `CEFRCriterion` instead of `IELTSCriterion`

#### 6. components/FeedbackDisplay.tsx ⏳ TODO

**Major changes needed:**

1. **Remove IELTS imports (line 5):**
```typescript
// REMOVE
import { getBandDescription } from '@/lib/ielts-scoring';

// ADD
import { getGlobalDescriptor, getCriterionDescriptor, getNextLevel, getImprovementPath } from '@/lib/cefr-scoring';
```

2. **Remove IELTS fallback detection (lines 40-41):**
```typescript
// REMOVE
const isCEFR = 'overall_level' in analysis;
```

3. **Update criteria mapping (lines 52-58):**
```typescript
// OLD - 4 IELTS criteria
const criteriaToShow = isCEFR ? cefrCriteria : ielts Criteria;

// NEW - Always 5 CEFR criteria
const criteria = [
  { key: 'range' as const, label: 'Range (Vocabulary)', level: analysis.range_level, feedback: analysis.range_feedback },
  { key: 'accuracy' as const, label: 'Accuracy (Grammar)', level: analysis.accuracy_level, feedback: analysis.accuracy_feedback },
  { key: 'fluency' as const, label: 'Fluency', level: analysis.fluency_level, feedback: analysis.fluency_feedback },
  { key: 'interaction' as const, label: 'Interaction', level: analysis.interaction_level, feedback: analysis.interaction_feedback },
  { key: 'coherence' as const, label: 'Coherence', level: analysis.coherence_level, feedback: analysis.coherence_feedback },
];
```

4. **Remove "Band X Performance" (line 121):**
```typescript
// REMOVE
{!isCEFR && <h3>Band {Math.round(analysis.overall_score)} Performance</h3>}

// REPLACE with CEFR level display using getGlobalDescriptor()
```

5. **Update Next Steps section (lines 254-282):**
```typescript
// Use getNextLevel() and getImprovementPath() from cefr-scoring.ts
const { nextLevel, focusAreas } = getImprovementPath(analysis.overall_level);
```

#### 7. components/RecentSessionsList.tsx ⏳ TODO

**Changes:**
- Lines 44-61: Update table headers to 5 CEFR criteria
- Lines 70-93: Display CEFR levels instead of scores
- Lines 122-144: Update mobile view

**New headers:**
```typescript
<th>Date</th>
<th>Topic</th>
<th>Overall</th>
<th>Range</th>
<th>Accuracy</th>
<th>Fluency</th>
<th>Interaction</th>
<th>Coherence</th>
```

**Field mapping:**
```typescript
// Display session.range_level instead of session.lexical_score
// Display session.accuracy_level instead of session.grammar_score
// Display session.interaction_level (new)
// Display session.coherence_level (new)
// Remove session.pronunciation_score
```

#### 8. components/ProgressChart.tsx ⏳ TODO

**Changes:**
- Line 21: Change title to "Your English Speaking Progress"
- Lines 35, 46-78: Replace 0-9 scale with CEFR levels
- Remove "Part 1", "Part 2", "Part 3" legend

**New Y-axis:**
```typescript
yAxis={{
  type: 'category',
  categories: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  title: 'CEFR Level'
}}
```

#### 9. components/DashboardClient.tsx ⏳ TODO

**Simple text changes:**
- Line 113: "Track your IELTS Speaking improvement" → "Track your English speaking improvement"
- Replace any `overall_score` display with `overall_level`

#### 10. lib/ielts-scoring.ts ⏳ TODO

Add deprecation notice at top:
```typescript
/**
 * @deprecated This file contains legacy IELTS scoring logic.
 * New code should use lib/cefr-scoring.ts instead.
 * This file is kept for backward compatibility with old records only.
 */
```

#### 11. lib/vertex-ai.ts ⏳ TODO

Remove fallback `analyzeESLSpeech()` function (lines 294-308) if it exists and uses IELTS scoring.

## CEFR Feedback Templates

### Global Descriptors (from Cambridge ESOL)

**C2:** "Conveys finer shades of meaning precisely and naturally."

**C1:** "Shows fluent, spontaneous expression in clear, well-structured speech."

**B2:** "Expresses points of view without noticeable strain."

**B1:** "Relates comprehensibly the main points he/she wants to make."

**A2:** "Relates basic information on, e.g. work, family, free time etc."

**A1:** "Makes simple statements on personal details and very familiar topics."

### Criterion-Specific Examples

**Range (B2):**
"Has a sufficient range of language to be able to give clear descriptions, express viewpoints on most general topics, without much conspicuous searching for words."

**Accuracy (B2):**
"Shows a relatively high degree of grammatical control. Does not make errors which cause misunderstanding."

**Fluency (B2):**
"Can produce stretches of language with a fairly even tempo; although he/she can be hesitant as he or she searches for patterns and expressions, there are few noticeably long pauses."

**Interaction (B2):**
"Can initiate discourse, take his/her turn when appropriate and end conversation when he/she needs to."

**Coherence (B2):**
"Can use a limited number of cohesive devices to link his/her utterances into clear, coherent discourse."

## Testing Checklist

After completing all changes, verify:

- [ ] FeedbackDisplay shows 5 CEFR criteria (not 4 IELTS)
- [ ] No mentions of "band" or "Band" anywhere in UI
- [ ] No mentions of "IELTS" in user-facing text
- [ ] Progress chart shows CEFR levels (A1-C2), not 0-9 scale
- [ ] Recent sessions table has 5 columns for criteria
- [ ] Score displays show CEFR level strings (e.g., "B2"), not numbers
- [ ] Dashboard text uses "English" or "CEFR", not "IELTS"
- [ ] Database saves only CEFR fields for new sessions
- [ ] TypeScript build completes without errors
- [ ] Legacy sessions (with IELTS scores) still display correctly

## Reference Files

- **CEFR Scales PDF:** `/Users/comradeflats/Desktop/CEFR Scales.pdf`
- **CEFR Implementation:** `lib/cefr-scoring.ts`
- **Migration Plan:** `/Users/comradeflats/.claude/plans/squishy-forging-melody.md`
- **This Documentation:** `IELTS_TO_CEFR_MIGRATION.md`

## Total Files to Modify

**Core:** 3 files
- ✅ app/practice/page.tsx (DONE)
- ✅ lib/firestore-db.ts (PARTIAL)
- ⏳ app/api/analyze/route.ts

**Components:** 6 files (all pending)
- components/FeedbackDisplay.tsx
- components/DetailedFeedbackHeatmap.tsx
- components/ProgressChart.tsx
- components/ui/ScoreDisplay.tsx
- components/RecentSessionsList.tsx
- components/DashboardClient.tsx

**Libraries:** 2 files (all pending)
- lib/vertex-ai.ts
- lib/ielts-scoring.ts (deprecate)

**Total:** 11 files

## Estimated Time Remaining

- Phase 1 completion: ~10 minutes
- Phase 2 (components): ~30-40 minutes
- Phase 3 (testing): ~10 minutes

**Total:** ~50-60 minutes of focused work
