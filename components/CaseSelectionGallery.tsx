'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Leaf, Plus } from 'lucide-react';
import { ClarityButton } from '@/components/ClarityButton';

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const CASES: CaseStudy[] = [
  {
    id: 'carbon-tax',
    title: 'Carbon Tax Implementation',
    description: 'Designing a carbon policy to cut emissions while balancing energy prices. Models the impact on household income, renewable investment, and industrial output.',
    icon: Leaf,
  },
  {
    id: 'build-your-own',
    title: 'Build Your Own Case',
    description: 'Create a custom simulation from scratch by defining your own parameters and policy inputs.',
    icon: Plus,
  }
];

export const CaseSelectionGallery: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.scrollTo({
        left: direction === 'right' ? currentScroll + scrollAmount : currentScroll - scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleViewDemo = () => {
    if (selectedId && selectedId !== 'build-your-own') {
      router.push(`/canvas?case=${selectedId}`);
    }
    // Note: No navigation for build-your-own (future functionality placeholder)
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pointer-events-auto animate-in fade-in duration-700">

      <div className="relative w-full max-w-7xl px-4 md:px-12 flex items-center justify-center">
        {/* Left Scroll Button */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex absolute left-2 z-20 p-3 rounded-full bg-white/80 backdrop-blur shadow-lg text-gray-800 hover:bg-white hover:scale-110 transition-all border border-gray-100"
          aria-label="Scroll left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-8 py-20 px-4 md:px-4 scrollbar-hide snap-x snap-mandatory w-full justify-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CASES.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`
                  flex-none w-full md:w-[450px] snap-center
                  relative bg-white rounded-3xl p-10 cursor-pointer
                  transition-all duration-300 ease-out
                  border
                  ${isSelected
                    ? 'border-gray-900 ring-1 ring-gray-900 shadow-2xl scale-[1.03] z-10'
                    : 'border-gray-100 shadow-lg hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 z-0'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className={`p-4 rounded-2xl transition-colors ${isSelected ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  {isSelected && (
                    <div className="w-3 h-3 bg-gray-900 rounded-full animate-pulse" />
                  )}
                </div>

                <h3 className="text-3xl font-serif text-gray-900 mb-4 leading-tight">
                  {item.title}
                </h3>

                <p className="text-gray-500 leading-relaxed text-base font-light">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex absolute right-2 z-20 p-3 rounded-full bg-white/80 backdrop-blur shadow-lg text-gray-800 hover:bg-white hover:scale-110 transition-all border border-gray-100"
          aria-label="Scroll right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* View Demo Button */}
      <div className="h-16 flex items-center justify-center">
        <div className={`transition-all duration-500 transform ${selectedId ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <ClarityButton
            onClick={handleViewDemo}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <span>{selectedId === 'build-your-own' ? 'Start' : 'View Demo'}</span>
            <ArrowRight className="w-4 h-4" />
          </ClarityButton>
        </div>
      </div>
    </div>
  );
};
