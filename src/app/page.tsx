'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateSaju } from '@/lib/saju';
import { getShuffledDeck } from '@/lib/tarot';
import { exportToPDF } from '@/lib/export';
import ReactMarkdown from 'react-markdown';
import { Navigation } from '@/components/Navigation';
import { interpretWithGemini } from '@/lib/geminiClient';

// Jay Dosa Introduction text is rendered directly in the component.

interface SajuData {
  palja: string[];
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
}

interface TarotCard {
  id: number;
  name: string;
  meaning: string;
}

type Step = 'input' | 'saju_report' | 'tarot_picking' | 'final_report';

const ELEMENT_COLORS: Record<string, string> = {
  wood: 'bg-green-600',
  fire: 'bg-red-600',
  earth: 'bg-yellow-700',
  metal: 'bg-gray-400',
  water: 'bg-blue-700'
};

// Custom component for the Hanji unfolding effect
function MinhwaCard({ card, index, isFlipped = false, onClick, isSelected = false }: { 
  card?: TarotCard, 
  index: number, 
  isFlipped?: boolean, 
  onClick?: () => void,
  isSelected?: boolean 
}) {
  return (
    <motion.div
      className="relative w-full aspect-[2/3] cursor-pointer preserve-3d"
      whileHover={!isSelected ? { y: -10, scale: 1.05 } : {}}
      onClick={onClick}
      initial={false}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.7, type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Front of the card (Facedown/Hanji Back) */}
      <div className={`absolute inset-0 backface-hidden rounded-xl border-2 transition-all duration-500 overflow-hidden ${
        isSelected ? 'border-accent shadow-[0_0_25px_rgba(212,175,55,0.6)]' : 'border-white/10 bg-[#1a1630]'
      }`}>
        <div className="absolute inset-4 border border-accent/20 rounded-lg flex flex-col items-center justify-center">
          <div className="text-2xl text-accent/30 mb-2">✨</div>
          <div className="text-[8px] uppercase tracking-[0.3em] text-accent/20 font-bold">Mystic Oracle</div>
        </div>
        {isSelected && (
          <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
             <div className="text-background font-black text-2xl">{index + 1}</div>
          </div>
        )}
      </div>

      {/* Back of the card (Faceup/Minhwa Image) */}
      <div className="absolute inset-0 backface-hidden rounded-xl border-2 border-accent/40 overflow-hidden rotate-y-180 bg-white">
         {card && (
           <img 
             src={`/assets/tarot/card_${card.id}.png`} 
             alt={card.name}
             className="w-full h-full object-cover"
             onError={(e) => {
               (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=Minhwa+Tarot';
             }}
           />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
         {card && (
           <div className="absolute bottom-2 left-0 right-0 text-center">
             <div className="text-[10px] font-mystic text-accent drop-shadow-md">{card.name}</div>
           </div>
         )}
      </div>
    </motion.div>
  );
}

// Custom component for the mystical ritual loading animation
function DosaLoadingOverlay({ message }: { message: string }) {
  const charms = Array.from({ length: 12 });
  const loadingPhrases = [
    "어허, 천기가 기묘하게 얽혀 있구만!",
    "흐음... 만파식적의 소리가 들리는가?",
    "잠시만 기다리게, 운명의 타래를 풀고 있으니.",
    "허허, 자네의 운명이 참으로 기운차구만!"
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);

  // Rotate phrases
  useState(() => {
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % loadingPhrases.length);
    }, 2500);
    return () => clearInterval(interval);
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-xl"
    >
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Rotating Bagua (팔괘) Background */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-20"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-accent">
            <path d="M50 5A45 45 0 1 0 50 95A45 45 0 1 0 50 5 M50 15A35 35 0 1 1 50 85A35 35 0 1 1 50 15" fillRule="evenodd" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
              <rect key={deg} x="48" y="5" width="4" height="15" transform={`rotate(${deg} 50 50)`} />
            ))}
          </svg>
        </motion.div>

        {/* Floating Charms (부적) */}
        {charms.map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 100, x: Math.random() * 200 - 100, opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{ 
              y: -300, 
              x: Math.random() * 400 - 200, 
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.8],
              rotate: 360 
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity, 
              delay: i * 0.4,
              ease: "easeOut"
            }}
            className="absolute w-8 h-12 bg-accent/40 rounded-sm border border-accent/60 flex items-center justify-center text-[6px] text-background font-bold p-1 overflow-hidden"
          >
            <div className="rotate-90 whitespace-nowrap">天命 • 運命</div>
          </motion.div>
        ))}

        {/* Jay Dosa Character (Jeon Woo-chi) */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
        >
          <img 
            src="/assets/jay-dosa.png" 
            alt="Jay Dosa" 
            className="w-48 h-48 rounded-full border-4 border-accent shadow-[0_0_50px_rgba(212,175,55,0.4)]"
          />
          <div className="absolute -inset-4 border-2 border-accent/20 rounded-full animate-ping" />
        </motion.div>
      </div>

      <div className="mt-12 text-center">
        <motion.p 
          key={phraseIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xl font-mystic text-accent mb-4 tracking-wider"
        >
          {loadingPhrases[phraseIdx]}
        </motion.p>
        <p className="text-sm opacity-40 uppercase tracking-[0.3em]">{message}</p>
      </div>
    </motion.div>
  );
}

