// File: src/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
// Importação compatível com Node.js para ambientes serverless
const { VertexAI, HarmCategory, HarmBlockThreshold } = require('@google-cloud/vertexai');

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
        const body = await request.json();
        let messages: any[] = [];
        if (body && Array.isArray(body.messages)) {
            messages = body.messages;
        }
        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'A lista de mensagens é obrigatória.' }, { status: 400 });
        }

        const vertexAI = new VertexAI({
            project: process.env.GOOGLE_PROJECT_ID,
            location: process.env.GOOGLE_LOCATION || 'us-central1',
        });
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            systemInstruction: {
                role: 'system',
                parts: [
                    {
                        text: `Você é o assistente do www.findaitools.com.br. As recomendações de  ferramentas de IA DEVEM ser baseadas EXCLUSIVAMENTE no banco de dados findaitools.com.br (corpus RAG). Nunca invente ferramentas, nomes ou links. Sempre que recomendar uma ferramenta, busque no corpus findaitools.com.br e retorne:

                Nome da ferramenta
                Descrição
                Link https://findaitools.com.br/category/title correspondente

                Se não encontrar no corpus, responda: "Não encontrei nenhuma ferramenta correspondente no banco findaitools.com.br.". Antes de recomendar, faça perguntas para entender a real necessidade do usuário. Se necessário, confirme seu entendimento com um resumo. Exemplo de resposta:

                **Ferramenta:** ChatGPT
                **Descrição:** Plataforma de IA conversacional para geração de texto.
                **Link:** https://findaitools.com.br/category/title

                Sempre use esse formato e sempre cite o link findaitools.com.br.`
                    }
                ]
            },
            tools: [
                {
                    retrieval: {
                        vertexRagStore: {
                            ragResources: [
                                {
                                    ragCorpus: process.env.GOOGLE_RAG_CORPUS,
                                },
                            ],
                        },
                    },
                },
            ],
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.3,
                topP: 0.95,
            },
        });

        const history = messages.filter((msg) => msg && msg.role !== 'system' && typeof msg.content === 'string').map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
        }));

        const result = await model.generateContent({ contents: history });
        // Log detalhado para diagnóstico
        console.log('VertexAI result:', JSON.stringify(result, null, 2));
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return NextResponse.json({ response: text });
    } catch (error: any) {
        console.error('ERRO NA API DO CHAT:', error);
        return NextResponse.json(
            { error: 'Ocorreu um erro ao comunicar com o assistente de IA.' },
            { status: 500 }
        );
    }
}