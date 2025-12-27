    export default function PetCard({ pet }) {
    return (
        <div className="
        bg-[#0F1538]
        rounded-2xl p-5
        border border-[#6B8CFF]/25
        shadow-lg
        hover:shadow-[0_0_25px_#6B8CFF40]
        transition
        ">
        <img
            src={pet.photoUrl || "/pet.png"}
            className="w-full h-40 object-cover rounded-xl mb-4"
        />

        <h3 className="text-xl font-bold text-[#E6ECFF]">
            {pet.name}
        </h3>

        <p className="text-[#B8C4FF] text-sm mt-1">
            {pet.species} • {pet.age} years
        </p>

        <div className="mt-3 flex justify-between text-sm">
            <span className="text-[#9AA6E8]">
            Health: {pet.healthStatus}
            </span>

            {pet.hasVaccineCert && (
            <span className="text-[#6B8CFF] font-medium">
                💉 Vaccinated
            </span>
            )}
        </div>
        </div>
    );
    }
