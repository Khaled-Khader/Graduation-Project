    import { useState } from "react";
    import Dialog from "./Dialog";
    import { FetchPets } from "../../../util/http";
    import { useQuery } from "@tanstack/react-query";
    import {useAuth} from "../../../Auth/AuthHook"
    
    export default function CreateAdoptionDialog({ open, onClose }) {
    const [selectedPet, setSelectedPet] = useState(null);
    const [note, setNote] = useState("");
    const {user}=useAuth()

    console.log(user.id)
    const { data = [] } = useQuery({
    queryKey: ["pets", user?.id],
    queryFn: ()=>FetchPets(user.id),
    enabled: open,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,   
});


    function handleSubmit(e) {
        e.preventDefault();

        if (!selectedPet) return;

        console.log({
        petId: selectedPet.id,
        note,
        });

        onClose();
        setSelectedPet(null);
        setNote("");
    }

    return (
        <Dialog open={open} onClose={onClose}>
        <h2 className="text-2xl font-bold mb-6 text-center">
            Choose Pet for Adoption 🐾
        </h2>

        {/* PET SELECTOR */}
        <div
            className="
            grid grid-cols-2 sm:grid-cols-3
            gap-4 mb-6
            max-h-[300px] overflow-y-auto
            pr-1
            "
        >
            {data.map((pet) => (
            <button
                key={pet.id}
                type="button"
                onClick={() => setSelectedPet(pet)}
                className={`
                relative rounded-xl overflow-hidden
                border transition
                ${
                    selectedPet?.id === pet.id
                    ? "border-[#0A39E0] shadow-[0_0_20px_#0A39E0]"
                    : "border-white/10 hover:border-white/30"
                }
                `}
            >
                {/* IMAGE */}
                <img
                src={"/"+pet.photoUrl}
                alt={pet.name}
                className="w-full aspect-square object-cover"
                />

                {/* INFO OVERLAY */}
                <div
                className="
                    absolute bottom-0 left-0 right-0
                    bg-black/60 backdrop-blur
                    px-2 py-1 text-left
                "
                >
                <p className="text-sm font-semibold">{pet.name}</p>
                <p className="text-xs text-white/70">
                    {pet.type} • {pet.age}
                </p>
                </div>

                {/* CHECK ICON */}
                {selectedPet?.id === pet.id && (
                <span
                    className="
                    absolute top-2 right-2
                    bg-[#0A39E0] text-white
                    w-6 h-6 rounded-full
                    flex items-center justify-center
                    text-sm
                    "
                >
                    ✓
                </span>
                )}
            </button>
            ))}
        </div>

        {/* NOTE */}
        <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why are you offering this pet for adoption?"
            className="
            w-full min-h-[100px]
            rounded-xl p-4
            bg-white/10
            text-white
            placeholder-white/50
            outline-none resize-none
            mb-5
            "
            required
        />

        {/* SUBMIT */}
        <button
            onClick={handleSubmit}
            disabled={!selectedPet}
            className={`
            w-full py-3 rounded-xl font-semibold transition
            ${
                selectedPet
                ? "bg-[#FF3B59] hover:bg-[#ff4f6a]"
                : "bg-white/20 cursor-not-allowed"
            }
            `}
        >
            Publish Adoption
        </button>
        </Dialog>
    );
    }
