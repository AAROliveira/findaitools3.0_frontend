import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/api';

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = await getPostBySlug(params.slug);
    if (!post) return { title: 'Post não encontrado' };
    return {
        title: post.title + ' | FindAITools',
        description: post.description,
    };
}

export default async function PostPage({ params }: { params: { category: string; slug: string } }) {
    const post = await getPostBySlug(params.slug);
    if (!post) return notFound();

    return (
        <main className="max-w-2xl mx-auto py-10 px-4">
            {post.logo && (
                <div className="flex justify-center mb-6">
                    <img
                        src={post.logo}
                        alt={post.title}
                        className="rounded-xl shadow max-h-32 sm:max-h-40 md:max-h-48 w-auto"
                        style={{ maxWidth: '220px', height: 'auto' }}
                    />
                </div>
            )}
            <h1 className="mb-2">{post.title}</h1>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                {post.categories && post.categories.map((cat: string) => (
                    <span key={cat} className="bg-gray-200 rounded-full px-2 py-0.5 text-gray-700">{cat}</span>
                ))}
            </div>
            <p className="mb-4 text-base text-gray-700">{post.description}</p>
            <section className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Atributos:</h2>
                <ul className="list-none space-y-1">
                    {post.attributes.map((attr: string, i: number) => (
                        <li key={i}>{attr}</li>
                    ))}
                </ul>
            </section>
            <section className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Exemplos de uso:</h2>
                <ul className="list-none space-y-1">
                    {post.examples.map((ex: string, i: number) => (
                        <li key={i}>{ex}</li>
                    ))}
                </ul>
            </section>
            {post.site && (
                <div className="mb-8">
                    <a href={post.site} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-blue-700 transition">Visite o site</a>
                </div>
            )}
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Ferramentas relacionadas:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {post.related.map((rel: any) => (
                        <a key={rel.slug} href={`/${params.category}/${rel.slug}`} className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white" target="_blank" rel="noopener noreferrer">
                            {rel.image && (
                                <img src={rel.image} alt={rel.title} className="h-12 w-auto mb-2 rounded" style={{ maxWidth: '80px' }} />
                            )}
                            <div className="font-semibold text-blue-700 mb-1">{rel.title}</div>
                            <div className="text-xs text-gray-500 mb-1">{new Date(rel.date).toLocaleDateString('pt-BR')}</div>
                            <div className="text-sm text-gray-700">{rel.description}</div>
                        </a>
                    ))}
                </div>
            </section>
            <div className="text-center mt-8">
                <a href="/" className="text-blue-600 hover:underline">← Voltar para a lista</a>
            </div>
        </main>
    );
}
