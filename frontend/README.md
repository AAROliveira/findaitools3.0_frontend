# findaitools3.0_frontend

## Visão Geral

Este projeto integra Next.js (frontend), WordPress (backend de conteúdo via GraphQL) e Google Vertex AI Gemini (RAG) para criar um buscador inteligente de ferramentas de IA, com deploy pronto para Vercel e autenticação segura via Service Account. O objetivo é fornecer uma base robusta, escalável e fácil de adaptar para outros projetos de busca e recomendação baseados em IA.

---

## Estrutura do Projeto


```text
app/
  body.json
  llm_config.py
  local_search.py
  main.py
  ollama_config.py
  run_server.py
  setup_ollama.py
  start_server.py
  test_api.py
  test_backend.py
  test_chat.py
  __pycache__/
frontend/
  components.json
  next-env.d.ts
  next.config.js
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.json
  src/
    app/
      globals.css
      layout.tsx
      page.tsx
    components/
      Chatbot.tsx
      MarkdownMessage.tsx
      SearchAndFilter.tsx
      ui/
        badge.tsx
        button.tsx
        card.tsx
        input.tsx
    lib/
      utils.ts
```

---

## Fluxo de Dados e Integração


### 1. Frontend (Next.js)

- Interface de chat (`Chatbot.tsx`) envia mensagens para `/api/chat`.
- Respostas são renderizadas via `MarkdownMessage.tsx` (usa `react-markdown` para links clicáveis).
- Filtros de busca por tags/categorias, contador de soluções, UI moderna com Tailwind.

### 2. Backend (API Route Next.js)

- Endpoint `/api/chat` (`route.ts`) recebe mensagens, injeta credenciais do Google via variável de ambiente Base64, inicializa Vertex AI Gemini com RAG (corpus findaitools.com.br).
- Prompt orienta o modelo Gemini a responder apenas com dados reais do corpus, formatando recomendações como links Markdown.
- Segurança: nunca expõe credenciais, nunca inventa respostas.

### 3. WordPress (WPGraphQL)

- Serve como backend de conteúdo, acessado via proxy GraphQL.
- Filtros por tags/categorias implementados via slug/ID.

### 4. Vertex AI Gemini (RAG)

- Integração via SDK oficial `@google-cloud/vertexai`.
- Autenticação por Service Account (Base64), corpus configurável via variável de ambiente.
- Prompt customizado para respostas seguras, formatadas e sempre baseadas no contexto recuperado.

---

## Deploy no Vercel


1. **Clone o repositório:**

   ```sh
   git clone https://github.com/AAROliveira/findaitools3.0_frontend.git
   cd findaitools3.0_frontend/frontend
   ```

2. **Configure as variáveis de ambiente no painel do Vercel:**

   - `GOOGLE_CREDENTIALS_BASE64`: Credenciais do Service Account (arquivo JSON, convertido para Base64).
   - `GOOGLE_RAG_CORPUS`: Nome do corpus Vertex AI (ex: `projects/xxx/locations/us-central1/corpora/yyy`).
   - `GOOGLE_PROJECT_ID`, `GOOGLE_LOCATION` (opcional, default: `us-central1`).
   - Outras variáveis do WordPress/GraphQL conforme necessário.

3. **Instale as dependências:**

   ```sh
   npm install
   ```

4. **Deploy:**

   - Faça deploy pelo painel do Vercel ou via CLI:

     ```sh
     vercel --prod
     ```

---


## Segurança e Boas Práticas

- **Nunca exponha o arquivo de credenciais!** Use sempre a variável Base64.
- O endpoint `/api/chat` nunca retorna dados sensíveis.
- O modelo Gemini só responde com dados do corpus findaitools.com.br.
- Links são sempre formatados em Markdown e renderizados como `<a target="_blank">`.

---


## Customização e Extensão

- Para usar outro corpus, altere a variável `GOOGLE_RAG_CORPUS`.
- Para adaptar para outro frontend, basta consumir `/api/chat` e renderizar Markdown.
- Para trocar o backend de conteúdo, adapte o proxy GraphQL.
- O prompt do Gemini pode ser ajustado para outros domínios, mantendo a estrutura de segurança e formatação.

---

## Exemplos de Uso


### Exemplo de mensagem enviada pelo frontend

```json
{
  "messages": [
    { "role": "user", "content": "Quero uma ferramenta de IA para gerar imagens." }
  ]
}
```

### Exemplo de resposta do backend

```json
{
  "response": "**Ferramenta:** [Midjourney](https://findaitools.com.br/category/midjourney)\n**Descrição:** Geração de imagens realistas por IA."
}
```

---


## Manutenção e Evolução

- Sempre revise o contrato entre frontend (`Chatbot.tsx`/`MarkdownMessage.tsx`) e backend (`route.ts`) antes de alterar a estrutura das mensagens ou o formato das respostas.
- O backend espera um array `messages` e sempre retorna `{ response: string }`.
- O frontend espera respostas em Markdown, com links no padrão `[Nome](URL)`.
- Para evoluir, mantenha a documentação e o fluxo de dados claros para evitar regressões.

---


## Créditos e Licença

- Projeto desenvolvido por [AAROliveira](https://github.com/AAROliveira) e colaboradores.
- Baseado em Next.js, WordPress, Google Vertex AI Gemini.
- Licença: MIT (ou conforme definido no repositório).
