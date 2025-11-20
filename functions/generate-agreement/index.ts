import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai'

// Simple in-memory rate limiting (per function instance)
const rateLimitMap = new Map<string, number[]>()

const RATE_LIMIT = 10 // calls per minute
const WINDOW_MS = 60 * 1000

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(userId) || []
  const recent = timestamps.filter(t => now - t < WINDOW_MS)
  if (recent.length >= RATE_LIMIT) return true
  recent.push(now)
  rateLimitMap.set(userId, recent)
  return false
}

export default async function handler(req: Request) {
  try {
    // Authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Rate limiting
    if (isRateLimited(user.id)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    const { caseMeta, partyContexts, recentMessages } = await req.json()

    // Input validation
    if (!caseMeta || !partyContexts || !Array.isArray(recentMessages)) {
      return new Response(JSON.stringify({ error: 'Invalid input parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!
    })

    // System prompt
    const SYSTEM_PROMPT = "You are an impartial, neutral mediator facilitating a conversation between two parties. Your role is to help them reach a fair agreement by summarizing discussions, suggesting compromises, rephrasing messages calmly, and drafting agreements. Always remain neutral and professional."

    // Construct prompt
    const prompt = `${SYSTEM_PROMPT}

Case Meta: ${JSON.stringify(caseMeta)}

Party Contexts: ${JSON.stringify(partyContexts)}

Recent Messages: ${recentMessages.map((m: any) => `${m.sender}: ${m.content}`).join('\n')}

Please generate or update a draft agreement based on the discussion.`

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    })

    const result = response.choices[0].message.content

    return new Response(JSON.stringify({ result }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in generate-agreement:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}