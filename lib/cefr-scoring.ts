/**
 * CEFR Speaking Assessment System
 * Based on Cambridge ESOL Speaking Assessment Criteria
 * (Common European Framework of Reference for Languages)
 */

// ============================================================================
// TYPES
// ============================================================================

export type CEFRLevel = 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1' | 'C1+' | 'C2';

export type CEFRCriterion = 'range' | 'accuracy' | 'fluency' | 'interaction' | 'coherence';

export interface CEFRAnalysis {
  overall_level: CEFRLevel;

  // 5 criteria levels
  range_level: CEFRLevel;
  accuracy_level: CEFRLevel;
  fluency_level: CEFRLevel;
  interaction_level: CEFRLevel;
  coherence_level: CEFRLevel;

  // Feedback per criterion (2-3 bullet points each)
  range_feedback: string[];
  accuracy_feedback: string[];
  fluency_feedback: string[];
  interaction_feedback: string[];
  coherence_feedback: string[];

  // Overall feedback
  strengths: string[];
  improvements: string[];
  detailed_feedback: DetailedFeedbackItem[];
  verbatim_transcript?: string;

  // Translated global descriptor (for non-English feedback)
  global_descriptor_translated?: string;
}

export interface DetailedFeedbackItem {
  phrase: string;
  issue: string;
  criterion: CEFRCriterion;
  severity: 'minor' | 'moderate' | 'major';
  suggestion: string;
}

// ============================================================================
// GLOBAL DESCRIPTORS (Table 5.4 from Cambridge ESOL CEFR document)
// ============================================================================

export const GLOBAL_DESCRIPTORS: Record<CEFRLevel, string> = {
  'C2': 'Conveys finer shades of meaning precisely and naturally. Can express him/herself spontaneously and very fluently, interacting with ease and skill, and differentiating finer shades of meaning precisely. Can produce clear, smoothly-flowing, well-structured descriptions.',

  'C1+': 'Shows fluent, spontaneous expression in clear, well-structured speech approaching C2 mastery.',

  'C1': 'Shows fluent, spontaneous expression in clear, well-structured speech. Can express him/herself fluently and spontaneously, almost effortlessly, with a smooth flow of language. Can give clear, detailed descriptions of complex subjects. High degree of accuracy; errors are rare.',

  'B2+': 'Expresses points of view without noticeable strain, approaching C1 fluency.',

  'B2': 'Expresses points of view without noticeable strain. Can interact on a wide range of topics and produce stretches of language with a fairly even tempo. Can give clear, detailed descriptions on a wide range of subjects related to his/her field of interest. Does not make errors which cause misunderstanding.',

  'B1+': 'Relates comprehensibly the main points approaching B2 proficiency.',

  'B1': 'Relates comprehensibly the main points he/she wants to make. Can keep going comprehensibly, even though pausing for grammatical and lexical planning and repair may be very evident. Can link discrete, simple elements into a connected sequence to give straightforward descriptions on a variety of familiar subjects within his/her field of interest. Reasonably accurate use of main repertoire associated with more predictable situations.',

  'A2+': 'Relates basic information approaching B1 competence.',

  'A2': 'Relates basic information on, e.g. work, family, free time etc. Can communicate in a simple and direct exchange of information on familiar matters. Can make him/herself understood in very short utterances, even though pauses, false starts and reformulation are very evident. Can describe in simple terms family, living conditions, educational background, present or most recent job. Uses some simple structures correctly, but may systematically make basic mistakes.',

  'A1+': 'Makes simple statements on personal details approaching A2.',

  'A1': 'Makes simple statements on personal details and very familiar topics. Can make him/herself understood in a simple way, asking and answering questions about personal details, provided the other person talks slowly and clearly and is prepared to help. Can manage very short, isolated, mainly pre-packaged utterances. Much pausing to search for expressions, to articulate less familiar words.',
};

// ============================================================================
// ANALYTIC DESCRIPTORS (Table 5.5 from Cambridge ESOL - 5 Criteria)
// ============================================================================

type CriterionDescriptors = Record<CEFRLevel, string>;

