export const TAROT_DECK = [
  { id: 0, name: 'The Fool', meaning: 'New beginnings' },
  { id: 1, name: 'The Magician', meaning: 'Manifestation' },
  { id: 2, name: 'The High Priestess', meaning: 'Intuition' },
  // ... mock cards to satisfy the engine
  { id: 3, name: 'The Empress', meaning: 'Fertility' },
  { id: 4, name: 'The Emperor', meaning: 'Authority' },
];

export function drawCards(count = 3) {
  const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
