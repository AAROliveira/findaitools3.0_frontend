// File: src/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { vertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';


// Função para inicializar o GoogleGenAI e configs // Não é mais necessário provider custom, pois o vertex() já lê as variáveis de ambiente padrão do Vercel


// Não é mais necessário provider custom, pois o vertex() já lê as variáveis de ambiente padrão do Vercel
// Função principal da API que será chamada pelo frontend
export async function POST(request: NextRequest) {
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
