import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Plus, Building2, MoreHorizontal, Loader2 } from "lucide-react";
import { getJobs, addJob, updateJobStatus, deleteJob } from "../services/api";

const STATUSES = ["To Apply", "Applied", "Interviewing", "Offered", "Rejected"];

interface Job {
    id: number;
    company: string;
    role: string;
    status: string;
    salary?: string;
    notes?: string;
    updated_at: string;
}

export const JobTracker = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const [newJob, setNewJob] = useState({ company: "", role: "", status: "To Apply", salary: "", notes: "" });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const data = await getJobs();
            setJobs(data);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddJob = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addJob(newJob);
            setIsAddModalOpen(false);
            setNewJob({ company: "", role: "", status: "To Apply", salary: "", notes: "" });
            fetchJobs();
        } catch (error) {
            console.error("Failed to add job", error);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        const jobId = parseInt(draggableId.replace("job-", ""));
        const newStatus = destination.droppableId;

        // Optimistically update UI
        setJobs(prevJobs => 
            prevJobs.map(job => 
                job.id === jobId ? { ...job, status: newStatus } : job
            )
        );

        try {
            await updateJobStatus(jobId, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            fetchJobs(); // Revert on failure
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this job application?")) return;
        try {
            await deleteJob(id);
            setJobs(jobs.filter(j => j.id !== id));
        } catch (error) {
            console.error("Failed to delete job", error);
        }
    };

    const getColumnJobs = (status: string) => {
        return jobs.filter(job => job.status === status);
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'To Apply': return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
            case 'Applied': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300';
            case 'Interviewing': return 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300';
            case 'Offered': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';
            case 'Rejected': return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
            default: return 'bg-gray-100 dark:bg-gray-800';
        }
    };

    return (
        <div className="w-full h-full flex flex-col space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Tracker</h1>
                    <p className="text-muted-foreground mt-2">Manage your job applications visually.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Job
                </button>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto pb-4">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex gap-6 h-full min-h-[600px]">
                            {STATUSES.map(status => (
                                <Droppable key={status} droppableId={status}>
                                    {(provided, snapshot) => (
                                        <div 
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-shrink-0 w-80 bg-muted/40 rounded-2xl p-4 flex flex-col transition-colors ${snapshot.isDraggingOver ? 'bg-muted/70' : ''}`}
                                        >
                                            <div className="flex items-center justify-between mb-4 px-1">
                                                <h3 className="font-bold text-foreground/80 flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(status).split(' ')[0]}`} />
                                                    {status}
                                                </h3>
                                                <span className="text-xs font-medium bg-background px-2.5 py-1 rounded-full text-muted-foreground border">
                                                    {getColumnJobs(status).length}
                                                </span>
                                            </div>

                                            <div className="flex-1 space-y-3 overflow-y-auto">
                                                {getColumnJobs(status).map((job, index) => (
                                                    <Draggable key={job.id} draggableId={`job-${job.id}`} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`bg-card p-4 rounded-xl shadow-sm border ${snapshot.isDragging ? 'shadow-lg border-primary ring-2 ring-primary/20 rotate-2 scale-105' : 'hover:border-primary/50'}`}
                                                                style={{...provided.draggableProps.style}}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="font-bold text-sm truncate pr-2">{job.role}</div>
                                                                    <button 
                                                                        onClick={() => handleDelete(job.id)}
                                                                        className="text-muted-foreground hover:text-red-500 transition-colors"
                                                                    >
                                                                        <MoreHorizontal size={16} />
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                                                    <Building2 size={12} />
                                                                    <span className="truncate">{job.company}</span>
                                                                </div>
                                                                
                                                                <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-border/50">
                                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${getStatusColor(job.status)}`}>
                                                                        {job.status}
                                                                    </span>
                                                                    {job.salary && (
                                                                        <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
                                                                            {job.salary}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-2xl border">
                        <h2 className="text-xl font-bold mb-4">Add Job Application</h2>
                        <form onSubmit={handleAddJob} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Company *</label>
                                <input required type="text" value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full bg-background border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. Google" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role *</label>
                                <input required type="text" value={newJob.role} onChange={e => setNewJob({...newJob, role: e.target.value})} className="w-full bg-background border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. Frontend Engineer" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select value={newJob.status} onChange={e => setNewJob({...newJob, status: e.target.value})} className="w-full bg-background border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none">
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Salary</label>
                                    <input type="text" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full bg-background border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. $120k" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea value={newJob.notes} onChange={e => setNewJob({...newJob, notes: e.target.value})} className="w-full bg-background border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none h-24 resize-none" placeholder="Any links or details..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors">Cancel</button>
                                <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors">Save Job</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
