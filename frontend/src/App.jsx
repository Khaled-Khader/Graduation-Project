//react router imports
import { createHashRouter, RouterProvider } from "react-router-dom"

//Pages import
import OpenPage from "./pages/OpenPage"
import SigninPage from "./pages/SigninPage"
import SignupPage from "./pages/SignupPage"
import RolesPage from "./pages/RolesPage"


export default function App(){

  //routers layout 
  const router=createHashRouter(
    [
      {path:"/",element:<OpenPage/>},
      {path:"/sign-in",element:<SigninPage/>},
      {path:"/roles",element:<RolesPage/>},
      {path:"/sign-up/:roleId",element:<SignupPage/>}
    ]
  )
  return(
    <>
      <RouterProvider router={router} />
    </>
  )
}