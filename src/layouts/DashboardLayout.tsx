import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import TopNavbar from "@/components/layout/TopNavbar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#E3F2FD] dark:bg-[#0A1C33]">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col shrink-0 transition-[width] duration-300 ${
          sidebarCollapsed ? "lg:w-[76px]" : "lg:w-64"
        }`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
      </aside>

      {/* Mobile sidebar drawer */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </MobileSidebar>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto overflow-x-hidden">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 mt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
