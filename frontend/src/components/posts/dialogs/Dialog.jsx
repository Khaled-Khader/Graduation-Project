// components/posts/dialogs/Dialog.jsx
import { createPortal } from "react-dom";

export default function Dialog({ open, onClose, children }) {
  return createPortal(
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        px-4
        bg-[#050B24]/40
        backdrop-blur-sm
        transition-opacity duration-200
        ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative
          w-full max-w-lg md:max-w-xl
          rounded-2xl
          bg-[#1A2140]
          p-6
          text-white
          border border-white/10
          shadow-[0_0_40px_rgba(10,57,224,0.35)]
          transform transition-all duration-200
          ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            text-white/60 hover:text-white
            transition
          "
        >
          ✕
        </button>

        {children}
      </div>
    </div>,
    document.getElementById("portal-root")
  );
}
