    // components/posts/AdoptionPostCard.jsx
    import { useState } from "react";
    import AdoptionRequestDialog from "./posts/dialogs/AdoptionRequestDialog";
    import CancelAdoptionPostDialog from "./posts/dialogs/CancelAdoptionPostDialog";
    import { useAuth } from "../Auth/AuthHook";
    import { formatAge } from "../util/AgeFormatter";

    export default function AdoptionPostCard({ post }) {
    const [openAdoptionRequsetDialog, setOpenAdoptionRequsetDialog] = useState(false);
    const [openCancelAdoptionPostDilaog, setCancelAdoptionPostDialog] = useState(false);
    const { user } = useAuth();

    const isOwner = user?.id === post.userId;
    const isReserved = post.adoptionStatus === "RESERVED";

    const genderLabel =
        post.petDTO.gender === "MALE"
        ? "♂ Male"
        : post.petDTO.gender === "FEMALE"
        ? "♀ Female"
        : "Unknown";

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

                <span
                className={`text-xs font-semibold ${
                    isReserved ? "text-yellow-400" : "text-green-400"
                }`}
                >
                {post.adoptionStatus}
                </span>
            </div>

            {/* PET INFO */}
            <h3 className="text-lg sm:text-xl font-bold mb-1">
                {post.petDTO.name}
            </h3>

            <p className="text-sm sm:text-base text-white/70 mb-2">
                {post.petDTO.species} • {genderLabel} • Age:{" "}
                {formatAge(Number(post.petDTO.age))} • {post.city}
            </p>

            <p className="text-sm sm:text-base leading-relaxed mb-4">
                {post.content}
            </p>

            {/* IMAGE */}
            <div className="w-full aspect-[4/5] overflow-hidden rounded-xl mb-4 bg-black">
                <img
                src={post.petDTO.photoUrl}
                alt="post"
                className="w-full h-full object-cover"
                />
            </div>

            {/* ACTION */}
            {!isOwner ? (
                <button
                onClick={() => {
                    if (!isReserved) {
                    setOpenAdoptionRequsetDialog(true);
                    }
                }}
                disabled={isReserved}
                className={`
                    w-full py-2.5 rounded-xl
                    font-semibold
                    transition
                    ${
                    isReserved
                        ? "bg-yellow-500/30 text-yellow-300 cursor-not-allowed"
                        : "bg-[#0A39E0] hover:bg-[#0f3dff] shadow-[0_0_15px_#0A39E0]"
                    }
                `}
                >
                {isReserved
                    ? "This adoption is currently reserved"
                    : "Request Adoption"}
                </button>
            ) : (
                <button
                onClick={() => setCancelAdoptionPostDialog(true)}
                className="
                    w-full py-3 rounded-xl
                    bg-red-600
                    text-white
                    font-semibold
                    hover:bg-red-700
                    transition
                    shadow-[0_0_15px_rgba(220,38,38,0.5)]
                "
                >
                Cancel Adoption
                </button>
            )}
            </div>

            {/* DIALOGS */}
            <CancelAdoptionPostDialog
            open={openCancelAdoptionPostDilaog}
            onClose={() => setCancelAdoptionPostDialog(false)}
            petName={post.petDTO.name}
            postId={post.id}
            />

            <AdoptionRequestDialog
            open={openAdoptionRequsetDialog}
            onClose={() => setOpenAdoptionRequsetDialog(false)}
            post={post}
            />
        </div>
        </>
    );
    }
