"use client";

import Canvas from "@/components/canvas/canvas";
import Moodboard from "@/components/moodboard";
import { useSearchParams } from "next/navigation";

function Project() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "moodboard";

  return (
    <div className='container flex items-center overflow-x-hidden flex-col mx-auto'>
      <div className=' w-full '>
        {currentTab === "moodboard" && <Moodboard />}
        {currentTab === "canvas" && <Canvas />}
      </div>
    </div>
  );
}

export default Project;
