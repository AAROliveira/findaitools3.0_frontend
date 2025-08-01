// SEO dinâmico para a página principal
export async function generateMetadata() {
    return {
        title: 'FindAITools - Encontre as melhores ferramentas de IA',
        description: 'Descubra, filtre e compare ferramentas de Inteligência Artificial para todas as áreas. Busque por categoria, compare soluções e converse com nosso assistente IA para encontrar a melhor opção para você.',
    };
}
import HomeClient from "./HomeClient";
import { getFilteredPosts, getAllCategories } from "@/lib/api";

export const revalidate = 10;

export default async function Home() {
    let initialPosts: any[] = [];
    let categories: any[] = [];
    let error: string | null = null;

    try {
        // Busca os dados iniciais e as categorias em paralelo
        const [postsData, categoriesData] = await Promise.all([
            getFilteredPosts({}),
            getAllCategories()
        ]);
        initialPosts = postsData;
        categories = categoriesData;
    } catch (e) {
        console.error(e);
        error = "Erro ao buscar dados iniciais do WordPress.";
    }

    // Passa os posts e as categorias para o componente cliente
    return <HomeClient initialPosts={initialPosts} allCategories={categories} error={error} />;
}
