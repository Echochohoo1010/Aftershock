'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  id: number;
}

interface MouseState {
  x: number | null;
  y: number | null;
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<MouseState>({ x: null, y: null });
  const ripplesRef = useRef<Ripple[]>([]);
  const requestRef = useRef<number | null>(null);

  // Configuration
  const particleCount = 180; // Density
  const connectionDistance = 100;
  const baseColor = 'rgba(156, 163, 175, 0.3)'; // gray-400 low opacity
  const activeColor = 'rgba(31, 41, 55, 0.8)'; // gray-800 high opacity
  const rippleSpeed = 4;
  const rippleThickness = 40;

  const createParticles = (width: number, height: number) => {
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
      });
    }
    return particles;
  };

  const particlesRef = useRef<any[]>([]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      particlesRef.current = createParticles(canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    const handleClick = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxRadius = Math.max(rect.width, rect.height);
      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius,
        id: Date.now(),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update Ripples
    ripplesRef.current.forEach((ripple, index) => {
      ripple.radius += rippleSpeed;
      if (ripple.radius > ripple.maxRadius) {
        ripplesRef.current.splice(index, 1);
      }
    });

    // Update and Draw Particles
    particlesRef.current.forEach((particle) => {
      // Basic Movement
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

      let isActive = false;
      let scale = 1;

      // 1. Mouse Proximity Interaction
      if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          isActive = true;
          scale = 1.5;
          // Gentle attraction
          particle.x += dx * 0.01;
          particle.y += dy * 0.01;
        }
      }

      // 2. Ripple Interaction
      ripplesRef.current.forEach((ripple) => {
        const dx = ripple.x - particle.x;
        const dy = ripple.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if particle is within the ripple ring
        if (dist >= ripple.radius - rippleThickness && dist <= ripple.radius) {
            isActive = true;
            scale = 2;
            // Push out slightly
            const angle = Math.atan2(dy, dx);
            particle.x -= Math.cos(angle) * 2;
            particle.y -= Math.sin(angle) * 2;
        }
      });

      // Draw Particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * scale, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? activeColor : baseColor;
      ctx.fill();
    });

    // Draw connections (lines) between close particles
    particlesRef.current.forEach((p1, i) => {
      particlesRef.current.slice(i + 1).forEach((p2) => {
         const dx = p1.x - p2.x;
         const dy = p1.y - p2.y;
         const dist = Math.sqrt(dx * dx + dy * dy);

         if (dist < connectionDistance) {
           ctx.beginPath();
           ctx.strokeStyle = baseColor;
           ctx.lineWidth = 0.5;
           ctx.moveTo(p1.x, p1.y);
           ctx.lineTo(p2.x, p2.y);
           ctx.stroke();
         }
      });
    });

    requestRef.current = requestAnimationFrame(animate);
  }, [baseColor, activeColor]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [handleResize, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full bg-zinc-50"
      style={{ zIndex: 1, pointerEvents: 'none' }}
    />
  );
};

export default ParticleBackground;
