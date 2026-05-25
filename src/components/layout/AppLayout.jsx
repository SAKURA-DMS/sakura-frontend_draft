import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import CopyrightFooter from "./CopyrightFooter";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        <div className="flex-1"><Outlet /></div>
        <CopyrightFooter />
      </main>
    </div>
  );
}
