import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";
import type { RootState } from "@/store/store";
import ThemeToggle from "@/components/common/ThemeToggle";
import SearchInput from "@/components/common/SearchInput";
import Avatar from "@/components/common/Avatar";
import { useLogout } from "@/features/auth/auth.hooks";
import { useUnreadNotificationCount } from "@/features/notifications/notifications.hooks";
import {
  getNavGroupsForRole,
  getNavLabel,
  type UserRole,
} from "@/config/navigation";

interface TopNavbarProps {
  onMenuClick: () => void;
}

const TopNavbar = ({ onMenuClick }: TopNavbarProps) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: unreadCountData } = useUnreadNotificationCount();
  const notificationCount = unreadCountData?.unread ?? 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { mutate: logout, isPending } = useLogout();

  const displayName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    user?.username ||
    "User";
  const role = user?.role ?? "Employee";

  const navGroups = getNavGroupsForRole(
    (user?.role ?? undefined) as UserRole | undefined,
  );
  const navItems = navGroups.flatMap((group) => group.items);

  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery
    ? navItems
        .filter(
          (item) =>
            getNavLabel(item, role as UserRole)
              .toLowerCase()
              .includes(normalizedQuery) ||
            item.path.toLowerCase().includes(normalizedQuery),
        )
        .slice(0, 8)
    : [];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const navigateTo = (path: string) => {
    setQuery("");
    setSearchOpen(false);
    setActiveIndex(-1);
    navigate(path);
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    setSearchOpen(true);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = results[activeIndex >= 0 ? activeIndex : 0];
      if (item) navigateTo(item.path);
    }
  };

  const menuItemClass = `
    w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200
    hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer
    focus:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-white/5
  `;

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <div className="flex items-center gap-3 sm:gap-4 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-sm px-4 py-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="
            lg:hidden flex items-center justify-center h-10 w-10 rounded-xl
            text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5
            transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
          "
        >
          <Menu className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* Search */}
        <div
          className="relative flex-1 max-w-sm hidden md:block"
          ref={searchRef}
        >
          <SearchInput
            value={query}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search pages..."
          />
          {searchOpen && normalizedQuery && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden z-50 animate-fade-in">
              {results.length > 0 ? (
                <ul role="listbox" aria-label="Navigation search results">
                  {results.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={index === activeIndex}
                          onClick={() => navigateTo(item.path)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors cursor-pointer focus:outline-none ${
                            index === activeIndex
                              ? "bg-gray-50 dark:bg-white/5 text-primary"
                              : "text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          <Icon
                            className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500"
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {getNavLabel(item, role as UserRole)}
                          </span>
                          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 font-mono hidden sm:inline">
                            {item.path}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                  No matching pages for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 md:hidden" />

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* Notifications */}
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
            className="
              relative flex items-center justify-center h-10 w-10 lg:ml-2  rounded-xl
              text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5
              transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
            "
          >
            <Bell
              className="w-5 h-5 lg:w-6 lg:h-6   text-[#2196F3]/90"
              aria-hidden="true"
            />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <div className=" sm:block">
            <ThemeToggle />
          </div>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="User menu"
              className="
                flex items-center gap-2 sm:gap-3 pl-1 pr-2 py-1 rounded-xl
                hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
              "
            >
              <Avatar
                firstName={user?.firstName}
                lastName={user?.lastName}
                name={displayName}
                src={user?.profilePicture as string | null}
                size="md"
              />
              <span className="hidden sm:block text-left leading-tight">
                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100 max-w-[120px] truncate">
                  {displayName}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {role}
                </span>
              </span>
              <ChevronDown
                className={`hidden sm:block w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="User menu"
                className="
                  absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-dark-surface
                  border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden
                  animate-fade-in
                "
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.username ?? role}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    role="menuitem"
                    className={menuItemClass}
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <UserCircle
                      className="w-4 h-4 text-gray-400 dark:text-gray-500"
                      aria-hidden="true"
                    />
                    Profile
                  </button>
                  {role === "Admin" && (
                    <button
                      type="button"
                      role="menuitem"
                      className={menuItemClass}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/settings");
                      }}
                    >
                      <Settings
                        className="w-4 h-4 text-gray-400 dark:text-gray-500"
                        aria-hidden="true"
                      />
                      Settings
                    </button>
                  )}
                  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                  <button
                    type="button"
                    role="menuitem"
                    className={menuItemClass}
                    onClick={handleLogout}
                    disabled={isPending}
                  >
                    <LogOut
                      className="w-4 h-4 text-red-500"
                      aria-hidden="true"
                    />
                    {isPending ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
