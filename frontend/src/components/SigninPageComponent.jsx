    import { Link, useNavigate } from "react-router-dom";
    import { useState } from "react";
    import { useLogin } from "../hooks/LoginHook";

    export default function SigninPageComponent() {
    const login = useLogin();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState(""); // for invalid credentials
    const [passwordError, setPasswordError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        // reset errors
        setEmailError("");
        setPasswordError("");

        login.mutate(
        { email, password },
        {
            onSuccess: () => {
            navigate("/app");
            },
            onError: (err) => {
            // show inline error under fields
            if (err.message.includes("Invalid email")) {
                setEmailError("Invalid email or account does not exist");
            } else if (err.message.includes("Invalid password")) {
                setPasswordError("Incorrect password");
            } else {
                // fallback generic error
                setEmailError("Invalid credentials");
            }
            },
        }
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#050B24] flex justify-center items-center py-14 px-4">
        <form
            onSubmit={handleSubmit}
            className="
            w-full 
            max-w-xl 
            flex 
            flex-col 
            gap-10 
            bg-white/10 
            backdrop-blur-xl 
            rounded-3xl 
            p-10 
            shadow-[0_0_80px_#0A1B70] 
            border border-white/10
            "
        >
            {/* Header */}
            <h2 className="text-center text-3xl md:text-4xl font-extrabold text-white drop-shadow-md">
            Sign In
            </h2>

            {/* Account Info Section */}
            <div className="bg-[#D6DAE3]/80 rounded-2xl p-6 shadow-[0_0_50px_#0A1B70]">
            <h3 className="text-2xl font-bold text-[#0A1B70] mb-4">
                Account Information
            </h3>

            <div className="flex flex-col gap-5">
                {/* Email */}
                <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#0A1B70]">Email</label>
                <input
                    type="email"
                    name="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-style"
                    placeholder="Enter your email"
                />
                {emailError && (
                    <span className="text-red-600 text-sm mt-1">{emailError}</span>
                )}
                </div>

                {/* Password */}
                <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#0A1B70]">Password</label>
                <input
                    type="password"
                    name="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-style"
                    placeholder="Enter your password"
                />
                {passwordError && (
                    <span className="text-red-600 text-sm mt-1">{passwordError}</span>
                )}
                </div>
            </div>
            </div>

            {/* Submit Button */}
            <button
            type="submit"
            disabled={login.isPending}
            className="
                bg-[#0A39E0] 
                text-white 
                py-4 
                rounded-full 
                font-bold 
                text-xl 
                shadow-[0_10px_30px_rgba(0,0,0,0.4)] 
                hover:bg-[#1346ff] 
                transition 
                underline 
                decoration-[#2D4DFF]
                disabled:opacity-50
            "
            >
            {login.isPending ? "Signing in..." : "Sign In"}
            </button>

            {/* Footer */}
            <p className="text-center text-white">
            Don&apos;t have an account?
            <Link to="/roles">
                <span className="ml-2 underline text-blue-400 hover:text-blue-300">Sign up</span>
            </Link>
            </p>
        </form>
        </div>
    );
    }
