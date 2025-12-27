    import { useState } from "react";
    import { useMutation, useQueryClient } from "@tanstack/react-query";
    import { addPet } from "../../util/http";
    import { uploadImageToCloudinary } from "../../util/cloudinary";

    export default function AddPetForm({ onClose }) {
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        name: "",
        species: "",
        age: "",
        photoUrl: "",
        healthStatus: "",
        hasVaccineCert: false,
    });

    const [uploading, setUploading] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: addPet,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
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
        } catch (err) {
        alert("Image upload failed");
        } finally {
        setUploading(false);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        mutate({
        ...form,
        age: Number(form.age),
        });
    }

    return (
        <>
        <h2 className="text-2xl font-bold mb-6 text-center">Add Pet 🐾</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl bg-white/10 px-4 py-2"
            required
            />

            <input
            placeholder="Species"
            value={form.species}
            onChange={(e) => setForm({ ...form, species: e.target.value })}
            className="w-full rounded-xl bg-white/10 px-4 py-2"
            required
            />

            <input
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            className="w-full rounded-xl bg-white/10 px-4 py-2"
            required
            />

            {/* IMAGE INPUT */}
            <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded-xl bg-white/10 px-4 py-2"
            required
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
            onChange={(e) =>
                setForm({ ...form, healthStatus: e.target.value })
            }
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
            disabled={isPending || uploading}
            className="w-full bg-gradient-to-r from-[#4F7CFF] to-[#355CFF] py-3 rounded-xl font-semibold"
            >
            Save Pet
            </button>
        </form>
        </>
    );
    }
