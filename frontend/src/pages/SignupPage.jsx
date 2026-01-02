import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useRegister } from "../hooks/RegisterHook";
import { useQueryClient } from "@tanstack/react-query";

import AccountInfo from "../components/Signup components/AccountInfo";
import BasicInfo from "../components/Signup components/BasicInfo";

import OwnerSignupPageComponent from "../components/Signup components/OwnerSignupPageComponent";
import VetSignupPageComponent from "../components/Signup components/VetSignupPageComponent";
import ClinicSignupPageComponent from "../components/Signup components/ClinicSignupPageComponent";

export default function SignUpPage() {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const register = useRegister();
    const queryClient = useQueryClient();

    // Account Info
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordLengthError, setPasswordLengthError] = useState("");
    const [backendEmailError, setBackendEmailError] = useState("");
    const [emailFormatError, setEmailFormatError] = useState("");

    // User Info
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [bio, setBio] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");

    // Vet Info
    const [specialty, setSpecialty] = useState("");

    // Clinic Info
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");

    // Role-based content
    let content;
    if (roleId === "1") content = null;
    else if (roleId === "2")
        content = <VetSignupPageComponent specialty={specialty} setSpecialty={setSpecialty} />;
    else if (roleId === "3")
        content = (
            <ClinicSignupPageComponent
                latitude={latitude} setLatitude={setLatitude}
                longitude={longitude} setLongitude={setLongitude}
                city={city} setCity={setCity}
                address={address} setAddress={setAddress}
            />
        );

    // Email validation regex
    function validateEmail(email) {
        const gmailRegex = /^[a-zA-Z0-9](?!.*\.\.)[a-zA-Z0-9._+]{0,63}[a-zA-Z0-9]@gmail\.com$/;
        return gmailRegex.test(email);
    }

    // Name validation regex (single word, letters only)
    const singleWordRegex = /^[A-Za-z]{2,30}$/;

    const handleSubmit = (e) => {
        e.preventDefault();

        // First name validation
        if (!singleWordRegex.test(firstName)) {
            setFirstNameError("First name must be a single word, 2-30 letters only");
            return;
        } else setFirstNameError("");

        // Last name validation
        if (!singleWordRegex.test(lastName)) {
            setLastNameError("Last name must be a single word, 2-30 letters only");
            return;
        } else setLastNameError("");

        // Password length validation
        if (password.length < 8) {
            setPasswordLengthError("Password must be at least 8 characters long");
            return;
        } else setPasswordLengthError("");

        // Password match validation
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        } else setPasswordError("");

        // Email format validation
        if (!validateEmail(email)) {
            setEmailFormatError("Invalid email format");
            return;
        } else setEmailFormatError("");

        // Construct DTO
        const dto = {
            email,
            passwordHash: password,
            role: roleId === "1" ? "OWNER" : roleId === "2" ? "VET" : roleId === "3" ? "CLINIC" : null,
            userInfoDTO: { firstName, lastName, bio },
            vetDTO: roleId === "2" ? { specialty } : null,
            clinicDTO: roleId === "3" ? { latitude, longitude, city, address } : null,
        };

        register.mutate(dto, {
            onSuccess: async () => {
                await queryClient.invalidateQueries(["user"]);
                navigate("/app");
            },
            onError: (err) => {
                if (err.message.includes("Email Already Exists")) {
                    setBackendEmailError(err.message);
                } else {
                    alert(err.message);
                }
            },
        });
    };

    return (
        <div className="min-h-screen w-full bg-[#050B24] flex justify-center items-start py-14 px-4">
            <form
                onSubmit={handleSubmit}
                className="
                    w-full 
                    max-w-3xl 
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
                <AccountInfo
                    email={email} setEmail={setEmail}
                    password={password} setPassword={setPassword}
                    confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                    passwordError={passwordError}
                    passwordLengthError={passwordLengthError}
                    backendEmailError={backendEmailError}
                    emailFormatError={emailFormatError}
                    setEmailFormatError={setEmailFormatError}
                    setBackendEmailError={setBackendEmailError}
                />
                <BasicInfo
                    firstName={firstName} setFirstName={setFirstName} firstNameError={firstNameError}
                    lastName={lastName} setLastName={setLastName} lastNameError={lastNameError}
                    bio={bio} setBio={setBio}
                />
                {content}
                <button
                    type="submit"
                    className="
                        mt-2 
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
                    "
                >
                    Create Account
                </button>
                <p className="text-center text-white">
                    have an account?
                    <Link to="/sign-in">
                        <span className="ml-2 underline text-blue-400 hover:text-blue-300">Sign in</span>
                    </Link>
                </p>
            </form>
        </div>
    );
}
