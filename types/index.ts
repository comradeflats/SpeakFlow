export interface PracticeSession {
  id: string;
  createdAt: Date;
  part: "1" | "2" | "3";
  transcript: string;
  audioUrl?: string;
  analysis: {
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
  };
  question: string;
}

export interface UserProgress {
  userId: string;
  sessions: PracticeSession[];
  averageScore: number;
  partScores: {
    part1: number[];
    part2: number[];
    part3: number[];
  };
  totalPracticeMinutes: number;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface TestStructure {
  part: "1" | "2" | "3";
  name: string;
  duration: string;
  description: string;
  questionCount: number;
  isActive: boolean;
}

export interface FeedbackPoint {
  criterion: string;
  score: number;
  feedback: string;
  examples: string[];
  nextSteps: string[];
}
