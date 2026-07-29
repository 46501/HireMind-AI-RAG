import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const Layout = () => {
    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-full overflow-y-auto p-8 bg-black/5 dark:bg-black/40">
                <div className="max-w-6xl mx-auto h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
