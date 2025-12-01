    export default function AccountInfo() {
    return (
        <div className="bg-[#D6DAE3]/80 rounded-2xl p-6 shadow-[0_0_50px_#0A1B70]">
        <h2 className="text-2xl font-bold text-[#0A1B70] mb-4">
            Account Information
        </h2>

        <div className="flex flex-col gap-5">

            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">Email</label>
            <input
                type="email"
                name="email"
                className="input-style"
                placeholder="Enter your email"
            />
            </div>

            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">
                Password
            </label>
            <input
                type="password"
                name="password"
                className="input-style"
                placeholder="Enter a password"
            />
            </div>

            <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#0A1B70]">
                Confirm Password
            </label>
            <input
                type="password"
                name="confirmPassword"
                className="input-style"
                placeholder="Confirm your password"
            />
            </div>

        </div>
        </div>
    );
    }
