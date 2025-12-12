import { createPortal } from "react-dom";
import { useRef, useEffect } from "react";

export default function Dialog({ isOpen, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
  const dialog = dialogRef.current;

  if (isOpen) {
    if (!dialog.open) dialog.showModal();

    
    setTimeout(() => {
      dialog.focus();
    }, 10);
  } else {
    if (dialog.open) dialog.close();
  }
}, [isOpen]);


  useEffect(() => {
    const dialog = dialogRef.current;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  function handleBackdropClick(e) {
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

  return createPortal(
    <dialog
    tabIndex={-1}
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="
        bg-[#D6DAE3] 
        rounded-2xl 
        p-6 
        text-[#050B24]
        backdrop:bg-black/60

        /* ⭐ CENTERING FIX ⭐ */
        fixed
        top-1/2 left-1/2
        -translate-x-1/2 -translate-y-1/2

        w-[95%]
        max-w-3xl
        max-h-[85vh]
        overflow-hidden

        shadow-[0_0_40px_rgba(0,0,0,0.35)]
      "
    >
      
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-2xl text-gray-700 hover:text-black"
      >
        ✕
      </button>

      <div className="p-4">
        {children}
      </div>
    </dialog>,
    document.getElementById("portal-root")
  );
}
