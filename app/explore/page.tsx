'use client';

import React from 'react';
import ParticleBackground from '@/components/ParticleBackground';
import { CaseSelectionGallery } from '@/components/CaseSelectionGallery';

export default function ExplorePage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-50">
      {/* Interactive Background */}
      <ParticleBackground />

      {/* Main Content Container */}
      <main className="relative z-10 w-full h-full flex flex-col">
        {/* Selection View */}
        <div className="flex-1 w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
          <CaseSelectionGallery />
        </div>
      </main>
    </div>
  );
}
