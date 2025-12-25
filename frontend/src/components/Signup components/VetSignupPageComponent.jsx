

    export default function VetSignupPageComponent({ specialty, setSpecialty }) {
    return (
        <div className="bg-[#D6DAE3]/80 rounded-2xl p-6 shadow-[0_0_50px_#0A1B70]">
        <h2 className="text-2xl font-bold text-[#0A1B70] mb-4">Vet Information</h2>

        <div className="flex flex-col gap-5">
            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">Specialty</label>
            <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="input-style"
                placeholder="Enter your specialty"
            />
            </div>
        </div>
        </div>
    );
}
