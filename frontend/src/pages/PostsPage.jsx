    import { useState } from "react";
    import PostsHeader from "../components/posts/PostsHeader";
    import PostsFeed from "../components/posts/PostsFeed";
    import CreateChooserDialog from "../components/posts/dialogs/CreateChooserDialog";
    import CreatePostDialog from "../components/posts/dialogs/CreatePostDialog";
    import CreateAdoptionDialog from "../components/posts/dialogs/CreateAdoptionDialog";

    export default function PostsPage() {
    const [openChooser, setOpenChooser] = useState(false);
    const [openPost, setOpenPost] = useState(false);
    const [openAdoption, setOpenAdoption] = useState(false);

    function handleCreate(type) {
        setOpenChooser(false);
        if (type === "post") setOpenPost(true);
        if (type === "adoption") setOpenAdoption(true);
    }

    return (
        <div className="w-full min-h-screen bg-[#0A0F29] text-white">
        <div className="max-w-[900px] mx-auto px-4 pb-24">
            <PostsHeader onCreate={() => setOpenChooser(true)} />
            <PostsFeed />

            {/* dialogs */}
            <CreateChooserDialog
            open={openChooser}
            onClose={() => setOpenChooser(false)}
            onSelect={handleCreate}
            />

            <CreatePostDialog
            open={openPost}
            onClose={() => setOpenPost(false)}
            />

            <CreateAdoptionDialog
            open={openAdoption}
            onClose={() => setOpenAdoption(false)}
            />
        </div>
        </div>
    );
    }
