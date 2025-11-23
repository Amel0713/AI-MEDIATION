import { authenticateUser, checkRateLimit, validateInput, createOpenAIClient, SYSTEM_PROMPT, errorResponse, successResponse, MediationRequestBody } from '../_shared/utils.ts'

export default async function handler(req: Request) {
  try {
    const { user, supabase } = await authenticateUser(req)

    if (await checkRateLimit(user.id, supabase)) {
      return errorResponse('Rate limit exceeded', 429)
    }

    const body = await req.json() as MediationRequestBody
    const validationError = validateInput(body, ['draftText'])
    if (validationError) {
      return errorResponse(validationError, 400)
    }

    const { draftText } = body
    const openai = createOpenAIClient()

    const prompt = `${SYSTEM_PROMPT}

Please improve the clarity, readability, and neutrality of the following agreement draft:

"${draftText}"

Make it more professional, clear, and balanced.`

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
    console.error('Error in improve-agreement:', error)
    return errorResponse('Internal server error', 500)
  }
}