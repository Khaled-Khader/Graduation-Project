    import { Plus } from "lucide-react";

    const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "comments", label: "Most comments" },
    { value: "oldest", label: "Oldest" },
    ];

    export default function PostsHeader({ filter, setFilter, sortBy, setSortBy, onCreate }) {
    return (
        <div className="sticky top-16 z-40 bg-[#0A0F29]/95 backdrop-blur-md py-5">
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                    Community
                    </h2>
                    <p className="text-sm text-white/55 mt-1">
                    Fresh posts, adoption offers, and pet stories.
                    </p>
                </div>

                <button
                onClick={onCreate}
                className="
                    inline-flex items-center justify-center gap-2
                    px-5 py-2.5 rounded-xl
                    bg-[#0A39E0]
                    text-white font-semibold
                    shadow-[0_0_18px_rgba(10,57,224,0.5)]
                    hover:bg-[#0f3dff]
                    transition
                "
                >
                <Plus size={18} />
                Create
                </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
            {["all", "posts", "adoption"].map((type) => (
                <button
                key={type}
                onClick={() => setFilter(type)}
                className={`
                    shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition
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

            <div className="flex items-center gap-2 rounded-xl bg-white/10 p-1 w-full sm:w-auto">
                {sortOptions.map((option) => (
                    <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        sortBy === option.value
                        ? "bg-[#1CE0B7] text-[#071323]"
                        : "text-white/75 hover:bg-white/10"
                    }`}
                    >
                    {option.label}
                    </button>
                ))}
            </div>
            </div>
        </div>
        </div>
    );
    }
