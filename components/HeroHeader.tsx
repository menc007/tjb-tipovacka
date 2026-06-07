'use client'

import Image from 'next/image'

export function HeroHeader() {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-2">
      {/* Gradient pozadí */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #0D0D0D 0%, #1A1A2E 50%, #0D1A3A 100%)',
        }}
      />

      {/* Animovaný glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    w-80 h-80 rounded-full blur-3xl pointer-events-none
                    animate-pulse-slow"
        style={{ background: 'rgba(74,144,217,0.08)' }}
      />

      {/* Subtilní mřížka */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(74,144,217,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,144,217,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Zlatý okraj nahoře */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
        }}
      />

      {/* Obsah */}
      <div className="relative z-10 flex flex-col items-center py-8 px-4">
        {/* Logo s glow efektem */}
        <div className="relative mb-4">
          <div
            className="absolute inset-0 rounded-full blur-2xl scale-150 animate-pulse-slow"
            style={{ background: 'rgba(74,144,217,0.15)' }}
          />
          <Image
            src="/tjb-logo.png"
            alt="TJB Football Club"
            width={140}
            height={140}
            className="relative z-10 drop-shadow-2xl hover:scale-105
                       transition-transform duration-300"
            priority
          />
        </div>

        {/* Titulek */}
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-center">
          <span className="text-white">TJB </span>
          <span className="text-gold-gradient">Tipovačka</span>
        </h1>

        {/* Podtitulek */}
        <p
          className="mt-2 text-base md:text-lg font-semibold tracking-widest
                     uppercase text-center"
          style={{ color: '#4A90D9' }}
        >
          ⚽ Mistrovství světa 2026 ⚽
        </p>

        {/* Vlajky */}
        <p className="text-white/30 text-sm mt-1">
          🇺🇸 USA &nbsp;·&nbsp; 🇨🇦 Kanada &nbsp;·&nbsp; 🇲🇽 Mexiko
        </p>

        {/* Zlatý okraj dole */}
        <div
          className="mt-6 h-px w-32"
          style={{
            background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
          }}
        />
      </div>
    </div>
  )
}