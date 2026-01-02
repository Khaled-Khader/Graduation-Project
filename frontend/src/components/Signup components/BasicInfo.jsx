export default function BasicInfo({
    firstName,
    setFirstName,
    lastName,
    setLastName,
    bio,
    setBio,
    firstNameError,
    lastNameError
}) {
    return (
        <div className="bg-[#D6DAE3]/80 rounded-2xl p-6 shadow-[0_0_50px_#0A1B70]">
            <h2 className="text-2xl font-bold text-[#0A1B70] mb-4">
                Basic Information
            </h2>

            <div className="flex flex-col gap-5">
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-[#0A1B70]">First Name</label>
                    <input
                        required
                        maxLength={30}
                        min={2}
                        type="text"
                        value={firstName}
                        className="input-style"
                        placeholder="Enter first name"
                        onChange={(e) => setFirstName(e.target.value)}
                        onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                    />
                    {firstNameError && <span className="text-red-600 text-sm mt-1">{firstNameError}</span>}
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-[#0A1B70]">Last Name</label>
                    <input
                        required
                        maxLength={30}
                        min={2}
                        type="text"
                        value={lastName}
                        className="input-style"
                        placeholder="Enter last name"
                        onChange={(e) => setLastName(e.target.value)}
                        onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                    />
                    {lastNameError && <span className="text-red-600 text-sm mt-1">{lastNameError}</span>}
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-[#0A1B70]">Bio</label>
                    <textarea
                        name="bio"
                        maxLength={50}
                        className="input-style h-28"
                        value={bio}
                        placeholder="Write a short bio"
                        onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );
}
