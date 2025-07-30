// File: src/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';

// --- Otimização de Performance ---
// A inicialização do cliente e do modelo é feita aqui, no escopo do módulo.
// Isso permite que a mesma instância seja reutilizada em múltiplas chamadas da API,
// economizando tempo de processamento e custos.

const project = process.env.GOOGLE_PROJECT_ID || 'findaitools';
const location = process.env.GOOGLE_LOCATION || 'us-central1';

// Inicializa o cliente do Vertex AI.
// As credenciais são lidas automaticamente das variáveis de ambiente no Vercel.
const vertex_ai = new VertexAI({ project, location });

// Configuração do modelo com a instrução do sistema e a ferramenta RAG.
const model = vertex_ai.getGenerativeModel({
  model: 'gemini-1.5-flash-8b',
  systemInstruction: {
    parts: [{ text: `Você é o assistente especialista do findaitools.com.br. Sua missão é ajudar usuários a encontrar a ferramenta de IA ideal.
      Siga estas regras OBRIGATÓRIAS:
      1.  **Fluxo da Conversa:** Primeiro, faça perguntas para entender a real necessidade do usuário. Caso necessário, confirme seu entendimento com um resumo. Só então, busque e recomende as ferramentas.
      2.  **Formato da Recomendação:**
          - Cada recomendação deve ser feita exatamente assim (sem campo 'Link' separado):
            [Nome da Ferramenta](https://findaitools.com.br/caminho-da-ferramenta): Descrição da ferramenta.
          - Exemplo:
            [AI Homeworkify](https://findaitools.com.br/educacao/ai-homeworkify): Ideal para obter explicações detalhadas sobre conceitos complexos, resolver exercícios práticos e acessar recursos complementares para estudo.`
    }]
  },
  tools: [{
    retrieval: {
      vertexAiSearch: {
        // Garanta que este é o caminho completo do seu Data Store no Vertex AI Search.
        datastore: "projects/findaitools/locations/us-central1/ragCorpora/6917529027641081856",
      }
    }
  }],
});


// --- Função Principal da API ---
export async function POST(req: NextRequest) {
  try {
    // Pega o histórico e a mensagem do corpo da requisição.
    const { history, message } = await req.json();

    // Validação de entrada.
    if (!message) {
      return NextResponse.json({ error: 'A mensagem do usuário é obrigatória.' }, { status: 400 });
    }

    // Inicia uma sessão de chat usando o modelo pré-inicializado.
    const chat = model.startChat({ history });

    // Envia a nova mensagem e aguarda o resultado.
    const result = await chat.sendMessage(message);
    const response = result.response;

    // --- Tratamento Robusto da Resposta ---
    // Verifica se a resposta, os candidatos e o conteúdo existem antes de tentar acessá-los.
    if (!response?.candidates?.length || !response.candidates[0].content?.parts?.length) {
      // Se não houver uma resposta válida (ex: bloqueada por filtros de segurança), retorna um erro.
      return NextResponse.json(
        { error: 'Não foi possível obter uma resposta da IA. Tente reformular sua pergunta.' },
        { status: 500 }
      );
    }

    // Concatena o texto de todas as 'parts' da resposta. O modelo pode dividir a resposta
    // em vários pedaços, e essa abordagem garante que você capture tudo.
    const responseText = response.candidates[0].content.parts
      .map(part => part.text)
      .filter(text => text !== undefined) // Filtra partes que não são texto
      .join('');

    // Retorna a resposta de texto concatenada para o frontend.
    return NextResponse.json({ response: responseText });

  } catch (error) {
    // Log detalhado do erro no servidor (bom para depuração).
    console.error('Erro na API do Chat:', error);

    // Retorna uma mensagem de erro genérica para o cliente.
    return NextResponse.json(
      { error: 'Ocorreu um erro ao comunicar com o assistente de IA.' },
      { status: 500 }
    );
  }
}