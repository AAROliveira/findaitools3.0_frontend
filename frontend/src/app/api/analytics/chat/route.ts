import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { messages, timestamp, sessionId } = await request.json();
    // Aqui você pode salvar em banco, arquivo, etc. Por enquanto, só loga.
    console.log('Chat registrado:', { messages, timestamp, sessionId });
    return NextResponse.json({ ok: true });
}
