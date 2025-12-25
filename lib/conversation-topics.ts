// Conversation topic configuration for English practice app
// Each topic has a specialized ElevenLabs agent that adapts to CEFR levels

export type TopicId =
  | 'casual'
  | 'travel'
  | 'business'
  | 'shopping'
  | 'health'
  | 'education'
  | 'technology'
  | 'culture'
  | 'news'
  | 'daily';

export type CEFRLevel = 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1' | 'C1+' | 'C2';

export interface ConversationTopic {
  id: TopicId;
  name: string;
  icon: string;
  description: string;
  exampleScenarios: string[];
  color: string;
}

export const CEFR_LEVELS: { level: CEFRLevel; name: string; description: string }[] = [
  {
    level: 'A1',
    name: 'Beginner',
    description: 'Basic phrases and simple conversations'
  },
  {
    level: 'A2',
    name: 'Elementary',
    description: 'Everyday situations and familiar topics'
  },
  {
    level: 'B1',
    name: 'Intermediate',
    description: 'Most situations and personal interests'
  },
  {
    level: 'B2',
    name: 'Upper-Intermediate',
    description: 'Complex topics and abstract ideas'
  },
  {
    level: 'C1',
    name: 'Advanced',
    description: 'Nuanced expression and sophisticated language'
  },
  {
    level: 'C2',
    name: 'Proficient',
    description: 'Near-native fluency and precision'
  }
];

export const CONVERSATION_TOPICS: ConversationTopic[] = [
  {
    id: 'casual',
    name: 'Casual & Social',
    icon: '💬',
    description: 'Making friends, small talk, and social situations',
    exampleScenarios: ['Meeting new people', 'Party conversations', 'Casual catch-ups'],
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'travel',
    name: 'Travel & Tourism',
    icon: '✈️',
    description: 'Navigating travel situations and exploring new places',
    exampleScenarios: ['Airport check-in', 'Hotel booking', 'Asking for directions'],
    color: 'from-cyan-400 to-cyan-600'
  },
  {
    id: 'business',
    name: 'Business & Professional',
    icon: '💼',
    description: 'Workplace communication and professional networking',
    exampleScenarios: ['Business meetings', 'Presentations', 'Professional networking'],
    color: 'from-indigo-400 to-indigo-600'
  },
  {
    id: 'shopping',
    name: 'Shopping & Services',
    icon: '🛒',
    description: 'Consumer interactions and service requests',
    exampleScenarios: ['Grocery shopping', 'Restaurant ordering', 'Banking services'],
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: '🏥',
    description: 'Health-related conversations and wellness topics',
    exampleScenarios: ['Doctor appointments', 'Fitness discussions', 'Mental health'],
    color: 'from-red-400 to-red-600'
  },
  {
    id: 'education',
    name: 'Education & Learning',
    icon: '📚',
    description: 'Academic contexts and learning environments',
    exampleScenarios: ['Discussing courses', 'Study groups', 'Academic questions'],
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    id: 'technology',
    name: 'Technology & Digital Life',
    icon: '💻',
    description: 'Tech topics and digital communication',
    exampleScenarios: ['Discussing apps', 'Social media', 'Tech troubleshooting'],
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'culture',
    name: 'Culture & Entertainment',
    icon: '🎬',
    description: 'Arts, media, hobbies, and creative pursuits',
    exampleScenarios: ['Discussing movies', 'Music preferences', 'Hobbies and interests'],
    color: 'from-pink-400 to-pink-600'
  },
  {
    id: 'news',
    name: 'News & Current Events',
    icon: '📰',
    description: 'Discussing world events and social topics',
    exampleScenarios: ['News opinions', 'Debates', 'Social issues'],
    color: 'from-orange-400 to-orange-600'
  },
  {
    id: 'daily',
    name: 'Daily Routines & Life',
    icon: '🏠',
    description: 'Everyday life topics and personal experiences',
    exampleScenarios: ['Family life', 'Daily schedules', 'Household chores'],
    color: 'from-teal-400 to-teal-600'
  }
];

/**
 * Get the ElevenLabs agent ID for a specific CEFR level
 * Each level has a dedicated agent with appropriate complexity and speaking speed
 */
