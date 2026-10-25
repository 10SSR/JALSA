import { NextRequest, NextResponse } from 'next/server';
import { GeminiLLMClient, checkRateLimit } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting per IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few seconds before trying again.' },
        { status: 429 }
      );
    }

    // 2. Request body validation
    const body = await req.json();
    const userInput = body?.message;
    const existingState = body?.existingState || {};

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json({ error: 'Message string is required.' }, { status: 400 });
    }

    // 3. User input length cap to prevent prompt injection / buffer attacks
    if (userInput.length > 2000) {
      return NextResponse.json(
        { error: 'Message exceeds maximum allowed length of 2000 characters.' },
        { status: 400 }
      );
    }

    // 4. Extraction with GeminiLLMClient (falls back automatically to deterministic engine)
    const client = new GeminiLLMClient();
    const result = await client.extractIntake(userInput, existingState);

    return NextResponse.json({
      success: true,
      data: result,
      source:
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock-key-for-ci'
          ? 'gemini'
          : 'engine_fallback',
    });
  } catch {
    return NextResponse.json({ error: 'Internal intake processing error' }, { status: 500 });
  }
}
