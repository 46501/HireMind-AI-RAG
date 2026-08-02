import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Brain, Briefcase, BotMessageSquare, BookOpen } from "lucide-react";

export const Sidebar = () => {
    const location = useLocation();

    const menu = [
        { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
        { name: "Knowledge Base", path: "/knowledge", icon: <BookOpen size={20} /> },
        { name: "AI Chat", path: "/chat", icon: <BotMessageSquare size={20} /> },
        { name: "Resume Analyzer", path: "/resume", icon: <FileText size={20} /> },
        { name: "Cover Letter", path: "/cover-letter", icon: <FileText size={20} /> },
        { name: "Job Tracker", path: "/job-tracker", icon: <Briefcase size={20} /> },
        { name: "Career Roadmap", path: "/roadmap", icon: <Briefcase size={20} /> },
        { name: "Interview Prep", path: "/interview", icon: <Brain size={20} /> },
    ];

    return (
        <aside className="w-64 h-screen border-r border-border bg-card flex flex-col p-4 shrink-0">
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                    <Briefcase size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight">HireMind AI</h1>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {menu.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                                isActive 
                                    ? "nav-item-active" 
                                    : "text-muted-foreground nav-item"
                            }`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};
