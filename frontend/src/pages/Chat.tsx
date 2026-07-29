import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, BookOpen } from "lucide-react";
import { chatWithKB } from "../services/api";

interface Message {
    role: "user" | "ai";
    content: string;
    sources?: any[];
}

export const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await chatWithKB(userMsg);
            setMessages(prev => [...prev, { 
                role: "ai", 
                content: res.answer,
                sources: res.sources
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { 
                role: "ai", 
                content: "Sorry, I encountered an error connecting to the knowledge base. Please check the backend connection." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Sparkles className="text-primary" size={32} /> AI Career Coach
                </h1>
                <p className="text-muted-foreground mt-2">Ask questions based on your uploaded knowledge base documents.</p>
            </header>

            <div className="flex-1 glass rounded-3xl border border-border overflow-hidden flex flex-col relative">
                
                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                            <Bot size={64} className="mb-4 text-primary" />
                            <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                            <p className="max-w-md">I have access to your uploaded knowledge base. Ask me about your study notes, interview prep, or career advice.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white dark:bg-black/40 border border-border text-foreground rounded-tl-sm'}`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    </div>
                                    
                                    {/* Sources */}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 px-2">
                                            <BookOpen size={14} />
                                            <span>Sources: {Array.from(new Set(msg.sources.map((s:any) => s.filename))).join(", ")}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    
                    {isLoading && (
                        <div className="flex gap-4 max-w-[85%] self-start">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary/20 text-primary">
                                <Bot size={20} />
                            </div>
                            <div className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-border text-foreground rounded-tl-sm flex items-center gap-2">
                                <Loader2 size={18} className="animate-spin text-primary" />
                                <span className="text-sm font-medium animate-pulse">Thinking...</span>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-border">
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about your documents..."
                            className="flex-1 bg-white dark:bg-black/40 border border-border rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-primary text-white p-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <Send size={24} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
