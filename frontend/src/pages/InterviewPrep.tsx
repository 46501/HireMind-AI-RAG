import { useState } from "react";
import { Brain, Building, Briefcase, Loader2, PlayCircle, ChevronDown, ChevronUp } from "lucide-react";
import { generateInterview } from "../services/api";
import { motion } from "framer-motion";

export const InterviewPrep = () => {
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [difficulty, setDifficulty] = useState("Intermediate");
    
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("hr");
    const [expandedQ, setExpandedQ] = useState<number | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company.trim() || !role.trim()) return;

        setIsLoading(true);
        setError(null);
        setQuestions(null);
        
        try {
            const data = await generateInterview(company, role, difficulty);
            if (data.error) {
                setError(data.error);
            } else {
                setQuestions(data);
                setActiveTab("hr");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to generate questions. Please check backend connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: "hr", label: "HR Questions", key: "hr_questions" },
        { id: "tech", label: "Technical", key: "technical_questions" },
        { id: "behavioral", label: "Behavioral", key: "behavioral_questions" },
        { id: "coding", label: "Coding / System Design", key: "coding_questions" },
    ];

    const currentQuestions = questions ? questions[tabs.find(t => t.id === activeTab)?.key || ""] : [];

    return (
        <div className="h-full flex flex-col gap-8 overflow-y-auto pb-10 pr-2">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Brain className="text-primary" size={32} /> Interview Preparation
                </h1>
                <p className="text-muted-foreground mt-2">Generate company-specific and role-specific interview questions with AI answers.</p>
            </header>

            {!questions ? (
                <div className="max-w-2xl mx-auto w-full glass p-8 rounded-3xl border border-border shadow-sm">
                    <form onSubmit={handleGenerate} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-lg flex items-center gap-2">
                                <Building size={20} className="text-primary" /> Target Company
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Google, Microsoft, Startup Inc..."
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="bg-white dark:bg-black/40 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-lg flex items-center gap-2">
                                <Briefcase size={20} className="text-primary" /> Target Role
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Frontend Engineer, Product Manager..."
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="bg-white dark:bg-black/40 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-lg flex items-center gap-2">
                                <PlayCircle size={20} className="text-primary" /> Difficulty Level
                            </label>
                            <div className="flex gap-4">
                                {["Entry Level", "Intermediate", "Senior"].map(level => (
                                    <label key={level} className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-colors ${difficulty === level ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-black/40 border-border hover:border-primary/50'}`}>
                                        <input 
                                            type="radio" 
                                            name="difficulty" 
                                            value={level}
                                            checked={difficulty === level}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                            className="hidden"
                                        />
                                        <span className="font-medium text-sm">{level}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !company || !role}
                            className="bg-primary text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4 shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Generating Questions...
                                </>
                            ) : (
                                <>
                                    Start Interview Prep
                                </>
                            )}
                        </button>
                    </form>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                    <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-border">
                        <div>
                            <h2 className="text-2xl font-bold">{company} - {role}</h2>
                            <p className="text-muted-foreground mt-1">Difficulty: {difficulty}</p>
                        </div>
                        <button 
                            onClick={() => {setQuestions(null); setExpandedQ(null);}}
                            className="px-4 py-2 bg-white dark:bg-black border border-border rounded-xl text-sm font-medium hover:border-primary transition-colors"
                        >
                            New Setup
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border overflow-x-auto hide-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setExpandedQ(null); }}
                                className={`px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                {tab.label} ({questions[tab.key]?.length || 0})
                            </button>
                        ))}
                    </div>

                    {/* Questions Accordion */}
                    <div className="flex flex-col gap-4">
                        {currentQuestions && currentQuestions.length > 0 ? currentQuestions.map((q: any, i: number) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i} 
                                className="glass rounded-2xl border border-border overflow-hidden shadow-sm"
                            >
                                <div 
                                    className="p-6 cursor-pointer flex justify-between items-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                                >
                                    <h3 className="font-bold text-lg pr-4">{i + 1}. {q.question}</h3>
                                    {expandedQ === i ? <ChevronUp className="text-muted-foreground shrink-0" /> : <ChevronDown className="text-muted-foreground shrink-0" />}
                                </div>
                                
                                {expandedQ === i && (
                                    <div className="p-6 pt-0 border-t border-border mt-4 bg-primary/5 flex flex-col gap-4">
                                        <div className="mt-4">
                                            <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Ideal Answer Idea</h4>
                                            <p className="text-foreground/80 leading-relaxed text-sm">{q.ideal_answer}</p>
                                        </div>
                                        {q.hint && (
                                            <div className="p-4 bg-white dark:bg-black/40 rounded-xl border border-border/50">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Coach's Hint</h4>
                                                <p className="text-sm text-foreground/70">{q.hint}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )) : (
                            <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-3xl">
                                No questions generated for this category.
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};
