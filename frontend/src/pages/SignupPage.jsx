//router imports
import { useParams } from "react-router-dom"


//Components import
import OwnerSignupPageComponent from "../components/Signup components/OwnerSignupPageComponent"
import VetSignupPageComponent from "../components/Signup components/VetSignupPageComponent"
import ClinicSignupPageComponent from "../components/Signup components/clinicSignupPageComponent"
import AccountInfo from "../components/Signup components/AccountInfo"
import BasicInfo from "../components/Signup components/BasicInfo"


    //get role id from the router url
    
    export default function SignUpPage() {

        const {roleId}=useParams()

    let content
    //choose which role to sign up
    if(roleId==='1')
        content=<OwnerSignupPageComponent/>
    else if(roleId==='2')
        content=<VetSignupPageComponent/>
    else if(roleId==='3')
        content=<ClinicSignupPageComponent/>

    return (
        <div className="min-h-screen w-full bg-[#050B24] flex justify-center items-start py-14 px-4">
        <form
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
            {/* Sections */}
            <AccountInfo />
            <BasicInfo />
            {/* If rendering vet info or clinic info, add here */}
            {content}
            {/* Submit Button */}
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
        </form>
        </div>
    );
    }
        