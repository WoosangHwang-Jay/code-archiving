import { expect, test } from 'vitest';
import { drawCards } from './tarot';

test('draws exactly 3 random cards', () => {
  const cards = drawCards(3);
  expect(cards).toHaveLength(3);
  expect(cards[0].name).toBeDefined();
});
