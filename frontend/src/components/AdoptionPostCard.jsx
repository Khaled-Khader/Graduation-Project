import { useEffect, useState } from "react";
import AdoptionRequestDialog from "./posts/dialogs/AdoptionRequestDialog";
import CancelAdoptionPostDialog from "./posts/dialogs/CancelAdoptionPostDialog";
import { useAuth } from "../Auth/AuthHook";
import { formatAge } from "../util/AgeFormatter";

export default function AdoptionPostCard({ post }) {
    const [openAdoptionRequsetDialog, setOpenAdoptionRequsetDialog] =
        useState(false);
    const [openCancelAdoptionPostDilaog, setCancelAdoptionPostDialog] =
        useState(false);
    const [hasRequested, setHasRequested] = useState(
        Boolean(post.requestedByCurrentUser)
    );
    const { user } = useAuth();

    const isOwner = user?.id === post.userId;
    const isReserved = post.adoptionStatus === "RESERVED";
    const requestDisabled = isReserved || hasRequested;

    useEffect(() => {
        setHasRequested(Boolean(post.requestedByCurrentUser));
    }, [post.id, post.requestedByCurrentUser]);

    const genderLabel =
        post.petDTO.gender === "MALE"
            ? "Male"
            : post.petDTO.gender === "FEMALE"
              ? "Female"
              : "Unknown";

    function getRequestButtonText() {
        if (isReserved) {
            return "This adoption is currently reserved";
        }

        if (hasRequested) {
            return "You already sent a request for this pet";
        }

        return "Request Adoption";
    }

    function getRequestButtonClass() {
        if (isReserved) {
            return "bg-yellow-500/30 text-yellow-300 cursor-not-allowed";
        }

        if (hasRequested) {
            return "bg-white/15 text-white/70 cursor-not-allowed";
        }

        return "bg-[#0A39E0] hover:bg-[#0f3dff] shadow-[0_0_15px_#0A39E0]";
    }

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

                    <h3 className="text-lg sm:text-xl font-bold mb-1">
                        {post.petDTO.name}
                    </h3>

                    <p className="text-sm sm:text-base text-white/70 mb-2">
                        {post.petDTO.species} - {genderLabel} - Age:{" "}
                        {formatAge(Number(post.petDTO.age))} - {post.city}
                    </p>

                    <p className="text-sm sm:text-base leading-relaxed mb-4">
                        {post.content}
                    </p>

                    <div className="w-full aspect-[4/5] overflow-hidden rounded-xl mb-4 bg-black">
                        <img
                            src={post.petDTO.photoUrl}
                            alt="post"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {!isOwner ? (
                        <button
                            onClick={() => {
                                if (!requestDisabled) {
                                    setOpenAdoptionRequsetDialog(true);
                                }
                            }}
                            disabled={requestDisabled}
                            className={`
                                w-full py-2.5 rounded-xl
                                font-semibold
                                transition
                                ${getRequestButtonClass()}
                            `}
                        >
                            {getRequestButtonText()}
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
                    onSuccess={() => setHasRequested(true)}
                />
            </div>
        </>
    );
}
