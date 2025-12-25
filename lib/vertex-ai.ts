import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs';

// Credential loading for both local and production environments
const getCredentials = () => {
  // Local development: use file path
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return JSON.parse(
        fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf-8')
      );
    } catch (error) {
      console.error('Error reading service account key from file:', error);
      throw new Error('Failed to load GCP credentials from file');
    }
  }

  // Production (Vercel): use base64 env var
  if (process.env.GCP_SERVICE_ACCOUNT_KEY_BASE64) {
    try {
      return JSON.parse(
        Buffer.from(process.env.GCP_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString()
      );
    } catch (error) {
      console.error('Error decoding base64 service account key:', error);
      throw new Error('Failed to decode GCP credentials from base64');
    }
  }

  throw new Error('No GCP credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or GCP_SERVICE_ACCOUNT_KEY_BASE64');
};

// Initialize Vertex AI client
const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID!,
  location: process.env.GCP_LOCATION || 'us-central1',
  googleAuthOptions: {
    credentials: getCredentials(),
  },
});

// Use Gemini 2.0 Flash for fast, cost-effective analysis
const MODEL_NAME = 'gemini-2.0-flash-exp';

// Helper: Extract text from Vertex AI response
const extractText = (result: any): string => {
  const candidate = result.response.candidates?.[0];
  if (!candidate) {
    console.error('No candidates in Vertex AI response:', JSON.stringify(result, null, 2));
    throw new Error('No response from Vertex AI');
  }

  const parts = candidate.content?.parts;
  if (!parts || parts.length === 0) {
    console.error('No parts in candidate:', JSON.stringify(candidate, null, 2));
    throw new Error('No content parts in Vertex AI response');
  }

  return parts[0].text || '';
};

