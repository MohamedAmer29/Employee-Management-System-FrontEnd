import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { LogOut, Building2, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { RootState } from "@/store/store";
import {
  getNavGroupsForRole,
  getNavLabel,
  type UserRole,
} from "@/config/navigation";
import { useLogout } from "@/features/auth/auth.hooks";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

const Sidebar = ({ collapsed = false, onToggle, onNavigate }: SidebarProps) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = (user?.role ?? undefined) as UserRole | undefined;
  const groups = getNavGroupsForRole(role);
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-full bg-dark text-light/80">
      {/* Brand */}
      <div
        className={`relative flex items-center shrink-0 h-16 border-b border-white/10 gap-2 ${
          collapsed ? "justify-center px-1" : "px-4"
        }`}
      >
        <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary text-white shadow-lg shrink-0">
          <Building2 className="w-5 h-5" aria-hidden="true" />
        </span>
        {!collapsed && (
          <div className="leading-tight flex-1 min-w-0">
            <p className="text-white font-bold tracking-wide">EMS</p>
            <p className="text-[10px] uppercase tracking-wider text-light/60 truncate">
              Employee Management
            </p>
          </div>
        )}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
            title={collapsed ? "Show sidebar" : "Hide sidebar"}
            className={`flex items-center justify-center shrink-0 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              collapsed
                ? "absolute z-20 -right-3.5 top-8 h-9 w-9 rounded-full bg-primary text-white shadow-lg ring-2 ring-dark hover:bg-primary-dark"
                : "h-8 w-8 rounded-lg text-light/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {collapsed ? (
              <ChevronsRight className="w-5 h-5" aria-hidden="true" />
            ) : (
              <ChevronsLeft className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className="sidebar-scrollbar flex-1 overflow-y-auto px-3 py-4 space-y-6"
        aria-label="Sidebar navigation"
      >
        {groups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-light/40">
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onNavigate}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark
                        ${collapsed ? "justify-center px-0" : ""}
                        ${isActive
                          ? "bg-primary text-white shadow-md"
                          : "text-light/70 hover:bg-white/10 hover:text-white"}
                      `}
                    >
                      <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                      {!collapsed && (
                        <span className="truncate">{getNavLabel(item, role)}</span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-light/70 hover:bg-red-600/20 hover:text-red-300
            transition-colors duration-200 cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
            disabled:opacity-60 disabled:cursor-not-allowed
            ${collapsed ? "justify-center px-0" : ""}
          `}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
          {!collapsed && (
            <span>{isPending ? "Logging out..." : "Logout"}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
