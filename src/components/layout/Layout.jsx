import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        <div className="flex-1"><Outlet /></div>
        <footer className="shrink-0 px-6 lg:px-8 pb-4 pt-0">
          <div className="border-t border-border/60" />
          <p className="pt-4 text-center text-[11px] text-muted-foreground/70 font-medium tracking-wide">
            © 2026 SAKURA · Developed by Group 5
          </p>
        </footer>
      </main>
    </div>
  );
}
