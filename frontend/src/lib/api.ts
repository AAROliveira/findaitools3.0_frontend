/**
 * Função genérica para fazer pedidos à API local que faz proxy para o WPGraphQL.
 */
async function fetchAPI(query: string, { variables }: { variables?: any } = {}) {
    const apiUrl = '/api/graphql'; 

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
            cache: 'no-cache' 
        });

        const json = await res.json();

        if (json.errors) {
            console.error("GraphQL Errors:", JSON.stringify(json.errors, null, 2));
            throw new Error('Falha ao buscar dados da API GraphQL através do proxy.');
        }
        return json.data;
    } catch (error) {
        console.error("Fetch Error:", error);
        throw new Error('Ocorreu um erro de rede ao comunicar com a API local.');
    }
}

// Função auxiliar para formatar objetos para a query GraphQL
const formatObjectForQuery = (obj: any): string => {
    return `{ ${Object.entries(obj).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
            return `${key}: ${formatObjectForQuery(value)}`;
        }
        // Garante que strings são envolvidas em aspas, mas números não
        return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
    }).join(', ')} }`;
};


/**
 * Busca posts com base nos filtros fornecidos.
 */
export async function getFilteredPosts(filters: {
    category?: string;
    tags?: string[];
    searchTerm?: string;
    dateQuery?: any; // Alterado para 'any' para aceitar estruturas complexas
}) {
    const { category, tags, searchTerm, dateQuery } = filters;

    const whereClauses: string[] = []; 
    if (category && category !== 'all') {
        whereClauses.push(`categoryName: "${category}"`);
    }
    if (tags && tags.length > 0) {
        const formattedTags = tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(', ');
        whereClauses.push(`tagIn: [${formattedTags}]`);
    }
    if (searchTerm) {
        whereClauses.push(`search: "${searchTerm}"`);
    }
    if (dateQuery) {
        // CORREÇÃO: Usa a função auxiliar para formatar o objeto de data corretamente
        whereClauses.push(`dateQuery: ${formatObjectForQuery(dateQuery)}`);
    }

    const whereArg = whereClauses.length > 0 ? `where: { ${whereClauses.join(', ')} }` : '';

    const query = `
        query GetFilteredPosts {
          posts(first: 21, ${whereArg}) {
            nodes {
              id, title, excerpt, date, slug, link,
              categories { nodes { name } },
              tags { nodes { name } }
            }
          }
        }
    `;

    const data = await fetchAPI(query);
    return data?.posts?.nodes || [];
}

/**
 * Busca todas as categorias de posts do WordPress.
 */
export async function getAllCategories() {
    const query = `
        query GetAllCategories {
          categories(first: 200) {
            nodes {
              id
              name
            }
          }
        }
    `;
    const data = await fetchAPI(query);
    return data?.categories?.nodes.filter((cat: { name: string }) => cat.name !== 'Uncategorized') || [];
}