const ZODIAC_SPRITES: Record<string, string> = {
  '子': 'rat', '丑': 'ox', '寅': 'tiger', '卯': 'rabbit',
  '辰': 'dragon', '巳': 'snake', '午': 'horse', '未': 'goat',
  '申': 'monkey', '酉': 'rooster', '戌': 'dog', '亥': 'pig'
};

const getZodiacByHour = (hourStr: string) => {
  if (!hourStr) return null;
  const h = parseInt(hourStr, 10);
  if (isNaN(h)) return null;
  
  if (h >= 23 || h < 1) return { icon: '🐀', hanja: '子(자)', sprite: 'rat' };
  if (h >= 1 && h < 3) return { icon: '🐂', hanja: '丑(축)', sprite: 'ox' };
  if (h >= 3 && h < 5) return { icon: '🐅', hanja: '寅(인)', sprite: 'tiger' };
  if (h >= 5 && h < 7) return { icon: '🐇', hanja: '卯(묘)', sprite: 'rabbit' };
  if (h >= 7 && h < 9) return { icon: '🐉', hanja: '辰(진)', sprite: 'dragon' };
  if (h >= 9 && h < 11) return { icon: '🐍', hanja: '巳(사)', sprite: 'snake' };
  if (h >= 11 && h < 13) return { icon: '🐎', hanja: '午(오)', sprite: 'horse' };
  if (h >= 13 && h < 15) return { icon: '🐐', hanja: '未(미)', sprite: 'goat' };
  if (h >= 15 && h < 17) return { icon: '🐒', hanja: '申(신)', sprite: 'monkey' };
  if (h >= 17 && h < 19) return { icon: '🐓', hanja: '酉(유)', sprite: 'rooster' };
  if (h >= 19 && h < 21) return { icon: '🐕', hanja: '戌(술)', sprite: 'dog' };
  if (h >= 21 && h < 23) return { icon: '🐖', hanja: '亥(해)', sprite: 'pig' };
  return null;
}

// 전통 창살 코너 격자 SVG 컴포넌트 (세로 완벽 중앙 정렬 최종 보정)
const LatticeCorner = () => (
  <div className="absolute left-0 top-[50%] -translate-y-[50%] w-[40px] h-[32px] pointer-events-none opacity-70">
    {/* 가로 선 */}
    <div className="absolute top-[16px] left-[8px] w-[24px] h-[1px] bg-accent/90" />
    {/* 세로 선 */}
    <div className="absolute top-0 bottom-0 left-[8px] w-[1px] bg-accent/90" />
    {/* 왼쪽 끝 틱 */}
    <div className="absolute top-[16px] left-[2px] w-[6px] h-[1px] bg-accent/90" />
  </div>
);

