// File: src/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { vertex } from '@ai-sdk/google-vertex';
import { generateText, convertToCoreMessages } from 'ai';

// Lê e injeta as credenciais do Service Account a partir da variável GOOGLE_CREDENTIALS_BASE64
function injectGoogleCredentialsFromBase64() {
    const base64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    if (!base64) return;
    try {
        const json = Buffer.from(base64, 'base64').toString('utf-8');
        const creds = JSON.parse(json);
        process.env.GOOGLE_PROJECT_ID = creds.project_id;
        process.env.GOOGLE_CLIENT_EMAIL = creds.client_email;
        process.env.GOOGLE_PRIVATE_KEY = creds.private_key;
        if (!process.env.GOOGLE_LOCATION) process.env.GOOGLE_LOCATION = 'us-central1';
    } catch (e) {
        console.error('Falha ao decodificar GOOGLE_CREDENTIALS_BASE64:', e);
    }
}
// Importa o modelo de IA do Google Vertex AI


// Função para inicializar o GoogleGenAI e configs // Não é mais necessário provider custom, pois o vertex() já lê as variáveis de ambiente padrão do Vercel


// Não é mais necessário provider custom, pois o vertex() já lê as variáveis de ambiente padrão do Vercel
// Função principal da API que será chamada pelo frontend
export async function POST(request: NextRequest) {
    injectGoogleCredentialsFromBase64();
    try {
        const { messages } = await request.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'A lista de mensagens é obrigatória.' }, { status: 400 });
        }

        const { text } = await generateText({
            model: vertex('gemini-2.0-flash-001', {
                system: `Você é o assistente especialista do findaitools.com.br. Sua missão é ajudar usuários a encontrar a ferramenta de IA mais relevante exclusivamente de acordo com as mecessidades do usuário. Para tanto, faça perguntas para entender a real necessidade do usuário. Caso necessário, confirme seu entendimento com um resumo. Só então, busque e recomende as ferramentas. Use o banco de dados findaitools.com.br (corpus RAG) para suas recomendações. Sempre retorne nome da ferramenta, descrição e link correspondente findaitools.com.br.`,
                tools: {
                    retrieval: {
                        type: 'vertex-rag-store',
                        ragResources: [
                            {
                                ragCorpus: process.env.GOOGLE_RAG_CORPUS,
                            },
                        ],
                    },
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                ],
                maxOutputTokens: 2048,
                temperature: 0.3,
                topP: 0.95,
            }),
            messages: convertToCoreMessages(messages),
        });

        return NextResponse.json({ response: text });

    } catch (error: any) {
        console.error('ERRO NA API DO CHAT:', error);
        return NextResponse.json(
            { error: 'Ocorreu um erro ao comunicar com o assistente de IA.' },
            { status: 500 }
        );
    }
}
