import { authenticateUser, checkRateLimit, validateInput, createOpenAIClient, SYSTEM_PROMPT, errorResponse, successResponse, MediationRequestBody } from '../_shared/utils.ts'

export default async function handler(req: Request) {
  try {
    const { user, supabase } = await authenticateUser(req)

    if (await checkRateLimit(user.id, supabase)) {
      return errorResponse('Rate limit exceeded', 429)
    }

    const body = await req.json() as MediationRequestBody
    const validationError = validateInput(body, ['caseMeta', 'partyContexts', 'recentMessages'])
    if (validationError) {
      return errorResponse(validationError, 400)
    }

    const { caseMeta, partyContexts, recentMessages } = body
    const openai = createOpenAIClient()

    const prompt = `${SYSTEM_PROMPT}

Case Meta: ${JSON.stringify(caseMeta)}

Party Contexts: ${JSON.stringify(partyContexts)}

Recent Messages: ${recentMessages!.map((m: any) => `${m.sender}: ${m.content}`).join('\n')}

Please generate or update a draft agreement based on the discussion.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    })

    const result = response.choices[0].message.content
    return successResponse(result)

  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Rate limit exceeded')) {
      return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 429)
    }
    console.error('Error in generate-agreement:', error)
    return errorResponse('Internal server error', 500)
  }
}