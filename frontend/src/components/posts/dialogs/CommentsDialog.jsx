        // components/posts/dialogs/CommentsDialog.jsx
        import Dialog from "./Dialog";

        export default function CommentsDialog({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose}>
        
        {/* WRAPPER */}
        <div className="flex flex-col h-[70vh] max-h-[500px]">

            {/* TITLE */}
            <h2 className="text-xl font-bold mb-4 shrink-0">
            Comments
            </h2>

            {/* COMMENTS LIST (SCROLLABLE) */}
            <div className="
            flex-1
            flex flex-col gap-3
            overflow-y-auto
            pr-1
            ">
            <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-sm font-semibold">Ahmed</p>
                <p className="text-sm">Nice post!</p>
            </div>

            {/* repeat comments */}
            </div>

            {/* INPUT AREA */}
            <form className="flex gap-2 mt-4 shrink-0">
            <input
                className="
                flex-1
                rounded-lg px-3 py-2
                bg-white/10
                outline-none
                "
                placeholder="Write a comment..."
            />
            <button
                className="
                bg-[#0A39E0]
                px-4 rounded-lg
                font-semibold
                "
            >
                Send
            </button>
            </form>

        </div>
        </Dialog>
    );
    }

