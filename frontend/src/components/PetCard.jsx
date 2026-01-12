    import { useState } from "react";
    import Dialog from "../components/posts/dialogs/Dialog";
    import { formatAge } from "../util/AgeFormatter";

    export default function PetCard({ pet, onRemove, currentUserId }) {
    const [openConfirm, setOpenConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // <-- Error state

    async function handleConfirmRemove() {
        try {
        setLoading(true);
        setError(null); // reset error before trying
        await onRemove(pet.id);
        setOpenConfirm(false);
        } catch (err) {
        setError("Can not remove pet, its on adoption post"); // <-- set error message
        } finally {
        setLoading(false);
        }
    }

    const genderLabel =
        pet.gender === "MALE"
        ? "♂️ Male"
        : pet.gender === "FEMALE"
        ? "♀️ Female"
        : null;

    return (
        <>
        <div
            className="
            relative
            bg-[#0F1538]
            rounded-2xl p-5
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
            <img
                src={pet.photoUrl || "/pet.png"}
                alt={pet.name}
                className="w-full h-40 object-cover rounded-xl mb-4"
            />

            <h3 className="text-xl font-bold text-[#E6ECFF]">{pet.name}</h3>

            <p className="text-[#B8C4FF] text-sm mt-1 flex items-center gap-2">
                <span>{pet.species}</span>
                <span>•</span>
                <span>{formatAge(Number(pet.age))}</span>
                {genderLabel && (
                <>
                    <span>•</span>
                    <span className="text-[#6B8CFF] font-medium">{genderLabel}</span>
                </>
                )}
            </p>

            <div className="mt-3 flex justify-between text-sm">
                <span className="text-[#9AA6E8]">
                Health: {pet.healthStatus || "N/A"}
                </span>

                {pet.hasVaccineCert && (
                <span className="text-[#6B8CFF] font-medium">💉 Vaccinated</span>
                )}
            </div>
            </div>

            {/* REMOVE BUTTON */}
            {currentUserId && (
            <button
                onClick={() => setOpenConfirm(true)}
                disabled={loading}
                className="
                mt-4
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
        <Dialog open={openConfirm} onClose={() => !loading && setOpenConfirm(false)}>
            <h2 className="text-xl font-semibold mb-3">Remove pet</h2>

            <p className="text-white/70 mb-6">
            Are you sure you want to remove{" "}
            <span className="text-white font-medium">{pet.name}</span>?
            </p>

            {/* Error message */}
            {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

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
