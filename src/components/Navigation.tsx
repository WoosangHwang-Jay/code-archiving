'use client';

import React from 'react';

export function Navigation() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-center w-full">
      <div className="flex items-center gap-2 text-accent font-mystic ml-4 drop-shadow-[0_0_10px_rgba(241,229,172,0.4)]">
        <span className="text-2xl hover:scale-110 transition-transform cursor-pointer">☯</span>
      </div>
    </nav>
  );
}
