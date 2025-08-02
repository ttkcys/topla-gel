'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setIsVisible(true);

    // Top hareketini simüle eden animasyon
    const interval = setInterval(() => {
      setBallPosition(prev => ({
        x: 30 + Math.sin(Date.now() / 2000) * 20,
        y: 40 + Math.cos(Date.now() / 3000) * 10
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-green-400 via-green-500 to-green-600">
      {/* Halı saha zemin deseni */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full relative">
          {/* Saha çizgileri */}
          <svg className="w-full h-full" viewBox="0 0 800 600">
            {/* Ana saha çerçevesi */}
            <rect x="50" y="100" width="700" height="400" fill="none" stroke="white" strokeWidth="3" />

            {/* Orta çizgi */}
            <line x1="400" y1="100" x2="400" y2="500" stroke="white" strokeWidth="2" />

            {/* Orta daire */}
            <circle cx="400" cy="300" r="50" fill="none" stroke="white" strokeWidth="2" />

            {/* Sol kale alanı */}
            <rect x="50" y="200" width="80" height="200" fill="none" stroke="white" strokeWidth="2" />
            <rect x="50" y="250" width="40" height="100" fill="none" stroke="white" strokeWidth="2" />

            {/* Sağ kale alanı */}
            <rect x="670" y="200" width="80" height="200" fill="none" stroke="white" strokeWidth="2" />
            <rect x="710" y="250" width="40" height="100" fill="none" stroke="white" strokeWidth="2" />

            {/* Köşe çizgileri */}
            <path d="M 50 100 Q 60 100 60 110" fill="none" stroke="white" strokeWidth="2" />
            <path d="M 750 100 Q 740 100 740 110" fill="none" stroke="white" strokeWidth="2" />
            <path d="M 50 500 Q 60 500 60 490" fill="none" stroke="white" strokeWidth="2" />
            <path d="M 750 500 Q 740 500 740 490" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Animasyonlu futbol topu */}
      <div
        className="absolute w-8 h-8 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out z-20"
        style={{
          left: `${ballPosition.x}%`,
          top: `${ballPosition.y}%`,
          background: 'radial-gradient(circle at 30% 30%, #ffffff, #f0f0f0, #e0e0e0)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {/* Top üzerindeki pentagon deseni */}
        <div className="w-full h-full relative">
          <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
          <div className="absolute top-2 right-1 w-1 h-1 bg-black rounded-full"></div>
          <div className="absolute bottom-1 left-2 w-1 h-1 bg-black rounded-full"></div>
        </div>
      </div>



      {/* Ana içerik */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div
          className={`  p-8  text-center   ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
        >
          {/* Logo ve başlık */}
          <div className="mb-4">

            <h1 className="text-6xl font-black text-white mb-4 tracking-wider drop-shadow-lg">
              <span className="text-green-200">TOPLA</span>{' '}
              <span className="text-white">GEL</span>
            </h1>
          </div>

          {/* Açıklama */}
          <p className="text-2xl text-white mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-md font-medium">
            Halı saha maçlarını organize et, G@ylarla top oyna!
            <br />
          </p>

          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/giris-yap">
              <button className="cursor-pointer group bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-4 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-lg border-2 border-white border-opacity-20 hover:border-opacity-40">
                <span className="flex items-center gap-2">
                  Giriş Yap

                </span>
              </button>
            </Link>

          </div>


        </div>
      </div>

      {/* Köşelerde dekoratif elementler */}
      <div className="absolute top-10 left-10 w-16 h-16 border-4 border-white border-opacity-40 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-10 right-10 w-12 h-12 border-4 border-white border-opacity-40 rounded-full animate-bounce"></div>

      {/* Gradient overlay - daha hafif */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-20"></div>
    </div>
  );
}