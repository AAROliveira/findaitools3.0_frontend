// File: src/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { VertexAI, Part, Content } from '@google-cloud/vertexai';

// Função para inicializar o Vertex AI e o modelo generativo
async function initializeVertexAI() {
    const project = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_LOCATION || 'us-central1';
    const datastore = process.env.GOOGLE_DATASTORE; // Usando a variável de ambiente solicitada

    // Validação das variáveis de ambiente essenciais
    if (!project) {
        throw new Error("A variável de ambiente GOOGLE_PROJECT_ID não está definida.");
    }
    if (!datastore) {
        throw new Error("A variável de ambiente GOOGLE_DATASTORE não está definida.");
    }

    // Inicializa o cliente do Vertex AI.
    const vertex_ai = new VertexAI({ project, location });

    const systemInstruction: Content = {
        role: 'system',
        parts: [{
            text: `Você é o assistente especialista do findaitools.com.br. Sua missão é ajudar usuários a encontrar a ferramenta de IA ideal.
      Siga estas regras OBRIGATÓRIAS:
      1.  **Fluxo da Conversa:** Primeiro, faça perguntas para entender a real necessidade do usuário. Caso necessário, confirme seu entendimento com um resumo. Só então, busque e recomende as ferramentas.
      2.  **Formato da Recomendação:**
          - Cada recomendação deve ser feita exatamente assim (sem campo 'Link' separado):
            [Nome da Ferramenta](https://findaitools.com.br/caminho-da-ferramenta): Descrição da ferramenta.
          - Exemplo:
            [AI Homeworkify](https://findaitools.com.br/educacao/ai-homeworkify): Ideal para obter explicações detalhadas sobre conceitos complexos, resolver exercícios práticos e acessar recursos complementares para estudo.`
        }]
    };

    // Configuração do modelo com a instrução do sistema e a ferramenta RAG.
    const model = vertex_ai.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        systemInstruction: systemInstruction,
        tools: [{
            retrieval: {
                vertexAiSearch: {
                    datastore: datastore // Usando a variável de ambiente
                }
            }
        }],
    });

    return model;
}

// Função principal da API que será chamada pelo seu frontend
export async function POST(req: NextRequest) {
    try {
        const { history, message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'A mensagem do usuário é obrigatória.' }, { status: 400 });
        }

        const model = await initializeVertexAI();

        // Inicia uma sessão de chat com o histórico da conversa
        const chat = model.startChat({ history });

        // Envia a nova mensagem e aguarda a resposta
        const result = await chat.sendMessage(message);
        const response = result.response;

        if (!response || !response.candidates || response.candidates.length === 0 || !response.candidates[0].content?.parts[0]?.text) {
            console.error("Resposta inválida ou vazia recebida do modelo Gemini:", JSON.stringify(response, null, 2));
            throw new Error("Resposta inválida do modelo Gemini.");
        }

        return NextResponse.json({ response: response.candidates[0].content.parts[0].text });

    } catch (error: any) {
        // Log de erro mais detalhado
        console.error('ERRO NA API DO CHAT:', {
            message: error.message,
            stack: error.stack,
            details: error.details, // Alguns erros do Google Cloud têm informações extras aqui
        });

        return NextResponse.json(
            { error: 'Ocorreu um erro ao comunicar com o assistente de IA.' },
            { status: 500 }
        );
    }
}
