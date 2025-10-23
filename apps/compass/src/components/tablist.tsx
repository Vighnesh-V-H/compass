"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

function TabList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "moodboard";

  const handleTabChange = (value: string) => {
    router.push(`?tab=${value}`);
  };

  return (
    <Tabs>
      <TabsList className='w-fit mt-3'>
        <TabsTrigger
          value='canvas'
          className='cursor-pointer'
          onClick={() => handleTabChange("canvas")}
          data-state={currentTab === "canvas" ? "active" : "inactive"}>
          Canvas
        </TabsTrigger>
        <TabsTrigger
          value='moodboard'
          onClick={() => handleTabChange("moodboard")}
          className='cursor-pointer'
          data-state={currentTab === "moodboard" ? "active" : "inactive"}>
          Moodboard
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export default TabList;
