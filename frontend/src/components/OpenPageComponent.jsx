//import router
import { Link } from "react-router-dom";

export default function OpenPageComponent(){
    return (
        <div className="bg-[#0A0F29] text-white w-full min-h-screen overflow-x-hidden font-sans">

        {/* MAIN CENTERED CONTAINER */}
        <div className="max-w-[1600px] mx-auto">

            {/* NAVBAR */}
            <nav className="w-full flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-6 md:py-10 border-b border-white/20 gap-6 md:gap-0">
            
            {/* Left Logo + Title */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5">

                    {/* LOGO */}
                <img
                    src="/logo.png"
                    alt="logo"
                    className="
                    w-10 h-10          /* small screens */
                    sm:w-14 sm:h-14    /* small tablets */
                    md:w-20 md:h-20    /* laptops and up */
                    object-contain
                    "
                />

                {/* TEXT */}
                <h1
                    className="
                    font-extrabold 
                    tracking-wide 
                    drop-shadow-lg
                    text-2xl         /* mobile */
                    sm:text-3xl      /* small tablets */
                    md:text-5xl      /* laptops/desktops */
                    "
                    style={{
                    fontFamily: "'Orbitron', sans-serif",
                    color: "#fff",
                    }}
                >
                    PetNexus
                </h1>

            </div>

            {/* Right Menu */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-14 text-xl md:text-2xl font-semibold tracking-wide">
                <p onClick={() =>
                    document.getElementById("about").scrollIntoView({ behavior: "smooth" })
                        } className="hover:text-blue-300 cursor-pointer">
                            About us
                </p>
                <p 
                    onClick={() =>
                    document.getElementById("services").scrollIntoView({ behavior: "smooth" })
                        }
                        className="hover:text-blue-300 cursor-pointer">
                            Our services
                </p>
                <Link to="/sign-in" className="hover:text-blue-300">SignIn</Link>
            </div>
            </nav>

            {/* HERO SECTION */}
            <section className="w-full flex flex-col lg:flex-row justify-between items-center px-6 md:px-16 pt-20 md:pt-32 pb-28 md:pb-48">

            {/* Left Text */}
            <div className="max-w-3xl space-y-8 md:space-y-12 text-center lg:text-left">
                <p className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight drop-shadow-xl">
                The digital universe for vets, pets, <br className="hidden md:block" />
                and everything in between.
                </p>

                <Link to="/roles">
                    <button className="mt-4 cursor-pointer md:mt-8 inline-block px-10 md:px-12 py-3 md:py-4 rounded-full bg-white text-[#0A0F29] text-xl md:text-2xl font-bold hover:bg-gray-200 transition shadow-xl">
                    Get start
                    </button>
                </Link>
                
            </div>

            {/* Right Image */}
            <div className="mt-16 lg:mt-0">
                <img
                src="/1.png"
                alt="app"
                className="
                    w-[280px] 
                    sm:w-[350px] 
                    md:w-[500px] 
                    lg:w-[600px] 
                    xl:w-[750px]
                    rounded-3xl 
                    object-cover 
                    shadow-[0_0_100px_#304ffe90]
                "
                />
            </div>
            </section>

            {/* GRADIENT ABOUT SECTION */}
            <section id="about" className="w-full text-center py-20 sm:py-32 md:py-44 px-6 md:px-10 bg-gradient-to-b from-[#0A0F29] via-[#3A00C9] to-[#E9007F]">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight max-w-5xl mx-auto drop-shadow-xl">
                <span className="text-[#FF3B59]">PetNexus</span> is a startup
                looking to change the way veterinarians and pet owners
                connect in the digital world.
            </h2>

            <p className="mt-6 sm:mt-10 md:mt-12 max-w-4xl mx-auto text-gray-200 text-lg sm:text-xl md:text-2xl leading-relaxed drop-shadow-lg">
                In VetiVerse, every connection matters — from pets to their people,
                and vets to their clinics. We’re building a digital universe where care
                travels faster, communities grow stronger, and pet health is just a tap away.
            </p>
            </section>

            {/* SERVICES SECTION */}
            <section id="services" className="py-20 sm:py-32 md:py-40 px-6 md:px-10 text-center">
            <h3 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-16 sm:mb-24 md:mb-28 drop-shadow-lg">
                Our Services
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14 sm:gap-16 md:gap-20 max-w-[1500px] mx-auto">

                {/* Service 1 */}
                <div className="flex flex-col items-center gap-6 md:gap-8">
                <img
                    src="/2.png"
                    alt="Online"
                    className="w-[180px] sm:w-[200px] md:w-[220px] h-[180px] sm:h-[200px] md:h-[220px] rounded-2xl shadow-[0_0_70px_#3b82f690] object-cover"
                />
                <h4 className="text-2xl md:text-3xl font-bold">Online Consultations</h4>
                <p className="text-lg md:text-xl text-gray-300 max-w-[260px] leading-relaxed">
                    Get expert advice from licensed veterinarians anytime, anywhere.
                </p>
                </div>

                {/* Service 2 */}
                <div className="flex flex-col items-center gap-6 md:gap-8">
                <img
                    src="/3.png"
                    alt="Booking"
                    className="w-[180px] sm:w-[200px] md:w-[220px] h-[180px] sm:h-[200px] md:h-[220px] rounded-2xl shadow-[0_0_70px_#3b82f690] object-cover"
                />
                <h4 className="text-2xl md:text-3xl font-bold">Appointment Booking</h4>
                <p className="text-lg md:text-xl text-gray-300 max-w-[260px] leading-relaxed">
                    Schedule and manage visits with trusted clinics easily.
                </p>
                </div>

                {/* Service 3 */}
                <div className="flex flex-col items-center gap-6 md:gap-8">
                <img
                    src="/4.png"
                    alt="Finder"
                    className="w-[180px] sm:w-[200px] md:w-[220px] h-[180px] sm:h-[200px] md:h-[220px] rounded-2xl shadow-[0_0_70px_#3b82f690] object-cover"
                />
                <h4 className="text-2xl md:text-3xl font-bold">Clinic Finder</h4>
                <p className="text-lg md:text-xl text-gray-300 max-w-[260px] leading-relaxed">
                    Discover nearby veterinary clinics through our interactive map.
                </p>
                </div>

                {/* Service 4 */}
                <div className="flex flex-col items-center gap-6 md:gap-8">
                <img
                    src="/5.png"
                    alt="Community"
                    className="w-[180px] sm:w-[200px] md:w-[220px] h-[180px] sm:h-[200px] md:h-[220px] rounded-2xl shadow-[0_0_70px_#3b82f690] object-cover"
                />
                <h4 className="text-2xl md:text-3xl font-bold">Vet Community</h4>
                <p className="text-lg md:text-xl text-gray-300 max-w-[260px] leading-relaxed">
                    Ask questions, share experiences, or connect with other pet lovers.
                </p>
                </div>

            </div>
            </section>

            {/* SIGN UP SECTION */}
            
            <section className="w-full py-24 sm:py-32 md:py-40 px-6 md:px-10 text-center bg-gradient-to-t from-[#0A0F29] via-[#3A00C9] to-[#E9007F]">
            
            <Link to="/roles">
                <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#FF3B59] underline drop-shadow-xl">
                    Sign up now!
                </h3>
            </Link>
            
            <p className="mt-8 sm:mt-10 md:mt-12 max-w-5xl mx-auto text-gray-100 text-lg sm:text-xl md:text-3xl leading-relaxed font-semibold drop-shadow-lg">
                as an animal owner, veterinarian, or clinic, and start experiencing
                the ease of connection, appointment scheduling, and comprehensive
                care for all animals today!
            </p>
            </section>

        </div>
        </div>
    );
}