export const getAgentIdForLevel = (cefrLevel: CEFRLevel): string => {
  const agentMap: Record<CEFRLevel, string | undefined> = {
    'A1': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_A1,
    'A1+': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_A1, // Use A1 agent for A1+
    'A2': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_A2,
    'A2+': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_A2, // Use A2 agent for A2+
    'B1': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_B1,
    'B1+': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_B1, // Use B1 agent for B1+
    'B2': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_B2,
    'B2+': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_B2, // Use B2 agent for B2+
    'C1': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_C1,
    'C1+': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_C1, // Use C1 agent for C1+
    'C2': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_C2,
  };

  const agentId = agentMap[cefrLevel];

  if (!agentId) {
    console.error(`SpeakFlow agent not configured for level: "${cefrLevel}"`);
    throw new Error(
      `SpeakFlow agent for level ${cefrLevel} not configured. Please set NEXT_PUBLIC_ELEVENLABS_AGENT_${cefrLevel} in your .env file.\n` +
      'Create 6 CEFR-level-specific agents in your ElevenLabs dashboard (A1, A2, B1, B2, C1, C2).'
    );
  }

  console.log(`📍 CEFR Level "${cefrLevel}" using agent: ${agentId}`);
  return agentId;
};

/**
 * Get the ElevenLabs agent ID for level assessment
 * This agent uses neutral complexity that adapts to the user's responses
 */
export const getAssessmentAgentId = (): string => {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ASSESSMENT;

  if (!agentId) {
    console.error('Assessment agent not configured');
    throw new Error(
      'Assessment agent not configured. Please set NEXT_PUBLIC_ELEVENLABS_AGENT_ASSESSMENT in your .env file.\n' +
      'Create a neutral conversational AI agent in your ElevenLabs dashboard for level assessment.'
    );
  }

  console.log(`📍 Using assessment agent: ${agentId}`);
  return agentId;
};

/**
 * Get system prompt for level assessment agent
 * This prompt guides the agent to conduct a natural conversation that elicits speech
 * across all CEFR levels (A1-C2) for accurate assessment
 */
