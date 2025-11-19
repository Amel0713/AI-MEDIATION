import OpenAI from 'openai';

// Constants
const OPENAI_MODEL = 'gpt-4';

// Initialize OpenAI client with API key from environment variables
// Conditionally enable dangerouslyAllowBrowser based on VITE_OPENAI_ALLOW_BROWSER env var for secure deployment
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: import.meta.env.VITE_OPENAI_ALLOW_BROWSER === 'true',
});

// System prompt that defines the AI mediator's role and behavior
const SYSTEM_PROMPT = "You are an impartial, neutral mediator facilitating a conversation between two parties. Your role is to help them reach a fair agreement by summarizing discussions, suggesting compromises, rephrasing messages calmly, and drafting agreements. Always remain neutral and professional.";

// Generate a neutral summary of the current mediation situation
export async function summarizeSituation(caseMeta, partyContexts, recentMessages) {
  try {
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
  } catch (error) {
    console.error('Error summarizing situation:', error);
    throw new Error('Failed to generate AI summary. Please try again.');
  }
}

// Suggest compromise options based on case context and discussion
export async function suggestCompromises(caseMeta, partyContexts, recentMessages, agreementDraft) {
  try {
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
  } catch (error) {
    console.error('Error suggesting compromises:', error);
    throw new Error('Failed to generate AI compromise suggestions. Please try again.');
  }
}

// Rephrase a user's message to be more calm and professional
export async function rephraseMessage(lastMessage) {
  try {
    const prompt = `${SYSTEM_PROMPT}

Please rephrase the following message more calmly and professionally: "${lastMessage}"`;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error rephrasing message:', error);
    throw new Error('Failed to rephrase message. Please try again.');
  }
}

// Generate or update a draft agreement based on case discussion
export async function generateAgreementDraft(caseMeta, partyContexts, recentMessages) {
  try {
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
  } catch (error) {
    console.error('Error generating agreement draft:', error);
    throw new Error('Failed to generate agreement draft. Please try again.');
  }
}

// Improve the clarity and professionalism of an agreement draft
export async function improveAgreementClarity(draftText) {
  try {
    const prompt = `${SYSTEM_PROMPT}

Please improve the clarity, readability, and neutrality of the following agreement draft:

"${draftText}"

Make it more professional, clear, and balanced.`;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error improving agreement clarity:', error);
    throw new Error('Failed to improve agreement clarity. Please try again.');
  }
}

export default openai;