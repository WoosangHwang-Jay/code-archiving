'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateSaju } from '@/lib/saju';
import { drawCards } from '@/lib/tarot';
import { exportToPDF } from '@/lib/export';

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

export default function Home() {
  const [step, setStep] = useState<'input' | 'saju' | 'tarot' | 'result'>('input');
  const [birthData, setBirthData] = useState({ date: '', time: '' });
  const [sajuResult, setSajuResult] = useState<SajuData | null>(null);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    if (!birthData.date) return;
    const result = calculateSaju(new Date(birthData.date + (birthData.time ? `T${birthData.time}` : '')));
    setSajuResult(result);
    setStep('saju');
  };

  const handleDrawTarot = () => {
    const cards = drawCards(3);
    setSelectedCards(cards);
    setStep('tarot');
  };

  const getInterpretation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saju_data: sajuResult, tarot_cards: selectedCards }),
      });
      const data = await res.json();
      setReport(data.report);
      setStep('result');
    } catch (err) {
      console.error(err);
      alert('AI 해석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Mystic Oracle</h1>
        <p className="text-lg opacity-80">사주와 타로의 결합, 당신의 운명을 마주하세요.</p>
      </header>

      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.section 
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass p-8 rounded-2xl w-full max-w-md text-center"
          >
            <h2 className="text-2xl mb-6">생년월일 입력</h2>
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm mb-1 opacity-70">생년월일</label>
                <input 
                  type="date" 
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-accent transition-colors"
                  value={birthData.date}
                  onChange={(e) => setBirthData({ ...birthData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 opacity-70">태어난 시간 (선택)</label>
                <input 
                  type="time" 
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-accent transition-colors"
                  value={birthData.time}
                  onChange={(e) => setBirthData({ ...birthData, time: e.target.value })}
                />
              </div>
              <button 
                onClick={handleStart}
                className="w-full bg-accent text-background font-bold py-3 rounded-lg hover:brightness-110 active:scale-95 transition-all mt-4"
              >
                운명 확인하기
              </button>
            </div>
          </motion.section>
        )}

        {step === 'saju' && (
          <motion.section 
            key="saju"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-2xl w-full max-w-2xl text-center"
          >
            <h2 className="text-3xl mb-8">당신의 사주 오행</h2>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {sajuResult.palja.map((char: string, idx: number) => (
                <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="text-4xl font-mystic text-accent">{char}</div>
                  <div className="text-xs opacity-50 mt-2">{idx % 2 === 0 ? '천간' : '지지'}</div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleDrawTarot}
              className="px-8 py-3 bg-accent text-background font-bold rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
            >
              타로 카드 뽑기
            </button>
          </motion.section>
        )}

        {step === 'tarot' && (
          <motion.section 
            key="tarot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center"
          >
            <h2 className="text-3xl mb-12">세 장의 카드를 선택하세요</h2>
            <div className="flex gap-6 mb-12">
              {selectedCards.map((card, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ delay: idx * 0.3, duration: 0.6 }}
                  className="w-40 h-64 glass rounded-xl border-accent/40 flex flex-col items-center justify-center p-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-30" />
                  <div className="text-accent text-4xl mb-4">✨</div>
                  <div className="text-lg font-mystic text-center">{card.name}</div>
                  <div className="text-xs opacity-50 absolute bottom-4 uppercase tracking-widest">{idx + 1}st Card</div>
                </motion.div>
              ))}
            </div>
            <button 
              onClick={getInterpretation}
              disabled={loading}
              className="px-12 py-4 bg-accent text-background font-bold rounded-full disabled:opacity-50"
            >
              {loading ? 'AI가 운명을 읽는 중...' : '최종 해석 보기'}
            </button>
          </motion.section>
        )}

        {step === 'result' && (
          <motion.section 
            key="result"
            id="report-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-10 rounded-2xl w-full"
          >
            <h2 className="text-4xl mb-8 border-b border-accent/20 pb-4">통합 운세 보고서</h2>
            <div className="prose prose-invert max-w-none text-lg leading-relaxed opacity-90 mb-12" id="report-content">
              {report}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => exportToPDF('report-section', 'my-destiny.pdf')}
                className="flex-1 border border-accent text-accent py-3 rounded-lg hover:bg-accent/10"
              >
                결과 PDF 저장
              </button>
              <button 
                onClick={() => setStep('input')}
                className="flex-1 bg-white/10 py-3 rounded-lg hover:bg-white/20"
              >
                다시 하기
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="mt-auto pt-12 text-sm opacity-40">
        © 2026 Mystic Oracle. No data is stored. Powered by Gemini Pro.
      </footer>
    </main>
  );
}