// 재사용 가능한 전통 스타일 폼 박스
const InputBox = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full rounded-xl border border-accent/40 bg-[#0a0e17]/90 backdrop-blur-xl transition-all focus-within:border-accent focus-within:bg-[#151a25] overflow-hidden shadow-[inset_0_0_20px_rgba(241,229,172,0.05)] flex items-center min-h-[64px] md:min-h-[74px] group px-4 md:px-8">
    <LatticeCorner />
    <div className="w-full flex items-center justify-between relative z-10">
      {children}
    </div>
  </div>
);

export default function Home() {

  const [step, setStep] = useState<Step>('input');
  const [birthData, setBirthData] = useState({ year: '', month: '', day: '', hour: '', minute: '' });
  const [sajuResult, setSajuResult] = useState<SajuData | null>(null);
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [sajuReport, setSajuReport] = useState('');
  const [finalReport, setFinalReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activePopSpirit, setActivePopSpirit] = useState<string | null>(null);
  const [prevZodiac, setPrevZodiac] = useState<string | null>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  // 1. Trigger spirit pop-out when both hour and minute are present and zodiac changes
  useEffect(() => {
    const h = birthData.hour?.trim() || '';
    const m = birthData.minute?.trim() || '';
    
    if (h !== '' && m !== '') {
      const zodiac = getZodiacByHour(h);
      if (zodiac && zodiac.sprite !== prevZodiac) {
        setPrevZodiac(zodiac.sprite);
        setActivePopSpirit(zodiac.sprite);
      }
    } else {
      // If either is empty, hide and reset
      setPrevZodiac(null);
      setActivePopSpirit(null);
    }
  }, [birthData.hour, birthData.minute, prevZodiac]);

  // 2. Automatically hide the spirit after a delay
  useEffect(() => {
    if (activePopSpirit) {
      const timer = setTimeout(() => {
        setActivePopSpirit(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activePopSpirit]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // YYYY-MM-DD
    if (!val) return;
    const [y, m, d] = val.split('-');
    setBirthData(prev => ({ ...prev, year: y, month: m, day: d }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // HH:mm
    if (!val) return;
    const [h, mi] = val.split(':');
    setBirthData(prev => ({ ...prev, hour: h, minute: mi }));
  };

  const handleSajuStart = async () => {
    const { year, month, day, hour, minute } = birthData;
    if (!year || !month || !day) {
      alert("생년월일(연, 월, 일)을 모두 입력해주세요!");
      return;
    }
    setLoading(true);
    
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    let dateStr = `${year}-${paddedMonth}-${paddedDay}`;
    
    if (hour && minute) {
      const paddedHour = hour.padStart(2, '0');
      const paddedMinute = minute.padStart(2, '0');
      dateStr += `T${paddedHour}:${paddedMinute}`;
    }

    const sajuData = calculateSaju(new Date(dateStr));
    setSajuResult(sajuData);
    try {
      const report = await interpretWithGemini('saju_only', sajuData, undefined, new Date().toLocaleDateString('ko-KR'));
      setSajuReport(report);
      setStep('saju_report');
    } catch (err: any) {
      console.error(err);
      if (err.message === 'API_KEY_MISSING') {
        alert('서버 측 .env.local 파일에 GEMINI_API_KEY가 등록되어 있지 않습니다. 관리자에게 문의하세요.');
      } else {
        alert('사주 해석 실패: ' + (err.message || '알 수 없는 오류'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToTarot = () => {
    setShuffledDeck(getShuffledDeck());
    setSelectedCards([]);
    setStep('tarot_picking');
  };

  const handlePickCard = (card: TarotCard) => {
    if (selectedCards.length >= 3) return;
    if (selectedCards.find(c => c.id === card.id)) return;
    setSelectedCards([...selectedCards, card]);
  };

  const getFinalInterpretation = async () => {
    if (selectedCards.length < 3) return;
    setLoading(true);
    try {
      const report = await interpretWithGemini('combined', sajuResult, selectedCards);
      setFinalReport(report);
      setStep('final_report');
    } catch (err: any) {
      console.error(err);
      if (err.message === 'API_KEY_MISSING') {
        alert('우측 상단의 설정 버튼(톱니바퀴)을 눌러 Gemini API 키를 먼저 입력해주세요.');
      } else {
        alert('최종 해석 실패: ' + (err.message || '알 수 없는 오류'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center min-h-screen">
      <Navigation />
      <AnimatePresence>
        {loading && <DosaLoadingOverlay message="천기를 읽는 중입니다..." />}
      </AnimatePresence>

      <header className="text-center mb-16">
        <motion.h1 
          className="text-6xl md:text-7xl font-light mb-4 tracking-[0.1em] text-accent font-cinzel drop-shadow-[0_0_15px_rgba(241,229,172,0.4)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          CHUNMYUNG <span className="font-mystic text-5xl md:text-6xl ml-2 align-baseline">(天命)</span>
        </motion.h1>
        <p className="mt-6 text-sm md:text-lg tracking-[0.3em] md:tracking-[0.5em] uppercase text-accent/80 font-cinzel font-light drop-shadow-md">
          The Destiny Code by Jay Dosa
        </p>
      </header>

      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.section 
            key="input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full flex flex-col items-center relative"
          >
            {/* Jay Dosa Character Image */}
            <div className="mb-8 relative flex justify-center group w-full mt-2">
               <div className="absolute inset-0 bg-neon/30 blur-[60px] rounded-full scale-[0.8] animate-pulse" />
               <motion.img 
                 src="/assets/jay-dosa.png" 
                 alt="Jay Dosa" 
                 className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-neon/50 shadow-[0_0_40px_rgba(0,229,255,0.7)] relative z-10"
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.2 }}
               />
            </div>

            {/* Spirit Pop-out Overlay */}
            <AnimatePresence mode="wait">
              {activePopSpirit && (
                <motion.div 
                  key={activePopSpirit}
                  initial={{ opacity: 0, scale: 0.2, y: 100, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0, 
                    x: 180, 
                    y: 120, 
                    filter: 'blur(15px)',
                    transition: { duration: 0.5, ease: "anticipate" }
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                >
                  <div className="relative">
                    {/* Mystical Glow Background */}
                    <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full scale-150 animate-pulse" />
                    <div className="absolute inset-0 border-2 border-accent/30 rounded-full animate-ping scale-110" />
                    
                    <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-accent shadow-[0_0_50px_rgba(241,229,172,0.5)] overflow-hidden bg-[#050810]">
                      <img 
                        src={`/assets/zodiac/${activePopSpirit}.png`} 
                        alt="Spirit" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-accent text-background px-6 py-1 rounded-full font-mystic text-xl font-bold shadow-lg"
                    >
                      {getZodiacByHour(birthData.hour || '')?.hanja}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <h2 className="text-4xl mb-6 font-mystic font-light text-accent decor-accent">Jay Dosa의 천명(天命) 지도</h2>
            <div className="mb-10 max-w-md mx-auto font-mystic font-light tracking-[0.1em] text-center leading-[2]">
              <span className="text-xl text-blue-50/90 inline-block">
                당신의 <span className="text-accent drop-shadow-[0_0_8px_rgba(241,229,172,0.6)]">운명에 새겨진 코드</span>,<br />
                Jay 도사가 <span className="text-accent drop-shadow-[0_0_8px_rgba(241,229,172,0.6)]">새롭게 해석</span>합니다.
              </span>
              <br />
              <span className="text-lg opacity-80 text-blue-50/90 inline-block mt-3">
                정해진 길 위에서 가장 당신다운 걸음을 제안할 겁니다.
              </span>
            </div>

            {/* Horizontal 2-Row Stacked Form Panel */}
            <div className="mt-12 w-full flex flex-col items-center">
              <div className="glass p-6 md:p-10 rounded-[2.5rem] border border-accent/20 w-full max-w-2xl shadow-[0_0_40px_rgba(241,229,172,0.05)] relative bg-[#050810]/50">
                <label className="block text-sm md:text-base uppercase tracking-[0.3em] mb-10 opacity-80 text-center font-bold flex items-center justify-center gap-3 font-mystic text-accent/80">
                  <span className="text-2xl drop-shadow-md">☯</span> 당신의 천기(天氣) 입력
                </label>
                
                <div className="flex flex-col gap-6">
                  {/* Date Form Row */}
                  <div className="w-full flex flex-col gap-2 relative">
                    <InputBox>
                      <div className="flex-1 flex items-center justify-center relative">
                        <input type="number" placeholder="연도 (YYYY)" min="0" onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                          className="w-[140px] md:w-[170px] bg-transparent text-center text-xl md:text-2xl font-mystic font-light outline-none tracking-[0.1em] placeholder:text-accent/30 text-accent"
                          value={birthData.year} onChange={(e) => setBirthData({ ...birthData, year: e.target.value })} />
                        <span className="opacity-60 mx-1 md:mx-4 text-2xl font-light font-sans text-accent">/</span>
                        <input type="number" placeholder="월 (MM)" min="1" onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                          className="w-[90px] md:w-[110px] bg-transparent text-center text-xl md:text-2xl font-mystic font-light outline-none tracking-[0.1em] placeholder:text-accent/30 text-accent"
                          value={birthData.month} onChange={(e) => setBirthData({ ...birthData, month: e.target.value })} />
                        <span className="opacity-60 mx-1 md:mx-4 text-2xl font-light font-sans text-accent">/</span>
                        <input type="number" placeholder="일 (DD)" min="1" onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                          className="w-[90px] md:w-[110px] bg-transparent text-center text-xl md:text-2xl font-mystic font-light outline-none tracking-[0.1em] placeholder:text-accent/30 text-accent"
                          value={birthData.day} onChange={(e) => setBirthData({ ...birthData, day: e.target.value })} />
                      </div>
                      
                      {/* Calendar Icon Right (clickable) */}
                      <div 
                        className="pl-4 text-accent/50 opacity-60 hover:opacity-100 hover:text-accent group-focus-within:opacity-100 transition-all cursor-pointer"
                        onClick={() => dateInputRef.current?.showPicker()}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {/* Hidden native input */}
                        <input 
                          type="date" 
                          ref={dateInputRef} 
                          className="absolute invisible w-0 h-0" 
                          onChange={handleDateChange} 
                        />
                      </div>
                    </InputBox>
                  </div>

                  {/* Time Form Row */}
                  <div className="w-full flex-col flex items-start gap-2">
                    <InputBox>
                      <div className="flex-1 flex items-center justify-center relative">
                        <input type="number" placeholder="시 (HH)" min="0" max="23" onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                          className="w-[100px] md:w-[120px] bg-transparent text-center text-xl md:text-2xl font-mystic font-light outline-none tracking-widest placeholder:text-accent/30 text-accent"
                          value={birthData.hour} onChange={(e) => setBirthData({ ...birthData, hour: e.target.value })} />
                        <span className="opacity-60 mx-1 md:mx-4 text-2xl font-light font-sans text-accent">:</span>
                        <input type="number" placeholder="분 (MM)" min="0" max="59" onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                          className="w-[110px] md:w-[130px] bg-transparent text-center text-xl md:text-2xl font-mystic font-light outline-none tracking-widest placeholder:text-accent/30 text-accent"
                          value={birthData.minute} onChange={(e) => setBirthData({ ...birthData, minute: e.target.value })} />
                      </div>
                      
                      {/* Zodiac or Clock Icon Right (clickable) */}
                      <div 
                        className="pl-4 ml-2 border-l border-accent/20 min-w-[40px] flex items-center justify-center cursor-pointer group/icon"
                        onClick={() => timeInputRef.current?.showPicker()}
                      >
                        {/* Show zodiac icon only when BOTH hour and minute are entered */}
                        {birthData.hour && birthData.minute && getZodiacByHour(birthData.hour) ? (
                          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1.5 md:gap-2">
                            <div className="w-8 h-8 rounded-full border border-accent/20 overflow-hidden bg-black/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                              <img 
                                src={`/assets/zodiac/${getZodiacByHour(birthData.hour)?.sprite}.png`} 
                                alt="Zodiac"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const textNode = document.createTextNode(getZodiacByHour(birthData.hour)?.icon || '');
                                  (e.target as HTMLImageElement).parentNode?.appendChild(textNode);
                                }}
                              />
                            </div>
                            <span className="hidden sm:inline text-xs md:text-sm font-mystic text-accent shadow-sm">{getZodiacByHour(birthData.hour)?.hanja}</span>
                          </motion.div>
                        ) : (
                          <div className="text-accent/50 opacity-60 group-hover/icon:opacity-100 group-hover/icon:text-accent transition-all">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          </div>
                        )}
                        {/* Hidden native input */}
                        <input 
                          type="time" 
                          ref={timeInputRef} 
                          className="absolute invisible w-0 h-0" 
                          onChange={handleTimeChange} 
                        />
                      </div>
                    </InputBox>
                  </div>
                </div>
                
              </div>

              <button onClick={handleSajuStart} disabled={loading} className="w-full max-w-xl bg-neon text-white font-sans font-bold tracking-[0.2em] py-5 md:py-6 rounded-full drop-shadow-[0_4px_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_40px_rgba(0,229,255,0.7)] hover:bg-[#00d0ff] active:scale-95 transition-all text-lg md:text-xl mt-12 mb-8 mx-auto relative overflow-hidden group">
                <span className="relative z-10">{loading ? 'ANALYZING...' : 'START MY DESTINY ANALYSIS'}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </motion.section>
        )}

        {step === 'saju_report' && sajuResult && (
          <motion.section key="saju_report" id="saju-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-12">
            <div className="glass p-12 rounded-[3rem] border-accent/20">
              <h2 className="text-4xl mb-12 font-mystic text-center decor-accent">사주 오행의 기운</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-16 px-4">
                {sajuResult.palja.map((char, index) => (
                  <div key={index} className={`p-4 rounded-xl text-center border shadow-lg transition-all ${
                    index % 2 === 1 ? 'bg-accent/5 border-accent/20' : 'bg-white/5 border-white/10'
                  }`}>
                    {index % 2 === 1 && ZODIAC_SPRITES[char] ? (
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full border-2 border-accent/30 overflow-hidden bg-black/40 shadow-[0_0_15px_rgba(241,229,172,0.2)] group relative">
                        <img 
                          src={`/assets/zodiac/${ZODIAC_SPRITES[char]}.png`} 
                          alt={char}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-xl font-mystic text-accent font-bold">{char}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-3xl font-mystic text-accent mb-2">{char}</div>
                    )}
                    <div className="text-[8px] opacity-30 uppercase tracking-tighter">
                      {['Year', 'Month', 'Day', 'Hour'][Math.floor(index/2)]} {index % 2 === 0 ? 'Top' : 'Bottom'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-6 mb-16 px-8">
                {Object.entries(sajuResult.elements).map(([el, val]) => (
                  <div key={el} className="flex flex-col items-center">
                    <div className="w-full bg-white/5 rounded-full h-36 relative overflow-hidden mb-3 border border-white/10">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${(val / 8) * 100}%` }} className={`absolute bottom-0 w-full ${ELEMENT_COLORS[el]} opacity-60`} />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">{el}</span>
                  </div>
                ))}
              </div>

              <div className="prose prose-invert max-w-none bg-white/5 p-10 rounded-[2rem] border border-white/5 shadow-inner leading-relaxed text-blue-100/90 report-content">
                <ReactMarkdown>{sajuReport}</ReactMarkdown>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <button onClick={handleGoToTarot} className="flex-[2] bg-accent text-background font-black py-5 rounded-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2">
                  🃏 민화 타로 카드로 더 깊은 조언 얻기
                </button>
                <button onClick={() => setStep('input')} className="flex-1 bg-white/5 py-5 rounded-2xl hover:bg-white/10 transition-all font-bold opacity-60">종료</button>
              </div>
            </div>
          </motion.section>
        )}

        {step === 'tarot_picking' && (
          <motion.section key="tarot_pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-center flex flex-col items-center">
            <h2 className="text-4xl mb-6 font-mystic italic tracking-[0.2em] text-accent decor-accent">DIVINE CHOICE</h2>
            <p className="opacity-60 mb-12 max-w-lg leading-relaxed">
              마음을 비우고, 민화 속 호랑이와 까치가 전하는 소리에 귀를 기울이세요.<br/>
              운명이 이끄는 대로 3장의 한지를 선택해 주세요.
            </p>
            
            <div className="flex gap-4 mb-20 h-28 items-center justify-center w-full">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-16 h-24 rounded-xl border-2 transition-all flex items-center justify-center font-black text-2xl ${
                  selectedCards[i] ? 'bg-accent border-accent text-background shadow-[0_0_30px_rgba(212,175,55,0.4)]' : 'border-white/10 bg-white/5 text-white/10'
                }`}>
                  {selectedCards[i] ? i + 1 : '？'}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-4 mb-20 p-8 glass rounded-[3rem] border-accent/20 w-full max-w-5xl">
              {shuffledDeck.map((card, idx) => (
                <MinhwaCard 
                  key={idx} 
                  index={selectedCards.indexOf(card)} 
                  isSelected={!!selectedCards.find(c => c.id === card.id)}
                  onClick={() => handlePickCard(card)} 
                />
              ))}
            </div>

            <button onClick={getFinalInterpretation} disabled={selectedCards.length < 3 || loading} className="px-16 py-6 bg-accent text-background font-black rounded-full disabled:opacity-20 transition-all hover:scale-110 active:scale-95 shadow-[0_20px_40px_rgba(212,175,55,0.3)] text-xl">
              {loading ? '신령의 계시를 받는 중...' : '최종 통합 예언 보기'}
            </button>
          </motion.section>
        )}

        {step === 'final_report' && (
          <motion.section key="final_report" id="report-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-12">
            <div className="glass p-12 rounded-[4rem] border-accent shadow-[0_60px_100px_rgba(0,0,0,0.7)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px]" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px]" />

              <h2 className="text-5xl mb-20 font-mystic text-center decor-accent leading-tight">민화가 들려주는<br/>당신의 천명</h2>
              
              <div className="flex flex-col md:flex-row gap-10 justify-center mb-20">
                {selectedCards.map((card, idx) => (
                  <div key={idx} className="flex-1 max-w-[200px]">
                    <MinhwaCard card={card} index={idx} isFlipped={true} />
                    <div className="text-center mt-4">
                      <div className="text-sm font-mystic text-accent mb-1">{card.name}</div>
                      <div className="text-[10px] opacity-30 uppercase tracking-widest">{['과거', '현재', '미래'][idx]}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="prose prose-invert max-w-none p-12 bg-black/40 rounded-[3rem] border border-white/5 backdrop-blur-md leading-[1.9] text-lg font-light text-blue-50/90 shadow-2xl report-content">
                <ReactMarkdown>{finalReport}</ReactMarkdown>
              </div>

              <div className="mt-20 flex flex-col sm:flex-row gap-6 pt-12 border-t border-white/10">
                <button 
                  onClick={async () => {
                    setIsExporting(true);
                    try {
                      await exportToPDF('report-section', 'minhwa-oracle-report.pdf');
                    } catch (err) {
                      console.error(err);
                      alert('PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                    } finally {
                      setIsExporting(false);
                    }
                  }} 
                  disabled={isExporting}
                  className={`flex-[2] bg-gradient-to-r from-accent to-yellow-600 text-background font-black py-5 rounded-[1.5rem] hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isExporting ? '운명서 생성 중...' : '민화 예언서 PDF 저장'}
                </button>
                <button onClick={() => setStep('input')} className="flex-1 bg-white/5 py-5 rounded-[1.5rem] hover:bg-white/10 transition-all font-bold opacity-60">다시 보기</button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="mt-20 py-12 border-t border-white/5 w-full text-center">
        <p className="text-[10px] opacity-20 tracking-[0.5em] uppercase mb-4 italic">Tradition Meets Future • Stateless Minhwa Oracle</p>
        <div className="text-accent/20 text-2xl">✦ ✧ ✺ ✧ ✦</div>
      </footer>

      {/* Tailwind helper for 3D transforms */}
      <style jsx global>{`
        .preserve-3d { transform-style: preserve-3d; transition: transform 0.6s; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </main>
  );
}
