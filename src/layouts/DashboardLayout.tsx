import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import TopNavbar from "@/components/layout/TopNavbar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-light dark:bg-dark-bg">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar drawer */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </MobileSidebar>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 mt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