export const RANGE_DESCRIPTORS: CriterionDescriptors = {
  'C2': 'Shows great flexibility reformulating ideas in differing linguistic forms to convey finer shades of meaning precisely, to give emphasis, to differentiate and to eliminate ambiguity. Also has a good command of idiomatic expressions and colloquialisms.',

  'C1+': 'Has a good command of a broad range of language approaching C2 flexibility.',

  'C1': 'Has a good command of a broad range of language allowing him/her to select a formulation to express him/ herself clearly in an appropriate style on a wide range of general, academic, professional or leisure topics without having to restrict what he/she wants to say.',

  'B2+': 'Has a sufficient range of language approaching C1 breadth.',

  'B2': 'Has a sufficient range of language to be able to give clear descriptions, express viewpoints on most general topics, without much conspicuous searching for words, using some complex sentence forms to do so.',

  'B1+': 'Has enough language to get by approaching B2 range.',

  'B1': 'Has enough language to get by, with sufficient vocabulary to express him/herself with some hesitation and circumlocutions on topics such as family, hobbies and interests, work, travel, and current events.',

  'A2+': 'Uses basic sentence patterns approaching B1 range.',

  'A2': 'Uses basic sentence patterns with memorised phrases, groups of a few words and formulae in order to communicate limited information in simple everyday situations.',

  'A1+': 'Has a very basic repertoire of words approaching A2.',

  'A1': 'Has a very basic repertoire of words and simple phrases related to personal details and particular concrete situations.',
};

export const ACCURACY_DESCRIPTORS: CriterionDescriptors = {
  'C2': 'Maintains consistent grammatical control of complex language, even while attention is otherwise engaged (e.g. in forward planning, in monitoring others\' reactions).',

  'C1+': 'Consistently maintains a high degree of grammatical accuracy approaching perfect control.',

  'C1': 'Consistently maintains a high degree of grammatical accuracy; errors are rare, difficult to spot and generally corrected when they do occur.',

  'B2+': 'Shows a relatively high degree of grammatical control approaching C1 accuracy.',

  'B2': 'Shows a relatively high degree of grammatical control. Does not make errors which cause misunderstanding, and can correct most of his/her mistakes.',

  'B1+': 'Uses reasonably accurately a repertoire approaching B2 control.',

  'B1': 'Uses reasonably accurately a repertoire of frequently used "routines" and patterns associated with more predictable situations.',

  'A2+': 'Uses some simple structures correctly approaching B1 accuracy.',

  'A2': 'Uses some simple structures correctly, but still systematically makes basic mistakes.',

  'A1+': 'Shows only limited control approaching A2.',

  'A1': 'Shows only limited control of a few simple grammatical structures and sentence patterns in a memorised repertoire.',
};

export const FLUENCY_DESCRIPTORS: CriterionDescriptors = {
  'C2': 'Can express him/herself spontaneously at length with a natural colloquial flow, avoiding or backtracking around any difficulty so smoothly that the interlocutor is hardly aware of it.',

  'C1+': 'Can express him/herself fluently and spontaneously approaching effortless natural flow.',

  'C1': 'Can express him/herself fluently and spontaneously, almost effortlessly. Only a conceptually difficult subject can hinder a natural, smooth flow of language.',

  'B2+': 'Can produce stretches of language approaching C1 fluency.',

  'B2': 'Can produce stretches of language with a fairly even tempo; although he/she can be hesitant as he or she searches for patterns and expressions, there are few noticeably long pauses.',

  'B1+': 'Can keep going comprehensibly approaching B2 tempo.',

  'B1': 'Can keep going comprehensibly, even though pausing for grammatical and lexical planning and repair is very evident, especially in longer stretches of free production.',

  'A2+': 'Can make him/herself understood in very short utterances approaching B1.',

  'A2': 'Can make him/herself understood in very short utterances, even though pauses, false starts and reformulation are very evident.',

  'A1+': 'Can manage very short, isolated, mainly pre-packaged utterances approaching A2.',

  'A1': 'Can manage very short, isolated, mainly pre-packaged utterances, with much pausing to search for expressions, to articulate less familiar words, and to repair communication.',
};

export const INTERACTION_DESCRIPTORS: CriterionDescriptors = {
  'C2': 'Can interact with ease and skill, using non-verbal and intonational cues apparently effortlessly. Can interweave his/her contribution into the joint discourse with fully natural turntaking, referencing, allusion making etc.',

  'C1+': 'Can select a suitable phrase from a readily available range approaching effortless interaction.',

  'C1': 'Can select a suitable phrase from a readily available range of discourse functions to preface his/her remarks in order to get or to keep the floor and to relate his/her own contributions skilfully to those of other speakers.',

  'B2+': 'Can initiate discourse, take his/her turn when appropriate approaching C1 skill.',

  'B2': 'Can initiate discourse, take his/her turn when appropriate and end conversation when he/she needs to, though he/she may not always do this elegantly. Can help the discussion along on familiar ground confirming comprehension, inviting others in, etc.',

  'B1+': 'Can initiate, maintain and close simple face-to-face conversation approaching B2 competence.',

  'B1': 'Can initiate, maintain and close simple face-to-face conversation on topics that are familiar or of personal interest. Can repeat back part of what someone has said to confirm mutual understanding.',

  'A2+': 'Can ask and answer questions and respond to simple statements approaching B1.',

  'A2': 'Can ask and answer questions and respond to simple statements. Can indicate when he/she is following but is rarely able to understand enough to keep conversation going of his/her own accord.',

  'A1+': 'Can ask and answer questions about personal details approaching A2.',

  'A1': 'Can ask and answer questions about personal details. Can interact in a simple way but communication is totally dependent on repetition, rephrasing and repair.',
};

