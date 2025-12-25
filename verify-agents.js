// Quick script to verify ElevenLabs agent IDs are loaded correctly

console.log('\n🔍 Checking ElevenLabs Agent Configuration...\n');

const agents = {
  'Casual & Social': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_CASUAL_ID,
  'Travel & Tourism': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_TRAVEL_ID,
  'Business & Professional': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_BUSINESS_ID,
  'Shopping & Services': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_SHOPPING_ID,
  'Health & Wellness': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_HEALTH_ID,
  'Education & Learning': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_EDUCATION_ID,
  'Technology & Digital Life': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_TECHNOLOGY_ID,
  'Culture & Entertainment': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_CULTURE_ID,
  'News & Current Events': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_NEWS_ID,
  'Daily Routines & Life': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_DAILY_ID,
};

let allGood = true;

for (const [topic, agentId] of Object.entries(agents)) {
  if (agentId) {
    console.log(`✅ ${topic.padEnd(30)} ${agentId}`);
  } else {
    console.log(`❌ ${topic.padEnd(30)} MISSING!`);
    allGood = false;
  }
}

console.log('\nAPI Key:', process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? '✅ Set' : '❌ Missing');

if (allGood) {
  console.log('\n✨ All agent IDs configured correctly!\n');
} else {
  console.log('\n⚠️  Some agent IDs are missing. Check your .env.local file.\n');
}
