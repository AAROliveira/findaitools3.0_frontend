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
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
