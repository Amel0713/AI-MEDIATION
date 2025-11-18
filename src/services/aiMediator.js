import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = "You are an impartial, neutral mediator facilitating a conversation between two parties. Your role is to help them reach a fair agreement by summarizing discussions, suggesting compromises, rephrasing messages calmly, and drafting agreements. Always remain neutral and professional.";

export async function summarizeSituation(caseMeta, partyContexts, recentMessages) {
  const prompt = `${SYSTEM_PROMPT}

Case Meta: ${JSON.stringify(caseMeta)}

Party Contexts: ${JSON.stringify(partyContexts)}

Recent Messages: ${recentMessages.map(m => `${m.sender}: ${m.content}`).join('\n')}

Please provide a neutral summary of the current situation in the mediation.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

export async function suggestCompromises(caseMeta, partyContexts, recentMessages, agreementDraft) {
  const prompt = `${SYSTEM_PROMPT}

Case Meta: ${JSON.stringify(caseMeta)}

Party Contexts: ${JSON.stringify(partyContexts)}

Recent Messages: ${recentMessages.map(m => `${m.sender}: ${m.content}`).join('\n')}

Current Agreement Draft: ${agreementDraft || 'None'}

Please suggest compromise options that could help the parties reach an agreement.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

export async function rephraseMessage(lastMessage) {
  const prompt = `${SYSTEM_PROMPT}

Please rephrase the following message more calmly and professionally: "${lastMessage}"`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

export async function generateAgreementDraft(caseMeta, partyContexts, recentMessages) {
  const prompt = `${SYSTEM_PROMPT}

Case Meta: ${JSON.stringify(caseMeta)}

Party Contexts: ${JSON.stringify(partyContexts)}

Recent Messages: ${recentMessages.map(m => `${m.sender}: ${m.content}`).join('\n')}

Please generate or update a draft agreement based on the discussion.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

export async function improveAgreementClarity(draftText) {
  const prompt = `${SYSTEM_PROMPT}

Please improve the clarity, readability, and neutrality of the following agreement draft:

"${draftText}"

Make it more professional, clear, and balanced.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

export default openai;