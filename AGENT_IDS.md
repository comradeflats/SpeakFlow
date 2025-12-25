# ElevenLabs Agent IDs Reference

**Last Updated**: December 25, 2024

## Current Active Agents

| CEFR Level | Agent ID | Description |
|------------|----------|-------------|
| **A1** (Beginner) | `agent_0001kdafyw5qe13rk9phvjy09ryg` | Simple vocabulary, present tense only, 1-2 sentences max |
| **A2** (Elementary) | `agent_7901kdag1jw2fdztss05x9dkypsj` | Everyday vocabulary, present/past simple, 2-3 sentences max |
| **B1** (Intermediate) | `agent_7301kdag3tqhepptygeph4m9d3xj` | Mixed tenses, topic-specific vocab, 3 sentences max |
| **B2** (Upper-Intermediate) | `agent_2401kdag61gce3a90vjayvj67se3` | Full tense range, academic vocab, thoughtful responses |
| **C1** (Advanced) | `agent_7601kdagbdbnftf8cj7bzbrzfyrg` | Sophisticated language, nuanced expression, sharp questions |
| **C2** (Proficient) | `agent_2001kdagj1kxey6aypsqhgvkbq4j` | Native-like precision, advanced rhetorical devices, peer-level |
| **Assessment** | `agent_9801kdafszg5fbwsff84tt2n5pwh` | Adaptive complexity, determines user's CEFR level (1.5 min) |

## Environment Variable Names

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_A1=agent_0001kdafyw5qe13rk9phvjy09ryg
NEXT_PUBLIC_ELEVENLABS_AGENT_A2=agent_7901kdag1jw2fdztss05x9dkypsj
NEXT_PUBLIC_ELEVENLABS_AGENT_B1=agent_7301kdag3tqhepptygeph4m9d3xj
NEXT_PUBLIC_ELEVENLABS_AGENT_B2=agent_2401kdag61gce3a90vjayvj67se3
NEXT_PUBLIC_ELEVENLABS_AGENT_C1=agent_7601kdagbdbnftf8cj7bzbrzfyrg
NEXT_PUBLIC_ELEVENLABS_AGENT_C2=agent_2001kdagj1kxey6aypsqhgvkbq4j
NEXT_PUBLIC_ELEVENLABS_AGENT_ASSESSMENT=agent_9801kdafszg5fbwsff84tt2n5pwh
```

## Quick Copy for Vercel Deployment

When deploying to Vercel, add these environment variables:

```
NEXT_PUBLIC_ELEVENLABS_AGENT_A1 = agent_0001kdafyw5qe13rk9phvjy09ryg
NEXT_PUBLIC_ELEVENLABS_AGENT_A2 = agent_7901kdag1jw2fdztss05x9dkypsj
NEXT_PUBLIC_ELEVENLABS_AGENT_B1 = agent_7301kdag3tqhepptygeph4m9d3xj
NEXT_PUBLIC_ELEVENLABS_AGENT_B2 = agent_2401kdag61gce3a90vjayvj67se3
NEXT_PUBLIC_ELEVENLABS_AGENT_C1 = agent_7601kdagbdbnftf8cj7bzbrzfyrg
NEXT_PUBLIC_ELEVENLABS_AGENT_C2 = agent_2001kdagj1kxey6aypsqhgvkbq4j
NEXT_PUBLIC_ELEVENLABS_AGENT_ASSESSMENT = agent_9801kdafszg5fbwsff84tt2n5pwh
```

## Notes

- All agents are on ElevenLabs free tier
- Assessment agent is adaptive - starts simple, increases complexity based on responses
- Each CEFR-level agent has specific speaking rate, vocabulary constraints, and sentence limits
- + levels (A1+, A2+, B1+, B2+, C1+) use the base level agent (e.g., B1+ uses B1 agent)

## Testing Checklist

- [ ] A1 agent responds at beginner level (simple present, basic vocab)
- [ ] A2 agent uses past tense and everyday vocabulary
- [ ] B1 agent uses mixed tenses and topic-specific words
- [ ] B2 agent provides thoughtful, academic-level responses
- [ ] C1 agent uses sophisticated, nuanced language
- [ ] C2 agent demonstrates native-like precision
- [ ] Assessment agent adapts complexity during conversation
- [ ] All agents keep responses concise (max 3 sentences)
- [ ] Assessment correctly determines user's CEFR level

---

**Status**: ✅ Updated for final testing
**Build Status**: ✅ Compiles successfully with new IDs
**Ready for Deployment**: ✅ Yes
