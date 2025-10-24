import { MoodboardProvider } from "@/components/providers/moodboard-provider";
import { Header } from "@/components/header";
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
    <MoodboardProvider projectId={projectid}>
      <div className='flex flex-col'>
        <Header></Header>
        <main className='flex-1'>{children}</main>
      </div>
    </MoodboardProvider>
  );
}
