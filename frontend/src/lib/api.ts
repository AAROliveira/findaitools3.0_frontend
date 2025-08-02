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
  const { category, tags, searchTerm, orderBy, first = 100, after } = filters;

  const whereClauses: string[] = [];
  if (category && category !== 'all') {
    // Se for número, usa categoryId, se for string, tenta converter para número
    const categoryId = Number(category);
    if (!isNaN(categoryId)) {
      whereClauses.push(`categoryId: ${categoryId}`);
    } else {
      whereClauses.push(`categoryName: "${category}"`);
    }
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

  // Monta os argumentos dinamicamente, evitando vírgulas extras
  const args = [
    `first: ${first}`,
    whereClauses.length > 0 ? `where: { ${whereClauses.join(', ')} }` : null,
    after ? `after: "${after}"` : null
  ].filter(Boolean).join(', ');

  const query = `
    query GetFilteredPosts {
      posts(${args}) {
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
              slug
            }
          }
        }
    `;
  const data = await fetchAPI(query);
  return data?.categories?.nodes.filter((cat: { name: string }) => cat.name !== 'Uncategorized') || [];
}

/**
 * Busca um post completo pelo slug, incluindo imagem destacada e relacionados.
 */
export async function getPostBySlug(slug: string) {
  const query = `
    query PostBySlug($slug: String!) {
      postBy(slug: $slug) {
        title
        date
        excerpt
        content
        featuredImage {
          node {
            sourceUrl(size: LARGE)
          }
        }
        acf {
          titulo_do_post
          descricao_da_ferramenta
          atributos_da_ferramenta
          exemplos_de_uso_da_ferramenta
          visite_o_site
        }
        categories { nodes { name, slug, id } }
        tags { nodes { name } }
        id
      }
      posts(first: 4, where: { categoryName: "", notIn: [$slug] }) {
        nodes {
          slug
          title
          excerpt
          date
          featuredImage { node { sourceUrl(size: MEDIUM) } }
        }
      }
    }
  `;
  const data = await fetchAPI(query, { variables: { slug } });
  const post = data?.postBy;
  if (!post) return null;
  // Parse atributos e exemplos para array
  const parseList = (str?: string) => str ? str.split(/\n+/).filter(Boolean) : [];
  // Relacionados: pega posts diferentes do atual, mesma(s) categoria(s)
  const related = (data?.posts?.nodes || []).filter((p: any) => p.slug !== slug).map((p: any) => ({
    slug: p.slug,
    title: p.title,
    description: p.excerpt?.replace(/<[^>]+>/g, ''),
    date: p.date,
    image: p.featuredImage?.node?.sourceUrl || undefined,
  }));
  return {
    title: post.acf?.titulo_do_post || post.title,
    logo: post.featuredImage?.node?.sourceUrl,
    date: post.date,
    categories: post.categories?.nodes?.map((c: any) => c.name) || [],
    tags: post.tags?.nodes?.map((t: any) => t.name) || [],
    description: post.acf?.descricao_da_ferramenta || post.excerpt || '',
    attributes: parseList(post.acf?.atributos_da_ferramenta),
    examples: parseList(post.acf?.exemplos_de_uso_da_ferramenta),
    site: post.acf?.visite_o_site,
    content: post.content,
    related,
  };
}
