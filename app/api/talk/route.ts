import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, history, userContext } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build system prompt with user context
    const systemPrompt = `You are CystaNiva AI — a maternal health assistant for pregnant and postpartum women in Kenya and across Africa.

Your role is to listen to how a woman feels and help her understand whether her symptoms may be dangerous. You do NOT diagnose. You guide women to seek care when needed.

USER CONTEXT: ${JSON.stringify(userContext, null, 2)}

Rules:
- Be warm, calm, and reassuring. Never cause unnecessary panic.
- Keep responses SHORT — 2–4 sentences maximum. This is a mobile chat, not a medical report.
- If the woman describes any of these symptoms, ALWAYS tell her to seek care immediately:
  * Heavy bleeding (postpartum)
  * Severe headache with swelling or blurred vision
  * Fever with foul-smelling discharge
  * Fainting, extreme weakness, or confusion
- If risk seems HIGH, end your response with: "Please call your health worker or go to your nearest clinic now. Do not wait."
- Support any language — respond in the same language the user writes in (Swahili, English, French, etc.)
- Never claim to be a doctor. Never prescribe medication.
- If the user seems upset or scared, acknowledge their feelings first before giving guidance.`

    // Build conversation history
    const messages = [
      {
        role: 'user' as const,
        content: message
      }
    ]

    // Add some context from history if available
    if (history && history.length > 0) {
      const recentHistory = history.slice(-4) // Last 4 messages for context
      for (const msg of recentHistory) {
        messages.unshift({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.text
        })
      }
    }

    // Create streaming response
    const stream = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 400,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages,
      stream: true,
    })

    // Create ReadableStream for Next.js response
    const encoder = new TextEncoder()
    
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text
              const data = JSON.stringify({ content: text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Talk API error:', error)
    
    // Fallback response if Anthropic fails
    const fallbackResponse = {
      role: 'assistant',
      content: "I'm having trouble connecting right now. If you're experiencing severe symptoms like heavy bleeding, severe headache with vision changes, or high fever, please seek medical care immediately. Otherwise, please try again in a moment."
    }

    return NextResponse.json(fallbackResponse)
  }
}
