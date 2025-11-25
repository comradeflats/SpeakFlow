import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export const analyzeESLSpeech = async (
  transcript: string,
  part: "1" | "2" | "3"
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert IELTS speaking examiner. Analyze this IELTS Speaking Part ${part} response and provide a detailed evaluation.

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON response from Gemini");
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error("Error analyzing speech with Gemini:", error);
    throw error;
  }
};

export const generateFollowUpQuestion = async (
  part: "1" | "2" | "3",
  previousTopic?: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let systemPrompt = "";
    if (part === "1") {
      systemPrompt = `Generate an IELTS Speaking Part 1 follow-up question. Part 1 is a 4-5 minute warm-up with questions about familiar topics like work, studies, family, hobbies. Keep questions simple and direct.`;
    } else if (part === "2") {
      systemPrompt = `Generate an IELTS Speaking Part 2 cue card task. This should be a topic card where the candidate speaks for 1-2 minutes. Include: "Describe [topic]. You should say: [4 bullet points]"`;
    } else {
      systemPrompt = `Generate an IELTS Speaking Part 3 follow-up question. Part 3 is discussion-based with more abstract and complex questions. ${
        previousTopic ? `It should relate to: ${previousTopic}` : ""
      }`;
    }

    const result = await model.generateContent(systemPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
};
