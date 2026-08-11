import { useEffect } from "react";
import { X } from "lucide-react";

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

const ImageLightbox = ({ src, alt, onClose }: ImageLightboxProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={alt ?? "Image"}
    >
      <style>{`
        @keyframes lightbox-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lightbox-zoom-in {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "lightbox-fade-in 0.2s ease-out" }}
      />
      <div className="relative max-w-3xl w-full flex items-center justify-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image"
          className="absolute -top-14 right-0 flex items-center justify-center h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/25 hover:rotate-90 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
        <img
          src={src}
          alt={alt ?? "Image"}
          className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain"
          style={{ animation: "lightbox-zoom-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
