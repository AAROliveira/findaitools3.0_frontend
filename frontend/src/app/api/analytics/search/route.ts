import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { searchTerm, timestamp, sessionId } = await request.json();
    // Aqui você pode salvar em banco, arquivo, etc. Por enquanto, só loga.
    console.log('Busca registrada:', { searchTerm, timestamp, sessionId });
    return NextResponse.json({ ok: true });
}
