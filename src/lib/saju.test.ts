import { expect, test } from 'vitest';
import { calculateSaju } from './saju';

test('calculates correct Saju format', () => {
  const result = calculateSaju(new Date('1990-01-01T12:00:00'));
  expect(result.palja).toHaveLength(8);
  expect(result.elements).toBeDefined();
});
