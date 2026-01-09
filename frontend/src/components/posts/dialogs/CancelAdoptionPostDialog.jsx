    import Dialog from "./Dialog";
    import { useCancelAdoptionPost } from "../../../hooks/useCancelAdoptionPost";
    export default function CancelAdoptionPostDialog({ open, onClose, petName,postId }) {

        const mutation=useCancelAdoptionPost(onClose)

        function cancelAdoption(){
            mutation.mutate(postId)
        }
        
    return (
        <Dialog open={open} onClose={onClose}>
        {/* TITLE */}
        <h2 className="text-2xl font-bold mb-4 text-center text-white">
            Cancel Adoption 🐾
        </h2>

        {/* MESSAGE */}
        <p className="text-white/70 text-center mb-8 leading-relaxed">
            Are you sure you want to cancel the adoption post for{" "}
            <span className="font-semibold text-white">{petName}</span>?
            <br />
            This action cannot be undone.
        </p>

        {/* ACTIONS */}
        <div className="flex gap-4">
            {/* YES */}
            
            <button
                className="
                    w-full py-3 rounded-xl
                    font-semibold
                    bg-red-600
                    hover:bg-red-700
                    transition
                    shadow-[0_0_15px_rgba(220,38,38,0.6)]
                "
                    onClick={cancelAdoption}
                    disabled={mutation.isLoading}
                >
                {mutation.isLoading ? "Canceling..." : "Yes, Cancel"}
            </button>

            {/* NO */}
            <button
            onClick={onClose}
            className="
                w-full py-3 rounded-xl
                font-semibold
                bg-white/10
                hover:bg-white/20
                transition
            "
            >
            No, Keep It
            </button>
        </div>
        </Dialog>
    );
    }
