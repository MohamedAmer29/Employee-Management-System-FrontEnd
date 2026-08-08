import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const MobileSidebar = ({ open, onClose, children }: MobileSidebarProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute inset-y-0 left-0 w-64 max-w-[85vw] bg-dark shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="
            absolute top-4 right-4 z-10 flex items-center justify-center h-8 w-8 rounded-lg
            text-light/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
          "
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default MobileSidebar;
