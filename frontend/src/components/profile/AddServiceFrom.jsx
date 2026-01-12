    import { useState, useMemo } from "react";
    import { useMutation, useQueryClient } from "@tanstack/react-query";
    import { addService } from "../../util/http";

    export default function AddServiceForm({ onClose }) {
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        name: "",
        description: "",
    });

    const { mutate, isPending } = useMutation({
        mutationFn: addService,
        onSuccess: () => {
        queryClient.invalidateQueries(["profile"]);
        onClose();
        },
    });

    // =========================
    // HELPERS
    // =========================
    function isOnlySpaces(value) {
        return value.trim().length === 0;
    }

    function handleTextChange(field, value) {
        setForm((prev) => ({
        ...prev,
        [field]: value,
        }));
    }

    // =========================
    // FORM VALIDATION
    // =========================
    const isFormValid = useMemo(() => {
        return (
        !isOnlySpaces(form.name) &&
        !isOnlySpaces(form.description)
        );
    }, [form]);

    // =========================
    // SUBMIT
    // =========================
    function handleSubmit(e) {
        e.preventDefault();
        if (!isFormValid) return;

        mutate({
        name: form.name.trim(),
        description: form.description.trim(),
        });
    }

    return (
        <>
        <h2 className="text-2xl font-bold mb-6 text-center">
            Add Service 💼
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* SERVICE NAME */}
            <input
            placeholder="Service name"
            value={form.name}
            onChange={(e) => handleTextChange("name", e.target.value)}
            className="w-full rounded-xl bg-white/10 px-4 py-2"
            />

            {/* DESCRIPTION */}
            <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
                handleTextChange("description", e.target.value)
            }
            className="w-full min-h-[120px] rounded-xl bg-white/10 px-4 py-2 resize-none"
            />

            {/* SUBMIT */}
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
            Save Service
            </button>
        </form>
        </>
    );
    }
