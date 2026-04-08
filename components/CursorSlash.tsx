"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface Slash {
  x: number;
  y: number;
  angle: number;
  progress: number;
  length: number;
}

export default function CursorSlash() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const slashesRef = useRef<Slash[]>([]);
  const animatingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleClick = (e: MouseEvent) => {
      const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.25;

      slashesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        angle,
        progress: 0,
        length: 35 + Math.random() * 20,
      });

      for (let i = 0; i < 3; i++) {
        const spread = (Math.random() - 0.5) * 1.2;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle + spread) * (1.5 + Math.random() * 2),
          vy: Math.sin(angle + spread) * (1.5 + Math.random() * 2),
          life: 1,
          maxLife: 1,
          size: 0.8 + Math.random() * 1.5,
        });
      }

      if (!animatingRef.current) {
        animatingRef.current = true;
        animate();
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw slashes
      for (let i = slashesRef.current.length - 1; i >= 0; i--) {
        const s = slashesRef.current[i];
        s.progress += 0.08;

        if (s.progress >= 1) {
          slashesRef.current.splice(i, 1);
          continue;
        }

        const drawProgress = Math.min(s.progress * 3, 1);
        const fade = s.progress > 0.4 ? 1 - (s.progress - 0.4) / 0.6 : 1;

        const startX = s.x - Math.cos(s.angle) * s.length * 0.5;
        const startY = s.y - Math.sin(s.angle) * s.length * 0.5;
        const endX = startX + Math.cos(s.angle) * s.length * drawProgress;
        const endY = startY + Math.sin(s.angle) * s.length * drawProgress;

        // Glow
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(255, 26, 26, ${0.3 * fade})`;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        // Core slash line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(204, 0, 0, ${0.8 * fade})`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();

        // Bright center
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(255, 100, 100, ${0.5 * fade})`;
        ctx.lineWidth = 0.5;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= 0.03;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        const alpha = p.life / p.maxLife;

        // Particle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 26, 26, ${alpha * 0.3})`;
        ctx.fill();

        // Particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(204, 0, 0, ${alpha * 0.9})`;
        ctx.fill();
      }

      if (slashesRef.current.length > 0 || particlesRef.current.length > 0) {
        requestAnimationFrame(animate);
      } else {
        animatingRef.current = false;
      }
    };

    window.addEventListener("mousedown", handleClick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
