export default function AccountInfo({
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    backendEmailError,
    setBackendEmailError,
    emailFormatError, // new
    setEmailFormatError, // new
}) {
    return (
        <div className="bg-[#D6DAE3]/80 rounded-2xl p-6 shadow-[0_0_50px_#0A1B70]">
            <h2 className="text-2xl font-bold text-[#0A1B70] mb-4">
                Account Information
            </h2>

            <div className="flex flex-col gap-5">
                {/* Email */}
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-[#0A1B70]">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setBackendEmailError(""); 
                            setEmailFormatError(""); 
                        }}
                        className="input-style"
                        placeholder="Enter your email"
                    />
                    {backendEmailError ? (
                        <span className="text-red-600 text-sm mt-1">{backendEmailError}</span>
                    ) : (
                        emailFormatError && (
                            <span className="text-red-600 text-sm mt-1">{emailFormatError}</span>
                        )
                    )}
                </div>

                {/* Password */}
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-[#0A1B70]">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-style"
                        placeholder="Enter a password"
                    />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-[#0A1B70]">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-style"
                        placeholder="Confirm your password"
                    />
                    {passwordError && (
                        <span className="text-red-600 text-sm mt-1">{passwordError}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
