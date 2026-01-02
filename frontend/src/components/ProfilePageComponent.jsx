import { useState } from "react";
import { useParams } from "react-router-dom";
import { useUserProfile } from "../hooks/UserProfileHook";
import { useAuth } from "../Auth/AuthHook";
import PetCard from "../components/PetCard";
import ServiceCard from "../components/ServiceCard";
import Dialog from "../components/posts/dialogs/Dialog";
import AddPetForm from "../components/profile/AddPetForm";
import AddServiceForm from "../components/profile/AddServiceFrom";
import { useDeletePet } from "../hooks/useDeletePet";
import { useDeleteService } from "../hooks/useDeleteService";
import EditProfileForm from "./EditProfileForm";

export default function ProfilePage() {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();

    const { data: profile, isLoading, isError, error } = useUserProfile(userId);

    const deletePet = useDeletePet();
    const deleteService = useDeleteService();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState(null); // "PET" | "SERVICE" | "EDIT_PROFILE"

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

    function handleDeletePet(id) {
        return deletePet.mutateAsync(id);
    }

    function handleDeleteService(id) {
        return deleteService.mutateAsync(id);
    }

    console.log(profile.role)
    

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-6xl bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/10">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row items-center gap-8">
                    <img
                        src={profile.photoUrl}
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

                        
                        {/* Role-specific info under bio */}
                        {profile.role === "VET" && profile.vetDTO?.specialty && (
                            <p className="mt-1 text-white/60 max-w-xl">
                                Specialty: <span className="font-semibold">{profile.vetDTO.specialty}</span>
                            </p>
                        )}

                        {profile.role === "CLINIC" && profile.clinicDTO && (
                            <p className="mt-1 text-white/60 max-w-xl">
                                {profile.clinicDTO.city}, {profile.clinicDTO.address}
                            </p>
                        )}

                        {isOwnerProfile && (
                            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
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

                                <button
                                    onClick={() => { setDialogType("EDIT_PROFILE"); setDialogOpen(true); }}
                                    className="
                                        bg-pink-500/20 text-pink-400
                                        px-6 py-2.5 rounded-full font-semibold
                                        hover:bg-pink-500/30 hover:text-pink-300
                                        transition-all duration-200
                                    "
                                >
                                    Edit Profile
                                </button>
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
                                <PetCard key={pet.id} pet={pet} onRemove={handleDeletePet} currentUserId={isOwnerProfile} />
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
                                <ServiceCard key={idx} service={service} onRemove={handleDeleteService} currentUserId={isOwnerProfile} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* DIALOG */}
            <Dialog open={dialogOpen} onClose={closeDialog}>
                {dialogType === "PET" && <AddPetForm onClose={closeDialog} userId={userId} />}
                {dialogType === "SERVICE" && <AddServiceForm onClose={closeDialog} />}
                {dialogType === "EDIT_PROFILE" && <EditProfileForm onClose={closeDialog} profile={profile} />}
            </Dialog>
        </div>
    );
}
