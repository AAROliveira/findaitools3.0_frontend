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
        // Escreve o JSON em um arquivo temporário e aponta GOOGLE_APPLICATION_CREDENTIALS para ele
        const fs = require('fs');
        const tmpPath = '/tmp/gcp-creds.json';
        fs.writeFileSync(tmpPath, json);
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
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
                system: `Você é o assistente especialista do findaitools.com.br. IMPORTANTE: Todas as respostas sobre ferramentas de IA DEVEM ser baseadas EXCLUSIVAMENTE no banco de dados findaitools.com.br (corpus RAG). Nunca invente ferramentas, nomes ou links. Sempre que recomendar uma ferramenta, busque no corpus findaitools.com.br e retorne:

Nome da ferramenta
Descrição
Link findaitools.com.br correspondente

Se não encontrar no corpus, responda: "Não encontrei nenhuma ferramenta correspondente no banco findaitools.com.br.". Nunca responda de cabeça, nunca invente links. Antes de recomendar, faça perguntas para entender a real necessidade do usuário. Se necessário, confirme seu entendimento com um resumo. Exemplo de resposta:

**Ferramenta:** ChatGPT
**Descrição:** Plataforma de IA conversacional para geração de texto.
**Link:** https://findaitools.com.br/ferramenta/chatgpt

Sempre use esse formato e sempre cite o link findaitools.com.br.`,
                tools: {
                    retrieval: {
                        vertexRagStore: {
                            ragResources: [
                            {
                                ragResource: {
                                ragCorpus: 'projects/findaitools/locations/us-central1/ragCorpora/6917529027641081856',
                                },
                            },
                            ],
                        },
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
