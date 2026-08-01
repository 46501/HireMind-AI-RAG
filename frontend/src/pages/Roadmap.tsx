import { useState } from "react";
import { Briefcase, Loader2, Map, Calendar, Target, CheckCircle } from "lucide-react";
import { generateRoadmap } from "../services/api";
import { motion } from "framer-motion";

export const Roadmap = () => {
    const [skills, setSkills] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [roadmap, setRoadmap] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!skills.trim() || !targetRole.trim()) return;

        setIsLoading(true);
        setError(null);
        
        try {
            const data = await generateRoadmap(skills, targetRole);
            if (data.error) {
                setError(data.error);
            } else {
                setRoadmap(data);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to generate roadmap. Please check backend connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-8 overflow-y-auto pb-10 pr-2">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Map className="text-primary" size={32} /> Career Roadmap Builder
                </h1>
                <p className="text-muted-foreground mt-2">Generate a personalized step-by-step career progression plan based on your current skills.</p>
            </header>

            {!roadmap ? (
                <div className="max-w-2xl mx-auto w-full glass p-8 rounded-3xl border border-border shadow-sm">
                    <form onSubmit={handleGenerate} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-lg flex items-center gap-2">
                                <Target size={20} className="text-primary" /> Target Role
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Full Stack Developer, Data Scientist..."
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-lg flex items-center gap-2">
                                <Briefcase size={20} className="text-primary" /> Current Skills
                            </label>
                            <textarea
                                placeholder="e.g. HTML, CSS, basic JavaScript, Python"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                rows={4}
                                className="bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !skills || !targetRole}
                            className="bg-primary text-primary-foreground font-bold text-lg px-8 py-4 rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4 shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Generating Roadmap...
                                </>
                            ) : (
                                <>
                                    Generate AI Roadmap
                                </>
                            )}
                        </button>
                    </form>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
                    <div className="flex justify-between items-center bg-muted/50 p-6 rounded-2xl border border-border">
                        <div>
                            <h2 className="text-2xl font-bold">Your Path to {targetRole}</h2>
                            <p className="text-muted-foreground mt-1">Based on your existing skills: {skills}</p>
                        </div>
                        <button 
                            onClick={() => setRoadmap(null)}
                            className="px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium hover:border-primary transition-colors"
                        >
                            Start Over
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 30 Day Plan */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-border">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Phase 1: 30 Days</h3>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Foundation</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-border">
                                {roadmap['30_day_plan']?.map((item: string, i: number) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={i} 
                                        className="relative pl-12 py-2"
                                    >
                                        <div className="absolute left-[11px] top-3.5 w-4 h-4 rounded-full bg-background border-2 border-blue-500 z-10" />
                                        <div className="glass p-4 rounded-2xl border border-border shadow-sm text-sm">
                                            {item}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* 90 Day Plan */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-border">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Phase 2: 90 Days</h3>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Advanced Skills</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-border">
                                {roadmap['90_day_plan']?.map((item: string, i: number) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        key={i} 
                                        className="relative pl-12 py-2"
                                    >
                                        <div className="absolute left-[11px] top-3.5 w-4 h-4 rounded-full bg-background border-2 border-purple-500 z-10" />
                                        <div className="glass p-4 rounded-2xl border border-border shadow-sm text-sm">
                                            {item}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* 6 Month Plan */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-border">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                                    <Target size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Phase 3: 6 Months</h3>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Job Readiness</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-border">
                                {roadmap['6_month_plan']?.map((item: string, i: number) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + (i * 0.1) }}
                                        key={i} 
                                        className="relative pl-12 py-2"
                                    >
                                        <div className="absolute left-[11px] top-3.5 w-4 h-4 rounded-full bg-background border-2 border-green-500 z-10" />
                                        <div className="glass p-4 rounded-2xl border border-border shadow-sm text-sm">
                                            {item}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section for Projects & Interview Strategy */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="glass p-6 rounded-3xl border border-border">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Briefcase className="text-primary" /> Recommended Projects
                            </h3>
                            <ul className="flex flex-col gap-3">
                                {roadmap.recommended_projects?.map((proj: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium">{proj}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="glass p-6 rounded-3xl border border-border bg-primary/5 border-primary/20">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                                <Map /> Interview Strategy
                            </h3>
                            <p className="text-foreground/80 leading-relaxed text-sm font-medium">
                                {roadmap.interview_prep_strategy}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
