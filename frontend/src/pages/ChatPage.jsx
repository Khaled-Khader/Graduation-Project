import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 px-4">


      <div className="
        w-72 h-72
        sm:w-80 sm:h-80
        md:w-[450px] md:h-[450px]
        lg:w-[520px] lg:h-[520px]
        transition-all duration-300
      ">
        <DotLottieReact
          src="https://lottie.host/497bc3f4-c43b-4d3c-9783-5ec7bbf0d22c/uezkB4b52P.lottie"
          loop
          autoplay
        />
      </div>


      <div className="
        w-52 h-52
        sm:w-56 sm:h-56
        md:w-64 md:h-64
        lg:w-72 lg:h-72
        flex-shrink-0
        transition-all duration-300
      ">
        <DotLottieReact
          src="https://lottie.host/171ab8f8-4d6f-44c5-9bc4-d1debc4d1434/2Jn6iCh622.lottie"
          loop
          autoplay
        />
      </div>

    </div>
  );
}
