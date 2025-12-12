    import { Link, useNavigate } from "react-router-dom";
    import { useState } from "react";
    import { useLogin } from "../hooks/LoginHook";

    export default function SigninPageComponent() {
    const login = useLogin();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        login.mutate(
        { email, password },
        {
            onSuccess: () => {
            navigate("/app");
            },
            onError: () => {
            alert("Invalid email or password");
            },
        }
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#050B24] flex items-center justify-center px-4 py-10">
        <div
            className="
                w-full 
                max-w-lg 
                bg-[#D6DAE3]/80 
                rounded-3xl 
                py-12 
                px-6 sm:px-10 
                shadow-[0_0_60px_#0A1B70]
                "
        >
            <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#0A1B70] mb-10 drop-shadow-md">
            Sign In
            </h2>

            <form onSubmit={handleSubmit}>
            <div className="flex flex-col mb-8">
                <label className="text-[#0A1B70] text-lg font-semibold mb-2">
                email
                </label>
                <input
                type="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                        w-full 
                        rounded-full 
                        py-4 
                        px-6 
                        bg-[#ECEEF3] 
                        text-[#0A1B70] 
                        outline-none 
                        shadow-[inset_0_0_15px_#b3b6c5,0_10px_25px_rgba(0,0,0,0.25)]
                    "
                placeholder="Enter your email"
                />
            </div>

            <div className="flex flex-col mb-10">
                <label className="text-[#0A1B70] text-lg font-semibold mb-2">
                password
                </label>
                <input
                type="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                        w-full 
                        rounded-full 
                        py-4 
                        px-6 
                        bg-[#ECEEF3] 
                        text-[#0A1B70] 
                        outline-none 
                        shadow-[inset_0_0_15px_#b3b6c5,0_10px_25px_rgba(0,0,0,0.25)]
                    "
                placeholder="Enter your password"
                />
            </div>

            <div className="flex justify-center">
                <button
                type="submit"
                disabled={login.isPending}
                className="
                        bg-[#0A39E0] 
                        text-white 
                        text-xl 
                        font-bold 
                        py-3 
                        px-10 
                        rounded-full 
                        shadow-[0_10px_25px_rgba(0,0,0,0.35)] 
                        hover:bg-[#0f3dff] 
                        transition 
                        underline
                        disabled:opacity-50
                    "
                >
                {login.isPending ? "Signing in..." : "Sign In"}
                </button>
            </div>
            </form>

            <p className="mt-4 text-center">
            Don't have an account?
            <Link to="/roles">
                <span className="underline text-blue-500"> sign_up</span>
            </Link>
            </p>
        </div>
        </div>
    );
    }
