// Simple Vertex AI connection test
const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs');

// Load credentials
const credentials = JSON.parse(
  fs.readFileSync('/Users/comradeflats/.gcp/ielts-vertex-ai-key-us.json', 'utf-8')
);

// Initialize
const vertexAI = new VertexAI({
  project: 'ielts-ai-practice-481410',
  location: 'us-central1',
  googleAuthOptions: {
    credentials: credentials,
  },
});

// Test with simple text (no audio)
async function test() {
  try {
    console.log('Testing Vertex AI connection...');
    const model = vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: 'Say "Hello, API is working!"' }],
      }],
    });

    const response = result.response.candidates[0].content.parts[0].text;
    console.log('✅ SUCCESS! Response:', response);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.message.includes('429')) {
      console.log('\nThis is a rate limit error. The API might not be fully activated yet.');
      console.log('Wait 5-10 minutes and try again, or check the GCP console.');
    }
  }
}

test();
