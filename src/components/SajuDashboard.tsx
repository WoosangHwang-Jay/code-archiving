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
          {userName}님의 사주 총운
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Elements */}
        <div className="glass p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md">
          <h2 className="text-xl font-mystic mb-8 text-accent/80 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            오행 분포 현황
          </h2>
          
          <div className="space-y-6">
            {(Object.keys(ELEMENT_MAP) as Array<keyof typeof ELEMENT_MAP>).map((key) => {
              const count = elements[key];
              const percentage = Math.round((count / totalElements) * 100);
              const config = ELEMENT_MAP[key];
              
              return (
                <div key={key} className="relative group">
                  <div className="flex justify-between items-end mb-2">
                    <span className={`font-mystic ${config.text} text-sm md:text-base`}>{config.label}</span>
                    <span className="text-xs opacity-50">{percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${config.bar}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-4 border border-accent/10 bg-accent/5 rounded-2xl">
            <p className="text-sm font-mystic text-accent/60 leading-relaxed">
              <span className="text-accent font-bold">부족한 기운 :</span>{' '}
              {Object.entries(elements)
                .filter(([_, v]) => v === 0)
                .map(([k, _]) => ELEMENT_MAP[k as keyof typeof ELEMENT_MAP].label)
                .join(', ') || '오행이 고루 분포되어 있습니다.'}
            </p>
          </div>
        </div>

        {/* Right Column: Radar Chart & Bagua */}
        <div className="relative flex items-center justify-center min-h-[400px]">
          {/* Central Bagua Diagram */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center opacity-40"
          >
            <div className="relative w-full h-full max-w-[400px] max-h-[400px]">
              <img id="saju-bagua-image" src="/assets/saju-bagua.png" alt="Bagua" className="w-full h-full object-contain animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Radar Chart Overlay */}
          <div className="relative z-10 w-full max-w-[350px]">
            <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_20px_rgba(241,229,172,0.3)]">
              {/* Background Hexagons */}
              {[1, 0.8, 0.6, 0.4, 0.2].map((scale) => {
                const points = radarCategories.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / radarCategories.length - Math.PI / 2;
                  const r = 120 * scale;
                  return `${150 + r * Math.cos(angle)},${150 + r * Math.sin(angle)}`;
                }).join(' ');
                return (
                  <polygon key={scale} points={points} fill="none" stroke="rgba(241,229,172,0.1)" strokeWidth="1" />
                );
              })}
              
              {/* Axis Lines */}
              {radarCategories.map((_, i) => {
                const angle = (Math.PI * 2 * i) / radarCategories.length - Math.PI / 2;
                return (
                  <line 
                    key={i} 
                    x1="150" y1="150" 
                    x2={150 + 120 * Math.cos(angle)} 
                    y2={150 + 120 * Math.sin(angle)} 
                    stroke="rgba(241,229,172,0.1)" 
                    strokeWidth="1" 
                  />
                );
              })}

              {/* Data Polygon */}
              <motion.polygon 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                points={getRadarPoints(fortuneScores, 300)} 
                fill="url(#radarGradient)" 
                stroke="#f1e5ac" 
                strokeWidth="2" 
              />
              
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f1e5ac" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Labels */}
              {radarCategories.map((cat, i) => {
                const angle = (Math.PI * 2 * i) / radarCategories.length - Math.PI / 2;
                const r = 140;
                const x = 150 + r * Math.cos(angle);
                const y = 150 + r * Math.sin(angle);
                return (
                  <text 
                    key={cat.key} 
                    x={x} y={y} 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fill="#f1e5ac" 
                    className="text-[10px] uppercase font-mystic opacity-70"
                  >
                    {cat.label}
                  </text>
                );
              })}
            </svg>
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
            
            {/* Grid lines */}
            {[0, 0.5, 1].map((p) => (
              <line key={p} x1="0" y1={140 * p + 10} x2="800" y2={140 * p + 10} stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
            ))}

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
                       <circle cx={x} cy={y} r="6" fill="#f1e5ac" className="animate-ping opacity-50" />
                       <circle cx={x} cy={y} r="4" fill="#f1e5ac" />
                       <text x={x} y={y - 12} textAnchor="middle" fill="#f1e5ac" className="text-[10px] font-bold">현재</text>
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
