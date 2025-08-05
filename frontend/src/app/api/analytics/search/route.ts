import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    const { searchTerm, timestamp, sessionId } = await request.json();
    const filePath = join(process.cwd(), 'analytics-search.json');
    let data: any[] = [];
    try {
        const file = await readFile(filePath, 'utf-8');
        data = JSON.parse(file);
    } catch (e) {
        data = [];
    }
    data.push({ searchTerm, timestamp, sessionId });
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
}
