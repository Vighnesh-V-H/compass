import { MoodboardContext } from "@/components/providers/moodboard-provider";
import { useContext } from "react";

export const useMoodboard = () => {
  const context = useContext(MoodboardContext);
  if (!context)
    throw new Error("useMoodboard must be used within MoodboardProvider");
  return context;
};