// Main audio analysis function
export const analyzeESLSpeechWithAudio = async (
  audioBuffer: Buffer,
  topic: string,
  cefrLevel: string,
  mimeType: string = "audio/webm",
  fullTranscript?: string,
  feedbackLanguage: string = 'en'
) => {
  try {
    const model = vertexAI.getGenerativeModel({ model: MODEL_NAME });

    // Import getLanguageByCode for language name lookup
    const { getLanguageByCode } = await import('./languages');
    const languageInfo = getLanguageByCode(feedbackLanguage);
    const languageName = languageInfo?.name || 'English';

    console.log('💬 PRACTICE MODE - Analyzing against target level:', cefrLevel);
    console.log('🌍 Feedback language:', languageName);
    console.log('📝 Translation header active:', feedbackLanguage !== 'en');
    console.log('🌐 Target language:', languageName, `(code: ${feedbackLanguage})`);

    // CEFR-based conversation evaluation prompt
    const contextSection = fullTranscript
      ? `\n\nFULL CONVERSATION TRANSCRIPT (for context):\n${fullTranscript}\n\n`
      : '';

    // Translation header - put at TOP of prompt for maximum priority
    const translationHeader = feedbackLanguage !== 'en'
      ? `⚠️ CRITICAL: YOU MUST RESPOND ENTIRELY IN ${languageName.toUpperCase()} ⚠️

ALL feedback must be written in ${languageName}. This includes:
- range_feedback, accuracy_feedback, fluency_feedback, interaction_feedback, coherence_feedback (all bullet points)
- strengths array (all items)
- improvements array (all items)
- detailed_feedback (both 'issue' and 'suggestion' fields for every phrase)
- global_descriptor_translated field: Translate the CEFR global descriptor for the overall level into ${languageName}

EXCEPTION - Keep these in English:
- CEFR level codes (A1, A2, B1, B2, C1, C2)
- JSON field names (range_feedback, strengths, etc.)
- Criterion names (range, accuracy, fluency, interaction, coherence)
- Severity levels (minor, moderate, major)
- Verbatim transcript quotes (keep in quotation marks as spoken)

Example ${languageName} feedback format:
"range_feedback": ["${languageName === 'German' ? 'Der Sprecher verwendet ein begrenztes Vokabular' : 'Translated observation'}. Example: 'I go to school' - ${languageName === 'German' ? 'einfache Wortwahl' : 'translated explanation'}. ${languageName === 'German' ? 'Versuchen Sie, mehr beschreibende Adjektive zu verwenden' : 'Translated action tip'}."]

NOW PROCEED WITH THE ASSESSMENT IN ${languageName}:

`
      : '';

    const prompt = `${translationHeader}You are an expert English language assessor using the CEFR (Common European Framework of Reference) speaking assessment rubric from Cambridge ESOL.${contextSection}

CONVERSATION CONTEXT:
- Topic: ${topic}
- Target CEFR Level: ${cefrLevel}
- Conversation Type: Free-flowing practice with AI conversation partner (not a formal test)

CRITICAL INSTRUCTIONS:
1. This is a raw, unedited audio recording
2. Analyze the USER's speech ONLY (not the AI partner's responses)
3. Capture all features of the user's speech honestly including filler words, false starts, and mistakes
4. The full conversation transcript (if provided) shows both USER and AI messages for context - analyze USER speech only

${feedbackLanguage !== 'en' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  LANGUAGE REMINDER: ALL feedback must be in ${languageName.toUpperCase()}  ⚠️

Examples shown below are in English for clarity, but YOUR responses must be in ${languageName}.
This applies to:
  • All array items in range_feedback, accuracy_feedback, fluency_feedback, etc.
  • All items in strengths and improvements arrays
  • Both 'issue' and 'suggestion' in detailed_feedback
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''}

=== CEFR ASSESSMENT CRITERIA (Assess each criterion independently) ===

Evaluate the speaker's performance on ALL 5 criteria using CEFR levels:
A1 (Beginner), A1+ (High Beginner), A2 (Elementary), A2+ (High Elementary),
B1 (Intermediate), B1+ (High Intermediate), B2 (Upper-Intermediate), B2+ (High Upper-Intermediate),
C1 (Advanced), C1+ (High Advanced), C2 (Proficient/Mastery)

1. RANGE (Vocabulary Repertoire)
   What to assess:
   - Breadth and appropriateness of vocabulary
   - Ability to paraphrase and work around lexical gaps
   - Topic-specific vs. general vocabulary usage
   - Precision and flexibility in word choice

   CEFR Descriptors:
   - A1-A2: Very basic repertoire, simple words for personal details and concrete situations
   - B1-B2: Sufficient range for familiar topics, some circumlocutions, topic-specific vocabulary emerging
   - C1-C2: Broad range allowing reformulation, idiomatic expressions, precise differentiation

2. ACCURACY (Grammatical Control)
   What to assess:
   - Grammatical control and error frequency
   - Sentence complexity and variety
   - Ability to self-correct
   - Tense and aspect usage

   CEFR Descriptors:
   - A1-A2: Limited control, simple structures, systematic basic mistakes
   - B1-B2: Reasonably accurate in predictable situations, does not make errors causing misunderstanding
   - C1-C2: High degree of accuracy, errors rare and difficult to spot, consistent control

3. FLUENCY (Speaking Flow)
   What to assess:
   - Speech tempo and continuity
   - Hesitations and pausing patterns
   - Length of uninterrupted speech production
   - Backtracking and reformulation

   CEFR Descriptors:
   - A1-A2: Very short utterances, much pausing, false starts and reformulation very evident
   - B1-B2: Can keep going comprehensibly, fairly even tempo though some pausing for planning
   - C1-C2: Fluent and spontaneous, natural smooth flow, almost effortless

4. INTERACTION (Communicative Effectiveness)
   What to assess:
   - Turn-taking ability
   - Ability to initiate and respond
   - Contribution to joint discourse
   - Asking for clarification when needed
   - Managing conversation flow

   CEFR Descriptors:
   - A1-A2: Can ask/answer simple questions, communication dependent on repetition and repair
   - B1-B2: Can initiate and maintain simple conversation, confirm understanding, invite others in
   - C1-C2: Can select suitable phrases to manage discourse, interweave contributions naturally

5. COHERENCE (Discourse Organization)
   What to assess:
   - Logical organization of ideas
   - Use of cohesive devices (connectors, discourse markers)
   - Clarity of structure in longer stretches of speech
   - Use of organizational patterns

   CEFR Descriptors:
   - A1-A2: Can link words/groups with very basic connectors ("and", "then")
   - B1-B2: Can link simple elements into connected sequences, limited cohesive devices
   - C1-C2: Clear, smoothly-flowing well-structured speech, full appropriate use of organizational patterns

${feedbackLanguage !== 'en' ? `
═══════════════════════════════════════════════════════════════
⚠️⚠️⚠️  CRITICAL: OUTPUT LANGUAGE = ${languageName.toUpperCase()}  ⚠️⚠️⚠️

ALL feedback content MUST be written in ${languageName}:
✓ range_feedback array items → ${languageName}
✓ accuracy_feedback array items → ${languageName}
✓ fluency_feedback array items → ${languageName}
✓ interaction_feedback array items → ${languageName}
✓ coherence_feedback array items → ${languageName}
✓ strengths array items → ${languageName}
✓ improvements array items → ${languageName}
✓ detailed_feedback 'issue' and 'suggestion' fields → ${languageName}
✓ global_descriptor_translated → ${languageName}

ONLY these remain in English:
✗ JSON field names (range_feedback, overall_level, etc.)
✗ CEFR level codes (A1, B2+, C1, etc.)
✗ Criterion names (range, accuracy, fluency, etc.)
═══════════════════════════════════════════════════════════════
` : ''}

Return JSON with this EXACT structure:
{
  "overall_level": "<CEFR level: A1, A1+, A2, A2+, B1, B1+, B2, B2+, C1, C1+, or C2>",

  "range_level": "<CEFR level>",
  "accuracy_level": "<CEFR level>",
  "fluency_level": "<CEFR level>",
  "interaction_level": "<CEFR level>",
  "coherence_level": "<CEFR level>",

  "range_feedback": [
    "Brief observation about vocabulary range (1 sentence max)",
    "Specific example: 'You used \"[exact quote]\"' - explain why this is good/needs improvement",
    "Actionable tip (1 sentence)"
  ],

  "accuracy_feedback": [
    "Brief observation about grammar control",
    "Specific mistake: 'You said \"[exact quote]\" but should say \"[correction]\"'",
    "Pattern to practice"
  ],

  "fluency_feedback": [
    "Brief observation about speaking flow",
    "Example: 'You hesitated when saying \"[exact quote]\"' or 'You spoke smoothly about [topic]'",
    "Tip to improve flow"
  ],

  "interaction_feedback": [
    "Brief observation about conversation engagement",
    "Example of good/weak turn-taking or response",
    "How to improve interaction"
  ],

  "coherence_feedback": [
    "Brief observation about discourse organization",
    "Example: 'You used \"[connector]\" effectively' or 'Missing transitions between ideas'",
    "Tip for better coherence"
  ],

  "strengths": [<3-5 key strengths demonstrated>],
  "improvements": [<3-5 specific actionable improvements>],

  "verbatim_transcript": "<EXACT word-for-word transcript including ALL filler words (um, uh, like), false starts, repetitions, and mistakes as spoken>",

  "global_descriptor_translated": "<Translated CEFR global descriptor for the overall_level - ONLY include if language is not English>",

  "detailed_feedback": [
    {
      "phrase": "<exact phrase from transcript>",
      "issue": "<specific problem>",
      "criterion": "<one of: range, accuracy, fluency, interaction, coherence>",
      "severity": "<one of: minor, moderate, major>",
      "suggestion": "<how to fix this>"
    }
  ]
}

CRITICAL FORMATTING RULES FOR FEEDBACK:
1. Each criterion feedback MUST be an array of exactly 2-3 strings (bullet points)
2. Each bullet point MUST be ONE sentence maximum
3. ALWAYS include exact quotes from transcript in quotation marks
4. Focus on ACTIONABLE items only - no generic praise
5. Use this format: "[Observation]. Example: '[exact quote]' - [why]. [Action tip]."
6. Keep language clear and simple for non-native speakers to understand

Example of GOOD condensed feedback:
"range_feedback": [
  "You demonstrated B1-level vocabulary with effective use of topic-specific words.",
  "Strong example: 'I'm particularly interested in renewable energy' shows precise word choice.",
  "Expand range by learning 5 synonyms for common words you repeated (like, things, stuff)."
]

Example of BAD verbose feedback (DO NOT USE):
"range_feedback": "The speaker demonstrated a reasonable command of vocabulary that is generally appropriate for a B1 level learner. Throughout the conversation, they showed the ability to use topic-specific vocabulary such as when they mentioned renewable energy, which indicates..."

ASSESSMENT INSTRUCTIONS:
1. Assign a CEFR level (A1 through C2, including + levels) to EACH of the 5 criteria INDEPENDENTLY
2. The overall_level should be a holistic assessment (not just an average) considering all 5 criteria
3. Use + levels (A1+, A2+, etc.) when performance is clearly between two main levels
4. Be honest and objective - don't automatically assign the target level (${cefrLevel})
5. If the speaker is below ${cefrLevel}, assign the actual level demonstrated
6. If the speaker exceeds ${cefrLevel}, assign the higher level they demonstrate

DETAILED FEEDBACK INSTRUCTIONS:
- Identify 5-10 specific phrases/sentences where issues or notable features occur
- Include examples of BOTH problems AND strengths
- Be specific with actual quotes from the conversation
- For each issue, specify which criterion it affects (range, accuracy, fluency, interaction, coherence)
- Severity: minor (doesn't affect understanding), moderate (noticeable), major (impairs communication)

IMPORTANT:
- Provide constructive, encouraging feedback appropriate for practice
- Consider the conversation topic ('${topic}') when assessing vocabulary
- Be honest about the actual CEFR level demonstrated, not just the target level
- Give specific examples from the actual conversation for all feedback

${feedbackLanguage !== 'en' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 FINAL REMINDER: Respond with ALL feedback text in ${languageName.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''}`;

    // Convert buffer to base64
    const base64Audio = audioBuffer.toString('base64');

    // Vertex AI request structure
    const request = {
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
        ],
      }],
    };

    const result = await model.generateContent(request);
    const responseText = extractText(result);

    // Extract JSON from response - try multiple methods
    let jsonString = '';

    // Method 1: Look for JSON code block
    const codeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
    } else {
      // Method 2: Extract everything between first { and last }
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Could not find JSON in response:', responseText);
        throw new Error('Could not parse JSON response from Vertex AI');
      }
      jsonString = jsonMatch[0];
    }

    // Log the raw JSON for debugging (first 1000 chars)
    console.log('Raw JSON from Vertex AI (first 1000 chars):', jsonString.substring(0, 1000));

    // Try to parse with error handling
    let analysis;
    try {
      analysis = JSON.parse(jsonString);
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('Error position:', parseError.message.match(/position (\d+)/)?.[1]);

      // Show the problematic area
      if (parseError.message.includes('position')) {
        const pos = parseInt(parseError.message.match(/position (\d+)/)?.[1] || '0');
        const start = Math.max(0, pos - 100);
        const end = Math.min(jsonString.length, pos + 100);
        console.error('Problematic area:', jsonString.substring(start, end));
      }

      throw new Error(`Failed to parse JSON from Vertex AI: ${parseError.message}`);
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing speech audio with Vertex AI:', error);
    throw error;
  }
};

