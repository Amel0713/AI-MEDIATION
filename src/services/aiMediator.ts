/* eslint-disable @typescript-eslint/no-explicit-any, curly, no-console */
import { supabase } from './supabase';

// Generate a neutral summary of the current mediation situation
export async function summarizeSituation(caseMeta: any, partyContexts: any, recentMessages: any): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('summarize-situation', {
      body: { caseMeta, partyContexts, recentMessages }
    });

    if (error) throw error;

    return data.result;
  } catch (error) {
    console.error('Error summarizing situation:', error);
    throw new Error('Failed to generate AI summary. Please try again.');
  }
}

// Suggest compromise options based on case context and discussion
export async function suggestCompromises(caseMeta: any, partyContexts: any, recentMessages: any, agreementDraft: any): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('suggest-compromises', {
      body: { caseMeta, partyContexts, recentMessages, agreementDraft }
    });

    if (error) throw error;

    return data.result;
  } catch (error) {
    console.error('Error suggesting compromises:', error);
    throw new Error('Failed to generate AI compromise suggestions. Please try again.');
  }
}

// Rephrase a user's message to be more calm and professional
export async function rephraseMessage(lastMessage: any): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('rephrase-message', {
      body: { lastMessage }
    });

    if (error) throw error;

    return data.result;
  } catch (error) {
    console.error('Error rephrasing message:', error);
    throw new Error('Failed to rephrase message. Please try again.');
  }
}

// Generate or update a draft agreement based on case discussion
export async function generateAgreementDraft(caseMeta: any, partyContexts: any, recentMessages: any): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-agreement', {
      body: { caseMeta, partyContexts, recentMessages }
    });

    if (error) throw error;

    return data.result;
  } catch (error) {
    console.error('Error generating agreement draft:', error);
    throw new Error('Failed to generate agreement draft. Please try again.');
  }
}

// Improve the clarity and professionalism of an agreement draft
export async function improveAgreementClarity(draftText: any): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('improve-agreement', {
      body: { draftText }
    });

    if (error) throw error;

    return data.result;
  } catch (error) {
    console.error('Error improving agreement clarity:', error);
    throw new Error('Failed to improve agreement clarity. Please try again.');
  }
}
