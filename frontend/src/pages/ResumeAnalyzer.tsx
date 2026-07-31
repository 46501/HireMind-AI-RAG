import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, UploadCloud, Loader2, CheckCircle, AlertTriangle, Target, Download, ChevronDown, ChevronUp, BarChart3, ListChecks, Zap } from "lucide-react";
import { analyzeResume, getLatestAnalysis } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import html2pdf from "html2pdf.js";

const SectionAccordion = ({ title, data }: { title: string, data: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    if (!data) return null;
    
    return (
        <div className="border border-border rounded-2xl overflow-hidden bg-white/5 dark:bg-black/20 mb-4">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${data.present ? (data.issues?.length > 0 ? 'bg-orange-500' : 'bg-green-500') : 'bg-red-500'}`} />
                    <h3 className="font-bold text-lg capitalize">{title.replace('_', ' ')}</h3>
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 pt-2 border-t border-border"
                    >
                        {!data.present && (
                            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm mb-4">
                                This section appears to be missing from your resume.
                            </div>
                        )}
                        
                        {data.feedback && (
                            <div className="mb-4">
                                <h4 className="text-sm font-bold text-muted-foreground mb-1">Feedback</h4>
                                <p className="text-sm leading-relaxed">{data.feedback}</p>
                            </div>
                        )}
                        
                        {data.issues && data.issues.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-bold text-orange-500 mb-2 flex items-center gap-1"><AlertTriangle size={16}/> Issues Detected</h4>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    {data.issues.map((issue: string, idx: number) => (
                                        <li key={idx} className="text-foreground/80">{issue}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {data.rewrite_suggestion && (
                            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                                <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-1"><Zap size={16}/> AI Rewrite Suggestion</h4>
                                <p className="text-sm italic text-foreground/90">"{data.rewrite_suggestion}"</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const ResumeAnalyzer = () => {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jdFile, setJdFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [latestFilename, setLatestFilename] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadLatest = async () => {
            try {
                const res = await getLatestAnalysis();
                if (res.analysis) {
                    setResults(res.analysis.analysis_data);
                    setLatestFilename(res.analysis.filename);
                }
            } catch (err) {
                console.error("Failed to load latest analysis", err);
            }
        };
        loadLatest();
    }, []);

    const onDropResume = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) setResumeFile(acceptedFiles[0]);
    }, []);

    const onDropJD = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) setJdFile(acceptedFiles[0]);
    }, []);

    const { getRootProps: getResumeProps, getInputProps: getResumeInput } = useDropzone({ 
        onDrop: onDropResume, 
        accept: { 
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }, 
        maxFiles: 1 
    });
    
    const { getRootProps: getJDProps, getInputProps: getJDInput } = useDropzone({ 
        onDrop: onDropJD, 
        accept: { 
            'text/plain': ['.txt'], 
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }, 
        maxFiles: 1 
    });

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
        if (score >= 80) return "text-green-500 border-green-500";
        if (score >= 60) return "text-orange-500 border-orange-500";
        return "text-red-500 border-red-500";
    };

    const handleDownloadPDF = () => {
        if (!reportRef.current) return;
        
        const opt = {
            margin: 0.5,
            filename: `ATS_Report_${resumeFile?.name || latestFilename || 'resume'}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
        };
        
        html2pdf().set(opt).from(reportRef.current).save();
    };

    const chartData = results?.category_scores ? Object.entries(results.category_scores).map(([key, value]) => ({
        subject: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        score: value,
        fullMark: 100,
    })) : [];

    return (
        <div className="h-full flex flex-col gap-8 overflow-y-auto pb-10 pr-2">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FileText className="text-primary" size={32} /> ATS Resume Analyzer
                    </h1>
                    <p className="text-muted-foreground mt-2">Professional-grade analysis, scoring, and actionable feedback.</p>
                </div>
                {results && (
                    <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors font-bold"
                    >
                        <Download size={18} /> Download Report
                    </button>
                )}
            </header>

            {!results ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Upload UI remains mostly same but supports docx */}
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
                                    <p className="text-muted-foreground text-sm mt-1">PDF or DOCX format</p>
                                </>
                            )}
                        </div>
                    </div>

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
                                    <p className="text-muted-foreground text-sm mt-1">TXT, PDF or DOCX</p>
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
                                    Analyzing Resume Thoroughly...
                                </>
                            ) : (
                                <>
                                    <Zap size={24} />
                                    Generate Professional Analysis
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8" ref={reportRef}>
                    
                    {/* Top Dashboard Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass p-8 rounded-3xl border border-border flex flex-col items-center justify-center text-center shadow-sm">
                            <h3 className="text-xl font-bold text-muted-foreground mb-6">Overall ATS Score</h3>
                            <div className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-[12px] ${getScoreColor(results.overall_score)}`}>
                                <span className="text-5xl font-black">{results.overall_score}</span>
                                <span className="text-sm font-bold opacity-70">/100</span>
                            </div>
                        </div>
                        
                        <div className="glass p-8 rounded-3xl border border-border flex flex-col items-center justify-center text-center shadow-sm">
                            <h3 className="text-xl font-bold text-muted-foreground mb-6">Hiring Readiness</h3>
                            <div className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-[12px] ${getScoreColor(results.hiring_readiness)}`}>
                                <span className="text-5xl font-black">{results.hiring_readiness}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart and Top Issues */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass p-6 rounded-3xl border border-border shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><BarChart3 size={20}/> Category Performance</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12 }} />
                                        <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        
                        <div className="glass p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-6">
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-500"><AlertTriangle size={20}/> Top Improvements Needed</h3>
                                <ul className="flex flex-col gap-2">
                                    {results.top_improvements?.map((imp: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-sm items-start p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                                            <span className="font-black text-red-500">{i+1}.</span>
                                            <span>{imp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-500"><CheckCircle size={20}/> Key Strengths</h3>
                                <ul className="flex flex-col gap-2">
                                    {results.strengths?.map((str: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-sm items-start p-3 bg-green-500/5 rounded-xl border border-green-500/10">
                                            <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                                            <span>{str}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Keywords Analysis */}
                    <div className="glass p-8 rounded-3xl border border-border shadow-sm">
                        <h3 className="text-xl font-bold mb-6">Keyword Optimization</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="text-sm font-bold text-green-500 mb-3 uppercase tracking-wider">Detected Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {results.keywords?.detected?.map((k: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-green-500/10 text-green-600 rounded-lg text-xs font-bold border border-green-500/20">{k}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-red-500 mb-3 uppercase tracking-wider">Missing Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {results.keywords?.missing?.map((k: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-red-500/10 text-red-600 rounded-lg text-xs font-bold border border-red-500/20">{k}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Suggested Additions</h4>
                                <div className="flex flex-wrap gap-2">
                                    {results.keywords?.suggested?.map((k: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20">{k}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deep Section Analysis */}
                    <div>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><ListChecks size={28} className="text-primary"/> Section-by-Section Analysis</h3>
                        <div className="flex flex-col">
                            {results.section_analysis && Object.entries(results.section_analysis).map(([key, data]: [string, any]) => (
                                <SectionAccordion key={key} title={key} data={data} />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center mt-4">
                        <button 
                            onClick={() => { setResults(null); setResumeFile(null); setJdFile(null); setLatestFilename(null); }}
                            className="text-muted-foreground hover:text-foreground font-medium underline"
                        >
                            Upload another resume
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
