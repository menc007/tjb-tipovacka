'use client'

export function HeroHeader() {
  return (
    <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-16">
      <div className="max-w-4xl mx-auto text-center px-4">
        {/* Nadpis */}
        <h1 className="text-5xl font-bold mb-4">TJB Tipovačka</h1>

        {/* Popis */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-2xl">⚽</span>
          <span className="text-2xl font-semibold">MISTROVSTVÍ SVĚTA 2026</span>
          <span className="text-2xl">⚽</span>
        </div>

        {/* Lokace */}
        <p className="text-xl mb-8">
          <span className="flag">🇺🇸</span> USA · 
          <span className="flag">🇨🇦</span> Canada · 
          <span className="flag">🇲🇽</span> Mexico
        </p>

        {/* CTA Button */}
        <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
          Začít tipovat
        </button>
      </div>
    </div>
  )
}