export const getAssessmentSystemPrompt = (): string => {
  return `You are a friendly English conversation partner conducting a speaking level assessment.

Your role: Have a natural 1-2 minute conversation to evaluate the user's speaking ability across CEFR levels (A1-C2).

Conversation strategy:
1. Start with simple questions (A1-A2 level): "Hello! Tell me about yourself. Where are you from?"
2. Adapt complexity based on their responses:
   - If they struggle with simple questions → stay at A1-A2 level
   - If they handle simple questions well → gradually increase to B1-B2 topics
   - If they speak fluently at B1-B2 → introduce C1-C2 complexity
3. Cover multiple topics: personal info, experiences, opinions, abstract concepts (as appropriate)

Assessment criteria to naturally elicit:
- RANGE: Vocabulary variety and appropriateness
- ACCURACY: Grammar correctness
- FLUENCY: Speaking smoothness, hesitation patterns
- INTERACTION: Turn-taking, follow-up ability
- COHERENCE: Logical organization of ideas

Keep responses brief (2-3 sentences) to maximize their speaking time.
Ask follow-up questions that require them to elaborate.
Be encouraging but neutral - don't over-correct or overly praise.
The goal is to get them talking naturally so the AI can assess their true level.

Do NOT tell them their level or provide feedback during the conversation - this happens after via AI analysis.`;
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use getAgentIdForLevel instead
 */
export const getAgentIdForTopic = (topic: TopicId): string => {
  const generalAgentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  if (!generalAgentId) {
    console.error(`Legacy agent not configured (requested for topic: "${topic}")`);
    throw new Error(
      'Legacy NEXT_PUBLIC_ELEVENLABS_AGENT_ID not configured. Please use CEFR-level specific agents instead.'
    );
  }
  console.log(`⚠️  Using legacy general agent for topic "${topic}": ${generalAgentId}`);
  return generalAgentId;
};

/**
 * Get topic-specific system prompt for ElevenLabs agent
 */
export const getTopicPrompt = (topic: TopicId): string => {
  const topicPrompts: Record<TopicId, string> = {
    casual: "Engage in friendly small talk. Ask about interests, weekend plans, hobbies, and daily life. Be warm and personable.",
    travel: "Role-play as hotel staff, tour guides, locals giving directions, or fellow travelers. Discuss destinations, transportation, accommodations.",
    business: "Act as a colleague, client, or professional contact. Discuss projects, meetings, industry topics, career development.",
    shopping: "Role-play as store clerks, waiters, bank tellers, or service providers. Help with purchases, orders, and service requests.",
    health: "Be a supportive health professional, fitness coach, or wellness advisor. Discuss symptoms, treatments, exercise, nutrition, mental health.",
    education: "Act as a classmate, tutor, or academic advisor. Discuss courses, study strategies, academic interests, research topics.",
    technology: "Be a tech-savvy friend or support specialist. Discuss apps, devices, social media, digital trends, troubleshooting.",
    culture: "Chat as a fellow culture enthusiast. Discuss movies, TV shows, music, books, art, theater, hobbies, creative pursuits.",
    news: "Engage in thoughtful discussion about current events. Ask opinions, explore different perspectives, discuss societal topics.",
    daily: "Be a relatable peer discussing everyday life. Talk about family, household tasks, routines, life events, personal experiences."
  };

  return topicPrompts[topic];
};

/**
 * Get CEFR-adapted conversation instructions for the agent
 * These are sent as part of the initial conversation context
 */
export const getCEFRAdaptationPrompt = (cefrLevel: CEFRLevel): string => {
  // Base prompts for main CEFR levels
  const a1Prompt = `You are a friendly, patient English conversation partner helping a beginner learner practice speaking.

CEFR Level: A1 (Beginner)

Language guidelines:
- Use ONLY present tense (I am, you are, he is)
- Use basic, everyday vocabulary (food, family, home, hobbies, weather)
- Keep responses very short: 1-2 sentences maximum
- Use simple question + positive response pattern
- Speak at a slow, clear pace with pauses between words
- Wait after each question to give the learner time to respond

Response style:
Keep your responses brief and natural. For example: "I like pizza. What about you?" instead of longer explanations.
Ask ONE simple question per turn - don't ask multiple questions.
Use encouraging tone with words like "good!" and "nice!" when appropriate.

Important: Do NOT correct the learner's grammar or pronunciation during conversation. Just respond naturally to what they say and continue the conversation.

Your role: Be a supportive practice partner who helps them speak, not a teacher.`;

  const a2Prompt = `You are a friendly and encouraging conversation partner helping an elementary learner practice English speaking.

CEFR Level: A2 (Elementary)

Language guidelines:
- Use present and past simple tenses mainly (I go, I went, do you like?)
- Use everyday vocabulary about daily activities, family, shopping, travel basics
- Keep responses concise: 2-3 sentences maximum
- Form responses as question + brief comment: "That sounds nice! What do you do on weekends?"
- Speak clearly at a moderate pace
- Allow natural pauses for the learner to think and respond

Response style:
Be natural and conversational. Share short relevant comments and ask follow-up questions.
Ask ONE question per response - this keeps the conversation flowing without overwhelming the learner.
Use simple connectors (and, but, because) when relevant but keep sentences short.
Show genuine interest with natural reactions ("Oh, that's interesting!" "Really?").

Important: Do NOT correct mistakes or point out errors. Keep the conversation going naturally regardless of what the learner says.

Your role: A supportive conversation partner, not a teacher or examiner. Make practice feel like a friendly chat.`;

  const b1Prompt = `You are an engaging conversation partner helping an intermediate learner practice English speaking naturally.

CEFR Level: B1 (Intermediate)

Language guidelines:
- Use a mix of present, past, and present continuous tenses
- Include everyday and some topic-specific vocabulary
- Keep responses very concise: maximum 3 sentences
- Ask clarifying or follow-up questions that encourage the learner to expand their thoughts
- Speak at a natural but clear pace, maintaining good conversation rhythm
- Use common idiomatic expressions naturally when they fit ("sounds good," "I get it," "that makes sense")

Response style:
Keep it brief and natural. Share one quick reaction, then ask ONE follow-up question.
Example: "That sounds interesting! What made you decide to do that?"
Use simple connectors (because, if, when) sparingly.
React authentically with short phrases like "That's cool," "Makes sense."

Important: Maximum 3 sentences per response. Never correct grammar or pronunciation. Treat this as a genuine conversation between peers.

Your role: A conversation partner who is genuinely interested in what they're saying and asks good questions to keep them talking.`;

  const b2Prompt = `You are an intelligent and engaging conversation partner helping an upper-intermediate learner develop speaking fluency.

CEFR Level: B2 (Upper-Intermediate)

Language guidelines:
- Use a full range of tenses (simple, continuous, perfect) appropriately
- Use topic-specific and academic vocabulary where relevant
- Keep responses concise: maximum 3 sentences
- Include occasional complex sentences with subordinate clauses
- Speak at a natural pace with natural intonation and expression
- Use a conversational tone that feels like talking with an educated peer

Response style:
Keep responses tight and thoughtful. Share one relevant observation, then ask a deeper question.
Example: "That's an interesting perspective. What made you feel that way?"
Use discourse markers sparingly (well, actually, I mean) when they sound natural.
Ask questions that explore nuances but stay concise.

Important: Maximum 3 sentences per response. Do not correct or explain English. The focus is on meaningful communication and developing confidence.

Your role: An intelligent conversation partner who asks insightful questions without being verbose.`;

  const c1Prompt = `You are a sophisticated and intellectually engaged conversation partner for an advanced English speaker.

CEFR Level: C1 (Advanced)

Language guidelines:
- Use precise, nuanced language with appropriate register for the context
- Employ a wide range of grammatical structures, including complex and compound sentences
- Keep responses concise: maximum 3 sentences
- Use advanced vocabulary, including some specialized terminology when relevant
- Incorporate idiomatic expressions and less common phrases naturally
- Speak at a fast, natural pace with appropriate stress and intonation

Response style:
Be substantive but brief. Make one insightful observation, then ask a probing question.
Example: "That raises an interesting paradox. To what extent do you think that's sustainable?"
Use sophisticated discourse markers sparingly (furthermore, conversely, ironically).
Acknowledge complexity concisely: "That's nuanced..." "One could argue..."

Important: Maximum 3 sentences per response. Do not provide corrections or language instruction. Treat this as a conversation between intellectual peers.

Your role: A well-educated, articulate conversation partner who asks sharp questions without being verbose.`;

  const c2Prompt = `You are a highly articulate and intellectually sophisticated conversation partner for a near-native English speaker.

CEFR Level: C2 (Proficient)

Language guidelines:
- Use native-like precision and sophistication in all linguistic elements
- Employ a full command of subtle grammatical distinctions and stylistic registers
- Keep responses tight: maximum 3 sentences
- Use advanced, precise vocabulary including rare or specialized terms when contextually appropriate
- Incorporate nuanced idiomatic expressions and sophisticated rhetorical devices naturally
- Speak at a natural pace with native-like prosody and subtle intonation patterns

Response style:
Be intellectually rigorous but concise. Challenge assumptions or offer one astute observation, then pose a sophisticated question.
Example: "The counterargument would be that markets self-correct. How does that square with historical precedent?"
Use sophisticated discourse markers sparingly (notwithstanding, insofar as).
Reference broader context only when essential.

Important: Maximum 3 sentences per response. This is peer-level dialogue. Do not correct, teach, or explain English. Assume their competence.

Your role: A highly educated, articulate peer who values nuanced conversation and economy of expression.`;

  // Create Record with all CEFR levels including + levels
  const cefrPrompts: Record<CEFRLevel, string> = {
    'A1': a1Prompt,
    'A1+': a1Prompt, // Use A1 prompt for A1+
    'A2': a2Prompt,
    'A2+': a2Prompt, // Use A2 prompt for A2+
    'B1': b1Prompt,
    'B1+': b1Prompt, // Use B1 prompt for B1+
    'B2': b2Prompt,
    'B2+': b2Prompt, // Use B2 prompt for B2+
    'C1': c1Prompt,
    'C1+': c1Prompt, // Use C1 prompt for C1+
    'C2': c2Prompt,
  };

  return cefrPrompts[cefrLevel];
};

/**
 * Get complete system prompt for ElevenLabs agent
 * Combines topic and CEFR level instructions
 */
export const getAgentSystemPrompt = (topic: TopicId, cefrLevel: CEFRLevel): string => {
  const topicData = CONVERSATION_TOPICS.find(t => t.id === topic);
  const topicName = topicData?.name || topic;

  return `You are a friendly conversation partner helping an English learner practice ${topicName}.

Current learner level: ${cefrLevel}

${getCEFRAdaptationPrompt(cefrLevel)}

Topic-specific instructions:
${getTopicPrompt(topic)}

Conversation style: Natural, encouraging, ask follow-up questions, maintain engagement. Do NOT correct errors during conversation - just respond naturally. Let the learner practice freely.`;
};

/**
 * Find topic by ID
 */
export const getTopicById = (topicId: TopicId): ConversationTopic | undefined => {
  return CONVERSATION_TOPICS.find(t => t.id === topicId);
};

/**
 * Get all topics (for UI display)
 */
export const getAllTopics = (): ConversationTopic[] => {
  return CONVERSATION_TOPICS;
};
