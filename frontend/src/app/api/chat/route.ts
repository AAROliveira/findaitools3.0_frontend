// File: src/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';


// Função para inicializar o GoogleGenAI e configs
function getGenAIConfig() {
    const project = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_LOCATION || 'us-central1';
    const ragCorpus = process.env.GOOGLE_RAG_CORPUS; // Ex: 'projects/findaitools/locations/us-central1/ragCorpora/6917529027641081856'

    if (!project) throw new Error('A variável de ambiente GOOGLE_PROJECT_ID não está definida.');
    if (!ragCorpus) throw new Error('A variável de ambiente GOOGLE_RAG_CORPUS não está definida.');

    const ai = new GoogleGenAI({
        vertexai: true,
        project,
        location,
    });

    // System instruction
    const systemInstruction = {
        parts: [
            {
                text: `Você é o assistente especialista do findaitools.com.br. Sua missão é ajudar usuários a encontrar a ferramenta de IA ideal.\nSiga estas regras OBRIGATÓRIAS:\n1. **Fluxo da Conversa:** Primeiro, faça perguntas para entender a real necessidade do usuário. Caso necessário, confirme seu entendimento com um resumo. Só então, busque e recomende as ferramentas.\n2. **Formato da Recomendação:**\n- Cada recomendação deve ser feita exatamente assim (sem campo 'Link' separado):\n[Nome da Ferramenta](https://findaitools.com.br/caminho-da-ferramenta): Descrição da ferramenta.\n- Exemplo:\n[AI Homeworkify](https://findaitools.com.br/educacao/ai-homeworkify): Ideal para obter explicações detalhadas sobre conceitos complexos, resolver exercícios práticos e acessar recursos complementares para estudo.`
            }
        ]
    };

    // Tools (RAG)
    const tools = [
        {
            retrieval: {
                vertexRagStore: {
                    ragResources: [
                        {
                            ragResource: {
                                ragCorpus: ragCorpus,
                            },
                        },
                    ],
                },
            },
        },
    ];

    // Safety settings (opcional, pode customizar)
    const safetySettings = [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' },
    ];

    // Generation config
    const generationConfig = {
        maxOutputTokens: 8192,
        temperature: 1,
        topP: 0.95,
        safetySettings,
        tools,
        systemInstruction,
    };

    return { ai, generationConfig };
}

// Função principal da API que será chamada pelo frontend
export async function POST(req: NextRequest) {
    try {
        const { history, message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'A mensagem do usuário é obrigatória.' }, { status: 400 });
        }

        const { ai, generationConfig } = getGenAIConfig();
        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

        // Monta o contexto do chat (history)
        const chatHistory = Array.isArray(history) ? history : [];
        const contents = [
            ...chatHistory,
            { role: 'user', parts: [{ text: message }] },
        ];

        // Chama a API Gemini
        const result = await model.generateContent({
            contents,
            generationConfig,
        });

        // Resposta do modelo
        const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.error('Resposta inválida ou vazia recebida do modelo Gemini:', JSON.stringify(result, null, 2));
            throw new Error('Resposta inválida do modelo Gemini.');
        }

        return NextResponse.json({ response: text });

    } catch (error: any) {
        // Log de erro mais detalhado
        console.error('ERRO NA API DO CHAT:', {
            message: error.message,
            stack: error.stack,
            details: error.details,
        });

        return NextResponse.json(
            { error: 'Ocorreu um erro ao comunicar com o assistente de IA.' },
            { status: 500 }
        );
    }
}
