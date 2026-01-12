import { useState } from "react";
import Dialog from "./Dialog";
import { FetchPets } from "../../../util/http";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../Auth/AuthHook";
import { useCreateAdoptionPost } from "../../../hooks/useCreateAdoptionPost";
import { formatAge } from "../../../util/AgeFormatter";

export default function CreateAdoptionDialog({ open, onClose }) {
    const [selectedPet, setSelectedPet] = useState(null);
    const [note, setNote] = useState("");
    const [city, setCity] = useState(""); 
    const [error, setError] = useState(null); // <-- error state
    const { user } = useAuth();

    // Fetch pets
    const { data: pets = [] } = useQuery({
        queryKey: ["pets", user?.id],
        queryFn: () => FetchPets(user.id),
        enabled: open,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    // Create adoption post mutation
    const createAdoptionPost = useCreateAdoptionPost({
        onSuccess: () => {
        // Reset form and close dialog
        onClose();
        setSelectedPet(null);
        setNote("");
        setCity("");
        setError(null);
        },
        onError: (err) => {
        // Show backend error message
        setError(
            "The pet already has adoption post"
        );
        },
    });

    // ==========================
    // VALIDATION HELPERS
    // ==========================
    const isCityValid = city.trim().length > 0;
    const isNoteValid = note.trim().length > 0;

    function handleSubmit(e) {
        e.preventDefault();
        if (!selectedPet || !isCityValid || !isNoteValid) return;

        setError(null); // reset previous error

        createAdoptionPost.mutate({
        content: note.trim(),
        petId: selectedPet.id,
        city: city.trim(),
        });
    }

    return (
        <Dialog open={open} onClose={onClose}>
        <h2 className="text-2xl font-bold mb-6 text-center">
            Choose Pet for Adoption 🐾
        </h2>

        {/* PET SELECTOR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 max-h-[300px] overflow-y-auto pr-1">
            {pets.map((pet) => (
            <button
                key={pet.id}
                type="button"
                onClick={() => setSelectedPet(pet)}
                disabled={pet.isOnAdoptionPost}
                className={`relative rounded-xl overflow-hidden border transition
                ${
                    selectedPet?.id === pet.id
                    ? "border-[#0A39E0] shadow-[0_0_20px_#0A39E0]"
                    : "border-white/10 hover:border-white/30"
                }
                ${pet.isOnAdoptionPost ? "opacity-50 cursor-not-allowed" : ""}
                `}
            >
                <img
                src={pet.photoUrl}
                alt={pet.name}
                className="w-full aspect-square object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur px-2 py-1 text-left">
                <p className="text-sm font-semibold">{pet.name}</p>
                <p className="text-xs text-white/70">
                    {pet.type} • {formatAge(Number(pet.age))}
                </p>
                </div>

                {/* Selected checkmark */}
                {selectedPet?.id === pet.id && (
                <span className="absolute top-2 right-2 bg-[#0A39E0] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                    ✓
                </span>
                )}

                {/* Already on adoption post badge */}
                {pet.isOnAdoptionPost && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                    Already on Adoption
                </span>
                )}
            </button>
            ))}
        </div>

        {/* CITY INPUT */}
        <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City where the pet is located"
            className="w-full rounded-xl p-3 mb-4 bg-white/10 text-white placeholder-white/50 outline-none"
            required
        />

        {/* NOTE */}
        <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why are you offering this pet for adoption?"
            className="w-full min-h-[100px] rounded-xl p-4 bg-white/10 text-white placeholder-white/50 outline-none resize-none mb-3"
        />

        {/* ERROR MESSAGE */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* SUBMIT BUTTON */}
        <button
            onClick={handleSubmit}
            disabled={!selectedPet || !isCityValid || !isNoteValid || createAdoptionPost.isLoading} // ✅ disabled if city/note empty or spaces
            className={`w-full py-3 rounded-xl font-semibold transition
            ${
                selectedPet && isCityValid && isNoteValid
                ? "bg-[#FF3B59] hover:bg-[#ff4f6a]"
                : "bg-white/20 cursor-not-allowed"
            }
            `}
        >
            {createAdoptionPost.isLoading ? "Publishing..." : "Publish Adoption"}
        </button>
        </Dialog>
    );
}
