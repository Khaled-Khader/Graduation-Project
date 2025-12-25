    export default function BasicInfo() {
    return (
        <div className="bg-[#D6DAE3]/80 rounded-2xl p-6 shadow-[0_0_50px_#0A1B70]">
        <h2 className="text-2xl font-bold text-[#0A1B70] mb-4">
            Basic Information
        </h2>

        <div className="flex flex-col gap-5">

            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">
                First Name
            </label>
            <input
                required
                type="text"
                name="firstName"
                className="input-style"
                placeholder="Enter first name"
            />
            </div>

            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">
                Last Name
            </label>
            <input
                required
                type="text"
                name="lastName"
                className="input-style"
                placeholder="Enter last name"
            />
            </div>

                {/*Photo URL */}
            {/*<div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">
                Photo URL
            </label>
            <input
                type="text"
                name="photoUrl"
                className="input-style"
                placeholder="Link to profile photo"
            />
            </div>*/}

            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">
                Bio
            </label>
            <textarea
                name="bio"
                className="input-style h-28"
                placeholder="Write a short bio"
            ></textarea>
            </div>

        </div>
        </div>
    );
    }
