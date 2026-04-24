/**
 * Saju (Four Pillars of Destiny) Calculation Utility
 * Based on the Sexagenary Cycle (60-pillar system)
 */

type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

const STEM_ELEMENTS: Record<typeof STEMS[number], Element> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water'
};

const BRANCH_ELEMENTS: Record<typeof BRANCHES[number], Element> = {
  '寅': 'wood', '卯': 'wood', '辰': 'earth',
  '巳': 'fire', '午': 'fire', '未': 'earth',
  '申': 'metal', '酉': 'metal', '戌': 'earth',
  '亥': 'water', '子': 'water', '丑': 'earth'
};

export type SajuResult = {
  palja: string[];
  elements: { [key in Element]: number };
  fortuneScores: {
    relations: number;
    honor: number;
    health: number;
    love: number;
    family: number;
    career: number;
    studies: number;
    wealth: number;
  };
  luckWave: { year: number; value: number }[];
};

/**
 * Calculates Saju based on the provided date and time.
 * Note: This implementation uses a simplified solar calendar approximation for pillars.
 */
export function calculateSaju(date: Date): SajuResult {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

  // 1. Year Pillar
  // Ref: Year 4 AD was Gap-Ja (Index 0 in 60-year cycle)
  const yearDiff = year - 4;
  const yearStemIdx = (yearDiff % 10 + 10) % 10;
  const yearBranchIdx = (yearDiff % 12 + 12) % 12;
  const yearStem = STEMS[yearStemIdx];
  const yearBranch = BRANCHES[yearBranchIdx];

  // 2. Month Pillar (Approximate version based on solar terms)
  const solarTermDays = [5, 4, 5, 5, 5, 6, 7, 7, 8, 8, 7, 7];
  let sajuMonth = month;
  if (day < solarTermDays[month - 1]) {
    sajuMonth = month - 1;
  }
  if (sajuMonth === 0) sajuMonth = 12;
  
  const monthStemIdx = (yearStemIdx * 2 + sajuMonth) % 10;
  const monthBranchIdx = (sajuMonth + 1) % 12;
  const monthStem = STEMS[monthStemIdx];
  const monthBranch = BRANCHES[monthBranchIdx];

  // 3. Day Pillar
  const refDate = new Date(2000, 0, 1);
  const diffTime = date.getTime() - refDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const dayPillarIdx = (diffDays % 60 + 60 + 54) % 60; 
  
  const dayStemIdx = dayPillarIdx % 10;
  const dayBranchIdx = dayPillarIdx % 12;
  const dayStem = STEMS[dayStemIdx];
  const dayBranch = BRANCHES[dayBranchIdx];

  // 4. Hour Pillar
  const hourBranchIdx = Math.floor(((hour + 1) % 24) / 2);
  const hourStemIdx = (dayStemIdx * 2 + hourBranchIdx) % 10;
  
  const hourStem = STEMS[hourStemIdx];
  const hourBranch = BRANCHES[hourBranchIdx];

  const palja = [
    yearStem, yearBranch,
    monthStem, monthBranch,
    dayStem, dayBranch,
    hourStem, hourBranch
  ];

  // 5. Calculate Elemental Balance
  const elements: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  palja.forEach((char, idx) => {
    const el = (idx % 2 === 0) ? STEM_ELEMENTS[char as typeof STEMS[number]] : BRANCH_ELEMENTS[char as typeof BRANCHES[number]];
    elements[el]++;
  });

  // 6. Generate Fortune Scores (Semi-deterministic based on palja)
  // We use the character codes of palja to seed a simple generator
  const seed = palja.join('').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRand = (offset: number) => {
    const space = Math.sin(seed + offset) * 10000;
    return Math.floor((space - Math.floor(space)) * 40) + 60; // Returns 60-100
  };

  const fortuneScores = {
    wealth: pseudoRand(1),
    honor: pseudoRand(2),
    health: pseudoRand(3),
    love: pseudoRand(4),
    family: pseudoRand(5),
    career: pseudoRand(6),
    studies: pseudoRand(7),
    relations: pseudoRand(8),
  };

  // 7. Generate Luck Wave (100-year trend starting from birth)
  const luckWave = Array.from({ length: 11 }, (_, i) => {
    const age = i * 10;
    const targetYear = year + age;
    const waveSeed = seed + targetYear;
    const waveVal = Math.sin(waveSeed * 0.1) * 30 + 50 + (Math.cos(waveSeed * 0.5) * 10);
    return { year: targetYear, value: Math.max(10, Math.min(95, waveVal)) };
  });

  return { palja, elements, fortuneScores, luckWave };
}