export const COHERENCE_DESCRIPTORS: CriterionDescriptors = {
  'C2': 'Can create coherent and cohesive discourse making full and appropriate use of a variety of organisational patterns and a wide range of connectors and other cohesive devices.',

  'C1+': 'Can produce clear, smoothly flowing, well-structured speech approaching perfect coherence.',

  'C1': 'Can produce clear, smoothly flowing, well-structured speech, showing controlled use of organisational patterns, connectors and cohesive devices.',

  'B2+': 'Can use a limited number of cohesive devices approaching C1 structure.',

  'B2': 'Can use a limited number of cohesive devices to link his/her utterances into clear, coherent discourse, though there may be some "jumpiness" in a long contribution.',

  'B1+': 'Can link a series of shorter, discrete elements approaching B2 coherence.',

  'B1': 'Can link a series of shorter, discrete simple elements into a connected, linear sequence of points.',

  'A2+': 'Can link groups of words with simple connectors approaching B1.',

  'A2': 'Can link groups of words with simple connectors like "and", "but" and "because".',

  'A1+': 'Can link words or groups of words approaching A2.',

  'A1': 'Can link words or groups of words with very basic linear connectors like "and" or "then".',
};

// ============================================================================
// LEVEL CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert CEFR level to numeric value for calculations
 * A1=1, A1+=1.5, A2=2, A2+=2.5, B1=3, B1+=3.5, B2=4, B2+=4.5, C1=5, C1+=5.5, C2=6
 */
export function cefrToNumeric(level: CEFRLevel): number {
  const mapping: Record<CEFRLevel, number> = {
    'A1': 1,
    'A1+': 1.5,
    'A2': 2,
    'A2+': 2.5,
    'B1': 3,
    'B1+': 3.5,
    'B2': 4,
    'B2+': 4.5,
    'C1': 5,
    'C1+': 5.5,
    'C2': 6,
  };
  return mapping[level] || 0;
}

/**
 * Convert numeric value to CEFR level
 */
