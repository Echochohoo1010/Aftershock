'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ParticleBackground from '@/components/ParticleBackground';
import { ClarityButton } from '@/components/ClarityButton';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLaunch = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push('/explore');
    }, 500); // Allow fade out animation
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-50">
      {/* Interactive Background */}
      <ParticleBackground />

      {/* Main Content Container */}
      <main className="relative w-full h-full flex flex-col" style={{ zIndex: 20 }}>
        {/* Landing View */}
        <div className={`
          flex-1 flex flex-col items-center justify-center px-4 text-center pointer-events-none
          transition-opacity duration-500 ease-in-out
          ${isTransitioning ? 'opacity-0' : 'opacity-100'}
        `}>
          <div className="max-w-full mx-auto space-y-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-gray-900 select-none leading-tight whitespace-nowrap pointer-events-none">
              Turn complexity into clarity
            </h1>

            <div className="flex justify-center pt-6 pointer-events-auto">
              <ClarityButton onClick={handleLaunch} className="flex items-center space-x-3 group">
                <span>Launch Simulator</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </ClarityButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
