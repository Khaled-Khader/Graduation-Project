//router imports
import { useParams } from "react-router-dom"


//Components import
import OwnerSignupPageComponent from "../components/Signup components/OwnerSignupPageComponent"
import VetSignupPageComponent from "../components/Signup components/VetSignupPageComponent"
import ClinicSignupPageComponent from "../components/Signup components/clinicSignupPageComponent"

export default function SignupPage(){
    //get role id from the router url
    const {roleId}=useParams()

    let content
    //choose which role to sign up
    if(roleId==='1')
        content=<OwnerSignupPageComponent/>
    else if(roleId==='2')
        content=<VetSignupPageComponent/>
    else if(roleId==='3')
        content=<ClinicSignupPageComponent/>

    
    return(
        <>
            {content}
        </>
    )
}