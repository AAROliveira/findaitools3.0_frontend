// ⚠️ IMPORTANTE: Nunca faça fetch direto para o domínio do WordPress neste componente!
"use client";

import React, { useState, useEffect, useRef } from "react";
import { getFilteredPosts } from "@/lib/api";

// --- Ícones SVG ---
const SearchIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const ExternalLinkIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>);
const CalendarIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const LoaderIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>);
const TagIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.586 2.586a2 2 0 0 0-2.828 0L2.172 10.172a2 2 0 0 0 0 2.828l7.414 7.414a2 2 0 0 0 2.828 0l7.586-7.586a2 2 0 0 0 0-2.828z" /><circle cx="16" cy="8" r="1" /></svg>);
const ClearIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

// --- Interfaces ---
export interface Post {
    id: string;
    title: string;
    excerpt: string;
    url: string;
    category: string;
    tags: { name: string; slug: string }[];
    publishDate: string;
    imageUrl?: string;
}

export interface SearchAndFilterProps {
    initialPosts: any; // Now expects the whole posts object
    allCategories: { id: string; name: string }[];
    error: string | null;
    onPostSelect?: (post: Post) => void;
}

// --- Componente Principal ---
export default function SearchAndFilter({ initialPosts, allCategories, error: initialError, onPostSelect }: SearchAndFilterProps) {
    // --- Estado do Componente ---
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(initialError);
    const [tagContext, setTagContext] = useState<{ name: string; slug: string }[]>([]);

    // --- Estado de Paginação ---
    const [hasNextPage, setHasNextPage] = useState(false);
    const [endCursor, setEndCursor] = useState<string | null>(null);

    // --- Estado dos Filtros ---
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedTags, setSelectedTags] = useState<{ name: string; slug: string }[]>([]);
    const [sortBy, setSortBy] = useState("DATE_DESC");

    const isInitialMount = useRef(true);

    // --- Efeitos ---
    useEffect(() => {
        const mapped = mapApiDataToPosts(initialPosts?.nodes || []);
        setPosts(mapped);
        setTagContext(extractTags(mapped));
        setHasNextPage(initialPosts?.pageInfo?.hasNextPage || false);
        setEndCursor(initialPosts?.pageInfo?.endCursor || null);
    }, [initialPosts]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const handler = setTimeout(() => {
            fetchAndSetPosts(false); // False indicates it's a new search, not loading more
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, selectedCategory, sortBy, selectedTags]);

    // --- Funções de Fetch e Mapeamento ---
    const fetchAndSetPosts = async (isLoadingMore = false) => {
        if (isLoadingMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        setError(null);

        const [field, order] = sortBy.split('_');
        const filters = {
            searchTerm: searchTerm || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            tags: selectedTags.length > 0 ? selectedTags.map(t => t.slug) : undefined,
            orderBy: { field, order },
            after: isLoadingMore && endCursor ? endCursor : undefined,
        };

        try {
            const postsData = await getFilteredPosts(filters);
            const newPosts = mapApiDataToPosts(postsData?.nodes || []);

            if (isLoadingMore) {
                setPosts(prevPosts => [...prevPosts, ...newPosts]);
            } else {
                setPosts(newPosts);
                // Only update tag context on a new search
                const contextTags = extractTags(newPosts);
                setTagContext(contextTags);
            }

            setHasNextPage(postsData?.pageInfo?.hasNextPage || false);
            setEndCursor(postsData?.pageInfo?.endCursor || null);

        } catch (err) {
            setError("Falha ao buscar os posts. Tente novamente.");
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const extractTags = (data: Post[]): { name: string; slug: string }[] => {
        if (!data || data.length === 0) return [];
        const allTags = data.flatMap(post => post.tags);
        // Remover duplicatas por slug
        const unique = new Map();
        allTags.forEach(tag => {
            if (tag && tag.slug) unique.set(tag.slug, tag);
        });
        return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
    };

    const mapApiDataToPosts = (data: any[]): Post[] => {
        if (!data || !Array.isArray(data)) return [];
        return data.map((post: any) => ({
            id: post.id,
            title: post.title.replace(/<[^>]*>?/gm, ''),
            excerpt: post.excerpt.replace(/<[^>]*>?/gm, ''),
            url: post.link,
            imageUrl: post.featuredImage?.node?.sourceUrl,
            category: post.categories?.nodes?.[0]?.name || 'Geral',
            tags: Array.isArray(post.tags?.nodes)
                ? post.tags.nodes.map((t: any) => ({ name: t.name, slug: t.slug }))
                : [],
            publishDate: new Date(post.date).toISOString(),
        }));
    };

    // --- Handlers de Filtro ---
    const toggleTag = (tag: { name: string; slug: string }) => {
        setSelectedTags(prevTags =>
            prevTags.some(t => t.slug === tag.slug)
                ? prevTags.filter(t => t.slug !== tag.slug)
                : [...prevTags, tag]
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("all");
        setSelectedTags([]);
        setSortBy("DATE_DESC");
    };

    const activeFilterCount =
        (searchTerm ? 1 : 0) +
        (selectedCategory !== "all" ? 1 : 0) +
        selectedTags.length;

    // --- Renderização ---
    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 p-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
                {/* Grade Principal de Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Item 1: Busca */}
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nome ou palavra-chave..."
                            className="w-full pl-12 pr-4 py-3 text-base h-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        />
                    </div>
                    {/* Item 2: Categoria */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full h-full px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition"
                    >
                        <option value="all">Todas as Categorias</option>
                        {allCategories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    {/* Item 3: Ordenação */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full h-full px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition"
                    >
                        <option value="DATE_DESC">Mais Recentes</option>
                        <option value="DATE_ASC">Mais Antigos</option>
                        <option value="TITLE_ASC">Título (A-Z)</option>
                        <option value="TITLE_DESC">Título (Z-A)</option>
                    </select>
                </div>

                {/* Seção de Tags temporariamente removida por solicitação do cliente */}

                {/* Footer do Filtro */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                        {!loading && (
                            <>
                                <span className="font-bold text-gray-800">{posts.length}</span>
                                <span> {posts.length === 1 ? 'ferramenta encontrada' : 'ferramentas encontradas'}</span>
                            </>
                        )}
                        {loading && <span className="italic">Buscando...</span>}
                    </div>
                    {activeFilterCount > 0 && (
                        <div className="flex items-center gap-1.5">
                            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors">
                                <ClearIcon className="w-4 h-4" />
                                Limpar Tudo
                            </button>
                        </div>
                    )}
                </div>

                {/* Display de Filtros Ativos */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
                        <span className="text-sm font-semibold text-gray-700">Filtros Ativos:</span>
                        {selectedCategory !== 'all' && (
                            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                {selectedCategory}
                                <button onClick={() => setSelectedCategory('all')} className="text-blue-600 hover:text-blue-800">
                                    <ClearIcon className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {selectedTags.map(tag => (
                            <span key={tag.slug} className="inline-flex items-center gap-1.5 bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                {tag.name}
                                <button onClick={() => toggleTag(tag)} className="text-gray-600 hover:text-gray-800">
                                    <ClearIcon className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Grelha de Resultados */}
            <div className="space-y-8">
                {loading && (
                    <div className="text-center py-16 flex justify-center items-center gap-3 text-gray-600">
                        <LoaderIcon className="w-6 h-6" />
                        <span className="text-lg">Carregando ferramentas...</span>
                    </div>
                )}
                {error && (
                    <div className="text-red-500 text-center py-16">{error}</div>
                )}
                {!loading && !error && (
                    <div>
                        {posts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.map((post) => (
                                    <div key={post.id} className="h-full bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group flex flex-col overflow-hidden" onClick={() => onPostSelect?.(post)}>
                                        <div className="aspect-video w-full overflow-hidden">
                                            <img
                                                src={post.imageUrl || 'https://placehold.co/600x400/EEE/31343C?text=Sem+Imagem'}
                                                alt={`Imagem de ${post.title}`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-5 flex-grow flex flex-col">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2 flex-grow">{post.title}</h3>
                                                <a href={post.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                                                    <ExternalLinkIcon className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 pt-1">
                                                <CalendarIcon className="w-4 h-4" />
                                                <span>{new Date(post.publishDate).toLocaleDateString("pt-BR")}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm my-4 h-16 line-clamp-3">{post.excerpt}</p>
                                            <div className="flex flex-wrap gap-2 mt-auto">
                                                {post.tags.slice(0, 3).map(tag => <span key={tag.slug} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-200">{tag.name}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="inline-block bg-gray-100 p-5 rounded-full mb-4">
                                    <SearchIcon className="text-gray-400 w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800 mt-4 mb-2">Nenhum resultado encontrado</h3>
                                <p className="text-gray-500 max-w-md mx-auto">Tente ajustar seus filtros ou usar palavras-chave diferentes para encontrar a ferramenta de IA que você procura.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Botão Carregar Mais */}
                {!loading && hasNextPage && (
                    <div className="text-center">
                        <button
                            onClick={() => fetchAndSetPosts(true)}
                            disabled={loadingMore}
                            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                        >
                            {loadingMore ? (
                                <>
                                    <LoaderIcon className="w-5 h-5" />
                                    <span>Carregando...</span>
                                </>
                            ) : (
                                <span>Carregar Mais Soluções</span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
