import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarDays,
  TrendingUp,
  Bell,
  ScrollText,
  User,
  Settings,
  UserCheck,
} from "lucide-react";

export type UserRole = "Admin" | "Manager" | "Employee";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles?: UserRole[];
  employeeLabel?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", path: "/home", icon: LayoutDashboard },
      { label: "Users", path: "/users", icon: User, roles: ["Admin"] },
      {
        label: "Employees",
        path: "/employees",
        icon: Users,
        roles: ["Admin", "Manager"],
      },
      {
        label: "Managers",
        path: "/managers",
        icon: UserCheck,
        roles: ["Admin"],
      },
      {
        label: "Departments",
        path: "/departments",
        icon: Building2,
        roles: ["Admin"],
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Attendance",
        path: "/attendance",
        icon: CalendarCheck,
        employeeLabel: "My Attendance",
      },
      {
        label: "Leave Management",
        path: "/leave",
        icon: CalendarDays,
        employeeLabel: "My Leave",
      },
      {
        label: "Performance",
        path: "/performance",
        icon: TrendingUp,
        employeeLabel: "My Performance",
        roles: ["Admin", "Manager"],
      },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Notifications", path: "/notifications", icon: Bell },
      {
        label: "Audit Logs",
        path: "/audit-logs",
        icon: ScrollText,
        roles: ["Admin"],
      },
      { label: "Profile", path: "/profile", icon: User },
      {
        label: "Settings",
        path: "/settings",
        icon: Settings,
        roles: ["Admin"],
      },
    ],
  },
];

export const getNavGroupsForRole = (role?: UserRole): NavGroup[] => {
  return navigationGroups
    .map((group) => {
      const items = group.items.filter((item) => {
        if (!item.roles) return true;
        if (!role) return false;
        return item.roles.includes(role);
      });
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
};

export const getNavLabel = (item: NavItem, role?: UserRole): string => {
  if (role === "Employee" && item.employeeLabel) return item.employeeLabel;
  return item.label;
};
