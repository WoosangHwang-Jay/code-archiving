'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SajuResult } from '@/lib/saju';

interface SajuDashboardProps {
  data: SajuResult;
  userName?: string;
}

const ELEMENT_MAP = {
  wood: { label: '木 (Wood)', color: 'bg-green-500', text: 'text-green-500', bar: 'from-green-500/20 to-green-500' },
  fire: { label: '火 (Fire)', color: 'bg-red-500', text: 'text-red-500', bar: 'from-red-500/20 to-red-500' },
  earth: { label: '土 (Earth)', color: 'bg-yellow-600', text: 'text-yellow-600', bar: 'from-yellow-600/20 to-yellow-600' },
  metal: { label: '金 (Metal)', color: 'bg-gray-300', text: 'text-gray-300', bar: 'from-gray-300/20 to-gray-300' },
  water: { label: '水 (Water)', color: 'bg-blue-500', text: 'text-blue-500', bar: 'from-blue-500/20 to-blue-500' },
};

export const SajuDashboard: React.FC<SajuDashboardProps> = ({ data, userName = '사용자' }) => {
  const { elements, fortuneScores, luckWave } = data;
  const totalElements = Object.values(elements).reduce((a, b) => a + b, 0);

  // Radar Chart calculation
  const radarCategories = [
    { key: 'wealth', label: '재물운' },
    { key: 'honor', label: '명예운' },
    { key: 'health', label: '건강운' },
    { key: 'love', label: '연애운' },
    { key: 'family', label: '가족운' },
    { key: 'career', label: '직업운' },
    { key: 'studies', label: '학업운' },
    { key: 'relations', label: '대인관계' },
  ] as const;

  const getRadarPoints = (scores: typeof fortuneScores, size: number) => {
    const center = size / 2;
    const radius = size * 0.4;
    return radarCategories.map((cat, i) => {
      const angle = (Math.PI * 2 * i) / radarCategories.length - Math.PI / 2;
      const score = scores[cat.key] / 100;
      const x = center + radius * score * Math.cos(angle);
      const y = center + radius * score * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Wave Chart Path
  const getWavePath = (wave: typeof luckWave, width: number, height: number) => {
    const padding = 20;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;
    
    const points = wave.map((p, i) => {
      const x = padding + (i / (wave.length - 1)) * innerWidth;
      const y = height - padding - (p.value / 100) * innerHeight;
      return { x, y };
    });

    return `M ${points[0].x} ${points[0].y} ` + 
      points.slice(1).map((p, i) => {
        const prev = points[i];
        const cx = (prev.x + p.x) / 2;
        return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
      }).join(' ');
  };

  // Mandala Orbs Calculation
  const mandalaElements = [
    { key: 'fire', label: '火 (Fire)', color: '#ef4444', desc: 'Activity & Passion', angle: 0 },
    { key: 'wood', label: '木 (Wood)', color: '#22c55e', desc: 'Growth & Expansion', angle: 72 },
    { key: 'earth', label: '土 (Earth)', color: '#ca8a04', desc: 'Stability & Foundation', angle: 144 },
    { key: 'metal', label: '金 (Metal)', color: '#94a3b8', desc: 'Clarity & Refinement', angle: 216 },
    { key: 'water', label: '水 (Water)', color: '#3b82f6', desc: 'Flow & Wisdom', angle: 288 },
  ] as const;

  return (
    <div className="w-full bg-[#050810] text-blue-50 p-6 md:p-10 rounded-[3rem] border border-accent/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] -z-10" />

      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-accent/50" />
          <div className="w-8 h-8 rounded-full border border-accent/50 flex items-center justify-center">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          </div>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-accent/50" />
        </div>
        <h1 className="text-3xl md:text-4xl font-mystic tracking-widest text-accent drop-shadow-[0_0_10px_rgba(241,229,172,0.5)]">
          {userName}의 천기(天氣) 총운
        </h1>
      </div>

      <div className="flex flex-col gap-12">
        {/* Top: Mandala Visualization */}
        <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-md flex flex-col items-center">
          <h2 className="text-2xl font-mystic mb-10 text-accent/80 flex items-center gap-3 self-start">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            오행 순환 만다라 (Mandala)
          </h2>
          
          <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center">
            <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {/* Outer Cycle Lines (Generation) */}
              <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(241,229,172,0.1)" strokeWidth="1" strokeDasharray="5 5" />
              
              {/* Inner Pentagram Lines (Control) - Hidden in PDF for clarity */}
              <g className="no-export opacity-20">
                {mandalaElements.map((el, i) => {
                  const nextIdx = (i + 2) % 5;
                  const nextEl = mandalaElements[nextIdx];
                  const x1 = 200 + 140 * Math.sin((el.angle * Math.PI) / 180);
                  const y1 = 200 - 140 * Math.cos((el.angle * Math.PI) / 180);
                  const x2 = 200 + 140 * Math.sin((nextEl.angle * Math.PI) / 180);
                  const y2 = 200 - 140 * Math.cos((nextEl.angle * Math.PI) / 180);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.5" />;
                })}
              </g>

              {/* Element Orbs */}
              {mandalaElements.map((el) => {
                const count = elements[el.key as keyof typeof elements] || 0;
                const percentage = Math.round((count / totalElements) * 100);
                const radius = 25 + (percentage / 100) * 45; // Dynamic size based on strength
                const x = 200 + 140 * Math.sin((el.angle * Math.PI) / 180);
                const y = 200 - 140 * Math.cos((el.angle * Math.PI) / 180);

                return (
                  <g key={el.key}>
                    {/* Glow Effect */}
                    <motion.circle 
                      initial={{ opacity: 0, r: 0 }}
                      animate={{ opacity: 0.3, r: radius * 1.5 }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                      cx={x} cy={y} 
                      fill={el.color} 
                      className="blur-xl"
                    />
                    
                    {/* Main Orb */}
                    <motion.circle 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.5 }}
                      cx={x} cy={y} r={radius} 
                      fill={`url(#grad-${el.key})`}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                    />
                    
                    {/* Label Text */}
                    <text 
                      x={x} y={y + radius + 25} 
                      textAnchor="middle" 
                      className="text-[14px] font-mystic fill-accent font-bold"
                    >
                      {el.label}
                    </text>
                    <text 
                      x={x} y={y + radius + 42} 
                      textAnchor="middle" 
                      className="text-[12px] fill-white/40 uppercase tracking-widest"
                    >
                      {percentage}%
                    </text>

                    {/* Gradients */}
                    <defs>
                      <radialGradient id={`grad-${el.key}`} cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                        <stop offset="50%" stopColor={el.color} />
                        <stop offset="100%" stopColor="black" stopOpacity="0.6" />
                      </radialGradient>
                    </defs>
                  </g>
                );
              })}
              
              {/* Central Core */}
              <circle cx="200" cy="200" r="10" fill="white" className="blur-md opacity-50" />
            </svg>
          </div>

          {/* Element Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full mt-16">
            {mandalaElements.map((el) => {
              const count = elements[el.key as keyof typeof elements] || 0;
              const percentage = Math.round((count / totalElements) * 100);
              
              return (
                <div key={el.key} className="glass p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
                  <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: el.color, boxShadow: `0 0 10px ${el.color}` }} />
                  <span className="text-xs font-mystic text-accent/60 mb-1">{el.key.toUpperCase()}</span>
                  <span className="text-sm font-bold text-white mb-2">{percentage}%</span>
                  <span className="text-[10px] opacity-40 leading-tight">{el.desc}</span>
                </div>
              );
            })}
          </div>

          <div className="w-full mt-10 p-6 border border-accent/10 bg-accent/5 rounded-3xl">
            <p className="text-base md:text-lg font-mystic text-accent/70 leading-relaxed text-center">
              <span className="text-accent font-bold">기운의 조화 :</span>{' '}
              {Object.entries(elements)
                .filter(([_, v]) => v === 0)
                .map(([k, _]) => k.toUpperCase())
                .join(', ') ? (
                  `${Object.entries(elements)
                    .filter(([_, v]) => v === 0)
                    .map(([k, _]) => k.toUpperCase())
                    .join(', ')} 기운이 부족하나, 다른 기운들이 이를 보완하고 있습니다.`
                ) : '오행이 고루 분포되어 조화로운 흐름을 보이고 있습니다.'}
            </p>
          </div>
        </div>

        {/* Bottom: Radar Chart & Bagua (Hidden in PDF) */}
        <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-md flex flex-col items-center no-export">
          <h2 className="text-2xl font-mystic mb-6 text-accent/80 flex items-center gap-3 self-start">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            천기(天氣) 밸런스 분석
          </h2>
          
          <div className="relative flex items-center justify-center w-full max-w-[500px] aspect-square">
            {/* Central Bagua Diagram */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 flex items-center justify-center opacity-40 no-export"
            >
              <div className="relative w-full h-full max-w-[450px] max-h-[450px]">
                <img id="saju-bagua-image" src="/assets/saju-bagua.png" alt="Bagua" className="w-full h-full object-contain animate-[spin_80s_linear_infinite]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-transparent" />
              </div>
            </motion.div>

            {/* Radar Chart Overlay */}
            <div className="relative z-10 w-full h-full p-4 md:p-8">
              <svg viewBox="0 0 380 380" className="w-full h-full drop-shadow-[0_0_30px_rgba(241,229,172,0.2)]">
                {/* Background Hexagons */}
                {[1, 0.8, 0.6, 0.4, 0.2].map((scale) => {
                  const points = radarCategories.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / radarCategories.length - Math.PI / 2;
                    const r = 110 * scale;
                    return `${190 + r * Math.cos(angle)},${190 + r * Math.sin(angle)}`;
                  }).join(' ');
                  return (
                    <polygon key={scale} points={points} fill="none" stroke="rgba(241,229,172,0.15)" strokeWidth="1" />
                  );
                })}
                
                {/* Axis Lines */}
                {radarCategories.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / radarCategories.length - Math.PI / 2;
                  return (
                    <line 
                      key={i} 
                      x1="190" y1="190" 
                      x2={190 + 110 * Math.cos(angle)} 
                      y2={190 + 110 * Math.sin(angle)} 
                      stroke="rgba(241,229,172,0.15)" 
                      strokeWidth="1" 
                    />
                  );
                })}

                {/* Data Polygon */}
                <motion.polygon 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.65, scale: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  points={radarCategories.map((cat, i) => {
                    const angle = (Math.PI * 2 * i) / radarCategories.length - Math.PI / 2;
                    const score = fortuneScores[cat.key] / 100;
                    const r = 110 * score;
                    return `${190 + r * Math.cos(angle)},${190 + r * Math.sin(angle)}`;
                  }).join(' ')} 
                  fill="url(#radarGradient)" 
                  stroke="#2dd4bf" 
                  strokeWidth="2.5" 
                />
                
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Labels with Background Pills for Maximum Visibility */}
                {radarCategories.map((cat, i) => {
                  const angle = (Math.PI * 2 * i) / radarCategories.length - Math.PI / 2;
                  const r = 145; // Moved out slightly in the larger canvas
                  const x = 190 + r * Math.cos(angle);
                  const y = 190 + r * Math.sin(angle);
                  
                  // Calculate dynamic width based on text length
                  const labelWidth = cat.label.length * 16 + 24;
                  
                  return (
                    <g key={cat.key}>
                      <rect 
                        x={x - labelWidth / 2} 
                        y={y - 14} 
                        width={labelWidth} 
                        height="28" 
                        rx="14" 
                        fill="rgba(5, 8, 16, 0.95)" 
                        className="stroke-accent/40 stroke-[1px]"
                      />
                      <text 
                        x={x} y={y} 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="#f1e5ac" 
                        className="text-[14px] md:text-[16px] font-mystic font-bold"
                      >
                        {cat.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* PDF Export Only: Simple Score List (Hidden in Web View) */}
        <div className="hidden export-only mt-10 p-10 bg-black/40 border border-accent/30 rounded-[2rem]">
          <h2 className="text-2xl font-mystic mb-8 text-accent text-center tracking-widest">천기 밸런스 상세 분석</h2>
          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            {radarCategories.map((cat) => (
              <div key={cat.key} className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-base opacity-70 font-mystic">{cat.label}</span>
                <span className="text-xl font-bold text-accent">{fortuneScores[cat.key]}점</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Luck Wave Chart */}
      <div className="mt-12 glass p-8 rounded-3xl border border-white/5 bg-white/5">
        <h2 className="text-xl font-mystic mb-10 text-accent/80 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent rounded-full" />
          생애 운세 파동 (100년 트렌드)
        </h2>

        <div className="w-full h-40 relative">
          <svg viewBox="0 0 800 160" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f1e5ac" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f1e5ac" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Grid lines (Hidden in PDF for clean look) */}
            <g className="no-export">
              {[0, 0.5, 1].map((p) => (
                <line key={p} x1="0" y1={140 * p + 10} x2="800" y2={140 * p + 10} stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
              ))}
            </g>

            {/* Path Fill */}
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              d={getWavePath(luckWave, 800, 160) + " V 160 H 0 Z"} 
              fill="url(#waveGradient)" 
            />

            {/* Main Path */}
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              d={getWavePath(luckWave, 800, 160)} 
              fill="none" 
              stroke="#f1e5ac" 
              strokeWidth="2" 
              strokeLinecap="round"
            />

            {/* Labels and Points */}
            {luckWave.map((p, i) => {
              const x = 20 + (i / (luckWave.length - 1)) * 760;
              const y = 140 - (p.value / 100) * 120;
              const isCurrent = Math.abs(p.year - new Date().getFullYear()) < 6;
              
              return (
                <g key={p.year}>
                  {isCurrent && (
                    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 }}>
                       <circle cx={x} cy={y} r="4" fill="#f1e5ac" className="drop-shadow-[0_0_8px_rgba(241,229,172,0.8)]" />
                       <text x={x} y={y - 14} textAnchor="middle" fill="#f1e5ac" className="text-[11px] font-bold">현재</text>
                    </motion.g>
                  )}
                  <text x={x} y="158" textAnchor="middle" fill="white" className="text-[9px] opacity-30">{p.year}년</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <style jsx>{`
        .glass {
          background: rgba(255, 255, 255, 0.03);
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  );
};
