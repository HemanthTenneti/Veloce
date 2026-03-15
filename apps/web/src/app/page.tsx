"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturedVehicles from "@/components/landing/FeaturedVehicles";
import InventoryCTA from "@/components/landing/InventoryCTA";
import HowItWorks from "@/components/landing/HowItWorks";
import ReserveCTA from "@/components/landing/ReserveCTA";
import { useGsapAnimations } from "@/hooks/useGsapAnimations";

export default function LandingPage() {
  useGsapAnimations();

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedVehicles />
        <InventoryCTA />
        <HowItWorks />
        <ReserveCTA />
      </main>
      <Footer />
    </>
  );
}
