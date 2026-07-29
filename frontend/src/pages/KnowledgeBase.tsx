import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, CheckCircle, File, Loader2, Trash2, Database } from "lucide-react";
import { uploadKnowledge, getKnowledgeBase, deleteDocument } from "../services/api";

interface KBDoc {
    filename: string;
    category: string;
    chunks: number;
}

export const KnowledgeBase = () => {
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [documents, setDocuments] = useState<KBDoc[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);

    const fetchDocuments = async () => {
        setLoadingDocs(true);
        try {
            const docs = await getKnowledgeBase();
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to fetch knowledge base", error);
        } finally {
            setLoadingDocs(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        
        const file = acceptedFiles[0];
        setUploading(true);
        setStatus("Uploading and chunking document...");
        
        try {
            const res = await uploadKnowledge(file, "general");
            setStatus(`Success! Added ${res.chunks} chunks to the Knowledge Base.`);
            fetchDocuments(); // Refresh list
        } catch (error: any) {
            console.error(error);
            if (error.response?.data?.detail) {
                setStatus(`Error: ${error.response.data.detail}`);
            } else {
                setStatus("Failed to upload document. Is the backend running?");
            }
        } finally {
            setUploading(false);
        }
    }, []);

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
        try {
            await deleteDocument(filename);
            fetchDocuments(); // Refresh list
        } catch (error) {
            console.error("Failed to delete document", error);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        },
        maxFiles: 1
    });

    return (
        <div className="h-full flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-bold">Knowledge Base</h1>
                <p className="text-muted-foreground mt-2">Upload your notes, interview experiences, and study materials to power your AI Career Coach.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UploadCloud size={20} className="text-primary"/> Upload Document
                    </h2>
                    <div 
                        {...getRootProps()} 
                        className={`min-h-[300px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 transition-colors cursor-pointer ${
                            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                    >
                        <input {...getInputProps()} />
                        
                        {uploading ? (
                            <div className="flex flex-col items-center gap-4 text-primary">
                                <Loader2 size={48} className="animate-spin" />
                                <p className="font-medium text-center text-lg">{status}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                <div className="bg-background p-4 rounded-full shadow-sm border border-border">
                                    <UploadCloud size={48} className="text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-foreground">Drag & drop your files here</p>
                                    <p className="mt-2">Supports PDF, DOCX, and TXT files</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {status && !uploading && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${status.includes('Success') ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                            {status.includes('Success') ? <CheckCircle size={20} /> : <File size={20} />}
                            <span className="font-medium">{status}</span>
                        </div>
                    )}
                </div>

                {/* Database List Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Database size={20} className="text-primary"/> Indexed Documents
                        </span>
                        <span className="text-sm font-normal text-muted-foreground bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">
                            {documents.length} Docs
                        </span>
                    </h2>
                    
                    <div className="glass rounded-3xl p-2 flex-1 min-h-[300px] max-h-[500px] overflow-y-auto">
                        {loadingDocs ? (
                            <div className="p-8 flex justify-center">
                                <Loader2 size={32} className="animate-spin text-primary" />
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                <Database size={48} className="opacity-20 mb-4" />
                                <p className="font-medium">No documents uploaded yet.</p>
                                <p className="text-sm mt-1">Upload a document to see it listed here.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {documents.map((doc, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-border flex items-center justify-between group hover:border-primary/50 transition-colors">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="bg-primary/10 text-primary p-3 rounded-xl shrink-0">
                                                <File size={20} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-medium truncate" title={doc.filename}>{doc.filename}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {doc.chunks} vector chunks • {doc.category}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(doc.filename)}
                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Document"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
