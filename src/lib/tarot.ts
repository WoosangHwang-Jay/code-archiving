export const TAROT_DECK = [
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
];

export function drawCards(count = 3) {
  const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getShuffledDeck() {
  return [...TAROT_DECK].sort(() => 0.5 - Math.random());
}
