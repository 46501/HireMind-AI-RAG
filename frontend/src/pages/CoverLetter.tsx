import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, UploadCloud, Loader2, Copy, Download, Zap, Settings2 } from "lucide-react";
import { generateCoverLetter } from "../services/api";
import { motion } from "framer-motion";
import html2pdf from "html2pdf.js";

export const CoverLetter = () => {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jdFile, setJdFile] = useState<File | null>(null);
    const [tone, setTone] = useState("Professional");
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

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

    const handleGenerate = async () => {
        if (!resumeFile) return;
        setIsGenerating(true);
        setError(null);

        try {
            const data = await generateCoverLetter(resumeFile, jdFile || undefined, tone);
            if (data.error) {
                setError(data.error);
            } else {
                setResults(data);
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while generating the cover letter.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (results?.cover_letter) {
            navigator.clipboard.writeText(results.cover_letter);
        }
    };

    const handleDownloadPDF = () => {
        if (!results?.cover_letter) return;
        
        // Create a temporary element for the PDF generation
        const element = document.createElement("div");
        element.innerHTML = `
            <div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; padding: 40px; color: #333; white-space: pre-wrap;">
                ${results.cover_letter}
            </div>
        `;
        
        const opt = {
            margin: 0.5,
            filename: `Cover_Letter_${resumeFile?.name || 'document'}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
        };
        
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cover Letter Generator</h1>
                    <p className="text-muted-foreground mt-2">Generate a highly tailored cover letter based on your resume and target job.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: UPLOADS & SETTINGS */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card rounded-2xl p-6 border shadow-sm">
                        <h2 className="font-semibold mb-4 text-lg">Input Details</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-foreground/80">Your Resume (PDF/DOCX) *</label>
                                <div 
                                    {...getResumeProps()} 
                                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer dropzone-interactive ${
                                        resumeFile ? "border-primary bg-primary/5" : "border-border"
                                    }`}
                                >
                                    <input {...getResumeInput()} />
                                    {resumeFile ? (
                                        <div className="flex items-center gap-2 text-primary font-medium">
                                            <FileText size={20} />
                                            <span className="truncate max-w-[200px]">{resumeFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <UploadCloud className="mx-auto text-muted-foreground mb-2" size={24} />
                                            <p className="text-sm text-muted-foreground">Drop your resume here or click to browse</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2 text-foreground/80">Target Job Description (Optional)</label>
                                <div 
                                    {...getJDProps()} 
                                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer dropzone-interactive ${
                                        jdFile ? "border-primary bg-primary/5" : "border-border"
                                    }`}
                                >
                                    <input {...getJDInput()} />
                                    {jdFile ? (
                                        <div className="flex items-center gap-2 text-primary font-medium text-sm">
                                            <FileText size={16} />
                                            <span className="truncate max-w-[200px]">{jdFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="text-center text-sm">
                                            <p className="text-muted-foreground">Drop job description (PDF/TXT/DOCX)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl p-6 border shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings2 size={18} className="text-primary"/>
                            <h2 className="font-semibold text-lg">Settings</h2>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2 text-foreground/80">Tone</label>
                            <select 
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm input-interactive"
                            >
                                <option value="Professional">Professional & Formal</option>
                                <option value="Confident">Confident & Assertive</option>
                                <option value="Enthusiastic">Enthusiastic & Passionate</option>
                                <option value="Creative">Creative & Unique</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!resumeFile || isGenerating}
                        className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold btn-primary flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Zap size={20} />
                                Generate Cover Letter
                            </>
                        )}
                    </button>
                    
                    {error && (
                        <div className="p-4 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20">
                            {error}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: PREVIEW */}
                <div className="lg:col-span-8">
                    {results ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border rounded-2xl shadow-sm overflow-hidden h-full flex flex-col"
                        >
                            <div className="border-b bg-muted/30 px-6 py-4 flex items-center justify-between">
                                <h3 className="font-bold text-lg">Generated Cover Letter</h3>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={copyToClipboard}
                                        className="p-2 bg-background border rounded-lg flex items-center gap-2 text-sm font-medium btn-ghost"
                                        title="Copy to Clipboard"
                                    >
                                        <Copy size={16} />
                                        <span className="hidden sm:inline">Copy</span>
                                    </button>
                                    <button 
                                        onClick={handleDownloadPDF}
                                        className="p-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm btn-primary"
                                        title="Download as PDF"
                                    >
                                        <Download size={16} />
                                        <span className="hidden sm:inline">Export PDF</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-8 flex-1 overflow-y-auto bg-background font-serif">
                                <div className="max-w-[6.5in] mx-auto whitespace-pre-wrap text-foreground/90 leading-relaxed">
                                    {results.cover_letter}
                                </div>
                            </div>
                            
                            {results.tips && results.tips.length > 0 && (
                                <div className="bg-primary/5 border-t border-primary/20 p-6">
                                    <h4 className="font-bold text-primary mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                        <Zap size={16} /> Actionable Tips
                                    </h4>
                                    <ul className="space-y-2">
                                        {results.tips.map((tip: string, idx: number) => (
                                            <li key={idx} className="flex gap-3 text-sm text-foreground/80">
                                                <span className="text-primary mt-0.5">•</span>
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="bg-card border border-dashed rounded-2xl h-[600px] flex flex-col items-center justify-center text-muted-foreground p-8 text-center shadow-sm">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <FileText size={32} className="text-primary" />
                            </div>
                            <h3 className="font-bold text-xl text-foreground mb-2">Ready to Impress</h3>
                            <p className="max-w-md">
                                Upload your resume on the left, optionally add a job description, and pick your preferred tone. We'll generate a professional cover letter ready for you to export or copy.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
