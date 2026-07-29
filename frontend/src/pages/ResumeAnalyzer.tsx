import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, UploadCloud, Loader2, CheckCircle, AlertTriangle, Target } from "lucide-react";
import { analyzeResume } from "../services/api";
import { motion } from "framer-motion";

export const ResumeAnalyzer = () => {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jdFile, setJdFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onDropResume = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) setResumeFile(acceptedFiles[0]);
    }, []);

    const onDropJD = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) setJdFile(acceptedFiles[0]);
    }, []);

    const { getRootProps: getResumeProps, getInputProps: getResumeInput } = useDropzone({ onDrop: onDropResume, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });
    const { getRootProps: getJDProps, getInputProps: getJDInput } = useDropzone({ onDrop: onDropJD, accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] }, maxFiles: 1 });

    const handleAnalyze = async () => {
        if (!resumeFile) return;
        setIsAnalyzing(true);
        setError(null);
        setResults(null);

        try {
            const data = await analyzeResume(resumeFile, jdFile || undefined);
            if (data.error) {
                setError(data.error);
            } else {
                setResults(data);
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while analyzing the resume. Make sure the backend is running and the Gemini API key is valid.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500 bg-green-500/10";
        if (score >= 60) return "text-orange-500 bg-orange-500/10";
        return "text-red-500 bg-red-500/10";
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 60) return "bg-orange-500";
        return "bg-red-500";
    };

    return (
        <div className="h-full flex flex-col gap-8 overflow-y-auto pb-10 pr-2">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <FileText className="text-primary" size={32} /> Resume ATS Analyzer
                </h1>
                <p className="text-muted-foreground mt-2">Upload your resume to get an AI-powered ATS score, feedback, and optimization suggestions.</p>
            </header>

            {!results ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Resume Upload */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold">1. Upload Resume (Required)</h2>
                        <div {...getResumeProps()} className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[250px] ${resumeFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            <input {...getResumeInput()} />
                            {resumeFile ? (
                                <>
                                    <CheckCircle size={48} className="text-primary mb-4" />
                                    <p className="font-bold text-lg">{resumeFile.name}</p>
                                    <p className="text-muted-foreground text-sm mt-1">Ready for analysis</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={48} className="text-muted-foreground mb-4 opacity-50" />
                                    <p className="font-bold text-lg">Drop your resume here</p>
                                    <p className="text-muted-foreground text-sm mt-1">PDF format only</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* JD Upload */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold">2. Target Job Description (Optional)</h2>
                        <div {...getJDProps()} className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[250px] ${jdFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            <input {...getJDInput()} />
                            {jdFile ? (
                                <>
                                    <CheckCircle size={48} className="text-primary mb-4" />
                                    <p className="font-bold text-lg">{jdFile.name}</p>
                                    <p className="text-muted-foreground text-sm mt-1">Ready for comparison</p>
                                </>
                            ) : (
                                <>
                                    <Target size={48} className="text-muted-foreground mb-4 opacity-50" />
                                    <p className="font-bold text-lg">Drop JD file here</p>
                                    <p className="text-muted-foreground text-sm mt-1">TXT or PDF format</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex flex-col items-center mt-4">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl flex items-center gap-2 max-w-2xl w-full">
                                <AlertTriangle size={20} />
                                <span>{error}</span>
                            </div>
                        )}
                        <button
                            onClick={handleAnalyze}
                            disabled={!resumeFile || isAnalyzing}
                            className="bg-primary text-white font-bold text-lg px-12 py-4 rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Analyzing Resume...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={24} />
                                    Generate AI Analysis
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
                    {/* Score Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass p-8 rounded-3xl border border-border flex flex-col items-center justify-center text-center shadow-sm">
                            <h3 className="text-lg font-bold text-muted-foreground mb-4">Overall ATS Score</h3>
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-black ${getScoreColor(results.overall_score)} border-8 ${results.overall_score >= 80 ? 'border-green-500/20' : results.overall_score >= 60 ? 'border-orange-500/20' : 'border-red-500/20'}`}>
                                {results.overall_score}
                            </div>
                            {results.ats_match_percentage > 0 && (
                                <p className="mt-4 font-medium text-primary">JD Match: {results.ats_match_percentage}%</p>
                            )}
                        </div>

                        <div className="col-span-2 glass p-8 rounded-3xl border border-border shadow-sm flex flex-col justify-center">
                            <h3 className="text-lg font-bold mb-6">Section Scores</h3>
                            <div className="flex flex-col gap-4">
                                {Object.entries(results.section_scores || {}).map(([section, score]: [string, any]) => (
                                    <div key={section} className="flex items-center gap-4">
                                        <div className="w-24 font-medium capitalize text-sm">{section}</div>
                                        <div className="flex-1 h-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${score}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className={`h-full ${getScoreBarColor(score)} rounded-full`}
                                            />
                                        </div>
                                        <div className="w-8 text-right font-bold text-sm">{score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Feedback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass p-6 rounded-3xl border border-border">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-500">
                                <AlertTriangle size={20} /> Missing Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {results.missing_keywords?.length > 0 ? (
                                    results.missing_keywords.map((kw: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-red-500/10 text-red-600 rounded-lg text-sm font-medium border border-red-500/20">
                                            {kw}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-sm">No critical keywords missing.</p>
                                )}
                            </div>
                        </div>

                        <div className="glass p-6 rounded-3xl border border-border">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-500">
                                <CheckCircle size={20} /> Actionable Suggestions
                            </h3>
                            <ul className="flex flex-col gap-3">
                                {results.suggestions?.map((sug: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                        <span className="text-foreground/80 leading-relaxed">{sug}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Rewritten Summary */}
                    {results.improved_summary && (
                        <div className="glass p-8 rounded-3xl border border-border border-l-4 border-l-primary">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Sparkles size={20} className="text-primary"/> AI Improved Professional Summary
                            </h3>
                            <p className="text-foreground/80 leading-relaxed italic">
                                "{results.improved_summary}"
                            </p>
                        </div>
                    )}

                    <div className="flex justify-center mt-4">
                        <button 
                            onClick={() => { setResults(null); setResumeFile(null); setJdFile(null); }}
                            className="text-muted-foreground hover:text-foreground font-medium underline"
                        >
                            Analyze another resume
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// Simple Sparkles icon since it's not in the import list above.
function Sparkles(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
    );
}
