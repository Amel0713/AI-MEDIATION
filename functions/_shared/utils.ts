// @ts-ignore
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore
import OpenAI from 'https://esm.sh/openai'

export const SYSTEM_PROMPT = "You are an impartial, neutral mediator facilitating a conversation between two parties. Your role is to help them reach a fair agreement by summarizing discussions, suggesting compromises, rephrasing messages calmly, and drafting agreements. Always remain neutral and professional."

export interface AuthResult {
  user: any
  supabase: SupabaseClient
}

export interface MediationRequestBody {
  caseMeta?: any;
  partyContexts?: any;
  recentMessages?: { sender: string; content: string }[];
  lastMessage?: string;
  agreementDraft?: string;
  draftText?: string;
}

export async function authenticateUser(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Unauthorized')
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  return { user, supabase }
}

export async function checkRateLimit(userId: string, supabase: SupabaseClient): Promise<boolean> {
  const RATE_LIMIT = 10 // calls per minute
  const WINDOW_MS = 60 * 1000

  // Get current rate limit data from database
  const { data: rateData } = await supabase
    .from('rate_limits')
    .select('timestamps')
    .eq('user_id', userId)
    .single()

  let timestamps: number[] = []
  if (rateData && rateData.timestamps) {
    timestamps = rateData.timestamps
  }

  const now = Date.now()
  const recent = timestamps.filter(t => now - t < WINDOW_MS)

  if (recent.length >= RATE_LIMIT) {
    return true // rate limited
  }

  recent.push(now)

  // Update or insert rate limit data
  if (rateData) {
    await supabase
      .from('rate_limits')
      .update({ timestamps: recent })
      .eq('user_id', userId)
  } else {
    await supabase
      .from('rate_limits')
      .insert({ user_id: userId, timestamps: recent })
  }

  return false // not rate limited
}

export function validateInput(body: any, requiredFields: string[]): string | null {
  for (const field of requiredFields) {
    if (field === 'recentMessages' && !Array.isArray(body[field])) {
      return `Invalid input: ${field} must be an array`
    }
    if (field !== 'recentMessages' && !body[field]) {
      return `Invalid input: ${field} is required`
    }
  }
  return null
}

export function createOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY')!
  })
}

export function errorResponse(message: string, status: number = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export function successResponse(result: any): Response {
  return new Response(JSON.stringify({ result }), {
    headers: { 'Content-Type': 'application/json' }
  })
}