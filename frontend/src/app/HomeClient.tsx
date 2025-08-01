"use client";

import SearchAndFilter from "@/components/SearchAndFilter";
import { Chatbot } from "@/components/Chatbot";
import { useState } from 'react';
import { useEffect } from 'react';
import { Bot, Wrench } from 'lucide-react';

// Tipos para as props
interface HomeClientProps {
  initialPosts: any[];
  allCategories: any[];
  error: string | null;
}

export default function HomeClient({ initialPosts, allCategories, error }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState('ferramentas');
  // Detecta se está em tela pequena (mobile/tablet)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Cabeçalho do Website */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center p-4">
          <a href="https://findaitools.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <video
              src="/logo/color_logo_gif.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-13 w-auto"
              style={{ maxWidth: '234px', display: 'block' }}
              aria-label="FindAITools Logo animado"
            />
          </a>
          {/* Navegação só aparece em telas médias+ */}
          <nav className="hidden md:flex items-center gap-2 bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setActiveTab('ferramentas')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center gap-2 ${activeTab === 'ferramentas' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Wrench className="w-4 h-4" />
              Ferramentas
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center gap-2 ${activeTab === 'chatbot' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Bot className="w-4 h-4" />
              Assistente IA
            </button>
          </nav>
          {/* Botão 'Submeter Ferramenta' removido temporariamente do UI por solicitação */}
        </div>
      </header>

      {/* Conteúdo Principal da Página */}
      <main className="container mx-auto py-8 relative">
        {/* Renderiza SearchAndFilter normalmente */}
        {activeTab === 'ferramentas' && (
          <SearchAndFilter
            initialPosts={initialPosts}
            allCategories={allCategories}
            error={error}
            isMobile={isMobile} // Passa info para SearchAndFilter
          />
        )}

        {/* Renderiza Chatbot normalmente */}
        {activeTab === 'chatbot' && (
          <div className="flex justify-center">
            <Chatbot />
          </div>
        )}

        {/* Botão flutuante para acessar o Chatbot em mobile/tablet */}
        {isMobile && activeTab !== 'chatbot' && (
          <button
            onClick={() => setActiveTab('chatbot')}
            className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground shadow-lg rounded-full p-4 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            aria-label="Abrir Assistente IA"
          >
            <Bot className="w-6 h-6" />
            <span className="font-semibold text-sm hidden xs:inline">Assistente</span>
          </button>
        )}
        {/* Botão para voltar para ferramentas quando estiver no Chatbot em mobile */}
        {isMobile && activeTab === 'chatbot' && (
          <button
            onClick={() => setActiveTab('ferramentas')}
            className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white shadow-lg rounded-full p-4 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition-all"
            aria-label="Voltar para busca de ferramentas"
          >
            <Wrench className="w-6 h-6" />
            <span className="font-semibold text-sm hidden xs:inline">Ferramentas</span>
          </button>
        )}
      </main>
    </div>
  );
}
