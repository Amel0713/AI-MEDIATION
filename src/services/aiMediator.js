import OpenAI from 'openai';

// Constants
const OPENAI_MODEL = 'gpt-4';

// Initialize OpenAI client with API key from environment variables
// Note: Removed dangerouslyAllowBrowser for security - requires server-side proxy in production
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

// System prompt that defines the AI mediator's role and behavior
const SYSTEM_PROMPT = "You are an impartial, neutral mediator facilitating a conversation between two parties. Your role is to help them reach a fair agreement by summarizing discussions, suggesting compromises, rephrasing messages calmly, and drafting agreements. Always remain neutral and professional.";

// Generate a neutral summary of the current mediation situation
export async function summarizeSituation(caseMeta, partyContexts, recentMessages) {
  // Construct prompt with case metadata, party contexts, and recent messages
  const prompt = `${SYSTEM_PROMPT}

Case Meta: ${JSON.stringify(caseMeta)}

Party Contexts: ${JSON.stringify(partyContexts)}

Recent Messages: ${recentMessages.map(m => `${m.sender}: ${m.content}`).join('\n')}

Please provide a neutral summary of the current situation in the mediation.`;

  // Call OpenAI API with GPT-4 model
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

// Suggest compromise options based on case context and discussion
export async function suggestCompromises(caseMeta, partyContexts, recentMessages, agreementDraft) {
  const prompt = `${SYSTEM_PROMPT}

Case Meta: ${JSON.stringify(caseMeta)}

Party Contexts: ${JSON.stringify(partyContexts)}

Recent Messages: ${recentMessages.map(m => `${m.sender}: ${m.content}`).join('\n')}

Current Agreement Draft: ${agreementDraft || 'None'}

Please suggest compromise options that could help the parties reach an agreement.`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

// Rephrase a user's message to be more calm and professional
export async function rephraseMessage(lastMessage) {
  const prompt = `${SYSTEM_PROMPT}

Please rephrase the following message more calmly and professionally: "${lastMessage}"`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

// Generate or update a draft agreement based on case discussion
export async function generateAgreementDraft(caseMeta, partyContexts, recentMessages) {
  const prompt = `${SYSTEM_PROMPT}

Case Meta: ${JSON.stringify(caseMeta)}

Party Contexts: ${JSON.stringify(partyContexts)}

Recent Messages: ${recentMessages.map(m => `${m.sender}: ${m.content}`).join('\n')}

Please generate or update a draft agreement based on the discussion.`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

// Improve the clarity and professionalism of an agreement draft
export async function improveAgreementClarity(draftText) {
  const prompt = `${SYSTEM_PROMPT}

Please improve the clarity, readability, and neutrality of the following agreement draft:

"${draftText}"

Make it more professional, clear, and balanced.`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

export default openai;