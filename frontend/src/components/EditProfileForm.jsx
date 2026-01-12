import { useState, useMemo } from "react";
import { useAuth } from "../Auth/AuthHook";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchProfile } from "../util/http";
import { uploadImageToCloudinary } from "../util/cloudinary";

export default function EditProfileForm({ onClose, profile }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);

    // 🔹 only ONE word – letters only – 2 to 30 chars
    const singleWordRegex = /^[A-Za-z]{2,30}$/;

    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");

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

    // =============================
    // NAME HANDLER (NO SPACES)
    // =============================
    function handleNameChange(field, value) {
        if (value.includes(" ")) return;

        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (!singleWordRegex.test(value)) {
            field === "firstName"
                ? setFirstNameError("Only one word (2–30 letters)")
                : setLastNameError("Only one word (2–30 letters)");
        } else {
            field === "firstName"
                ? setFirstNameError("")
                : setLastNameError("");
        }
    }

    // =============================
    // IMAGE
    // =============================
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
        let defaultImage = "";

        if (user.role === "OWNER") {
            defaultImage =
                "https://res.cloudinary.com/di1xpud7d/image/upload/v1767881569/owner_qazol0.jpg";
        } else if (user.role === "VET") {
            defaultImage =
                "https://res.cloudinary.com/di1xpud7d/image/upload/v1767881562/vet_k8pgey.jpg";
        } else if (user.role === "CLINIC") {
            defaultImage =
                "https://res.cloudinary.com/di1xpud7d/image/upload/v1767881554/clinic_d2jav0.jpg";
        }

        setForm((prev) => ({ ...prev, photoUrl: defaultImage }));
    }

    // =============================
    // FORM VALIDATION
    // =============================
    const isFormValid = useMemo(() => {
        return (
            singleWordRegex.test(form.firstName) &&
            singleWordRegex.test(form.lastName)
        );
    }, [form.firstName, form.lastName]);

    // =============================
    // SUBMIT
    // =============================
    function handleSubmit(e) {
        e.preventDefault();
        if (!isFormValid) return;

        mutation.mutate({
            ...form,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
        });
    }

    return (
        <div className="max-h-[85vh] overflow-y-auto px-1">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Edit Profile ✏️
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* FIRST / LAST NAME */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <input
                            placeholder="First Name"
                            value={form.firstName}
                            onChange={(e) =>
                                handleNameChange("firstName", e.target.value)
                            }
                            className="rounded-xl bg-white/10 px-4 py-2 text-white w-full"
                        />
                        {firstNameError && (
                            <p className="text-red-400 text-sm mt-1">
                                {firstNameError}
                            </p>
                        )}
                    </div>

                    <div>
                        <input
                            placeholder="Last Name"
                            value={form.lastName}
                            onChange={(e) =>
                                handleNameChange("lastName", e.target.value)
                            }
                            className="rounded-xl bg-white/10 px-4 py-2 text-white w-full"
                        />
                        {lastNameError && (
                            <p className="text-red-400 text-sm mt-1">
                                {lastNameError}
                            </p>
                        )}
                    </div>
                </div>

                {/* BIO */}
                <textarea
                    placeholder="Bio"
                    value={form.bio}
                    onChange={(e) =>
                        setForm({ ...form, bio: e.target.value })
                    }
                    className="w-full rounded-xl bg-white/10 px-4 py-2 text-white"
                    rows={3}
                    maxLength={50}
                />

                {/* IMAGE INPUT + REMOVE (RESTORED) */}
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

                {/* ACTIONS */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-700 text-white"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={!isFormValid || mutation.isPending || uploading}
                        className={`flex-1 py-3 rounded-xl font-semibold text-white transition
                            ${
                                !isFormValid || mutation.isPending || uploading
                                    ? "bg-gray-500 cursor-not-allowed opacity-60"
                                    : "bg-gradient-to-r from-[#4F7CFF] to-[#355CFF]"
                            }
                        `}
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}
