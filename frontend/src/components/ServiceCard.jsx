    export default function ServiceCard({ service }) {
    return (
        <div className="
        bg-[#0F1538]
        rounded-2xl p-6
        border border-[#6B8CFF]/25
        shadow-lg
        hover:shadow-[0_0_25px_#6B8CFF40]
        transition
        ">
        <h3 className="text-xl font-semibold text-[#E6ECFF]">
            {service.name}
        </h3>

        <p className="mt-2 text-[#B8C4FF] text-sm leading-relaxed">
            {service.description}
        </p>

        <div className="mt-4 text-sm text-[#9AA6E8]">
            🐾 Provided by PetNexus
        </div>
        </div>
    );
    }
