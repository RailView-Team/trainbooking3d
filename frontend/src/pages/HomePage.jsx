import React from 'react';
import HeroBooking from '../components/HeroBooking';
import ExperienceSection from '../components/ExperienceSection';
import BenefitsSection from '../components/BenefitsSection';
import PopularRoutes from '../components/PopularRoutes';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Search and Vande Bharat Train */}
      <HeroBooking />

      {/* The RailVista 3D Coach Experience Section */}
      <ExperienceSection />

      {/* 4 Core Value Propositions / Benefits */}
      <BenefitsSection />

      {/* Curated Popular Indian Railway Routes */}
      <PopularRoutes />
    </main>
  );
}
