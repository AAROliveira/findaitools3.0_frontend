/**
 * Função genérica para fazer pedidos à API local que faz proxy para o WPGraphQL.
 * @param query A consulta GraphQL.
 * @param variables As variáveis para a consulta.
 */
async function fetchAPI(query: string, { variables }: { variables?: any } = {}) {
  const isServer = typeof window === 'undefined';
  const apiUrl = isServer
    ? process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://findaitools.com.br/graphql'
    : '/api/graphql';

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

const formatObjectForQuery = (obj: any): string => {
  return `{ ${Object.entries(obj).map(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return `${key}: ${formatObjectForQuery(value)}`;
    }
    return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
  }).join(', ')} }`;
};

/**
 * Busca posts com base nos filtros, ordenação e paginação.
 */
export async function getFilteredPosts(filters: {
  category?: string;
  tags?: string[];
  searchTerm?: string;
  orderBy?: { field: string; order: string };
  first?: number;
  after?: string;
}) {
  const { category, tags, searchTerm, orderBy, first = 21, after } = filters;

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
  if (orderBy) {
    whereClauses.push(`orderby: { field: ${orderBy.field}, order: ${orderBy.order} }`);
  }

  const whereArg = whereClauses.length > 0 ? `where: { ${whereClauses.join(', ')} }` : '';
  const afterArg = after ? `after: "${after}"` : '';

  const query = `
        query GetFilteredPosts {
          posts(first: ${first}, ${whereArg}, ${afterArg}) {
            nodes {
              id
              title
              excerpt
              date
              slug
              link
              featuredImage {
                node {
                  sourceUrl(size: LARGE)
                }
              }
              categories {
                nodes {
                  name
                }
              }
              tags {
                nodes {
                  name
                  slug
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            count
          }
        }
    `;

  const data = await fetchAPI(query);
  return data?.posts; // Return the whole posts object including pageInfo
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