// Assessment-specific function (NO level anchor - full range evaluation)
export const analyzeESLSpeechWithAudioForAssessment = async (
  audioBuffer: Buffer,
  topic: string,
  mimeType: string = "audio/webm",
  fullTranscript?: string,
  feedbackLanguage: string = 'en'
) => {
  try {
    const model = vertexAI.getGenerativeModel({ model: MODEL_NAME });

    // Import getLanguageByCode for language name lookup
    const { getLanguageByCode } = await import('./languages');
    const languageInfo = getLanguageByCode(feedbackLanguage);
    const languageName = languageInfo?.name || 'English';

    console.log('🎯 ASSESSMENT MODE - Full range evaluation (A1-C2)');
    console.log('🌍 Feedback language:', languageName);
    console.log('📝 Translation header active:', feedbackLanguage !== 'en');
    console.log('🌐 Target language:', languageName, `(code: ${feedbackLanguage})`);

    const contextSection = fullTranscript
      ? `\n\nFULL CONVERSATION TRANSCRIPT (for context):\n${fullTranscript}\n\n`
      : '';

    // Translation header
    const translationHeader = feedbackLanguage !== 'en'
      ? `⚠️ CRITICAL: YOU MUST RESPOND ENTIRELY IN ${languageName.toUpperCase()} ⚠️

ALL feedback must be written in ${languageName}. This includes:
- range_feedback, accuracy_feedback, fluency_feedback, interaction_feedback, coherence_feedback (all bullet points)
- strengths array (all items)
- improvements array (all items)
- detailed_feedback (both 'issue' and 'suggestion' fields for every phrase)
- global_descriptor_translated field: Translate the CEFR global descriptor for the overall level into ${languageName}

EXCEPTION - Keep these in English:
- CEFR level codes (A1, A2, B1, B2, C1, C2)
- JSON field names (range_feedback, strengths, etc.)
- Criterion names (range, accuracy, fluency, interaction, coherence)
- Severity levels (minor, moderate, major)
- Verbatim transcript quotes (keep in quotation marks as spoken)

NOW PROCEED WITH THE ASSESSMENT IN ${languageName}:

`
      : '';

    // ASSESSMENT-SPECIFIC PROMPT (no level anchor)
    const prompt = `${translationHeader}You are an expert English language assessor conducting a CEFR placement test.${contextSection}

YOUR TASK: Determine the speaker's ACTUAL CEFR level across the FULL range (A1 to C2).

CRITICAL ASSESSMENT GUIDELINES:
1. This is a PLACEMENT TEST - evaluate objectively across ALL levels (A1, A2, B1, B2, C1, C2)
2. DO NOT anchor to any particular level - the speaker could be anywhere from beginner to native-like
3. Native or near-native speakers (C1-C2) should be identified accurately
4. Pay special attention to C1-C2 indicators:
   * Minimal errors (1-2 minor slips acceptable for C1, nearly zero for C2)
   * Sophisticated vocabulary and idiomatic expressions
   * Natural, effortless fluency without strain
   * Complex sentence structures used correctly and naturally
   * Native-like pronunciation, intonation, and rhythm
   * Ability to express subtle shades of meaning

5. Beginners (A1-A2) should also be identified accurately:
   * Very limited vocabulary
   * Basic grammatical structures only
   * Frequent long pauses
   * Difficulty forming complete sentences

CONVERSATION CONTEXT:
- Topic: ${topic}
- Assessment Type: Initial CEFR placement test
- Goal: Determine actual proficiency level

CRITICAL INSTRUCTIONS:
1. This is a raw, unedited audio recording
2. Analyze the USER's speech ONLY (not the AI partner's responses)
3. Capture all features of the user's speech honestly including filler words, false starts, and mistakes
4. The full conversation transcript (if provided) shows both USER and AI messages for context - analyze USER speech only

${feedbackLanguage !== 'en' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  LANGUAGE REMINDER: ALL feedback must be in ${languageName.toUpperCase()}  ⚠️

Examples shown below are in English for clarity, but YOUR responses must be in ${languageName}.
This applies to:
  • All array items in range_feedback, accuracy_feedback, fluency_feedback, etc.
  • All items in strengths and improvements arrays
  • Both 'issue' and 'suggestion' in detailed_feedback
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''}

=== CEFR ASSESSMENT CRITERIA (Official Cambridge ESOL Descriptors) ===

Evaluate the speaker's performance on ALL 5 criteria using CEFR levels:
A1 (Beginner), A1+ (High Beginner), A2 (Elementary), A2+ (High Elementary),
B1 (Intermediate), B1+ (High Intermediate), B2 (Upper-Intermediate), B2+ (High Upper-Intermediate),
C1 (Advanced), C1+ (High Advanced), C2 (Proficient/Mastery)

1. RANGE (Vocabulary Repertoire)

   Official Cambridge ESOL Descriptors (Table 5.5):

   C2: Shows great flexibility reformulating ideas in differing linguistic forms to convey finer
       shades of meaning precisely, to give emphasis, to differentiate and to eliminate ambiguity.
       Also has a good command of idiomatic expressions and colloquialisms.

   C1: Has a good command of a broad range of language allowing him/her to select a formulation
       to express him/herself clearly in an appropriate style on a wide range of general, academic,
       professional or leisure topics without having to restrict what he/she wants to say.

   B2: Has a sufficient range of language to be able to give clear descriptions, express viewpoints
       on most general topics, without much conspicuous searching for words, using some complex
       sentence forms to do so.

   B1: Has enough language to get by, with sufficient vocabulary to express him/herself with some
       hesitation and circumlocutions on topics such as family, hobbies and interests, work, travel,
       and current events.

   A2: Uses basic sentence patterns with memorised phrases, groups of a few words and formulae
       in order to communicate limited information in simple everyday situations.

   A1: Has a very basic repertoire of words and simple phrases related to personal details and
       particular concrete situations.

2. ACCURACY (Grammatical Control)

   Official Cambridge ESOL Descriptors (Table 5.5):

   C2: Maintains consistent grammatical control of complex language, even while attention is
       otherwise engaged (e.g. in forward planning, in monitoring others' reactions).

   C1: Consistently maintains a high degree of grammatical accuracy; errors are rare, difficult
       to spot and generally corrected when they do occur.

   B2: Shows a relatively high degree of grammatical control. Does not make errors which cause
       misunderstanding, and can correct most of his/her mistakes.

   B1: Uses reasonably accurately a repertoire of frequently used 'routines' and patterns associated
       with more predictable situations.

   A2: Uses some simple structures correctly, but still systematically makes basic mistakes.

   A1: Shows only limited control of a few simple grammatical structures and sentence patterns
       in a memorised repertoire.

3. FLUENCY (Speaking Flow)

   Official Cambridge ESOL Descriptors (Table 5.5):

   C2: Can express him/herself spontaneously at length with a natural colloquial flow, avoiding or
       backtracking around any difficulty so smoothly that the interlocutor is hardly aware of it.

   C1: Can express him/herself fluently and spontaneously, almost effortlessly. Only a conceptually
       difficult subject can hinder a natural, smooth flow of language.

   B2: Can produce stretches of language with a fairly even tempo; although he/she can be hesitant
       as he/she searches for patterns and expressions, there are few noticeably long pauses.

   B1: Can keep going comprehensibly, even though pausing for grammatical and lexical planning and
       repair is very evident, especially in longer stretches of free production.

   A2: Can make him/herself understood in very short utterances, even though pauses, false starts
       and reformulation are very evident.

   A1: Can manage very short, isolated, mainly pre-packaged utterances, with much pausing to search
       for expressions, to articulate less familiar words, and to repair communication.

4. INTERACTION (Communicative Effectiveness)

   Official Cambridge ESOL Descriptors (Table 5.5):

   C2: Can interact with ease and skill, picking up and using non-verbal and intonational cues
       apparently effortlessly. Can interweave his/her contribution into the joint discourse with
       fully natural turn-taking, referencing, allusion making etc.

   C1: Can select a suitable phrase from a readily available range of discourse functions to preface
       his/her remarks in order to get or to keep the floor and to relate his/her own contributions
       skilfully to those of other speakers.

   B2: Can initiate discourse, take his/her turn when appropriate and end conversation when he/she
       needs to, though he/she may not always do this elegantly. Can help the discussion along on
       familiar ground confirming comprehension, inviting others in, etc.

   B1: Can initiate, maintain and close simple face-to-face conversation on topics that are familiar
       or of personal interest. Can repeat back part of what someone has said to confirm mutual
       understanding.

   A2: Can answer questions and respond to simple statements. Can indicate when he/she is following
       but is rarely able to understand enough to keep conversation going of his/her own accord.

   A1: Can ask and answer questions about personal details. Can interact in a simple way but
       communication is totally dependent on repetition, rephrasing and repair.

5. COHERENCE (Discourse Organization)

   Official Cambridge ESOL Descriptors (Table 5.5):

   C2: Can create coherent and cohesive discourse making full and appropriate use of a variety of
       organisational patterns and a wide range of connectors and other cohesive devices.

   C1: Can produce clear, smoothly-flowing, well-structured speech, showing controlled use of
       organisational patterns, connectors and cohesive devices.

   B2: Can use a limited number of cohesive devices to link his/her utterances into clear, coherent
       discourse, though there may be some "jumpiness" in a long contribution.

   B1: Can link a series of shorter, discrete simple elements into a connected, linear sequence of
       points.

   A2: Can link groups of words with simple connectors like "and", "but" and "because".

   A1: Can link words or groups of words with very basic linear connectors like "and" or "then".

${feedbackLanguage !== 'en' ? `
═══════════════════════════════════════════════════════════════
⚠️⚠️⚠️  CRITICAL: OUTPUT LANGUAGE = ${languageName.toUpperCase()}  ⚠️⚠️⚠️

ALL feedback content MUST be written in ${languageName}:
✓ range_feedback array items → ${languageName}
✓ accuracy_feedback array items → ${languageName}
✓ fluency_feedback array items → ${languageName}
✓ interaction_feedback array items → ${languageName}
✓ coherence_feedback array items → ${languageName}
✓ strengths array items → ${languageName}
✓ improvements array items → ${languageName}
✓ detailed_feedback 'issue' and 'suggestion' fields → ${languageName}
✓ global_descriptor_translated → ${languageName}

ONLY these remain in English:
✗ JSON field names (range_feedback, overall_level, etc.)
✗ CEFR level codes (A1, B2+, C1, etc.)
✗ Criterion names (range, accuracy, fluency, etc.)
═══════════════════════════════════════════════════════════════
` : ''}

Return JSON with this EXACT structure:
{
  "overall_level": "<CEFR level: A1, A1+, A2, A2+, B1, B1+, B2, B2+, C1, C1+, or C2>",

  "range_level": "<CEFR level>",
  "accuracy_level": "<CEFR level>",
  "fluency_level": "<CEFR level>",
  "interaction_level": "<CEFR level>",
  "coherence_level": "<CEFR level>",

  "range_feedback": [
    "Brief observation about vocabulary range (1 sentence max)",
    "Specific example: 'You used \"[exact quote]\"' - explain why this is good/needs improvement",
    "Actionable tip (1 sentence)"
  ],

  "accuracy_feedback": [
    "Brief observation about grammar control",
    "Specific mistake: 'You said \"[exact quote]\" but should say \"[correction]\"'",
    "Pattern to practice"
  ],

  "fluency_feedback": [
    "Brief observation about speaking flow",
    "Example: 'You hesitated when saying \"[exact quote]\"' or 'You spoke smoothly about [topic]'",
    "Tip to improve flow"
  ],

  "interaction_feedback": [
    "Brief observation about conversation engagement",
    "Example of good/weak turn-taking or response",
    "How to improve interaction"
  ],

  "coherence_feedback": [
    "Brief observation about discourse organization",
    "Example: 'You used \"[connector]\" effectively' or 'Missing transitions between ideas'",
    "Tip for better coherence"
  ],

  "strengths": [<3-5 key strengths demonstrated>],
  "improvements": [<3-5 specific actionable improvements>],

  "verbatim_transcript": "<EXACT word-for-word transcript including ALL filler words (um, uh, like), false starts, repetitions, and mistakes as spoken>",

  "global_descriptor_translated": "<Translated CEFR global descriptor for the overall_level - ONLY include if language is not English>",

  "detailed_feedback": [
    {
      "phrase": "<exact phrase from transcript>",
      "issue": "<specific problem>",
      "criterion": "<one of: range, accuracy, fluency, interaction, coherence>",
      "severity": "<one of: minor, moderate, major>",
      "suggestion": "<how to fix this>"
    }
  ]
}

CRITICAL FORMATTING RULES FOR FEEDBACK:
1. Each criterion feedback MUST be an array of exactly 2-3 strings (bullet points)
2. Each bullet point MUST be ONE sentence maximum
3. ALWAYS include exact quotes from transcript in quotation marks
4. Focus on ACTIONABLE items only - no generic praise
5. Use this format: "[Observation]. Example: '[exact quote]' - [why]. [Action tip]."
6. Keep language clear and simple for non-native speakers to understand

ASSESSMENT CALIBRATION EXAMPLES:

C2 Example:
- Zero or near-zero errors
- Sophisticated expressions: "I'm particularly fascinated by the nuanced interplay between..."
- Natural idioms: "it's a double-edged sword", "that really struck a chord with me"
- Effortless flow, no hesitation

C1 Example:
- 1-2 minor slips acceptable: "Yesterday I go... I went to the store"
- Complex structures: "Had I known earlier, I would have..."
- Rich vocabulary: "proliferation", "mitigate", "quintessential"
- Smooth flow with minimal pausing

B2 Example:
- Some errors but meaning clear: "I very like this topic" (word order)
- Good range: "technology has revolutionized communication"
- Occasional pausing for word search
- Clear viewpoints expressed

B1 Example:
- Regular errors: "I go yesterday", "He don't understand"
- Basic descriptive vocabulary
- Noticeable pausing and self-correction
- Can communicate main points

A2 Example:
- Systematic errors: "I no like", "She go home"
- Simple vocabulary: "good", "bad", "like", "want"
- Short utterances only
- Much pausing

A1 Example:
- Very limited: "I... yes", "My name is...", "I like pizza"
- Long pauses between words
- Pre-packaged phrases only

ASSESSMENT INSTRUCTIONS:
1. Assign a CEFR level (A1 through C2, including + levels) to EACH of the 5 criteria INDEPENDENTLY
2. The overall_level should be a holistic assessment (not just an average) considering all 5 criteria
3. Use + levels (A1+, A2+, etc.) when performance is clearly between two main levels
4. Be rigorously honest - if someone sounds native, rate them C1-C2
5. If someone struggles with basics, rate them A1-A2
6. DO NOT be conservative - rate accurately across the full spectrum

DETAILED FEEDBACK INSTRUCTIONS:
- Identify 5-10 specific phrases/sentences where issues or notable features occur
- Include examples of BOTH problems AND strengths
- Be specific with actual quotes from the conversation
- For each issue, specify which criterion it affects (range, accuracy, fluency, interaction, coherence)
- Severity: minor (doesn't affect understanding), moderate (noticeable), major (impairs communication)

IMPORTANT:
- Provide constructive, encouraging feedback appropriate for practice
- Consider the conversation topic ('${topic}') when assessing vocabulary
- Be RIGOROUSLY HONEST about the actual CEFR level demonstrated
- Give specific examples from the actual conversation for all feedback

${feedbackLanguage !== 'en' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 FINAL REMINDER: Respond with ALL feedback text in ${languageName.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''}`;

    // Convert buffer to base64
    const base64Audio = audioBuffer.toString('base64');

    // Vertex AI request structure
    const request = {
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
        ],
      }],
    };

    const result = await model.generateContent(request);
    const responseText = extractText(result);

    // Extract JSON from response - try multiple methods
    let jsonString = '';

    // Method 1: Look for JSON code block
    const codeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
    } else {
      // Method 2: Extract everything between first { and last }
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Could not find JSON in response:', responseText);
        throw new Error('Could not parse JSON response from Vertex AI');
      }
      jsonString = jsonMatch[0];
    }

    // Log the raw JSON for debugging (first 1000 chars)
    console.log('Raw JSON from Vertex AI (assessment mode, first 1000 chars):', jsonString.substring(0, 1000));

    // Try to parse with error handling
    let analysis;
    try {
      analysis = JSON.parse(jsonString);
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('Error position:', parseError.message.match(/position (\d+)/)?.[1]);

      // Show the problematic area
      if (parseError.message.includes('position')) {
        const pos = parseInt(parseError.message.match(/position (\d+)/)?.[1] || '0');
        const start = Math.max(0, pos - 100);
        const end = Math.min(jsonString.length, pos + 100);
        console.error('Problematic area:', jsonString.substring(start, end));
      }

      throw new Error(`Failed to parse JSON from Vertex AI: ${parseError.message}`);
    }

    return analysis;
  } catch (error) {
    console.error('Error in assessment mode with Vertex AI:', error);
    throw error;
  }
};

