    import { useState } from "react";
    import Dialog from "../components/posts/dialogs/Dialog";

    export default function ServiceCard({ service, onRemove, currentUserId }) {
    const [openConfirm, setOpenConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleConfirmRemove() {
        try {
        setLoading(true);
        await onRemove(service.id);
        setOpenConfirm(false);
        } finally {
        setLoading(false);
        }
    }

    return (
        <>
        <div
            className="
            relative
            bg-[#0F1538]
            rounded-2xl p-6
            border border-[#6B8CFF]/25
            shadow-lg
            hover:shadow-[0_0_25px_#6B8CFF40]
            transition
            flex flex-col
            justify-between
            h-full
            "
        >
            <div>
            <h3 className="text-xl font-semibold text-[#E6ECFF]">
                {service.name}
            </h3>

            <p className="mt-2 text-[#B8C4FF] text-sm leading-relaxed">
                {service.description}
            </p>

            <div className="mt-4 text-sm text-[#9AA6E8]">
                🐾 Provided by PetNexus
            </div>
            </div>

            {/* REMOVE BUTTON at the bottom */}
            {currentUserId && (
            <button
                onClick={() => setOpenConfirm(true)}
                disabled={loading}
                className="
                mt-6
                w-full
                text-red-500 font-semibold
                px-3 py-2
                rounded-md
                bg-red-500/10
                hover:bg-red-500/20
                hover:scale-105
                transition
                disabled:opacity-50
                "
            >
                Remove
            </button>
            )}
        </div>

        {/* CONFIRM DIALOG */}
        <Dialog
            open={openConfirm}
            onClose={() => !loading && setOpenConfirm(false)}
        >
            <h2 className="text-xl font-semibold mb-3">Remove service</h2>

            <p className="text-white/70 mb-6">
            Are you sure you want to remove{" "}
            <span className="text-white font-medium">{service.name}</span>?
            </p>

            <div className="flex justify-end gap-3">
            <button
                onClick={() => setOpenConfirm(false)}
                disabled={loading}
                className="
                px-5 py-2
                rounded-xl
                bg-white/10
                hover:bg-white/20
                disabled:opacity-50
                "
            >
                Cancel
            </button>

            <button
                onClick={handleConfirmRemove}
                disabled={loading}
                className="
                px-5 py-2
                rounded-xl
                bg-red-500
                hover:bg-red-600
                disabled:bg-red-500/50
                "
            >
                {loading ? "Removing..." : "Yes, remove"}
            </button>
            </div>
        </Dialog>
        </>
    );
    }
