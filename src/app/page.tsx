'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateSaju } from '@/lib/saju';
import { getShuffledDeck } from '@/lib/tarot';
import { exportToPDF } from '@/lib/export';
import ReactMarkdown from 'react-markdown';
import { Navigation } from '@/components/Navigation';
import { interpretWithGemini } from '@/lib/geminiClient';
import { SajuDashboard } from '@/components/SajuDashboard';

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

type Step = 'input' | 'saju_report' | 'tarot_picking' | 'tarot_revealing' | 'final_report';

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
      className="relative w-full h-full aspect-[2/3] cursor-pointer preserve-3d"
      whileHover={onClick && !isSelected ? { y: -10, scale: 1.05 } : {}}
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
function DosaLoadingOverlay({ message, mode = 'saju' }: { message: string, mode?: 'saju' | 'tarot' }) {
  const sajuPhrases = [
    "생년월일 데이터 퀀텀 파싱 중...",
    "사주팔자 만세력 코드 추출...",
    "오행(木火土金水) 에너지 밸런스 측정...",
    "격국 및 용신 정밀 알고리즘 연산...",
    "천명(天命) 지도 동기화 중...",
    "Jay 도사의 영적 직관 필터 적용...",
    "운명의 타임라인 시뮬레이션...",
    "대운과 세운의 흐름 데이터 가공...",
    "잠재된 기운 스캐닝...",
    "최종 천명(天命) 보고서 렌더링 중..."
  ];

  const tarotPhrases = [
    "민화 속 상징물과 교감 중...",
    "카드의 이미지를 현재와 연결 중...",
    "과거, 현재, 미래의 영적 실타래 분석...",
    "선택하신 카드의 신비로운 의미 연산 중...",
    "Jay 도사의 영적 직관 필터 적용...",
    "한지 속에 숨은 우주의 비밀 추출 중...",
    "운명의 카드가 전하는 메시지 수신 중...",
    "인연과 타이밍의 퀀텀 매칭...",
    "영적 주파수 튜닝 중...",
    "민화 타로의 신비로운 계시 분석 중..."
  ];

  const loadingPhrases = mode === 'tarot' ? tarotPhrases : sajuPhrases;
  
  const sajuElements = [
    { char: '木', label: 'Wood' },
    { char: '火', label: 'Fire' },
    { char: '土', label: 'Earth' },
    { char: '金', label: 'Metal' },
    { char: '水', label: 'Water' }
  ];

  const tarotElements = [
    { char: '🔮', label: 'Oracle' },
    { char: '🃏', label: 'Card' },
    { char: '✨', label: 'Spirit' },
    { char: '🌙', label: 'Moon' },
    { char: '☀️', label: 'Sun' }
  ];

  const elements = mode === 'tarot' ? tarotElements : sajuElements;
  
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [activeElementIdx, setActiveElementIdx] = useState(0);

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % loadingPhrases.length);
    }, 2000);
    
    const elementInterval = setInterval(() => {
      setActiveElementIdx((prev) => (prev + 1) % elements.length);
    }, 600);
    
    return () => {
      clearInterval(phraseInterval);
      clearInterval(elementInterval);
    };
  }, [loadingPhrases.length, elements.length]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050810]/95 backdrop-blur-2xl"
    >
      <div className="relative flex flex-col items-center">
        {/* Background Aura */}
        <div className="absolute inset-0 bg-accent/5 blur-[120px] rounded-full scale-150" />
        
        {/* Five Elements Sequential Animation */}
        <div className="flex gap-6 md:gap-10 mb-16 relative z-10">
          {elements.map((el, i) => (
            <div key={el.char} className="flex flex-col items-center">
              <motion.span
                animate={{ 
                  color: i === activeElementIdx ? "#f1e5ac" : "rgba(241, 229, 172, 0.15)",
                  scale: i === activeElementIdx ? 1.4 : 1,
                  textShadow: i === activeElementIdx ? "0 0 25px rgba(241, 229, 172, 0.6)" : "none"
                }}
                transition={{ duration: 0.4 }}
                className="text-4xl md:text-5xl font-mystic cursor-default"
              >
                {el.char}
              </motion.span>
              <motion.span 
                animate={{ opacity: i === activeElementIdx ? 0.4 : 0 }}
                className="text-[8px] uppercase tracking-widest mt-2 text-accent font-bold"
              >
                {el.label}
              </motion.span>
            </div>
          ))}
        </div>

        {/* Progress Ring or Subtle Divider */}
        <div className="w-64 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent mb-12" />

        <div className="text-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.p 
              key={phraseIdx}
              initial={{ opacity: 0, y: 10, color: "#e0d7ff" }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                color: ["#e0d7ff", "#f1e5ac", "#e0d7ff"] 
              }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                color: { duration: 2, repeat: Infinity },
                opacity: { duration: 0.5 },
                y: { duration: 0.5 }
              }}
              className="text-xl md:text-2xl font-mystic text-accent mb-4 tracking-[0.1em]"
            >
              {loadingPhrases[phraseIdx]}
            </motion.p>
          </AnimatePresence>
          <p className="text-[10px] md:text-xs opacity-30 uppercase tracking-[0.4em] font-cinzel">{message}</p>
        </div>
      </div>

      {/* Traditional Corner Accents in Loading Screen */}
      <div className="absolute top-12 left-12 w-12 h-12 border-t-2 border-l-2 border-accent/10 rounded-tl-3xl" />
      <div className="absolute bottom-12 right-12 w-12 h-12 border-b-2 border-r-2 border-accent/10 rounded-br-3xl" />
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
const InputBox = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative w-full rounded-xl border border-accent/40 bg-[#0a0e17]/90 backdrop-blur-xl transition-all focus-within:border-accent focus-within:bg-[#151a25] overflow-hidden shadow-[inset_0_0_20px_rgba(241,229,172,0.05)] flex items-center min-h-[64px] md:min-h-[74px] group px-4 md:px-8 ${className}`}>
    <LatticeCorner />
    <div className="w-full flex items-center justify-between relative z-10">
      {children}
    </div>
  </div>
);

