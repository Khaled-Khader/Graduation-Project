  // components/posts/PostCard.jsx
  import { useState } from "react";
  import CommentsDialog from "./dialogs/CommentsDialog";

  export default function PostCard() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <div className="w-full flex justify-center px-3 sm:px-4">
        <div
          className="
            w-full
            max-w-[520px]        /* mobile & tablet */
            md:max-w-[600px]     /* laptop */
            lg:max-w-[680px]     /* desktop */
            bg-white/10
            backdrop-blur-md
            border border-white/10
            rounded-2xl
            p-4 sm:p-5
            shadow-lg
            text-white
          "
        >
          {/* USER */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/1.png"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
            />
            <span className="font-semibold text-base sm:text-lg">
              Khaled Khader
            </span>
          </div>

          {/* TEXT */}
          <p className="text-sm sm:text-base leading-relaxed mb-4">
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
            Hi all 👋 this is my first post on PetNexus!
          </p>

          {/* IMAGE (optional) */}
          <div className="w-full aspect-[4/5] overflow-hidden rounded-xl mb-4 bg-black">
            <img
              src="/1.png"
              alt="post"
              className="w-full h-full object-cover"
            />
        </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="text-xl hover:scale-110 transition"
            >
              💬
            </button>
            <span className="text-sm text-white/70">
              5 comments
            </span>
          </div>
        </div>

  <CommentsDialog open={open} onClose={() => setOpen(false)} />
</div>
</>
)
}

  
