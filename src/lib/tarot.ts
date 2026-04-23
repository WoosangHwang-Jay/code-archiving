export interface TarotCard {
  id: number;
  name: string;
  meaning: string;
}

export const TAROT_DECK: TarotCard[] = [
  // Major Arcana (0-21)
  { id: 0, name: 'The Fool (광대)', meaning: '새로운 시작, 모험, 순수' },
  { id: 1, name: 'The Magician (마법사)', meaning: '창조, 기술, 잠재력' },
  { id: 2, name: 'The High Priestess (고위 여사제)', meaning: '직관, 신비, 무의식' },
  { id: 3, name: 'The Empress (여황제)', meaning: '풍요, 모성, 자연' },
  { id: 4, name: 'The Emperor (황제)', meaning: '권위, 구조, 실사구시' },
  { id: 5, name: 'The Hierophant (교황)', meaning: '전통, 교육, 정신적 지도' },
  { id: 6, name: 'The Lovers (연인)', meaning: '선택, 조화, 관계' },
  { id: 7, name: 'The Chariot (전차)', meaning: '의지, 승리, 자기 통제' },
  { id: 8, name: 'Strength (힘)', meaning: '용기, 인내, 내면의 힘' },
  { id: 9, name: 'The Hermit (은둔자)', meaning: '성찰, 고독, 지혜' },
  { id: 10, name: 'Wheel of Fortune (운명의 수레바퀴)', meaning: '운명, 변화, 전환점' },
  { id: 11, name: 'Justice (정의)', meaning: '공정, 진실, 인과보응' },
  { id: 12, name: 'The Hanged Man (매달린 사람)', meaning: '희생, 새로운 시각, 정체' },
  { id: 13, name: 'Death (죽음)', meaning: '종결, 변화, 새로운 시작' },
  { id: 14, name: 'Temperance (절제)', meaning: '균형, 인내, 중용' },
  { id: 15, name: 'The Devil (악마)', meaning: '중독, 속박, 물질적 욕망' },
  { id: 16, name: 'The Tower (탑)', meaning: '갑작스러운 변화, 붕괴, 깨달음' },
  { id: 17, name: 'The Star (별)', meaning: '희망, 믿음, 영감' },
  { id: 18, name: 'The Moon (달)', meaning: '불안, 환상, 직관' },
  { id: 19, name: 'The Sun (태양)', meaning: '성공, 기쁨, 활력' },
  { id: 20, name: 'Judgement (심판)', meaning: '부활, 결단, 용서' },
  { id: 21, name: 'The World (세계)', meaning: '완성, 여행, 통합' },

  // Wands (22-35)
  { id: 22, name: 'Ace of Wands (지팡이 에이스)', meaning: '새로운 열정, 창의적 시작' },
  { id: 23, name: 'Two of Wands (지팡이 2)', meaning: '계획, 결정, 미래 전망' },
  { id: 24, name: 'Three of Wands (지팡이 3)', meaning: '확장, 멀리 내다봄, 협력' },
  { id: 25, name: 'Four of Wands (지팡이 4)', meaning: '축하, 안정, 조화로운 결과' },
  { id: 26, name: 'Five of Wands (지팡이 5)', meaning: '경쟁, 갈등, 사소한 다툼' },
  { id: 27, name: 'Six of Wands (지팡이 6)', meaning: '승리, 인정, 공적인 성공' },
  { id: 28, name: 'Seven of Wands (지팡이 7)', meaning: '방어, 용기, 도전에 맞섬' },
  { id: 29, name: 'Eight of Wands (지팡이 8)', meaning: '신속한 변화, 뉴스, 바쁜 움직임' },
  { id: 30, name: 'Nine of Wands (지팡이 9)', meaning: '경계, 끈기, 거의 다 왔음' },
  { id: 31, name: 'Ten of Wands (지팡이 10)', meaning: '책임감, 과부하, 마지막 고비' },
  { id: 32, name: 'Page of Wands (지팡이 시종)', meaning: '호기심많은 소식, 아이디어' },
  { id: 33, name: 'Knight of Wands (지팡이 기사)', meaning: '거침없는 추진력, 에너지' },
  { id: 34, name: 'Queen of Wands (지팡이 여왕)', meaning: '매력, 자신감, 결단력' },
  { id: 35, name: 'King of Wands (지팡이 왕)', meaning: '리더십, 비전, 권위' },

  // Cups (36-49)
  { id: 36, name: 'Ace of Cups (컵 에이스)', meaning: '새로운 감정, 사랑의 시작' },
  { id: 37, name: 'Two of Cups (컵 2)', meaning: '사귐, 결합, 파트너십' },
  { id: 38, name: 'Three of Cups (컵 3)', meaning: '축하, 우정, 즐거운 모임' },
  { id: 39, name: 'Four of Cups (컵 4)', meaning: '지루함, 정체, 기회를 놓침' },
  { id: 40, name: 'Five of Cups (컵 5)', meaning: '상상, 실망, 후회 속의 희망' },
  { id: 41, name: 'Six of Cups (컵 6)', meaning: '추억, 순수, 옛 인연' },
  { id: 42, name: 'Seven of Cups (컵 7)', meaning: '환상, 선택의 과잉, 백일몽' },
  { id: 43, name: 'Eight of Cups (컵 8)', meaning: '떠나감, 새로운 길 모색' },
  { id: 44, name: 'Nine of Cups (컵 9)', meaning: '만족, 소원 성취, 풍요' },
  { id: 45, name: 'Ten of Cups (컵 10)', meaning: '행복한 가정, 정서적 완성' },
  { id: 46, name: 'Page of Cups (컵 시종)', meaning: '감수성, 새로운 소식, 영감' },
  { id: 47, name: 'Knight of Cups (컵 기사)', meaning: '낭만, 제안, 감정의 전달' },
  { id: 48, name: 'Queen of Cups (컵 여왕)', meaning: '직관, 배려, 부드러운 리더십' },
  { id: 49, name: 'King of Cups (컵 왕)', meaning: '정서적 균형, 현명한 조언' },

  // Swords (50-63)
  { id: 50, name: 'Ace of Swords (검 에이스)', meaning: '명확한 결단, 지적 승리' },
  { id: 51, name: 'Two of Swords (검 2)', meaning: '교착 상태, 선택 보류' },
  { id: 52, name: 'Three of Swords (검 3)', meaning: '마음의 상처, 슬픔, 이별' },
  { id: 53, name: 'Four of Swords (검 4)', meaning: '휴식, 명상, 후퇴' },
  { id: 54, name: 'Five of Swords (검 5)', meaning: '패배감, 실속 없는 승리' },
  { id: 55, name: 'Six of Swords (검 6)', meaning: '어려움에서 벗어남, 이동' },
  { id: 56, name: 'Seven of Swords (검 7)', meaning: '전략, 눈속임, 조심스러운 계획' },
  { id: 57, name: 'Eight of Swords (검 8)', meaning: '속박, 무력감, 심리적 고립' },
  { id: 58, name: 'Nine of Swords (검 9)', meaning: '악몽, 불안, 심한 스트레스' },
  { id: 59, name: 'Ten of Swords (검 10)', meaning: '바닥을 침, 끝, 새로운 시작의 전조' },
  { id: 60, name: 'Page of Swords (검 시종)', meaning: '관찰, 경계, 지적 호기심' },
  { id: 61, name: 'Knight of Swords (검 기사)', meaning: '성급함, 돌파력, 직선적 행동' },
  { id: 62, name: 'Queen of Swords (검 여왕)', meaning: '냉철한 판단, 독립심' },
  { id: 63, name: 'King of Swords (검 왕)', meaning: '이성적 권위, 공정한 심판' },

  // Pentacles (64-77)
  { id: 64, name: 'Ace of Pentacles (동전 에이스)', meaning: '물질적 시작, 기회, 행운' },
  { id: 65, name: 'Two of Pentacles (동전 2)', meaning: '균형 잡기, 유연성, 변화 과정' },
  { id: 66, name: 'Three of Pentacles (동전 3)', meaning: '협력, 전문성, 기술 인정' },
  { id: 67, name: 'Four of Pentacles (동전 4)', meaning: '소유욕, 보수적 태도, 안정' },
  { id: 68, name: 'Five of Pentacles (동전 5)', meaning: '고난, 경제적 어려움, 도움의 필요' },
  { id: 69, name: 'Six of Pentacles (동전 6)', meaning: '자선, 공정한 분배, 도움' },
  { id: 70, name: 'Seven of Pentacles (동전 7)', meaning: '수확의 기다림, 신중한 평가' },
  { id: 71, name: 'Eight of Pentacles (동전 8)', meaning: '숙련, 성실함, 장인 정신' },
  { id: 72, name: 'Nine of Pentacles (동전 9)', meaning: '독립적 풍요, 성공한 삶' },
  { id: 73, name: 'Ten of Pentacles (동전 10)', meaning: '가문, 유산, 안정된 재산' },
  { id: 74, name: 'Page of Pentacles (동전 시종)', meaning: '학습, 성실한 노력, 새로운 기회' },
  { id: 75, name: 'Knight of Pentacles (동전 기사)', meaning: '책임감, 꾸준함, 실질적 성과' },
  { id: 76, name: 'Queen of Pentacles (동전 여왕)', meaning: '풍요로움, 실무능력, 보호' },
  { id: 77, name: 'King of Pentacles (동전 왕)', meaning: '부유함, 사업적 성공, 지배력' },
];

export function drawCards(count = 3) {
  const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getShuffledDeck() {
  return [...TAROT_DECK].sort(() => 0.5 - Math.random());
}
