import { useParams,Navigate } from "react-router-dom";

export default function ProtectedRoleRouter({children}){

    const {roleId}=useParams()

    if(roleId==="1" || roleId==="2" || roleId==="3"){
        return children
    }

    return <Navigate to="/roles" replace />;
}