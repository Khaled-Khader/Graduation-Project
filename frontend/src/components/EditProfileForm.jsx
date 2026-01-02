import { useState } from "react";
import { useAuth } from "../Auth/AuthHook";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchProfile } from "../util/http";
import { uploadImageToCloudinary } from "../util/cloudinary";

export default function EditProfileForm({ onClose, profile }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        firstName: profile.userInfoDTO?.firstName || "",
        lastName: profile.userInfoDTO?.lastName || "",
        bio: profile.userInfoDTO?.bio || "",
        photoUrl: profile.photoUrl || "",
        specialty: profile.vetDTO?.specialty || "",
        latitude: profile.clinicDTO?.latitude || "",
        longitude: profile.clinicDTO?.longitude || "",
        city: profile.clinicDTO?.city || "",
        address: profile.clinicDTO?.address || "",
    });

    const mutation = useMutation({
        mutationFn: patchProfile,
        onSuccess: () => {
            queryClient.invalidateQueries(["profile", user.id]);
            onClose();
        },
    });

    async function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const imageUrl = await uploadImageToCloudinary(file);
            setForm((prev) => ({ ...prev, photoUrl: imageUrl }));
        } catch {
            alert("Image upload failed");
        } finally {
            setUploading(false);
        }
    }

    function handleRemoveImage() {
        setForm((prev) => ({ ...prev, photoUrl: "" }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        mutation.mutate(form);
    }

    return (
        /* 🔹 SCROLLABLE + SCREEN SAFE */
        <div className="max-h-[85vh] overflow-y-auto px-1">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Edit Profile ✏️
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* FIRST / LAST NAME */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={(e) =>
                            setForm({ ...form, firstName: e.target.value })
                        }
                        className="rounded-xl bg-white/10 px-4 py-2 text-white"
                        required
                    />

                    <input
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={(e) =>
                            setForm({ ...form, lastName: e.target.value })
                        }
                        className="rounded-xl bg-white/10 px-4 py-2 text-white"
                        required
                    />
                </div>

                {/* BIO */}
                <textarea
                    placeholder="Bio"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full rounded-xl bg-white/10 px-4 py-2 text-white"
                    rows={3}
                />

                {/* IMAGE INPUT + REMOVE */}
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1 rounded-xl bg-white/10 px-4 py-2"
                    />

                    {form.photoUrl && (
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-4 py-2 rounded-xl bg-red-600/80 text-white hover:bg-red-600 transition whitespace-nowrap"
                        >
                            Remove
                        </button>
                    )}
                </div>

                {uploading && (
                    <p className="text-sm text-blue-300">
                        Uploading image...
                    </p>
                )}

                {form.photoUrl && (
                    <img
                        src={form.photoUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-xl"
                    />
                )}

                {/* VET */}
                {profile.role === "VET" && (
                    <input
                        placeholder="Specialty"
                        value={form.specialty}
                        onChange={(e) =>
                            setForm({ ...form, specialty: e.target.value })
                        }
                        className="w-full rounded-xl bg-white/10 px-4 py-2 text-white"
                    />
                )}

                {/* CLINIC */}
                {profile.role === "CLINIC" && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Latitude"
                                value={form.latitude}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        latitude: e.target.value,
                                    })
                                }
                                className="rounded-xl bg-white/10 px-4 py-2 text-white"
                            />

                            <input
                                type="number"
                                placeholder="Longitude"
                                value={form.longitude}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        longitude: e.target.value,
                                    })
                                }
                                className="rounded-xl bg-white/10 px-4 py-2 text-white"
                            />
                        </div>

                        <input
                            placeholder="City"
                            value={form.city}
                            onChange={(e) =>
                                setForm({ ...form, city: e.target.value })
                            }
                            className="w-full rounded-xl bg-white/10 px-4 py-2 text-white"
                        />

                        <input
                            placeholder="Address"
                            value={form.address}
                            onChange={(e) =>
                                setForm({ ...form, address: e.target.value })
                            }
                            className="w-full rounded-xl bg-white/10 px-4 py-2 text-white"
                        />
                    </>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={mutation.isPending || uploading}
                        className="
                                flex-1 bg-gradient-to-r from-[#4F7CFF] to-[#355CFF]
                                py-3 rounded-xl font-semibold text-white
                                hover:from-[#6A8CFF] hover:to-[#4A6BFF]
                                hover: transition-all duration-200
                                "
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}
