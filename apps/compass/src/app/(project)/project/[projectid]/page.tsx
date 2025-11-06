"use client";

import Canvas from "@/components/canvas/canvas";
import Moodboard from "@/components/moodboard";
import { useSearchParams, useParams } from "next/navigation";

function Project() {
  const searchParams = useSearchParams();
  const params = useParams();
  const currentTab = searchParams.get("tab") || "moodboard";
  const projectId = params.projectid as string;

  return (
    <div className='container flex items-center overflow-x-hidden flex-col mx-auto'>
      <div className=' w-full '>
        {currentTab === "moodboard" && <Moodboard />}
        {currentTab === "canvas" && <Canvas projectId={projectId} />}
      </div>
    </div>
  );
}

export default Project;
