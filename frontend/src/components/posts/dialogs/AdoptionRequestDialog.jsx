    // components/posts/dialogs/AdoptionRequestDialog.jsx
    import Dialog from "./Dialog";

    export default function AdoptionRequestDialog({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose}>
        <h2 className="text-xl font-bold mb-4">Request Adoption</h2>

        <form className="flex flex-col gap-4">
            <input
            className="rounded-lg px-3 py-2 bg-white/10 outline-none"
            placeholder="Phone number"
            />
            <input
            className="rounded-lg px-3 py-2 bg-white/10 outline-none"
            placeholder="City"
            />
            <textarea
            className="rounded-lg px-3 py-2 bg-white/10 outline-none"
            placeholder="Message (optional)"
            />

            <button className="bg-[#0A39E0] py-2 rounded-lg font-semibold">
            Send Request
            </button>
        </form>
        </Dialog>
    );
    }
