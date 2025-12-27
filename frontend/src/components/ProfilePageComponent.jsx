    import { useState } from "react";
    import { useParams } from "react-router-dom";
    import { useUserProfile } from "../hooks/UserProfileHook";
    import { useAuth } from "../Auth/AuthHook";
    import PetCard from "../components/PetCard";
    import ServiceCard from "../components/ServiceCard";
    import Dialog from "../components/posts/dialogs/Dialog";
    import AddPetForm from "../components/profile/AddPetForm";
    import AddServiceForm from "../components/profile/AddServiceFrom";

    export default function ProfilePage() {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();

    const { data: profile, isLoading, isError, error } = useUserProfile(userId);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState(null); // "PET" | "SERVICE"

    if (isLoading)
        return <p className="text-[#EAF0FF] text-center mt-20 text-lg">Loading profile...</p>;
    if (isError)
        return <p className="text-red-400 text-center mt-20 text-lg">Error: {error.message}</p>;

    const isOwnerProfile =
        currentUser?.id === profile.userInfoDTO?.id ||
        currentUser?.id === Number(userId);

    const isVetOrClinic = profile.role === "VET" || profile.role === "CLINIC";

    function openPetDialog() {
        setDialogType("PET");
        setDialogOpen(true);
    }

    function openServiceDialog() {
        setDialogType("SERVICE");
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
        setDialogType(null);
    }

    return (
        <div className="flex justify-center">
        <div className="w-full max-w-6xl bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/10">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
            <img
                src="1.png"
                className="w-32 h-32 rounded-full border-4 border-[#4F7CFF] object-cover shadow-md"
            />

            <div className="flex-1 text-center sm:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#4F7CFF] tracking-wide">
                {profile.userInfoDTO?.firstName} {profile.userInfoDTO?.lastName}
                </h1>

                {profile.userInfoDTO?.bio && (
                <p className="mt-3 text-white/70 max-w-xl line-clamp-3">
                    {profile.userInfoDTO.bio}
                </p>
                )}

                {isOwnerProfile && (
                <div className="mt-6 flex gap-4 justify-center sm:justify-start">
                    <button
                    onClick={openPetDialog}
                    className="bg-gradient-to-r from-[#4F7CFF] to-[#355CFF] px-6 py-2.5 rounded-full font-semibold hover:scale-105 transition"
                    >
                    Add Pet
                    </button>

                    {isVetOrClinic && (
                    <button
                        onClick={openServiceDialog}
                        className="bg-white/10 border border-white/20 px-6 py-2.5 rounded-full font-semibold hover:bg-white/20"
                    >
                        Add Service
                    </button>
                    )}
                </div>
                )}
            </div>
            </div>

            {/* PETS */}
            {profile.pets?.length > 0 && (
            <section className="mt-14">
                <h2 className="text-3xl font-bold text-[#AFC2FF] mb-6">🐾 Pets</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {profile.pets.map((pet) => (
                    <PetCard key={pet.id} pet={pet} />
                ))}
                </div>
            </section>
            )}

            {/* SERVICES */}
            {isVetOrClinic && profile.services?.length > 0 && (
            <section className="mt-14">
                <h2 className="text-3xl font-bold text-[#AFC2FF] mb-6">💼 Services</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {profile.services.map((service, idx) => (
                    <ServiceCard key={idx} service={service} />
                ))}
                </div>
            </section>
            )}
        </div>

        {/* DIALOG */}
        <Dialog open={dialogOpen} onClose={closeDialog}>
            {dialogType === "PET" && <AddPetForm onClose={closeDialog} />}
            {dialogType === "SERVICE" && <AddServiceForm onClose={closeDialog} />}
        </Dialog>
        </div>
    );
    }
