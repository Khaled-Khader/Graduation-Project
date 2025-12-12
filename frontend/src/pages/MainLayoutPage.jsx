import { Outlet } from "react-router-dom";
import MainNavigationComponent from "../components/MainNavigationComponent"

export default function MainLayoutPage(){
    return (
    <div className="min-h-screen bg-[#0A0F29] text-white font-sans">
        
        {/* TOP NAVBAR */}
        <MainNavigationComponent />

        {/* CHILD ROUTES RENDER HERE */}
        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <Outlet />
        </main>

        </div>
    );
}