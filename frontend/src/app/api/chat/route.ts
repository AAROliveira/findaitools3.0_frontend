// File: src/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { vertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';
import { GoogleGenAI } from '@google/genai';
// Lê e injeta as credenciais do Service Account a partir da variável GOOGLE_CREDENTIALS_BASE64
function injectGoogleCredentialsFromBase64() {
    const base64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    if (!base64) return;
    try {
        const json = Buffer.from(base64, 'base64').toString('utf-8');
        const creds = JSON.parse(json);
        // Injeta as variáveis de ambiente esperadas pelo SDK
        process.env.GOOGLE_PROJECT_ID = creds.project_id;
        process.env.GOOGLE_CLIENT_EMAIL = creds.client_email;
        process.env.GOOGLE_PRIVATE_KEY = creds.private_key;
        if (creds.private_key_id) process.env.GOOGLE_PRIVATE_KEY_ID = creds.private_key_id;
        // Location pode ser fixo ou vir do .env, se não existir
        if (!process.env.GOOGLE_LOCATION) process.env.GOOGLE_LOCATION = 'us-central1';
    } catch (e) {
        // Não lança erro, apenas loga para debug
        console.error('Falha ao decodificar GOOGLE_CREDENTIALS_BASE64:', e);
    }
}
// Importa o modelo de IA do Google Vertex AI


// Função para inicializar o GoogleGenAI e configs // Não é mais necessário provider custom, pois o vertex() já lê as variáveis de ambiente padrão do Vercel


// Não é mais necessário provider custom, pois o vertex() já lê as variáveis de ambiente padrão do Vercel
// Função principal da API que será chamada pelo frontend
export async function POST(request: NextRequest) {
    // Injeta as credenciais do Service Account no ambiente
    injectGoogleCredentialsFromBase64();
    console.log('GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL);
    try {
        const { history, message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'A mensagem do usuário é obrigatória.' }, { status: 400 });
        }

        // Monta o prompt concatenando o histórico (se houver)
        const prompt = [
            ...(Array.isArray(history) ? history.map(h => h.parts?.[0]?.text || '') : []),
            message
        ].join('\n');

        // Chama o modelo Gemini 2.0 Flash
        const { text } = await generateText({
            model: vertex('gemini-2.0-flash-001', {
                systemInstruction: {
                    role: 'system',
                    parts: [
                        {
                            text: `Você é o assistente especialista do findaitools.com.br. Sua missão é ajudar usuários a encontrar a ferramenta de IA ideal.\nSiga estas regras OBRIGATÓRIAS:\n1. **Fluxo da Conversa:** Primeiro, faça perguntas para entender a real necessidade do usuário. Caso necessário, confirme seu entendimento com um resumo. Só então, busque e recomende as ferramentas.\n2. **Formato da Recomendação:**\n- Cada recomendação deve ser feita exatamente assim (sem campo 'Link' separado):\n[Nome da Ferramenta](https://findaitools.com.br/caminho-da-ferramenta): Descrição da ferramenta.\n- Exemplo:\n[AI Homeworkify](https://findaitools.com.br/educacao/ai-homeworkify): Ideal para obter explicações detalhadas sobre conceitos complexos, resolver exercícios práticos e acessar recursos complementares para estudo.`
                        }
                    ]
                },
                tools: [
                    {
                        retrieval: {
                            vertexRagStore: {
                                ragResources: [
                                    {
                                        ragResource: {
                                            ragCorpus: process.env.GOOGLE_RAG_CORPUS,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
                safetySettings: [
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' },
                ],
                maxOutputTokens: 2040,
                temperature: 0.3,
                topP: 0.95,
            }),
            prompt,
        });

        return NextResponse.json({ response: text });

    } catch (error: any) {
        // Log de erro mais detalhado
        console.error('ERRO NA API DO CHAT:', error);
        return NextResponse.json(
            { error: 'Ocorreu um erro ao comunicar com o assistente de IA.' },
            { status: 500 }
        );
    }
}
