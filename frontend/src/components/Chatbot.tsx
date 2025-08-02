
"use client";
import { MarkdownMessage } from './MarkdownMessage';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "initial",
            role: "assistant",
            content: "👋 Olá! Sou o assistente da FindAItools.com.br. Pergunte sobre ferramentas de IA, suas funcionalidades, ou qualquer dúvida sobre inteligência artificial!",
            timestamp: new Date("2025-01-01"), // Data fixa para evitar erro de hidratação
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messageCounter, setMessageCounter] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    async function sendMessage() {
        if (!input.trim() || loading) return;

        const nextCounter = messageCounter + 1;
        setMessageCounter(nextCounter);

        const userMessage: Message = {
            id: `user-${nextCounter}`,
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        // Adiciona a mensagem do usuário à UI imediatamente
        setMessages(prev => [...prev, userMessage]);

        const currentInput = input; // Salva o input atual antes de limpar
        setInput("");
        setLoading(true);


        try {
            // Monta o array de mensagens para a API (inclui o histórico + nova mensagem do usuário)
            const messagesForApi = [
                ...messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                { role: "user", content: currentInput }
            ];

            const response = await fetch('/api/chat', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: messagesForApi
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro na comunicação com o servidor");
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: `assistant-${nextCounter}`,
                role: "assistant",
                content: data.response || "Desculpe, não consegui processar sua pergunta.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

        } catch (error) {
            const errorMessageContent = error instanceof Error ? error.message : "😔 Desculpe, ocorreu um erro. Tente novamente.";
            const errorMessage: Message = {
                id: `error-${nextCounter}`,
                role: "assistant",
                content: errorMessageContent,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Lista extensa de sugestões para chips (70 exemplos)
    const allPromptSuggestions = [
        'Ferramentas para gerar imagens',
        'Resumir textos automaticamente',
        'Ferramentas de IA para educação',
        'Comparar ChatGPT e Gemini',
        'Automação de marketing com IA',
        'Gerar legendas para redes sociais',
        'Ferramentas para análise de sentimentos',
        'Traduzir textos com IA',
        'Gerar apresentações automaticamente',
        'Ferramentas para criar vídeos com IA',
        'Assistentes de escrita acadêmica',
        'Ferramentas para transcrição de áudio',
        'IA para atendimento ao cliente',
        'Ferramentas para criar chatbots',
        'Gerar código com IA',
        'Ferramentas para análise de dados',
        'IA para automação de tarefas',
        'Ferramentas para reconhecimento de voz',
        'Gerar imagens a partir de texto',
        'Ferramentas para detecção de plágio',
        'IA para recomendação de produtos',
        'Ferramentas para criar quizzes',
        'IA para diagnóstico médico',
        'Ferramentas para criar memes',
        'Gerar músicas com IA',
        'Ferramentas para edição de fotos',
        'IA para análise de currículos',
        'Ferramentas para criar podcasts',
        'IA para previsão de vendas',
        'Ferramentas para sumarização de vídeos',
        'IA para reconhecimento de imagens',
        'Ferramentas para criar infográficos',
        'IA para análise de mercado',
        'Ferramentas para OCR (reconhecimento de texto em imagem)',
        'IA para geração de contratos',
        'Ferramentas para criar newsletters',
        'IA para análise de redes sociais',
        'Ferramentas para criar avatares',
        'IA para monitoramento de notícias',
        'Ferramentas para automação de e-mails',
        'IA para análise de sentimentos em reviews',
        'Ferramentas para criar mapas mentais',
        'IA para geração de relatórios',
        'Ferramentas para criar logos',
        'IA para análise de risco financeiro',
        'Ferramentas para criar ebooks',
        'IA para detecção de fake news',
        'Ferramentas para criar roteiros de vídeo',
        'IA para análise de voz',
        'Ferramentas para criar posts automáticos',
        'IA para análise de churn',
        'Ferramentas para criar dashboards',
        'IA para análise de sentimentos em áudios',
        'Ferramentas para criar vídeos curtos',
        'IA para análise de tendências',
        'Ferramentas para criar questionários',
        'IA para análise de comportamento do consumidor',
        'Ferramentas para criar animações',
        'IA para análise de dados jurídicos',
        'Ferramentas para criar resumos automáticos',
        'IA para análise de dados esportivos',
        'Ferramentas para criar campanhas de marketing',
        'IA para análise de dados de saúde',
        'Ferramentas para criar conteúdos para blogs',
        'IA para análise de dados ambientais',
        'Ferramentas para criar relatórios automáticos',
        'IA para análise de dados educacionais',
        'Ferramentas para criar scripts de vendas',
        'IA para análise de dados financeiros',
        'Ferramentas para criar conteúdos para e-commerce',
        'IA para análise de dados de RH',
        'Ferramentas para criar conteúdos para YouTube',
        'IA para análise de dados de logística',
        'Ferramentas para criar conteúdos para Instagram',
        'IA para análise de dados de transporte',
        'Ferramentas para criar conteúdos para LinkedIn',
        'IA para análise de dados de manufatura',
        'Ferramentas para criar conteúdos para TikTok',
        'IA para análise de dados de energia',
        'Ferramentas para criar conteúdos para Facebook',
        'IA para análise de dados de varejo',
        'Ferramentas para criar conteúdos para Twitter',
        'IA para análise de dados de turismo',
        'Ferramentas para criar conteúdos para Pinterest',
        'IA para análise de dados de agricultura',
        'Ferramentas para criar conteúdos para WhatsApp',
        'IA para análise de dados de seguros',
        'Ferramentas para criar conteúdos para Telegram',
        'IA para análise de dados de telecom',
        'Ferramentas para criar conteúdos para podcasts',
        'IA para análise de dados de construção',
        'Ferramentas para criar conteúdos para newsletters',
        'IA para análise de dados de educação',
    ];

    // Sorteia 5 sugestões diferentes a cada carregamento do componente
    function getRandomSuggestions(arr: string[], n: number) {
        const shuffled = arr.slice().sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }
    const [promptSuggestions] = useState(() => getRandomSuggestions(allPromptSuggestions, 5));

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-white/95 backdrop-blur-sm border-0 overflow-hidden">
            <CardContent className="p-0">
                {/* Header com cor sólida do tema */}
                <div className="bg-primary text-primary-foreground p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <Bot className="w-6 h-6" aria-label="Ícone do assistente" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Assistente FindAItools</h2>
                            <p className="text-primary-foreground/80 text-sm">
                                Especialista em ferramentas de inteligência artificial
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mensagens */}
                <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {/* Avatar do assistente */}
                                {message.role === "assistant" && (
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-primary-foreground" aria-label="Ícone do assistente" />
                                    </div>
                                )}

                                {/* Balão de mensagem */}
                                <div
                                    className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${message.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                                        }`}
                                >
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {message.role === "user" ? (
                                            message.content
                                        ) : (
                                            <MarkdownMessage content={message.content} />
                                        )}
                                    </div>
                                    <div
                                        className={`text-xs mt-2 opacity-70 ${message.role === "user" ? "text-primary-foreground/70" : "text-gray-500"}`}
                                    >
                                        {mounted ? message.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }) : ""}
                                    </div>
                                </div>

                                {/* Avatar do usuário */}
                                {message.role === "user" && (
                                    <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-secondary-foreground" aria-label="Ícone do usuário" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Mensagem de carregamento */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3 justify-start"
                        >
                            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-primary-foreground" aria-label="Ícone do assistente" />
                            </div>
                            <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-sm shadow-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin" aria-label="Carregando" />
                                    <span className="text-sm">Pensando...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Chips de sugestões de perguntas */}
                <div className="px-6 pb-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500 mr-2">Sugestões:</span>
                    {promptSuggestions.map(prompt => (
                        <Button
                            key={prompt}
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => setInput(prompt)}
                            aria-label={`Usar sugestão: ${prompt}`}
                        >
                            {prompt}
                        </Button>
                    ))}
                </div>

                {/* Input de mensagem */}
                <div className="p-6 bg-white border-t border-gray-200">
                    <div className="flex gap-3">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Digite sua pergunta sobre ferramentas de IA..."
                            disabled={loading}
                            className="flex-1 h-12 text-base rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            aria-label="Campo de mensagem do chat"
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            aria-label="Enviar mensagem"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" aria-label="Carregando" />
                            ) : (
                                <Send className="w-5 h-5" aria-label="Ícone de enviar" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        💡 Dica: Pergunte sobre funcionalidades específicas, comparações entre ferramentas ou casos de uso
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
