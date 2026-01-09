    import { useState } from "react";
    import Dialog from "./Dialog";
    import { useCreateRegularPost } from "../../../hooks/useCreateRegularPost";
    import { uploadImageToCloudinary } from "../../../util/cloudinary";

    export default function CreatePostDialog({ open, onClose }) {
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { mutate, isLoading } = useCreateRegularPost(() => {
        // Reset dialog after success
        setText("");
        setImage(null);
        onClose();
    });

    async function handleSubmit(e) {
        e.preventDefault();

        let imageUrl = null;

        if (image) {
        try {
            setIsUploading(true);
            imageUrl = await uploadImageToCloudinary(image);
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            alert("Failed to upload image");
            setIsUploading(false);
            return;
        } finally {
            setIsUploading(false);
        }
        }

        // Send content + uploaded image URL to backend
        mutate({ content: text, imageUrl });
    }

    return (
        <Dialog open={open} onClose={onClose}>
        <h2 className="text-2xl font-bold mb-5 text-center">Create Post</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* TEXT */}
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="
                w-full min-h-[120px]
                rounded-xl p-4
                bg-white/10
                text-white
                placeholder-white/50
                outline-none
                resize-none
            "
            required
            />

            {/* IMAGE UPLOAD */}
            <label className="cursor-pointer">
            <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files[0])}
            />
            <div className="
                w-full py-3 text-center
                rounded-xl
                bg-white/10
                hover:bg-white/20
                transition
            ">
                📷 Add Image
            </div>
            </label>

            {/* IMAGE PREVIEW */}
            {image && (
            <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="w-full rounded-xl object-cover max-h-[300px]"
            />
            )}

            {/* SUBMIT */}
            <button
            type="submit"
            disabled={isLoading || isUploading}
            className="
                mt-2 w-full py-3
                rounded-xl
                bg-[#0A39E0]
                font-semibold
                hover:bg-[#0f3dff]
                transition
                disabled:opacity-50
            "
            >
            {isUploading
                ? "Uploading Image..."
                : isLoading
                ? "Posting..."
                : "Post"}
            </button>
        </form>
        </Dialog>
    );
    }
