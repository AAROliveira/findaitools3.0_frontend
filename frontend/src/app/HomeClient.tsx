"use client";

import SearchAndFilter from "@/components/SearchAndFilter";
import { Chatbot } from "@/components/Chatbot";
import { useState } from 'react';
import { Bot, Wrench } from 'lucide-react';

// Tipos para as props
interface HomeClientProps {
  initialPosts: any[];
  allCategories: any[];
  error: string | null;
}

export default function HomeClient({ initialPosts, allCategories, error }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState('ferramentas');

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Cabeçalho do Website */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center p-4">
          <a href="https://findaitools.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <img
              src="/logo/Color logo - no background.svg"
              alt="FindAITools Logo"
              className="h-13 w-auto"
              style={{ maxWidth: '234px' }}
            />
          </a>
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
      <main className="container mx-auto py-8">
        {activeTab === 'ferramentas' && (
          <SearchAndFilter
            initialPosts={initialPosts}
            allCategories={allCategories} // CORREÇÃO: Propriedade agora está a ser passada
            error={error}
          />
        )}

        {activeTab === 'chatbot' && (
          <div className="flex justify-center">
            <Chatbot />
          </div>
        )}
      </main>
    </div>
  );
}