// Text-only analysis function (fallback)
export const analyzeESLSpeech = async (
  transcript: string,
  topic: string,
  cefrLevel: string
) => {
  try {
    const model = vertexAI.getGenerativeModel({ model: MODEL_NAME });

    // CEFR-based evaluation prompt for text
    const prompt = `You are an expert English language assessor. Analyze this conversation transcript and provide a detailed evaluation.

CONVERSATION CONTEXT:
- Topic: ${topic}
- Learner's CEFR Level: ${cefrLevel}

TRANSCRIPT:
"${transcript}"

Please evaluate the response on these criteria and return a JSON response with the following structure:
{
  "fluencyScore": <1-9>,
  "lexicalScore": <1-9>,
  "grammarScore": <1-9>,
  "pronunciationScore": <1-9>,
  "overallScore": <1-9>,
  "fluencyFeedback": "<specific feedback on speech flow, hesitations, discourse markers>",
  "lexicalFeedback": "<specific feedback on vocabulary range and precision>",
  "grammarFeedback": "<specific feedback on sentence structures and accuracy>",
  "pronunciationFeedback": "<specific feedback on clarity and intonation>",
  "improvements": [<list of 3-5 specific actionable improvements>],
  "strengths": [<list of 3-5 key strengths demonstrated>]
}

Be specific with examples from the transcript. Provide constructive feedback that helps the learner improve.`;

    const request = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }],
      }],
    };

    const result = await model.generateContent(request);
    const responseText = extractText(result);

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON response from Vertex AI');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error analyzing speech with Vertex AI:', error);
    throw error;
  }
};

// Note: generateFollowUpQuestion removed - will be replaced with structured question database
