        import { useState } from "react";
        import Dialog from "./Dialog";

        const testComment=[
            {
                user:"khaled",
                text:"Blaa blaaa"
            },
            {
                user:"khaled",
                text:"Blaa blaaa"
            },
            {
                user:"khaled",
                text:"Blaa blaaa"
            },
            {
                user:"khaled",
                text:"Blaa blaaa"
            },
            {
                user:"khaled",
                text:"Blaa blaaa"
            },
            {
                user:"khaled",
                text:"Blaa blaaa"
            }
        ]

        export default function Post({ post }) {
        const [open, setOpen] = useState(false);

        return (
    <>
        {/* POST CARD */}
        <div
        className="
            bg-white/10 
            backdrop-blur-md
            border border-white/10
            w-full max-w-3xl mx-auto
            rounded-2xl p-6
            shadow-[0_0_35px_#0A39E0]
            mb-20
            text-white
        "
        >
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-5">
            <img
            src="ff"
            className="w-11 h-11 rounded-full border border-white shadow-md"
            />
            <p className="font-semibold underline text-sm tracking-wide">
            Khaled Khader
            </p>
        </div>

        {/* TEXT */}
        <p className="text-base leading-relaxed mb-6 text-center font-light">
            Hi all, this is the first post in the web ✨
        </p>

        {/* COMMENTS BUTTON */}
        <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">{testComment.length}</span>

            <button
            onClick={() => setOpen(true)}
            className="
                text-white/80 hover:text-white 
                text-2xl 
                transition 
                hover:scale-110
            "
            >
            💬
            </button>
        </div>
        </div>

        {/* COMMENTS MODAL */}
        <Dialog isOpen={open} onClose={() => setOpen(false)}
            
            >

  {/* TITLE */}
  <h2 className="text-3xl font-extrabold mb-5 text-[#0A39E0] drop-shadow-[0_0_10px_#0A39E0] text-center">
    Comments 💬
  </h2>

  {/* COMMENTS CONTAINER */}
  <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto px-1 pb-4">

    {testComment.map((c, idx) => (
      <div
        key={idx}
        className="
          bg-white/20 
          backdrop-blur-md
          p-4 
          rounded-xl 
          shadow-[0_0_15px_rgba(0,0,0,0.3)]
          text-white
          border border-white/10
        "
      >
        <p className="text-sm font-semibold text-[#00C2FF] mb-1">
          {c.user}
        </p>
        <p className="text-sm leading-relaxed">{c.text}</p>
      </div>
    ))}

  </div>

  {/* INPUT AREA */}
  <form
    
    className="
      w-full 
      flex 
      items-center 
      gap-3 
      mt-4 
      bg-white/10 
      backdrop-blur-lg 
      p-3 
      rounded-xl 
      border border-white/10
      shadow-[0_0_20px_rgba(0,0,0,0.3)]
    "
  >
    <input
      type="text"
      placeholder="Write a comment..."
      className="
        flex-1 
        py-2 px-4 
        rounded-lg 
        bg-white/20 
        text-white 
        placeholder-gray-300 
        outline-none 
        shadow-inner
      "
      required
    />

    <button
      type="submit"
      className="
        bg-[#0A39E0] 
        text-white 
        px-4 py-2 
        rounded-lg 
        font-semibold 
        hover:bg-[#0f3dff] 
        shadow-[0_0_15px_#0A39E0]
        transition
      "
    >
      Send
    </button>
  </form>
</Dialog>

    </>
    );

        }
