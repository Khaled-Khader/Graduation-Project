import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import Dialog from "./Dialog";
import AddPetForm from "../../profile/AddPetForm";
import { FetchPets } from "../../../util/http";
import { useAuth } from "../../../Auth/AuthHook";
import { useCreateAdoptionPost } from "../../../hooks/useCreateAdoptionPost";
import { formatAge } from "../../../util/AgeFormatter";

export default function CreateAdoptionDialog({ open, onClose }) {
    const [selectedPet, setSelectedPet] = useState(null);
    const [note, setNote] = useState("");
    const [city, setCity] = useState("");
    const [error, setError] = useState(null);
    const [isAddingPet, setIsAddingPet] = useState(false);
    const { user } = useAuth();

    const {
        data: pets = [],
        isFetching: isFetchingPets,
        refetch: refetchPets,
    } = useQuery({
        queryKey: ["pets", user?.id],
        queryFn: () => FetchPets(user.id),
        enabled: open && !!user?.id,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: true,
    });

    const createAdoptionPost = useCreateAdoptionPost({
        onSuccess: () => {
            handleClose();
        },
        onError: () => {
            setError("The pet already has an adoption post");
        },
    });

    const availablePets = pets.filter((pet) => !pet.isOnAdoptionPost);
    const isCityValid = city.trim().length > 0;
    const isNoteValid = note.trim().length > 0;

    useEffect(() => {
        if (open && !isFetchingPets && pets.length === 0) {
            setIsAddingPet(true);
        }
    }, [open, isFetchingPets, pets.length]);

    useEffect(() => {
        if (!open) {
            setSelectedPet(null);
            setNote("");
            setCity("");
            setError(null);
            setIsAddingPet(false);
        }
    }, [open]);

    function handleClose() {
        setSelectedPet(null);
        setNote("");
        setCity("");
        setError(null);
        setIsAddingPet(false);
        onClose();
    }

    async function handlePetAdded() {
        const result = await refetchPets();
        const nextPet = result.data?.find((pet) => !pet.isOnAdoptionPost);
        if (nextPet) {
            setSelectedPet(nextPet);
        }
        setIsAddingPet(false);
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!selectedPet || !isCityValid || !isNoteValid) return;

        setError(null);
        createAdoptionPost.mutate({
            content: note.trim(),
            petId: selectedPet.id,
            city: city.trim(),
        });
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            {isAddingPet ? (
                <>
                    {pets.length === 0 && (
                        <p className="text-sm text-white/70 mb-4 text-center">
                            You do not have any pets yet. Add a pet first.
                        </p>
                    )}
                    <AddPetForm
                        userId={user?.id}
                        title="Add Pet"
                        submitLabel="Save Pet"
                        onSuccess={handlePetAdded}
                        onClose={() => setIsAddingPet(false)}
                    />
                </>
            ) : (
                <>
                    <div className="flex items-center justify-between gap-3 mb-6">
                        <h2 className="text-2xl font-bold">
                            Choose Pet for Adoption
                        </h2>
                        <button
                            type="button"
                            onClick={() => setIsAddingPet(true)}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition"
                        >
                            Add Pet
                        </button>
                    </div>

                    {isFetchingPets ? (
                        <p className="text-white/70 mb-6">Loading pets...</p>
                    ) : pets.length === 0 ? (
                        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                            <p className="text-white/75 mb-3">
                                You do not have any pets yet. Add a pet first.
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsAddingPet(true)}
                                className="px-5 py-2 rounded-xl bg-[#0A39E0] hover:bg-[#0f3dff] font-semibold transition"
                            >
                                Add Pet
                            </button>
                        </div>
                    ) : (
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
                                        ${
                                            pet.isOnAdoptionPost
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }
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
                                            {pet.species} - {formatAge(Number(pet.age))}
                                        </p>
                                    </div>

                                    {selectedPet?.id === pet.id && (
                                        <span className="absolute top-2 right-2 bg-[#0A39E0] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                                            <Check size={14} strokeWidth={3} />
                                        </span>
                                    )}

                                    {pet.isOnAdoptionPost && (
                                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                                            Already on Adoption
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {pets.length > 0 && availablePets.length === 0 && (
                        <p className="text-yellow-300 text-sm mb-4">
                            All your pets already have adoption posts.
                        </p>
                    )}

                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City where the pet is located"
                        className="w-full rounded-xl p-3 mb-4 bg-white/10 text-white placeholder-white/50 outline-none"
                        required
                    />

                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Why are you offering this pet for adoption?"
                        className="w-full min-h-[100px] rounded-xl p-4 bg-white/10 text-white placeholder-white/50 outline-none resize-none mb-3"
                    />

                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={
                            !selectedPet ||
                            !isCityValid ||
                            !isNoteValid ||
                            createAdoptionPost.isPending
                        }
                        className={`w-full py-3 rounded-xl font-semibold transition
                            ${
                                selectedPet && isCityValid && isNoteValid
                                    ? "bg-[#FF3B59] hover:bg-[#ff4f6a]"
                                    : "bg-white/20 cursor-not-allowed"
                            }
                        `}
                    >
                        {createAdoptionPost.isPending
                            ? "Publishing..."
                            : "Publish Adoption"}
                    </button>
                </>
            )}
        </Dialog>
    );
}
