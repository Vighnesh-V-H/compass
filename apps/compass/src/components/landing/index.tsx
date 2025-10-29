"use client";

import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import Pricing from "./Pricing";
import Footer from "./Footer";

interface LandingPageProps {
  isLoggedIn?: boolean;
}

export default function LandingPage({ isLoggedIn = false }: LandingPageProps) {
  return (
    <div className='bg-black min-h-screen'>
      <Navbar isLoggedIn={isLoggedIn} />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}

export { Navbar, Hero, Features, Pricing, Footer };
