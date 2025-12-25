        // components/posts/AdoptionPostCard.jsx
        import { useState } from "react";
        import AdoptionRequestDialog from "./posts/dialogs/AdoptionRequestDialog";

        export default function AdoptionPostCard() {
        const [open, setOpen] = useState(false);

        return (
            <>
            <div className="w-full flex justify-center px-3 sm:px-4">
    <div
        className="
        w-full
        max-w-[520px]
        md:max-w-[600px]
        lg:max-w-[680px]
        bg-gradient-to-br from-[#1a1f4a] to-[#0A0F29]
        border border-[#3A00C9]/40
        rounded-2xl
        p-4 sm:p-5
        shadow-[0_0_30px_#3A00C9]
        text-white
        "
    >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
        <span className="text-xs px-3 py-1 rounded-full bg-[#FF3B59]">
            Adoption
        </span>
        <span className="text-xs text-green-400 font-semibold">
            OPEN
        </span>
        </div>

        {/* PET INFO */}
        <h3 className="text-lg sm:text-xl font-bold mb-1">
        Bella
        </h3>

        <p className="text-sm sm:text-base text-white/70 mb-2">
        Cat • 2 years • Amman
        </p>

        <p className="text-sm sm:text-base leading-relaxed mb-4">
        Friendly cat looking for a loving home 💙
        </p>

        {/* IMAGE */}
        <div className="w-full aspect-[4/5] overflow-hidden rounded-xl mb-4 bg-black">
    <img
        src="/1.png"
        alt="post"
        className="w-full h-full object-cover"
        />
    </div>

        {/* ACTION */}
        <button
        onClick={() => setOpen(true)}
        className="
            w-full py-2.5 rounded-xl
            bg-[#0A39E0]
            font-semibold
            hover:bg-[#0f3dff]
            transition
            shadow-[0_0_15px_#0A39E0]
        "
        >
        Request Adoption
        </button>
    </div>

    <AdoptionRequestDialog open={open} onClose={() => setOpen(false)} />
    </div>
            </>
        );
        }
