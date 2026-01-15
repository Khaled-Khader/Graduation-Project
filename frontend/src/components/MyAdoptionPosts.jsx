// pages/MyAdoptionsPosts.jsx
import { useState } from "react";
import CancelAdoptionPostDialog from "../components/posts/dialogs/CancelAdoptionPostDialog";
import { useGetUserAdoptionPosts } from "../hooks/useGetUserAdoptionPosts";
import AdoptionRequestersDialog from "./posts/dialogs/AdoptionRequsetersDialog";
import {useCompleteAdoptionPost} from "../hooks/useCompleteAdoptionPost"
import { formatAge } from "../util/AgeFormatter";

export default function MyAdoptionsPosts() {
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [openRequestersDialog, setOpenRequestersDialog] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);

    const mutation=useCompleteAdoptionPost()

    const { data, isLoading, isError } = useGetUserAdoptionPosts();
    if (isLoading) return <div className="text-white">Loading posts...</div>;
    if (isError) return <div className="text-red-400">Something went wrong</div>;


    function handleComplete(postId){
        mutation.mutate(postId)
    }
    console.log(data)
    return (
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-4">
            <h1 className="text-2xl font-bold text-white mb-4">
                My Adoption Posts
            </h1>

            {data.length === 0 && (
                <p className="text-white/60">No adoption posts yet.</p>
            )}

            {data.map((post) => {
                const isReserved = post.adoptionStatus === "RESERVED";

                return (
                    <div
                        key={post.id}
                        className="
                            bg-white/5
                            backdrop-blur
                            border border-white/10
                            rounded-2xl
                            p-5
                            shadow-lg
                            hover:border-white/20
                            transition
                        "
                    >
                        {/* Post Info */}
                        <h2 className="text-lg font-semibold text-white">
                            {post.petDTO.name}
                        </h2>

                        <p className="text-sm text-white/60">
                            {post.petDTO.species} • Age: {formatAge(Number(post.petDTO.age))} • {post.city}
                        </p>

                        <p className="text-sm text-white/70 mt-2">
                            {post.content}
                        </p>

                        <span
                            className={`
                                inline-block mt-3 text-xs px-3 py-1 rounded-full
                                ${
                                    isReserved
                                        ? "bg-yellow-500/20 text-yellow-300"
                                        : "bg-white/10 text-white/80"
                                }
                            `}
                        >
                            {post.adoptionStatus}
                        </span>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4">
                            {/* CANCEL BUTTON (unchanged) */}
                            <button
                                onClick={() => {
                                    setSelectedPostId(post.id);
                                    setOpenCancelDialog(true);
                                }}
                                className="
                                    flex-1
                                    py-2.5
                                    rounded-xl
                                    bg-red-600/90
                                    hover:bg-red-600
                                    text-white
                                    font-semibold
                                    transition
                                "
                            >
                                Cancel
                            </button>

                            {/* SECOND BUTTON */}
                            {!isReserved ? (
                                <button
                                    onClick={() => {
                                        setSelectedPostId(post.id);
                                        setOpenRequestersDialog(true);
                                    }}
                                    className="
                                        flex-1
                                        py-2.5
                                        rounded-xl
                                        bg-white/10
                                        hover:bg-white/20
                                        text-white
                                        font-semibold
                                        transition
                                    "
                                >
                                    View Requesters
                                </button>
                            ) : (
                                <button
                                    onClick={()=>handleComplete(post.id)}
                                    className="
                                        flex-1
                                        py-2.5
                                        rounded-xl
                                        bg-green-600/80
                                        hover:bg-green-600
                                        text-white
                                        font-semibold
                                        transition
                                    "
                                >
                                    Complete Adoption
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Dialogs */}
            {selectedPostId && (
                <>
                    <CancelAdoptionPostDialog
                        open={openCancelDialog}
                        onClose={() => setOpenCancelDialog(false)}
                        petName={data.find(p => p.id === selectedPostId)?.petDTO.name}
                        postId={selectedPostId}
                    />

                    <AdoptionRequestersDialog
                        open={openRequestersDialog}
                        onClose={() => setOpenRequestersDialog(false)}
                        postId={selectedPostId}
                    />
                </>
            )}
        </div>
    );
}
