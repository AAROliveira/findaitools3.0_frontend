## ⚠️ Alerta importante sobre integração com WordPress/GraphQL

Todo acesso do frontend ao WordPress/GraphQL deve ser feito via o proxy local `/api/graphql`.
Nunca faça fetch direto para o domínio do WordPress no código do frontend!
O proxy está implementado em `src/app/api/graphql/route.ts` e elimina qualquer problema de CORS.
No SSR/ISR (lado servidor), o `fetchAPI` monta a URL absoluta do proxy usando a variável de ambiente `NEXT_PUBLIC_SITE_URL`.
No client (navegador), o `fetchAPI` usa o caminho relativo `/api/graphql`.
Se mudar o domínio do frontend, lembre-se de atualizar `NEXT_PUBLIC_SITE_URL` no Vercel.
# Preparação do Projeto Localmente

## 1. Instalar dependências
Abra o terminal na pasta `frontend` e execute:

```
npm install
```

## 2. Testar localmente
Execute:

```
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador para verificar se o projeto está funcionando.

## 3. Observações
- Certifique-se de ter o Node.js e o npm instalados.
- Caso encontre erros, verifique se todas as dependências estão corretas no `package.json`.
