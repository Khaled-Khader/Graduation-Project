    import { useState } from "react";
    import { useMutation, useQueryClient } from "@tanstack/react-query";
    import { addService } from "../../util/http";

    export default function AddServiceForm({ onClose }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ name: "", description: "" });

    const { mutate, isPending } = useMutation({
        mutationFn: addService,
        onSuccess: () => {
        queryClient.invalidateQueries(["profile"]);
        onClose();
        },
    });

    function handleSubmit(e) {
        e.preventDefault();
        mutate(form);
    }

    return (
        <>
        <h2 className="text-2xl font-bold mb-6 text-center">Add Service 💼</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            <input
            placeholder="Service name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl bg-white/10 px-4 py-2"
            required
            />

            <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full min-h-[120px] rounded-xl bg-white/10 px-4 py-2 resize-none"
            required
            />

            <button
            disabled={isPending}
            className="w-full bg-gradient-to-r from-[#4F7CFF] to-[#355CFF] py-3 rounded-xl font-semibold"
            >
            Save Service
            </button>
        </form>
        </>
    );
    }
