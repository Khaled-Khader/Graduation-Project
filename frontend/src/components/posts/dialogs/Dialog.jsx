// components/posts/dialogs/Dialog.jsx
import { createPortal } from "react-dom";

export default function Dialog({ open, onClose, children }) {
  if (!open) return null;

  return createPortal(
  <div
    className="
      fixed inset-0 z-50 
      flex items-center justify-center 
      bg-[#050B24]/40         /* SOFTER BACKDROP */
      backdrop-blur-sm
      px-4
    "
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="
        relative
        w-full max-w-lg md:max-w-xl
        rounded-2xl
        bg-[#1A2140]           /* LIGHTER THAN PAGE */
        p-6
        text-white
        border border-white/10
        shadow-[0_0_40px_rgba(10,57,224,0.35)]
      "
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
