import { useState } from "react";
import Dialog from "./Dialog";
import { useCreateAdoptionRequest } from "../../../hooks/useCreateAdoptionRequset";

export default function AdoptionRequestDialog({ open, onClose, post }) {
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [message, setMessage] = useState("");

    const mutation = useCreateAdoptionRequest(() => {
        onClose(); // close dialog after success
        setPhone("");
        setCity("");
        setMessage("");
    });

    // ==============================
    // Validation helpers
    // ==============================
    const isPhoneValid = phone.trim().length > 0;
    const isCityValid = city.trim().length > 0;

    function handleSubmit(e) {
        e.preventDefault();
        if (!isPhoneValid || !isCityValid) return;

        mutation.mutate({
            postId: post.id,
            phoneNumber: phone.trim(),
            city: city.trim(),
            message,
        });
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-6 text-center">
                Request Adoption for {post.petDTO.name} 🐾
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/50 outline-none"
                    required
                />

                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/50 outline-none"
                    required
                />

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message (optional)"
                    className="w-full min-h-[100px] p-3 rounded-xl bg-white/10 text-white placeholder-white/50 outline-none resize-none"
                />

                <button
                    type="submit"
                    disabled={!isPhoneValid || !isCityValid || mutation.isLoading} // ✅ disabled if invalid
                    className={`w-full py-3 rounded-xl font-semibold transition
                        ${!isPhoneValid || !isCityValid || mutation.isLoading
                        ? "bg-white/20 cursor-not-allowed"
                        : "bg-[#0A39E0] hover:bg-[#0f3dff]"
                        }`}
                >
                    {mutation.isLoading ? "Submitting..." : "Send Request"}
                </button>

                {mutation.isError && (
                    <p className="text-red-500 text-sm mt-1">You already request on this post</p>
                )}
            </form>
        </Dialog>
    );
}
