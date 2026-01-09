    // components/posts/dialogs/AdoptionRequestersDialog.jsx
    import Dialog from "./Dialog";
    import { useAcceptRequset } from "../../../hooks/useAcceptRequset";
    import { useInfiniteAdoptionRequests } from "../../../hooks/useGetAdoptionPostRequsets";
    import { useState } from "react";

    export default function AdoptionRequestersDialog({ open, onClose, postId }) {
    const [confirmingId, setConfirmingId] = useState(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteAdoptionRequests(postId);

    const requests = data?.pages.flatMap((page) => page.content) ?? [];
    const mutation = useAcceptRequset(onClose);

    function handleConfirmAccept(requestId) {
        mutation.mutate(requestId, {
        onSuccess: () => setConfirmingId(null),
        });
    }

    function handleScroll(e) {
        const el = e.currentTarget;
        if (
        el.scrollTop + el.clientHeight >= el.scrollHeight - 40 &&
        hasNextPage &&
        !isFetchingNextPage
        ) {
        fetchNextPage();
        }
    }

    return (
        <Dialog open={open} onClose={onClose}>
        {/* TITLE */}
        <h2 className="text-xl font-bold mb-4 text-center text-white">
            Adoption Requests
        </h2>

        {/* REQUESTS LIST */}
        <div
            className="flex flex-col gap-3 max-h-[420px] overflow-y-auto"
            onScroll={handleScroll}
        >
            {isLoading && (
            <p className="text-white/60 text-center py-10">
                Loading requests...
            </p>
            )}

            {!isLoading && requests.length === 0 && (
            <p className="text-white/60 text-center py-12">
                No adoption requests yet.
            </p>
            )}

            {requests.map((req) => (
            <div
                key={req.id}
                className="
                bg-white/5
                backdrop-blur
                border border-white/10
                rounded-xl
                p-4
                flex flex-col gap-2
                "
            >
                {/* HEADER */}
                <div className="flex justify-between items-center">
                <h3 className="font-semibold text-white">
                    {req.requesterName}
                </h3>

                <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                    req.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : req.status === "ACCEPTED"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                >
                    {req.status}
                </span>
                </div>

                {/* INFO */}
                <p className="text-sm text-white/60">
                📞 {req.phoneNumber} &nbsp;•&nbsp; 📍 {req.city}
                </p>

                {/* MESSAGE */}
                {req.message && (
                <p className="text-sm text-white/70 italic">
                    “{req.message}”
                </p>
                )}

                {/* ACTIONS */}
                {req.status === "PENDING" && (
                <div className="relative h-[42px] mt-2">
                    {/* ACCEPT BUTTON */}
                    {confirmingId !== req.id && (
                    <button
                        className="
                        absolute inset-0
                        rounded-xl
                        bg-green-600/80
                        hover:bg-green-600
                        text-white
                        font-semibold
                        transition-all
                        duration-200
                        opacity-100 scale-100
                        "
                        onClick={() => setConfirmingId(req.id)}
                    >
                        Accept
                    </button>
                    )}

                    {/* CONFIRMATION BUTTONS */}
                    {confirmingId === req.id && (
                    <div
                        className="
                        absolute inset-0
                        flex gap-2
                        transition-all
                        duration-200
                        opacity-100 scale-100
                        "
                    >
                        <button
                        className="
                            flex-1
                            rounded-xl
                            bg-green-600
                            hover:bg-green-700
                            text-white
                            font-semibold
                            transition
                        "
                        onClick={() => handleConfirmAccept(req.id)}
                        disabled={mutation.isLoading}
                        >
                        Confirm
                        </button>

                        <button
                        className="
                            flex-1
                            rounded-xl
                            bg-white/10
                            hover:bg-white/20
                            text-white
                            font-semibold
                            transition
                        "
                        onClick={() => setConfirmingId(null)}
                        >
                        Cancel
                        </button>
                    </div>
                    )}
                </div>
                )}
            </div>
            ))}

            {isFetchingNextPage && (
            <p className="text-white/50 text-center py-4">
                Loading more...
            </p>
            )}
        </div>
        </Dialog>
    );
    }
