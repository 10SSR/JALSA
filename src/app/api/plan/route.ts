import { NextRequest, NextResponse } from 'next/server';
import { EventProfileSchema } from '@/lib/validation';
import { generateCompleteEventPlan } from '@/lib/engine';
import { checkRateLimit } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = EventProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid event profile schema', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    // Pure deterministic engine executes plan generation
    const plan = generateCompleteEventPlan(parseResult.data);

    return NextResponse.json({ success: true, data: plan });
  } catch {
    return NextResponse.json({ error: 'Failed to generate event plan.' }, { status: 500 });
  }
}
