"use client";

import TabList from "@/components/tablist";
import Canvas from "@/components/canvas";
import Moodboard from "@/components/moodboard";
import { useSearchParams } from "next/navigation";

function Project() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "moodboard";

  return (
    <div className='container flex items-center  flex-col mx-auto '>
      <TabList />

      <div className='mt-2 w-full p-3'>
        {currentTab === "moodboard" && <Moodboard />}
        {currentTab === "canvas" && <Canvas />}
      </div>
    </div>
  );
}

export default Project;
