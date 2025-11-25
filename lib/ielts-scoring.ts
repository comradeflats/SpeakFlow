// IELTS Band Score Calculator
// Each criteria is scored 0-9, with descriptors based on official IELTS criteria

export interface IELTSAnalysis {
  fluencyScore: number;
  lexicalScore: number;
  grammarScore: number;
  pronunciationScore: number;
  overallScore: number;
  fluencyFeedback: string;
  lexicalFeedback: string;
  grammarFeedback: string;
  pronunciationFeedback: string;
  improvements: string[];
  strengths: string[];
}

export const calculateOverallScore = (
  fluency: number,
  lexical: number,
  grammar: number,
  pronunciation: number
): number => {
  // IELTS overall score is the average of all four criteria
  const average = (fluency + lexical + grammar + pronunciation) / 4;
  // Round to nearest 0.5
  return Math.round(average * 2) / 2;
};

export const getBandDescription = (score: number): string => {
  if (score >= 9)
    return "Expert User - Uses the language fluently, flexibly and at length";
  if (score >= 8)
    return "Very Good User - Uses the language very well though there may be occasional inaccuracies";
  if (score >= 7)
    return "Good User - Uses the language with confidence and mostly correctly";
  if (score >= 6)
    return "Competent User - Uses language adequately for most situations";
  if (score >= 5)
    return "Modest User - Can use the language for routine situations";
  if (score >= 4)
    return "Limited User - Basic competence but many limitations";
  if (score >= 3)
    return "Extremely Limited User - Conveys only basic meaning";
  if (score >= 2) return "Intermittent User - Difficulty communicating";
  return "Non User - Essentially no ability to use the language";
};

export const getBandImprovementPath = (
  currentBand: number
): { nextBand: number; focusAreas: string[] } => {
  const focusMap: { [key: number]: string[] } = {
    5: [
      "Increase speech rate (aim for 140+ WPM)",
      "Reduce hesitations and filler words",
      "Use more complex sentence structures",
      "Improve vocabulary range with synonyms",
      "Work on word stress and intonation",
    ],
    6: [
      "Master discourse markers (however, moreover, furthermore)",
      "Use a wider range of collocations",
      "Reduce grammatical errors to <5%",
      "Improve clarity of consonant sounds",
      "Add more detail and examples to responses",
    ],
    7: [
      "Achieve native-like fluency with minimal hesitation",
      "Use advanced vocabulary and less common idioms",
      "Master complex grammatical structures",
      "Perfect connected speech and linking",
      "Provide sophisticated reasoning and examples",
    ],
    8: [
      "Demonstrate exceptional control of language",
      "Use nuanced vocabulary appropriately",
      "Show exceptional grammatical accuracy",
      "Achieve near-native pronunciation",
      "Provide highly organized and coherent responses",
    ],
  };

  return {
    nextBand: Math.min(currentBand + 0.5, 9),
    focusAreas: focusMap[Math.floor(currentBand)] || focusMap[5],
  };
};

// Scoring rubrics based on official IELTS criteria
export const scoreFluentSpeaker = (metadata: {
  wordsPerMinute: number;
  hesitationCount: number;
  pauseDuration: number;
  discourseMarkers: number;
  selfCorrections: number;
}): number => {
  let score = 5; // Start with modest user

  // Speech rate (target 140-180 WPM)
  if (metadata.wordsPerMinute >= 180) score = 8;
  else if (metadata.wordsPerMinute >= 160) score = 7;
  else if (metadata.wordsPerMinute >= 140) score = 6;
  else if (metadata.wordsPerMinute >= 120) score = 5;

  // Adjust for hesitations and pauses
  if (metadata.hesitationCount > 5) score = Math.max(score - 1, 4);
  if (metadata.pauseDuration > 2) score = Math.max(score - 1, 4);

  // Bonus for discourse markers
  if (metadata.discourseMarkers > 5) score = Math.min(score + 1, 9);

  // Penalty for excessive self-corrections
  if (metadata.selfCorrections > 10) score = Math.max(score - 1, 4);

  return Math.min(score, 9);
};

export const scoreLexicalResource = (metadata: {
  vocabularyDiversity: number; // Type-Token Ratio (0-1)
  advancedVocabularyCount: number;
  totalWords: number;
  collocationAccuracy: number; // 0-1
  paraphrasingAttempts: number;
}): number => {
  let score = 5;

  // Vocabulary diversity (TTR)
  if (metadata.vocabularyDiversity > 0.6) score = 8;
  else if (metadata.vocabularyDiversity > 0.5) score = 7;
  else if (metadata.vocabularyDiversity > 0.4) score = 6;

  // Advanced vocabulary percentage
  const advancedPercent = metadata.advancedVocabularyCount / metadata.totalWords;
  if (advancedPercent > 0.3) score = Math.min(score + 1, 9);
  else if (advancedPercent < 0.1) score = Math.max(score - 1, 4);

  // Collocation accuracy
  if (metadata.collocationAccuracy > 0.8) score = Math.min(score + 1, 9);
  else if (metadata.collocationAccuracy < 0.5) score = Math.max(score - 1, 4);

  // Paraphrasing ability
  if (metadata.paraphrasingAttempts >= 3) score = Math.min(score + 1, 9);

  return Math.min(score, 9);
};

