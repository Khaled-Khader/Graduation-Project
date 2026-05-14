export default function ClinicSignupPageComponent({
    city, setCity,
    address, setAddress
}) {
    return (
        <div className="bg-[#D6DAE3]/80 rounded-2xl p-6 shadow-[0_0_50px_#0A1B70]">
        <h2 className="text-2xl font-bold text-[#0A1B70] mb-4">Clinic Information</h2>

        <div className="flex flex-col gap-5">

            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">City</label>
            <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-style"
                placeholder="Enter city"
            />
            </div>

            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">Address</label>
            <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-style"
                placeholder="Enter address"
            />
            </div>

        </div>
        </div>
    );
}
