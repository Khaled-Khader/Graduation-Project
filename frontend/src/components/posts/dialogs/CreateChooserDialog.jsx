    import Dialog from "./Dialog";

    export default function CreateChooserDialog({ open, onClose, onSelect }) {
    return (
        <Dialog open={open} onClose={onClose}>
        <h2 className="text-xl font-bold text-center mb-6">
            Create
        </h2>

        <div className="flex flex-col gap-4">
            <button
            onClick={() => onSelect("post")}
            className="
                w-full py-4 rounded-xl
                bg-white/10
                hover:bg-white/20
                transition
                text-lg
            "
            >
            📝 Create Post
            </button>

            <button
            onClick={() => onSelect("adoption")}
            className="
                w-full py-4 rounded-xl
                bg-white/10
                hover:bg-white/20
                transition
                text-lg
            "
            >
            🐾 Offer Pet for Adoption
            </button>
        </div>
        </Dialog>
    );
    }
