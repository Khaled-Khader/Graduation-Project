    // components/posts/PostsHeader.jsx
    import { useState } from "react";

    export default function PostsHeader({onCreate}) {
    const [filter, setFilter] = useState("all");

    return (
        <div className="sticky top-16 z-40 bg-[#0A0F29]/90 backdrop-blur-md py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            {/* TITLE */}
            <h2 className="text-2xl md:text-3xl font-extrabold">
            Community
            </h2>

            {/* FILTER TABS */}
            <div className="flex gap-2">
            {["all", "posts", "adoption"].map((type) => (
                <button
                key={type}
                onClick={() => setFilter(type)}
                className={`
                    px-4 py-2 rounded-full text-sm font-semibold transition
                    ${filter === type
                    ? "bg-white text-[#0A0F29]"
                    : "bg-white/10 text-white hover:bg-white/20"}
                `}
                >
                {type === "all" && "All"}
                {type === "posts" && "Posts"}
                {type === "adoption" && "Adoption"}
                </button>
            ))}
            </div>

            {/* CREATE BUTTON */}
            <button
                onClick={onCreate}
                className="
                    px-5 py-2 rounded-full
                    bg-[#0A39E0]
                    text-white font-semibold
                    shadow-[0_0_20px_#0A39E0]
                    hover:bg-[#0f3dff]
                    transition
                "
            >
            + Create
            </button>
        </div>
        </div>
    );
    }
