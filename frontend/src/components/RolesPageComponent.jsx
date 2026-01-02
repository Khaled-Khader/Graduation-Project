//router imports
import { Link } from "react-router-dom";

// array contains the all roles on the system
        const ROLES=[
            {
                id:1,
                label: "Animal Owner",
                img: "https://res.cloudinary.com/di1xpud7d/image/upload/v1767196037/6_aekvel.png",
            },
            {
                id:2,
                label: "Veterinarian (Vet)",
                img: "https://res.cloudinary.com/di1xpud7d/image/upload/v1767196045/7_a1o66k.png",
            },
            {
                id:3,
                label: "Veterinary Clinic (Clinic)",
                img: "https://res.cloudinary.com/di1xpud7d/image/upload/v1767196056/8_svecyt.png",
            }
        ]

    export default function RolesPageComponent(){

        

        return (
        <div className="min-h-screen w-full bg-[#050B24] flex flex-col items-center justify-start py-16 px-4">

        {/* Title */}
        <h1
            className="
            text-4xl
            sm:text-5xl 
            md:text-6xl 
            lg:text-7xl 
            font-extrabold 
            text-white 
            mb-16 
            text-center
            drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]
            "
        >
            Select Your Role !
        </h1>

        {/* ROLE GRID */}
        <div
            className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            gap-16 
            lg:gap-24
            mt-4
            "
        >

            {/* CARD TEMPLATE */}
            {ROLES.map((role,index) => (
                <Link to={`/sign-up/${role.id}`} key={index}>
                    <div
                        key={role.label}
                        className="flex flex-col items-center cursor-pointer group"
                    >
                        {/* IMAGE CARD */}
                        <div
                        className="
                            w-[230px]
                            h-[230px]
                            sm:w-[260px]
                            sm:h-[260px]
                            md:w-[300px]
                            md:h-[300px]
                            rounded-2xl 
                            overflow-hidden 
                            bg-[#0A1B70]
                            shadow-[0_0_80px_#0A1B70]
                            transition 
                            duration-300 
                            group-hover:scale-105
                            group-hover:shadow-[0_0_120px_#1335ff]
                        "
                        >
                        <img
                            src={role.img}
                            alt={role.label}
                            className="w-full h-full object-cover"
                        />
                        </div>

                        {/* LABEL */}
                        <p
                        className="
                            text-center 
                            text-lg
                            sm:text-xl 
                            md:text-2xl 
                            text-white 
                            font-semibold 
                            underline 
                            decoration-[#2D4DFF]
                            mt-6
                        "
                        >
                        {role.label}
                        </p>
                    </div>
                </Link>
                    ))}
                </div>
            </div>
    );
    }