    export default function ClinicSignupPageComponent() {
    return (
        <div className="bg-[#D6DAE3]/80 rounded-2xl p-6 shadow-[0_0_50px_#0A1B70] w-full">
        <h2 className="text-2xl font-bold text-[#0A1B70] mb-4">
            Clinic Information
        </h2>

        <div className="flex flex-col gap-5">

            {/* Latitude */}
            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">
                Latitude
            </label>
            <input
                type="number"
                name="latitude"
                className="input-style"
                placeholder="Enter latitude"
            />
            </div>

            {/* Longitude */}
            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">
                Longitude
            </label>
            <input
                type="number"
                name="longitude"
                className="input-style"
                placeholder="Enter longitude"
            />
            </div>

            {/* City */}
            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">
                City
            </label>
            <input
                type="text"
                name="city"
                className="input-style"
                placeholder="Enter city"
            />
            </div>

            {/* Address */}
            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">
                Address
            </label>
            <input
                type="text"
                name="address"
                className="input-style"
                placeholder="Enter full clinic address"
            />
            </div>

        </div>
        </div>
    );
    }
