"use client";

import LandingPage from "@/components/landing";
import { useSession } from "@/lib/session";

export default function Home() {
  const session = useSession();
  const isLoggedIn = !!session.user;

  return <LandingPage isLoggedIn={isLoggedIn} />;
}
