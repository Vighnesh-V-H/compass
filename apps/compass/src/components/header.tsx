"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TabList from "@/components/tablist";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className='w-full bg-background'>
      <div className='flex h-16 items-center justify-between px-4'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/projects'>
              <ArrowLeft className='size-4' />
            </Link>
          </Button>
        </div>

        <div className='mx-auto'>
          <TabList />
        </div>

        {children && <div className='flex items-center gap-2'>{children}</div>}
      </div>
    </header>
  );
}
