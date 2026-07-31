import { motion } from "framer-motion";
import { Brain, FileText, Briefcase, BookOpen, Activity, Database, Server, Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSystemStatus, getLatestAnalysis } from "../services/api";

export const Dashboard = () => {
    const [status, setStatus] = useState<any>(null);
    const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statusRes, analysisRes] = await Promise.all([
                    getSystemStatus(),
                    getLatestAnalysis()
                ]);
                setStatus(statusRes);
                if (analysisRes.analysis) {
                    setLatestAnalysis(analysisRes.analysis);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { label: "Knowledge Base", value: status?.knowledge_base_count ?? 0, icon: <BookOpen size={24} />, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Resume ATS Score", value: latestAnalysis?.overall_score ?? "--", icon: <FileText size={24} />, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Roadmap Progress", value: "--", icon: <Briefcase size={24} />, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Interviews Prep", value: "--", icon: <Brain size={24} />, color: "text-orange-500", bg: "bg-orange-500/10" },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="h-full flex flex-col gap-8 overflow-y-auto pb-8 pr-2">
            <header>
                <h1 className="text-3xl font-bold">Welcome back, User 👋</h1>
                <p className="text-muted-foreground mt-2">Here is your career progress overview.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="glass p-6 rounded-2xl shadow-sm border border-border flex flex-col gap-4 hover:shadow-md transition-all"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                            {s.icon}
                        </div>
                        <div>
                            {loading ? (
                                <div className="h-9 w-16 bg-black/10 dark:bg-white/10 rounded animate-pulse mb-1"></div>
                            ) : (
                                <div className="text-3xl font-bold">{s.value}</div>
                            )}
                            <div className="text-sm text-muted-foreground font-medium mt-1">{s.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Latest ATS Analysis Summary */}
            <div className="glass rounded-2xl p-6 border border-border">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-primary"/> Latest ATS Analysis
                </h2>
                
                {loading ? (
                    <div className="flex justify-center p-6"><div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div></div>
                ) : latestAnalysis ? (
                    <div className="flex flex-col md:flex-row items-center justify-between bg-black/5 dark:bg-white/5 p-5 rounded-xl border border-border gap-4">
                        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                            <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-[6px] ${latestAnalysis.overall_score >= 80 ? 'border-green-500 text-green-500' : latestAnalysis.overall_score >= 60 ? 'border-orange-500 text-orange-500' : 'border-red-500 text-red-500'}`}>
                                <span className="text-2xl font-black">{latestAnalysis.overall_score}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{latestAnalysis.filename}</h3>
                                <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center md:justify-start gap-1">
                                    <Clock size={14} /> Analyzed on {formatDate(latestAnalysis.created_at)}
                                </p>
                            </div>
                        </div>
                        
                        <Link to="/resume" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 whitespace-nowrap">
                            View Full Report <ChevronRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="text-center p-8 bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-border flex flex-col items-center">
                        <FileText size={48} className="text-muted-foreground mb-4 opacity-30" />
                        <h3 className="font-bold text-lg mb-1">No resume analyzed yet.</h3>
                        <p className="text-muted-foreground text-sm mb-4">Upload a resume to generate your ATS score and get actionable feedback.</p>
                        <Link to="/resume" className="bg-primary text-white font-bold px-6 py-2 rounded-xl hover:bg-primary/90 transition-all">
                            Analyze Resume Now
                        </Link>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[300px]">
                <div className="glass rounded-2xl p-6 flex flex-col col-span-2">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link to="/resume" className="p-4 rounded-xl border border-border bg-white dark:bg-black/20 hover:border-primary transition-colors flex flex-col items-center gap-2 text-center">
                            <FileText size={32} className="text-primary" />
                            <span className="font-medium">Analyze Resume</span>
                        </Link>
                        <Link to="/chat" className="p-4 rounded-xl border border-border bg-white dark:bg-black/20 hover:border-primary transition-colors flex flex-col items-center gap-2 text-center">
                            <Brain size={32} className="text-primary" />
                            <span className="font-medium">Ask AI Coach</span>
                        </Link>
                        <Link to="/roadmap" className="p-4 rounded-xl border border-border bg-white dark:bg-black/20 hover:border-primary transition-colors flex flex-col items-center gap-2 text-center">
                            <Briefcase size={32} className="text-primary" />
                            <span className="font-medium">Build Roadmap</span>
                        </Link>
                        <Link to="/knowledge" className="p-4 rounded-xl border border-border bg-white dark:bg-black/20 hover:border-primary transition-colors flex flex-col items-center gap-2 text-center">
                            <BookOpen size={32} className="text-primary" />
                            <span className="font-medium">Add Knowledge</span>
                        </Link>
                    </div>
                </div>
                
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity size={20} className="text-primary"/> System Status</h2>
                    <div className="flex flex-col gap-3">
                        <div className="p-3 rounded-lg bg-white dark:bg-black/20 border border-border flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Server size={18} className="text-muted-foreground" />
                                <span>API Backend</span>
                            </div>
                            {loading ? <div className="h-6 w-16 bg-black/10 dark:bg-white/10 rounded animate-pulse"></div> : (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${status?.status === 'Online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {status?.status || "Offline"}
                                </span>
                            )}
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-black/20 border border-border flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Brain size={18} className="text-muted-foreground" />
                                <span>Gemini AI</span>
                            </div>
                            {loading ? <div className="h-6 w-16 bg-black/10 dark:bg-white/10 rounded animate-pulse"></div> : (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${status?.gemini_api === 'Connected' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {status?.gemini_api || "Disconnected"}
                                </span>
                            )}
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-black/20 border border-border flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Database size={18} className="text-muted-foreground" />
                                <span>ChromaDB Vector</span>
                            </div>
                            {loading ? <div className="h-6 w-16 bg-black/10 dark:bg-white/10 rounded animate-pulse"></div> : (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${status?.chroma_db === 'Connected' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {status?.chroma_db || "Disconnected"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
