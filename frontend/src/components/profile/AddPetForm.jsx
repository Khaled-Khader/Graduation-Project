import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPet } from "../../util/http";
import { uploadImageToCloudinary } from "../../util/cloudinary";

export default function AddPetForm({
    onClose,
    onSuccess,
    submitLabel = "Save Pet",
    title = "Add Pet",
}) {
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        name: "",
        species: "",
        gender: "",
        age: "",
        photoUrl: "",
        healthStatus: "",
        hasVaccineCert: false,
    });

    const [uploading, setUploading] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: addPet,
        onSuccess: async (data, variables, context) => {
            queryClient.invalidateQueries({
                queryKey: ["userProfile"],
            });
            queryClient.invalidateQueries({
                queryKey: ["pets"],
            });
            await onSuccess?.(data, variables, context);
            onClose?.();
        },
    });

    function isOnlySpaces(value) {
        return value.trim().length === 0;
    }

    function handleTextChange(field, value) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    const isFormValid = useMemo(() => {
        return (
            !isOnlySpaces(form.name) &&
            !isOnlySpaces(form.species) &&
            !isOnlySpaces(form.healthStatus) &&
            form.gender &&
            form.age !== "" &&
            form.photoUrl &&
            !uploading
        );
    }, [form, uploading]);

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

    function handleSubmit(e) {
        e.preventDefault();
        if (!isFormValid) return;

        mutate({
            ...form,
            name: form.name.trim(),
            species: form.species.trim(),
            healthStatus: form.healthStatus.trim(),
            age: Number(form.age),
        });
    }

    return (
        <>
            <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => handleTextChange("name", e.target.value)}
                    className="w-full rounded-xl bg-white/10 px-4 py-2"
                />

                <input
                    placeholder="Species"
                    value={form.species}
                    onChange={(e) => handleTextChange("species", e.target.value)}
                    className="w-full rounded-xl bg-white/10 px-4 py-2"
                />

                <select
                    value={form.gender}
                    onChange={(e) => handleTextChange("gender", e.target.value)}
                    className="
                        w-full rounded-xl bg-white/10 px-4 py-2 text-white
                        outline-none border border-transparent
                        focus:border-[#6B8CFF]
                        focus:shadow-[0_0_12px_#6B8CFF55]
                        transition
                    "
                >
                    <option value="" disabled className="bg-[#0F1538] text-white/60">
                        Select Gender
                    </option>
                    <option value="MALE" className="bg-[#0F1538]">
                        Male
                    </option>
                    <option value="FEMALE" className="bg-[#0F1538]">
                        Female
                    </option>
                </select>

                <input
                    type="number"
                    placeholder="Age in Months"
                    value={form.age}
                    onChange={(e) => handleTextChange("age", e.target.value)}
                    className="w-full rounded-xl bg-white/10 px-4 py-2"
                    min={0}
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-xl bg-white/10 px-4 py-2"
                />

                {uploading && (
                    <p className="text-sm text-blue-300">Uploading image...</p>
                )}

                {form.photoUrl && (
                    <img
                        src={form.photoUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-xl"
                    />
                )}

                <input
                    placeholder="Health Status"
                    value={form.healthStatus}
                    onChange={(e) => handleTextChange("healthStatus", e.target.value)}
                    className="w-full rounded-xl bg-white/10 px-4 py-2"
                />

                <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                        type="checkbox"
                        checked={form.hasVaccineCert}
                        onChange={(e) =>
                            setForm({ ...form, hasVaccineCert: e.target.checked })
                        }
                    />
                    Has Vaccine Certificate
                </label>

                <button
                    disabled={!isFormValid || isPending}
                    className={`w-full py-3 rounded-xl font-semibold transition
                        ${
                            !isFormValid || isPending
                                ? "bg-gray-500 cursor-not-allowed opacity-60"
                                : "bg-gradient-to-r from-[#4F7CFF] to-[#355CFF]"
                        }
                    `}
                >
                    {isPending ? "Saving..." : submitLabel}
                </button>
            </form>
        </>
    );
}
