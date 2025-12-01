

    export default function VetSignupPageComponent(){

        return (
        <div className="bg-[#D6DAE3]/80 rounded-2xl p-6 shadow-[0_0_50px_#0A1B70] w-full">
        <h2 className="text-2xl font-bold text-[#0A1B70] mb-4">
            Veterinarian Information
        </h2>

        <div className="flex flex-col gap-5">

            {/* Specialties */}
            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">
                Specialties
            </label>
            <input
                type="text"
                name="specialties"
                className="input-style"
                placeholder="Ex: Surgery, Dentistry, Dermatology..."
            />
            </div>

        </div>
        </div>
    );
    }