export const scoreGrammaticalRange = (metadata: {
  errorDensity: number; // errors per 100 words
  complexSentenceRatio: number; // 0-1
  tenseVariety: number; // count of different tenses used
  sentenceVariety: string[]; // types: simple, compound, complex
}): number => {
  let score = 5;

  // Error density (target <2 errors per 100 words)
  if (metadata.errorDensity < 1) score = 8;
  else if (metadata.errorDensity < 2) score = 7;
  else if (metadata.errorDensity < 4) score = 6;
  else if (metadata.errorDensity < 6) score = 5;
  else score = 4;

  // Complex sentence usage
  if (metadata.complexSentenceRatio > 0.4) score = Math.min(score + 1, 9);
  else if (metadata.complexSentenceRatio < 0.1) score = Math.max(score - 1, 4);

  // Tense variety
  if (metadata.tenseVariety >= 5) score = Math.min(score + 1, 9);

  // Sentence variety
  const uniqueTypes = new Set(metadata.sentenceVariety).size;
  if (uniqueTypes < 2) score = Math.max(score - 1, 4);

  return Math.min(score, 9);
};

export const scorePronunciation = (metadata: {
  clarity: number; // 0-1 intelligibility
  wordStressAccuracy: number; // 0-1
  sentenceStressAccuracy: number; // 0-1
  intonationAccuracy: number; // 0-1
  accentStrength: number; // 0-1 (0 = no accent, 1 = heavy accent)
}): number => {
  let score = 5;

  // Overall clarity
  if (metadata.clarity > 0.9) score = 8;
  else if (metadata.clarity > 0.8) score = 7;
  else if (metadata.clarity > 0.7) score = 6;

  // Word stress
  if (metadata.wordStressAccuracy > 0.8) score = Math.min(score + 1, 9);
  else if (metadata.wordStressAccuracy < 0.5) score = Math.max(score - 1, 4);

  // Sentence stress and intonation
  const prosodyAccuracy = (metadata.sentenceStressAccuracy + metadata.intonationAccuracy) / 2;
  if (prosodyAccuracy > 0.8) score = Math.min(score + 1, 9);
  else if (prosodyAccuracy < 0.5) score = Math.max(score - 1, 4);

  // Accent (slight accent is acceptable at higher bands)
  if (metadata.accentStrength > 0.7 && score > 5) score = Math.max(score - 1, 5);

  return Math.min(score, 9);
};

// Feedback templates
export const generateFeedbackSuggestions = (analysis: IELTSAnalysis): string[] => {
  const suggestions: string[] = [];

  // Fluency suggestions
  if (analysis.fluencyScore < 7) {
    suggestions.push(
      "Practice speaking more continuously - aim for 2-3 minute stretches without long pauses"
    );
    suggestions.push("Record yourself and listen for hesitations - replace 'uh/um' with silent pauses");
    suggestions.push("Use discourse markers: 'Well', 'In fact', 'As a matter of fact' to maintain flow");
  }

  // Lexical suggestions
  if (analysis.lexicalScore < 7) {
    suggestions.push(
      "Learn synonyms for common words - e.g., instead of 'good', use 'excellent', 'remarkable', 'outstanding'"
    );
    suggestions.push(
      "Practice using collocations - word pairs that naturally go together like 'make a difference', 'play a role'"
    );
    suggestions.push("Study topic-specific vocabulary for common IELTS topics (environment, technology, culture)");
  }

  // Grammar suggestions
  if (analysis.grammarScore < 7) {
    suggestions.push(
      "Practice using complex sentences - combine clauses with 'although', 'whereas', 'despite the fact that'"
    );
    suggestions.push("Focus on tense consistency - decide on your time perspective and maintain it");
    suggestions.push("Review common errors: subject-verb agreement, article use (a/the), prepositions");
  }

  // Pronunciation suggestions
  if (analysis.pronunciationScore < 7) {
    suggestions.push("Work on word stress - use a dictionary to mark stress and practice specific words");
    suggestions.push(
      "Practice connected speech - linking (t+vowel), elision (dropping sounds), assimilation (sound changes)"
    );
    suggestions.push("Record yourself and compare with native speakers - focus on rhythm and intonation patterns");
  }

  return suggestions;
};
