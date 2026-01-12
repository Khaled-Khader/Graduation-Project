    import Dialog from "../dialogs/Dialog";

    export default function LogoutDialog({ open, onCancel, onConfirm, isLoading }) {
    return (
        <Dialog open={open} onClose={onCancel}>
        <h2 className="text-xl font-bold text-center mb-4">Are you sure?</h2>
        <p className="text-center text-white/70 mb-6">Do you want to log out?</p>

        <div className="flex gap-3">
            <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition"
            >
            Cancel
            </button>

            <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition disabled:opacity-50"
            >
            {isLoading ? "Logging out..." : "Log out"}
            </button>
        </div>
        </Dialog>
    );
    }
