//react router imports
import { createHashRouter, RouterProvider } from "react-router-dom"

//Pages import
import OpenPage from "./pages/OpenPage"
import SigninPage from "./pages/SigninPage"
import SignupPage from "./pages/SignupPage"
import RolesPage from "./pages/RolesPage"
import PostsPage from "./pages/PostsPage"
import MapPage from "./pages/MapPage"
import ChatPage from "./pages/ChatPage"
import ProfilePage from "./pages/ProfilePage"

import { QueryClient,QueryClientProvider } from "@tanstack/react-query"

import ProtectedRouter from "./Auth/ProtectedRouter"
import { AuthProvider } from "./Auth/AuthProvider"
import PublicRouter from "./Auth/PublicRouter"
import MainLayoutPage from "./pages/MainLayoutPage"
const query=new QueryClient()

export default function App(){

  

  //routers layout 
  const router=createHashRouter(
    [
      {
        path:"/",element:
        <PublicRouter>
          <OpenPage/>
        </PublicRouter>
      },
      {path:"/sign-in",element:<SigninPage/>},


      {path:"/roles",element:<RolesPage/>},
      {path:"/sign-up/:roleId",element:<SignupPage/>},


      {
        path:"/app",
        element:
        <ProtectedRouter>
          <MainLayoutPage/>
        </ProtectedRouter>
        ,
        children:[
          { index: true, element: <PostsPage /> },
          { path: "map", element: <MapPage /> },
          { path: "chat", element: <ChatPage /> },
          { path: "profile", element: <ProfilePage /> },
        ]

      },
    ]
  )
  return(
    <>
      <QueryClientProvider client={query}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider> 
      </QueryClientProvider>
    </>
  )
}