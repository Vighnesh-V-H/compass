import type { Metadata } from "next";

import { MoodboardProvider } from "@/components/providers/moodboard-provider";

export const metadata: Metadata = {
  title: "Project",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <MoodboardProvider>{children}</MoodboardProvider>
    </div>
  );
}
