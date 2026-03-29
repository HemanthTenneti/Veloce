'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Application } from '@splinetool/runtime';

// Dynamically import Spline to avoid SSR issues
const Spline = dynamic(
  () => import('@splinetool/react-spline').then((mod) => mod.default),
  { ssr: false, loading: () => null }
);

const SPLINE_SCENE_URL = "https://prod.spline.design/XuoQgfyw6ov3Xrld/scene.splinecode";

interface SplineViewerProps {
  paused?: boolean;
}

// Check for webdriver at module level (runs once on client)
const isWebdriver = typeof navigator !== 'undefined' && navigator.webdriver;

export default function SplineViewer({ paused = false }: SplineViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [disableSpline] = useState(isWebdriver);

  const handleLoad = useCallback((splineApp: Application) => {
    appRef.current = splineApp;

    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      canvasRef.current = canvas;
      // Kill ALL native input to the canvas. Spline never sees wheel, mousedown,
      // touch, keyboard — nothing. No zoom, no pan, no drag, no scroll hijack.
      canvas.style.pointerEvents = 'none';
    }
    if (containerRef.current) {
      containerRef.current.style.transition = 'opacity 500ms ease';
      containerRef.current.style.opacity = '1';
    }
  }, []);

  // The container (pointer-events: auto) receives native mousemove, then
  // dispatches a synthetic copy directly on the canvas. dispatchEvent bypasses
  // CSS pointer-events:none, so Spline's internal raycast picks it up for hover.
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.dispatchEvent(new MouseEvent('mousemove', {
      clientX: e.clientX,
      clientY: e.clientY,
      bubbles: false,
    }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
  }, []);

  // Stop/start the Spline render loop based on visibility
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    if (paused) {
      app.stop();
    } else {
      app.play();
    }
  }, [paused]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: 0,
        touchAction: 'none',
        overflow: 'hidden',
        background: '#0E0E0E',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        contain: 'layout style paint',
        isolation: 'isolate',
      }}
    >
      {!disableSpline ? (
        <Spline
          scene={SPLINE_SCENE_URL}
          onLoad={handleLoad}
        />
      ) : null}
    </div>
  );
}
