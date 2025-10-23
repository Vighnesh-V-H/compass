import { MoodboardProvider } from "@/components/providers/moodboard-provider";
import { use } from "react";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectid: string }>;
}) {
  const { projectid } = use(params);

  return (
    <MoodboardProvider projectid={projectid}>{children}</MoodboardProvider>
  );
}
