import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { LogOut, Building2 } from "lucide-react";
import type { RootState } from "@/store/store";
import {
  getNavGroupsForRole,
  getNavLabel,
  type UserRole,
} from "@/config/navigation";
import { useLogout } from "@/features/auth/auth.hooks";

interface SidebarProps {
  onNavigate?: () => void;
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
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
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
        <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-white shadow-lg">
          <Building2 className="w-5 h-5" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="text-white font-bold tracking-wide">EMS</p>
          <p className="text-[10px] uppercase tracking-wider text-light/60">
            Employee Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="sidebar-scrollbar flex-1 overflow-y-auto px-3 py-4 space-y-6"
        aria-label="Sidebar navigation"
      >
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-light/40">
              {group.title}
            </p>
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
                        ${isActive
                          ? "bg-primary text-white shadow-md"
                          : "text-light/70 hover:bg-white/10 hover:text-white"}
                      `}
                    >
                      <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                      <span className="truncate">{getNavLabel(item, role)}</span>
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
          className="
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-light/70 hover:bg-red-600/20 hover:text-red-300
            transition-colors duration-200 cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
          <span>{isPending ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
