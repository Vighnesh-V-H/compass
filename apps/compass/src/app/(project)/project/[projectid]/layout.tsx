import { Header } from "@/components/header";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col'>
      <Header></Header>
      <main className='flex-1'>{children}</main>
    </div>
  );
}
