import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className = "" }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        z-30 flex items-center justify-center w-10 h-10 rounded-full
        bg-light text-primary-dark
        hover:bg-primary hover:text-white
        dark:bg-dark dark:text-light
        dark:hover:bg-primary-dark
        transition-colors duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-primary
        ${className}
      `}
    >
      {isDark ? (
        <Sun size={20} aria-hidden="true" />
      ) : (
        <Moon size={20} aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
