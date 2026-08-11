import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";


export const Layout = () => {
    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 shrink-0 border-b border-border bg-card flex items-center justify-between px-6 z-10 shadow-sm">
                    {/* Mobile/Alternative Logo Area (optional) */}
                    <div className="flex items-center gap-2 md:hidden">
                        <img src="/icon.png" alt="HireMind AI Logo" className="h-8 w-8 object-contain" />
                        <span className="font-bold">HireMind AI</span>
                    </div>
                    <div className="hidden md:block"></div> {/* Spacer for desktop */}
                    
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </header>
                
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-muted/30">
                    <div className="max-w-6xl mx-auto h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
