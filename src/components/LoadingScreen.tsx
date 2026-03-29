'use client';

import { useState, useEffect } from 'react';
import gsap from 'gsap';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let revealTween: gsap.core.Tween | null = null;

    // Minimal delay for brand impression, then fade out quickly
    const minDisplayTime = 600;
    const startTime = performance.now();

    const revealSite = () => {
      if (!mounted) return;

      // Calculate remaining time to meet minimum display
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        if (!mounted) return;

        // Fast fade out for snappy feel
        revealTween = gsap.to('.loading-screen', {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            if (mounted) {
              setIsLoading(false);
            }
          },
        });
      }, remaining);
    };

    // Start reveal immediately - no need to preload Spline (it loads lazily)
    revealSite();

    return () => {
      mounted = false;
      revealTween?.kill();
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className="loading-screen fixed inset-0 z-[9999] flex items-center justify-center bg-black pointer-events-none"
      style={{
        backgroundColor: '#000000',
      }}
    >
      <div className="flex flex-col items-center gap-8">
        <h1
          className="font-display font-bold tracking-tight text-6xl md:text-8xl animate-fade-in-out"
          style={{
            color: '#FFFFFF',
            animation: 'fadeInOut 1.5s ease-in-out forwards',
          }}
        >
          VELOCE.
        </h1>
        <div className="flex gap-2">
          <div
            className="w-2 h-2 rounded-full bg-white"
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0s',
            }}
          />
          <div
            className="w-2 h-2 rounded-full bg-white"
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.3s',
            }}
          />
          <div
            className="w-2 h-2 rounded-full bg-white"
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.6s',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
