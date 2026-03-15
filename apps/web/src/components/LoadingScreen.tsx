'use client';

import { useState, useEffect } from 'react';
import gsap from 'gsap';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let revealTween: gsap.core.Tween | null = null;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const preloadSpline = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('/retrofuturism_bg_animation.spline', {
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          // File is preloaded, wait minimum 1.5 seconds for visual effect
          await sleep(1500);
        }
      } catch (error) {
        console.warn('Spline preload failed:', error);
        // Still proceed after timeout even if preload fails
        await sleep(1500);
      }

      if (!mounted) {
        return;
      }

      // Fade out the loading screen
      revealTween = gsap.to('.loading-screen', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          if (mounted) {
            setIsLoading(false);
          }
        },
      });
    };

    preloadSpline();

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
