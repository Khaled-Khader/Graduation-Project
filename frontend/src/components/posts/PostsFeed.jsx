    // components/posts/PostsFeed.jsx
    import PostCard from "./PostCard";
    import AdoptionPostCard from "../AdoptionPostCard";

    const MOCK_FEED = [
    { id: 1, type: "post" },
    { id: 2, type: "adoption" },
    { id: 3, type: "post" },
    ];

    export default function PostsFeed() {
    return (
        <div className="mt-6 flex flex-col gap-10">
        {MOCK_FEED.map((item) =>
            item.type === "post" ? (
            <PostCard key={item.id} />
            ) : (
            <AdoptionPostCard key={item.id} />
            )
        )}
        </div>
    );
    }
