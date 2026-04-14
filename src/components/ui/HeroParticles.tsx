'use client'
// src/components/ui/HeroParticles.tsx
import { useEffect, useRef } from 'react'

const COLORS = [
  'rgba(245,200,66,0.6)',
  'rgba(123,111,212,0.5)',
  'rgba(245,200,66,0.3)',
  'rgba(255,255,255,0.4)',
  'rgba(196,190,236,0.5)',
]

export function HeroParticles() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div')
      const size = Math.random() * 3 + 1
      p.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        border-radius:50%;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100 + 100}%;
        background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
        animation:float-up ${Math.random() * 15 + 10}s linear ${Math.random() * 10}s infinite;
      `
      container.appendChild(p)
    }

    return () => { container.innerHTML = '' }
  }, [])

  return <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" />
}
