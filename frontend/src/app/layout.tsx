import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FindAI Tools RAG - Assistente IA Local",
    description: "Sistema RAG local para consultas especializadas sobre ferramentas de inteligência artificial",
    keywords: ["IA", "Inteligência Artificial", "RAG", "Ollama", "Chatbot", "Ferramentas AI"],
    authors: [{ name: "FindAI Tools" }],
    viewport: "width=device-width, initial-scale=1",
    icons: {
        icon: "/logo/118191020_padded_logo.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <head>
                {/* Google Fonts: Google Sans, Roboto, Roboto Mono */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
                {/* Google Sans não está disponível oficialmente no Google Fonts, mas pode ser importado via CDN alternativo */}
                <link href="https://fonts.cdnfonts.com/css/google-sans" rel="stylesheet" />
            </head>
            <body>
                {children}
                <footer className="bg-gray-100 border-t border-gray-200 mt-12 py-8 text-gray-700">
                    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo/Black logo - no background - no padding.PNG" alt="FindAITools Logo" className="h-8 w-auto" style={{ maxWidth: '120px' }} />
                            <span className="font-semibold text-lg tracking-tight">FindAITools</span>
                        </div>
                        <nav className="flex flex-wrap gap-4 text-sm">
                            <a href="/" className="hover:underline">Início</a>
                            <a href="/sobre" className="hover:underline">Sobre</a>
                            <a href="/contato" className="hover:underline">Contato</a>
                            <a href="https://findaitools.com.br" target="_blank" rel="noopener noreferrer" className="hover:underline">Blog</a>
                        </nav>
                        <div className="flex gap-3">
                            <a href="https://github.com/AAROliveira/findaitools3.0_frontend" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-blue-600 transition-colors">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0112 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48C19.13 20.54 22 16.74 22 12.26 22 6.58 17.52 2 12 2z" /></svg>
                            </a>
                            <a href="https://www.linkedin.com/company/findaitools/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-blue-600 transition-colors">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 8a6 6 0 0 1 6 6v6" /><line x1="8" y1="11" x2="8" y2="16" /><line x1="8" y1="8" x2="8" y2="8" /></svg>
                            </a>
                            <a href="mailto:contato@findaitools.com.br" aria-label="E-mail" className="hover:text-blue-600 transition-colors">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" /></svg>
                            </a>
                        </div>
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-4">© {new Date().getFullYear()} FindAITools. Todos os direitos reservados.</div>
                </footer>
            </body>
        </html>
    );
}