export function numericToCefr(num: number): CEFRLevel {
  if (num <= 1) return 'A1';
  if (num <= 1.5) return 'A1+';
  if (num <= 2) return 'A2';
  if (num <= 2.5) return 'A2+';
  if (num <= 3) return 'B1';
  if (num <= 3.5) return 'B1+';
  if (num <= 4) return 'B2';
  if (num <= 4.5) return 'B2+';
  if (num <= 5) return 'C1';
  if (num <= 5.5) return 'C1+';
  return 'C2';
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate overall CEFR level from 5 criteria
 * Uses weighted average favoring communication effectiveness (range, fluency, interaction)
 */
export function calculateOverallLevel(
  range: CEFRLevel,
  accuracy: CEFRLevel,
  fluency: CEFRLevel,
  interaction: CEFRLevel,
  coherence: CEFRLevel
): CEFRLevel {
  // Convert to numeric
  const rangeNum = cefrToNumeric(range);
  const accuracyNum = cefrToNumeric(accuracy);
  const fluencyNum = cefrToNumeric(fluency);
  const interactionNum = cefrToNumeric(interaction);
  const coherenceNum = cefrToNumeric(coherence);

  // Weighted average: emphasize communication (range, fluency, interaction) slightly more
  const weights = {
    range: 1.2,
    accuracy: 1.0,
    fluency: 1.2,
    interaction: 1.1,
    coherence: 1.0,
  };

  const weightedSum =
    rangeNum * weights.range +
    accuracyNum * weights.accuracy +
    fluencyNum * weights.fluency +
    interactionNum * weights.interaction +
    coherenceNum * weights.coherence;

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const average = weightedSum / totalWeight;

  // Round to nearest 0.5 and convert back
  const rounded = Math.round(average * 2) / 2;
  return numericToCefr(rounded);
}

// ============================================================================
// DESCRIPTOR RETRIEVAL FUNCTIONS
// ============================================================================

export function getGlobalDescriptor(level: CEFRLevel): string {
  return GLOBAL_DESCRIPTORS[level] || 'No descriptor available';
}

export function getCriterionDescriptor(
  criterion: CEFRCriterion,
  level: CEFRLevel
): string {
  const descriptors = {
    range: RANGE_DESCRIPTORS,
    accuracy: ACCURACY_DESCRIPTORS,
    fluency: FLUENCY_DESCRIPTORS,
    interaction: INTERACTION_DESCRIPTORS,
    coherence: COHERENCE_DESCRIPTORS,
  };

  return descriptors[criterion][level] || 'No descriptor available';
}

// ============================================================================
// IMPROVEMENT PATH FUNCTIONS
// ============================================================================

export function getNextLevel(currentLevel: CEFRLevel): CEFRLevel | null {
  const levels: CEFRLevel[] = ['A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+', 'C2'];
  const currentIndex = levels.indexOf(currentLevel);

  if (currentIndex === -1 || currentIndex === levels.length - 1) {
    return null; // Already at C2
  }

  return levels[currentIndex + 1];
}

export function getImprovementPath(currentLevel: CEFRLevel): {
  nextLevel: CEFRLevel | null;
  focusAreas: string[];
} {
  const nextLevel = getNextLevel(currentLevel);

  if (!nextLevel) {
    return {
      nextLevel: null,
      focusAreas: [
        'Maintain your C2 proficiency through regular practice',
        'Focus on specialized vocabulary in new domains',
        'Refine nuanced expression and cultural understanding',
      ],
    };
  }

  // Define focus areas for each level progression
  const focusAreasByLevel: Record<string, string[]> = {
    'A1→A1+': [
      'Build basic vocabulary for daily routines',
      'Practice simple present tense consistently',
      'Work on pronunciation of common words',
    ],
    'A1+→A2': [
      'Expand vocabulary to 500-1000 words',
      'Introduce simple past tense',
      'Practice asking and answering questions',
    ],
    'A2→A2+': [
      'Link simple sentences with "and", "but", "because"',
      'Describe past experiences in more detail',
      'Improve listening comprehension in conversations',
    ],
    'A2+→B1': [
      'Expand vocabulary for expressing opinions',
      'Practice different tenses (present, past, future)',
      'Work on conversation flow and turn-taking',
    ],
    'B1→B1+': [
      'Reduce hesitation when speaking',
      'Use more complex sentence structures',
      'Develop topic-specific vocabulary',
    ],
    'B1+→B2': [
      'Speak with more even tempo and fewer pauses',
      'Use discourse markers (however, therefore, furthermore)',
      'Express viewpoints clearly without strain',
    ],
    'B2→B2+': [
      'Minimize errors that cause misunderstanding',
      'Expand range of discourse functions',
      'Improve coherence in longer speech',
    ],
    'B2+→C1': [
      'Develop near-effortless fluency',
      'Master complex grammatical structures',
      'Use a wide range of organizational patterns',
    ],
    'C1→C1+': [
      'Refine precision in conveying subtle meanings',
      'Perfect control of grammatical structures',
      'Master idiomatic expressions naturally',
    ],
    'C1+→C2': [
      'Achieve complete naturalness and ease',
      'Perfect cohesive device usage',
      'Master all shades of meaning and nuance',
    ],
  };

  const key = `${currentLevel}→${nextLevel}`;
  const focusAreas = focusAreasByLevel[key] || [
    'Continue regular speaking practice',
    'Expand vocabulary in new areas',
    'Focus on accuracy and fluency balance',
  ];

  return { nextLevel, focusAreas };
}

// ============================================================================
// CRITERION HELPERS
// ============================================================================

export function getCriterionDisplayName(criterion: CEFRCriterion): string {
  const names: Record<CEFRCriterion, string> = {
    range: 'Range (Vocabulary)',
    accuracy: 'Accuracy (Grammar)',
    fluency: 'Fluency',
    interaction: 'Interaction',
    coherence: 'Coherence',
  };
  return names[criterion];
}

export function getCriterionColor(criterion: CEFRCriterion): string {
  const colors: Record<CEFRCriterion, string> = {
    range: 'purple',
    accuracy: 'red',
    fluency: 'blue',
    interaction: 'green',
    coherence: 'orange',
  };
  return colors[criterion];
}
