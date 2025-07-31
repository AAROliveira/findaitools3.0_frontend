import { MarkdownMessage } from './MarkdownMessage';
"use client";

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
            content: "👋 Olá! Sou o assistente da FindAI Tools. Pergunte sobre ferramentas de IA, suas funcionalidades, ou qualquer dúvida sobre inteligência artificial!",
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
            // O histórico enviado para a API deve ser o estado ANTES da nova mensagem do usuário
            const historyForApi = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const response = await fetch('/api/chat', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: historyForApi,
                    message: currentInput
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

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-white/95 backdrop-blur-sm border-0 overflow-hidden">
            <CardContent className="p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Assistente IA</h2>
                            <p className="text-blue-100 text-sm">
                                Especialista em ferramentas de inteligência artificial
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {message.role === "assistant" && (
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${message.role === "user"
                                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm"
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
                                        className={`text-xs mt-2 opacity-70 ${message.role === "user" ? "text-blue-100" : "text-gray-500"
                                            }`}
                                    >
                                        {mounted ? message.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }) : ""}
                                    </div>
                                </div>

                                {message.role === "user" && (
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3 justify-start"
                        >
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-sm shadow-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Pensando...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input */}
                <div className="p-6 bg-white border-t border-gray-200">
                    <div className="flex gap-3">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Digite sua pergunta sobre ferramentas de IA..."
                            disabled={loading}
                            className="flex-1 h-12 text-base rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
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