export default function Home() {

  const [step, setStep] = useState<Step>('input');
  const [birthData, setBirthData] = useState({ 
    year: '', 
    month: '', 
    day: '', 
    hour: '', 
    minute: '',
    gender: 'male' as 'male' | 'female',
    isLunar: false
  });
  const [sajuResult, setSajuResult] = useState<SajuData | null>(null);
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [sajuReport, setSajuReport] = useState('');
  const [finalReport, setFinalReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activePopSpirit, setActivePopSpirit] = useState<string | null>(null);
  const [revealingIndex, setRevealingIndex] = useState(0);
  const [shuffleStatus, setShuffleStatus] = useState<'idle' | 'shuffling' | 'dealt'>('idle');
  const [dealtCards, setDealtCards] = useState<TarotCard[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
  
  // 3. Card Revelation Sequence Logic
  useEffect(() => {
    if (step === 'tarot_revealing') {
      if (revealingIndex < 3) {
        const timer = setTimeout(() => {
          setRevealingIndex(prev => prev + 1);
        }, 2000); // 1s for flip animation + 1s for stay = 2s total cycle
        return () => clearTimeout(timer);
      } else {
        // All cards revealed, fetch interpretation
        getFinalInterpretation();
      }
    }
  }, [step, revealingIndex]);

  // 2. Automatically hide the spirit after a delay
  useEffect(() => {
    if (activePopSpirit) {
      const timer = setTimeout(() => {
        setActivePopSpirit(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activePopSpirit]);

  const validateField = (name: string, value: string) => {
    const num = parseInt(value);
    if (!value) return "";

    switch (name) {
      case 'year':
        if (num < 1900 || num > 2100) return "1900~2100년 사이 입력";
        break;
      case 'month':
        if (num < 1 || num > 12) return "1~12월 사이 입력";
        break;
      case 'day':
        const year = parseInt(birthData.year) || 2024;
        const month = parseInt(birthData.month) || 1;
        const maxDays = new Date(year, month, 0).getDate();
        if (num < 1 || num > maxDays) return `${month}월은 1~${maxDays}일까지입니다.`;
        break;
      case 'hour':
        if (num < 0 || num > 23) return "0~23시 입력";
        break;
      case 'minute':
        if (num < 0 || num > 59) return "0~59분 입력";
        break;
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, name === 'year' ? 4 : 2);
    setBirthData({ ...birthData, [name]: numericValue });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m, d] = val.split('-');
    setBirthData(prev => ({ ...prev, year: y, month: m, day: d }));
    setErrors(prev => ({ ...prev, year: "", month: "", day: "" }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [h, mi] = val.split(':');
    setBirthData(prev => ({ ...prev, hour: h, minute: mi }));
    setErrors(prev => ({ ...prev, hour: "", minute: "" }));
  };

  const handleSajuStart = async () => {
    const newErrors: Record<string, string> = {};
    ['year', 'month', 'day'].forEach(key => {
      const val = (birthData as any)[key];
      const err = validateField(key, val);
      if (err) newErrors[key] = err;
      if (!val) newErrors[key] = "필수 입력";
    });

    if (Object.values(newErrors).some(err => err)) {
      setErrors(newErrors);
      alert("입력하신 정보를 다시 확인해주세요.");
      return;
    }

    setLoading(true);
    
    const { year, month, day, hour, minute } = birthData;
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
    setShuffleStatus('idle');
    setDealtCards([]);
    setSelectedCards([]);
    setStep('tarot_picking');
  };

  const handleShuffle = () => {
    setShuffleStatus('shuffling');
    // Simulate mysterious shuffling time
    setTimeout(() => {
      const fullDeck = getShuffledDeck();
      setDealtCards(fullDeck.slice(0, 12)); // Deal 12 cards
      setShuffleStatus('dealt');
    }, 1800);
  };

  const handlePickCard = (card: TarotCard) => {
    if (selectedCards.length >= 3) return;
    if (selectedCards.find(c => c.id === card.id)) return;
    setSelectedCards([...selectedCards, card]);
  };

  const startRevelation = () => {
    if (selectedCards.length < 3) return;
    setRevealingIndex(0);
    setStep('tarot_revealing');
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
        {loading && (
          <DosaLoadingOverlay 
            message={['tarot_picking', 'tarot_revealing', 'final_report'].includes(step) ? "운명의 실타래를 엮고 있습니다..." : "천기를 읽는 중입니다..."} 
            mode={['tarot_picking', 'tarot_revealing', 'final_report'].includes(step) ? 'tarot' : 'saju'} 
          />
        )}
      </AnimatePresence>

      <header className="text-center mb-16">
        <motion.h1 
          className="text-5xl md:text-7xl font-light mb-4 tracking-[0.1em] text-accent font-cinzel drop-shadow-[0_0_15px_rgba(241,229,172,0.4)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          CHUNMYUNG <span className="font-mystic text-4xl md:text-6xl ml-1 md:ml-2 align-baseline">(天命)</span>
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

            <h2 className="text-4xl md:text-5xl mb-8 font-mystic font-light text-accent decor-accent text-center leading-tight">
              Jay 도사의<br />
              천명(天命) 지도
            </h2>
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

            <div className="mt-12 w-full flex flex-col items-center">
              <div className="glass p-6 md:p-10 rounded-[2.5rem] border border-accent/20 w-full max-w-2xl shadow-[0_0_40px_rgba(241,229,172,0.05)] relative bg-[#050810]/50">
                <label className="block text-sm md:text-base uppercase tracking-[0.3em] mb-10 opacity-80 text-center font-bold flex items-center justify-center gap-3 font-mystic text-accent/80">
                  당신의 천기(天氣) 입력
                </label>
                
                <div className="flex flex-col gap-6">
                  {/* Date Form Row */}
                  <div className="w-full flex flex-col gap-2 relative">
                    <InputBox className={errors.year || errors.month || errors.day ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}>
                      <div className="flex-1 flex items-center justify-center relative gap-1 md:gap-0">
                        <input type="number" name="year" placeholder="YYYY" min="1900" max="2100"
                          className="w-[80px] sm:w-[140px] md:w-[170px] bg-transparent text-center text-lg sm:text-xl md:text-2xl font-mystic font-light outline-none tracking-tight sm:tracking-[0.1em] placeholder:text-accent/30 text-accent"
                          value={birthData.year} onChange={handleInputChange} onBlur={handleBlur} />
                        <span className="opacity-60 mx-0.5 md:mx-4 text-xl md:text-2xl font-light font-sans text-accent">/</span>
                        <input type="number" name="month" placeholder="MM" min="1" max="12"
                          className="w-[60px] sm:w-[90px] md:w-[110px] bg-transparent text-center text-lg sm:text-xl md:text-2xl font-mystic font-light outline-none tracking-tight sm:tracking-[0.1em] placeholder:text-accent/30 text-accent"
                          value={birthData.month} onChange={handleInputChange} onBlur={handleBlur} />
                        <span className="opacity-60 mx-0.5 md:mx-4 text-xl md:text-2xl font-light font-sans text-accent">/</span>
                        <input type="number" name="day" placeholder="DD" min="1" max="31"
                          className="w-[60px] sm:w-[90px] md:w-[110px] bg-transparent text-center text-lg sm:text-xl md:text-2xl font-mystic font-light outline-none tracking-tight sm:tracking-[0.1em] placeholder:text-accent/30 text-accent"
                          value={birthData.day} onChange={handleInputChange} onBlur={handleBlur} />
                      </div>
                      
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
                        <input 
                          type="date" 
                          ref={dateInputRef} 
                          className="absolute invisible w-0 h-0" 
                          onChange={handleDateChange} 
                        />
                      </div>
                    </InputBox>
                    {(errors.year || errors.month || errors.day) && (
                      <div className="text-red-400 text-xs mt-2 text-center font-mystic animate-pulse">
                        {errors.year || errors.month || errors.day}
                      </div>
                    )}
                  </div>

                  {/* Time Form Row */}
                  <div className="w-full flex-col flex items-start gap-2">
                    <InputBox className={errors.hour || errors.minute ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}>
                      <div className="flex-1 flex items-center justify-center relative gap-1 md:gap-0">
                        <input type="number" name="hour" placeholder="HH" min="0" max="23"
                          className="w-[70px] sm:w-[100px] md:w-[120px] bg-transparent text-center text-lg sm:text-xl md:text-2xl font-mystic font-light outline-none tracking-tight sm:tracking-widest placeholder:text-accent/30 text-accent"
                          value={birthData.hour} onChange={handleInputChange} onBlur={handleBlur} />
                        <span className="opacity-60 mx-1 md:mx-4 text-xl md:text-2xl font-light font-sans text-accent">:</span>
                        <input type="number" name="minute" placeholder="MM" min="0" max="59"
                          className="w-[70px] sm:w-[100px] md:w-[120px] bg-transparent text-center text-lg sm:text-xl md:text-2xl font-mystic font-light outline-none tracking-tight sm:tracking-widest placeholder:text-accent/30 text-accent"
                          value={birthData.minute} onChange={handleInputChange} onBlur={handleBlur} />
                      </div>
                      
                      <div 
                        className="pl-4 ml-2 border-l border-accent/20 min-w-[40px] flex items-center justify-center cursor-pointer group/icon"
                        onClick={() => timeInputRef.current?.showPicker()}
                      >
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
                        <input 
                          type="time" 
                          ref={timeInputRef} 
                          className="absolute invisible w-0 h-0" 
                          onChange={handleTimeChange} 
                        />
                      </div>
                    </InputBox>
                    {(errors.hour || errors.minute) && (
                      <div className="text-red-400 text-xs mt-2 text-center font-mystic animate-pulse">
                        {errors.hour || errors.minute}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10">
                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                    <button onClick={() => setBirthData({ ...birthData, gender: 'male' })} className={`px-8 py-2.5 rounded-xl text-sm font-mystic transition-all ${birthData.gender === 'male' ? 'bg-accent text-background font-bold shadow-lg' : 'text-accent/40 hover:text-accent/60'}`}>MALE (남)</button>
                    <button onClick={() => setBirthData({ ...birthData, gender: 'female' })} className={`px-8 py-2.5 rounded-xl text-sm font-mystic transition-all ${birthData.gender === 'female' ? 'bg-accent text-background font-bold shadow-lg' : 'text-accent/40 hover:text-accent/60'}`}>FEMALE (여)</button>
                  </div>
                  
                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                    <button onClick={() => setBirthData({ ...birthData, isLunar: false })} className={`px-8 py-2.5 rounded-xl text-sm font-mystic transition-all ${!birthData.isLunar ? 'bg-accent text-background font-bold shadow-lg' : 'text-accent/40 hover:text-accent/60'}`}>SOLAR (양)</button>
                    <button onClick={() => setBirthData({ ...birthData, isLunar: true })} className={`px-8 py-2.5 rounded-xl text-sm font-mystic transition-all ${birthData.isLunar ? 'bg-accent text-background font-bold shadow-lg' : 'text-accent/40 hover:text-accent/60'}`}>LUNAR (음)</button>
                  </div>
                </div>
              </div>

              <motion.button 
                onClick={handleSajuStart} 
                disabled={loading} 
                whileHover={{ scale: 1.02, boxShadow: "0 0 50px rgba(0, 229, 255, 0.6)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-xl bg-neon text-white font-myeongjo font-extrabold tracking-[0.15em] py-5 md:py-6 rounded-full drop-shadow-[0_4px_15px_rgba(0,229,255,0.3)] transition-all text-xl md:text-2xl mt-12 mb-8 mx-auto relative overflow-hidden group"
              >
                <span className="relative z-10">{loading ? '천기를 읽는 중...' : '나의 천명 읽기'}</span>
                
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-45 -translate-x-[200%] group-hover:animate-[shine_1.5s_infinite]"
                  initial={false}
                />
                
                <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-300 scale-0 group-active:scale-150 rounded-full" />
              </motion.button>
            </div>
          </motion.section>
        )}

        {step === 'saju_report' && sajuResult && (
          <motion.section key="saju_report" id="saju-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-12">
            {/* Premium Dashboard Visuals */}
            <SajuDashboard data={sajuResult as any} userName={birthData.year ? '당신' : '사용자'} />

            {/* Original Palja Display (Kept as secondary detail) */}
            <div className="glass p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-accent/20 bg-[#050810]/50 backdrop-blur-xl no-export">
              <h2 className="text-2xl mb-10 font-mystic text-center text-accent/60 italic tracking-widest flex items-center justify-center gap-4">
                <span className="h-[1px] w-8 bg-accent/20" />
                천간지지 팔자(八字) 상세
                <span className="h-[1px] w-8 bg-accent/20" />
              </h2>
              
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
            </div>

            {/* Enhanced Text Interpretation Rendering */}
            <div className="prose prose-invert max-w-none bg-black/40 p-5 md:p-10 rounded-[1.5rem] md:rounded-[3rem] border border-white/5 shadow-inner leading-[1.8] md:leading-[2.2] text-blue-50/90 report-content font-myeongjo text-base md:text-lg">
                <ReactMarkdown>{sajuReport}</ReactMarkdown>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 no-export">
                <button onClick={handleGoToTarot} className="flex-[2] bg-accent text-background font-black py-5 rounded-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2">
                  🃏 민화 타로 카드로 더 깊은 조언 얻기
                </button>
                <button 
                  onClick={async () => {
                    setIsExporting(true);
                    try {
                      await exportToPDF('saju-section', 'saju-dashboard-report.pdf');
                    } catch (err) {
                      console.error(err);
                      alert('PDF 생성 중 오류가 발생했습니다.');
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                  disabled={isExporting}
                  className="flex-1 bg-white/10 py-5 rounded-2xl hover:bg-white/20 transition-all font-bold flex items-center justify-center gap-2 border border-white/10"
                >
                  💾 {isExporting ? '저장 중...' : 'PDF 저장'}
                </button>
                <button onClick={() => setStep('input')} className="flex-1 bg-white/5 py-5 rounded-2xl hover:bg-white/10 transition-all font-bold opacity-60">종료</button>
              </div>
          </motion.section>
        )}

        {step === 'tarot_picking' && (
          <motion.section key="tarot_pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-center flex flex-col items-center">
            <h2 className="text-4xl mb-6 font-mystic italic tracking-[0.2em] text-accent decor-accent">DIVINE CHOICE</h2>
            
            <div className="relative w-full max-w-4xl min-h-[400px] flex items-center justify-center mb-12">
              <AnimatePresence mode="wait">
                {/* 1. Idle State: Show the deck */}
                {shuffleStatus === 'idle' && (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative w-40 h-60 mb-12">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute inset-0 rounded-xl border-2 border-accent/20 bg-[#1a1630] shadow-2xl" 
                          style={{ transform: `translate(${i * 2}px, ${-i * 2}px)`, zIndex: -i }}
                        />
                      ))}
                      <div className="absolute inset-0 rounded-xl border-2 border-accent/40 bg-[#1a1630] flex items-center justify-center shadow-[0_0_30px_rgba(241,229,172,0.2)]">
                        <span className="text-accent/30 text-4xl">✨</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleShuffle}
                      className="px-10 py-4 bg-accent text-background font-black rounded-full hover:shadow-[0_0_30px_rgba(241,229,172,0.5)] transition-all hover:scale-105 active:scale-95"
                    >
                      🃏 운명의 카드 셔플하기
                    </button>
                  </motion.div>
                )}

                {/* 2. Shuffling State: Dynamic Animation */}
                {shuffleStatus === 'shuffling' && (
                  <motion.div 
                    key="shuffling"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <div className="relative w-60 h-60">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            x: [0, (Math.random() - 0.5) * 300, 0],
                            y: [0, (Math.random() - 0.5) * 300, 0],
                            rotate: [0, Math.random() * 360, 0],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-1/2 left-1/2 -mt-20 -ml-12 w-24 h-40 rounded-lg border border-accent/30 bg-[#1a1630] shadow-xl"
                        />
                      ))}
                      <div className="absolute inset-0 flex items-center justify-center">
                         <p className="font-mystic text-accent text-2xl animate-pulse">천기를 섞는 중...</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. Dealt State: Show 12 cards in a spread */}
                {shuffleStatus === 'dealt' && (
                  <motion.div 
                    key="dealt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center w-full"
                  >
                    <p className="opacity-60 mb-12 max-w-lg leading-relaxed">
                      셔플된 카드 중에서 당신의 마음이 머무는 3장을 골라주세요.
                    </p>
                    
                    <div className="flex gap-4 mb-16 h-24 items-center justify-center w-full">
                      {[0, 1, 2].map(i => (
                        <div key={i} className={`w-14 h-20 rounded-xl border-2 transition-all flex items-center justify-center font-black text-xl ${
                          selectedCards[i] ? 'bg-accent border-accent text-background shadow-[0_0_30px_rgba(212,175,55,0.4)]' : 'border-white/10 bg-white/5 text-white/10'
                        }`}>
                          {selectedCards[i] ? i + 1 : '？'}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 p-8 glass rounded-[3rem] border-accent/20 w-full max-w-5xl">
                      {dealtCards.map((card, idx) => (
                        <div key={idx} className="w-[80px] sm:w-[100px] md:w-[120px] transition-all hover:-translate-y-4">
                          <MinhwaCard 
                            index={selectedCards.indexOf(card)} 
                            isSelected={!!selectedCards.find(c => c.id === card.id)}
                            onClick={() => handlePickCard(card)} 
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {shuffleStatus === 'dealt' && (
              <button 
                onClick={startRevelation} 
                disabled={selectedCards.length < 3 || loading} 
                className="px-16 py-6 bg-accent text-background font-black rounded-full disabled:opacity-20 transition-all hover:scale-110 active:scale-95 shadow-[0_20px_40px_rgba(212,175,55,0.3)] text-xl"
              >
                {loading ? '신령의 계시를 받는 중...' : '🔮 민화 타로의 계시 받기'}
              </button>
            )}
          </motion.section>
        )}

        {step === 'tarot_revealing' && (
          <motion.section 
            key="tarot_revealing" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#050810]/90 backdrop-blur-xl"
          >
            <div className="text-center mb-12">
              <motion.h2 
                key={revealingIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-mystic text-accent mb-4"
              >
                {revealingIndex === 0 ? "과거의 기운" : revealingIndex === 1 ? "현재의 흐름" : "미래의 계시"}
              </motion.h2>
              <p className="text-accent/60 tracking-widest uppercase text-sm">Divine Revelation</p>
            </div>

            <div className="relative w-64 md:w-80 aspect-[2/3] perspective-1000">
              <AnimatePresence mode="wait">
                {revealingIndex < 3 && (
                  <motion.div
                    key={selectedCards[revealingIndex].id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full"
                  >
                    <MinhwaCard card={selectedCards[revealingIndex]} index={revealingIndex} isFlipped={true} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-16 flex gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${i <= revealingIndex ? 'bg-accent shadow-[0_0_10px_rgba(241,229,172,0.8)]' : 'bg-white/10'}`} />
              ))}
            </div>
          </motion.section>
        )}

        {step === 'final_report' && sajuResult && (
          <motion.section key="final_report" id="report-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-12">
            <div className="glass p-5 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-accent shadow-[0_60px_100px_rgba(0,0,0,0.7)] relative overflow-hidden bg-[#050810]/80">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px]" />

              <h2 className="text-3xl md:text-5xl mb-12 md:mb-20 font-mystic text-center decor-accent leading-tight">🔮 민화 타로의<br/>신비로운 계시</h2>
              
              {/* Tarot Cards Selection for the report */}
              <div className="flex flex-col md:flex-row gap-10 justify-center mb-16 md:mb-20 px-4 md:px-10">
                {selectedCards.map((card, idx) => (
                  <div key={idx} className="flex-1 max-w-[180px] md:max-w-[200px] mx-auto md:mx-0">
                    <MinhwaCard card={card} index={idx} isFlipped={true} />
                    <div className="text-center mt-6">
                      <div className="text-sm md:text-base font-mystic text-accent mb-2">{card.name}</div>
                      <div className="text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold">{['과거의 기운', '현재의 흐름', '미래의 계시'][idx]}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Integrated Interpretation text */}
              <div className="prose prose-invert max-w-none p-5 md:p-12 bg-black/40 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl report-content leading-[1.8] md:leading-[2.2] text-lg md:text-xl font-light text-blue-50/90 font-myeongjo">
                <ReactMarkdown>{finalReport}</ReactMarkdown>
              </div>

              {/* PDF Only Footer */}
              <div className="hidden export-only mt-16 pt-8 border-t border-accent/20 text-center">
                <p className="text-accent/60 font-mystic text-sm tracking-widest">본 리포트는 Jay 도사의 천명 지도를 통해 생성되었습니다.</p>
                <p className="text-[10px] opacity-30 mt-2 uppercase tracking-tighter">© 2026 JAY DOSA - MYSTIC ORACLE | {new Date().toLocaleDateString()}</p>
              </div>

              <div className="mt-20 flex flex-col sm:flex-row gap-6 pt-12 border-t border-white/10 no-export">
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

            {/* Saju Dashboard as a secondary/supplementary info at the bottom */}
            <div className="mt-20 opacity-50 hover:opacity-100 transition-opacity no-export">
               <div className="text-center mb-8">
                 <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-accent/20 to-transparent mb-4" />
                 <p className="text-xs uppercase tracking-[0.4em] font-mystic text-accent/40">Base Fate Profile (Saju)</p>
               </div>
               <SajuDashboard data={sajuResult as any} userName={birthData.year ? '당신' : '사용자'} />
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
