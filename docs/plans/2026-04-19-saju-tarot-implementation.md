# Saju & Tarot Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a stateless Next.js application that combines Saju and Tarot into an AI horoscope, running purely in browser memory with a secure serverless API proxy.

**Architecture:** Next.js App Router providing frontend and serverless API proxy. No DB.
**Tech Stack:** Next.js 14, React, Tailwind CSS 4, Framer Motion, Google GenAI SDK, jspdf, html2canvas, Vitest (for TDD)

---

### Task 1: Scaffolding and Environment Setup

**Files:**
- Create: `package.json`

**Step 1: Scaffold Next.js Application**
Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
Expected: PASS

**Step 2: Install Dependencies**
Run: `npm install framer-motion @google/genai jspdf html2canvas`
Expected: PASS

**Step 3: Install Test Dependencies**
Run: `npm install -D vitest @testing-library/react @testing-library/dom jsdom`
Expected: PASS

**Step 4: Commit**
```bash
git add .
git commit -m "chore: scaffold Next.js app and install dependencies"
```

### Task 2: Implement Saju Engine

**Files:**
- Create: `src/lib/saju.ts`
- Create: `src/lib/saju.test.ts`

**Step 1: Write the failing test**
```typescript
// src/lib/saju.test.ts
import { expect, test } from 'vitest';
import { calculateSaju } from './saju';

test('calculates correct Saju format', () => {
  const result = calculateSaju(new Date('1990-01-01T12:00:00'));
  expect(result.palja.length).toBe(8);
  expect(result.elements).toBeDefined();
});
```

**Step 2: Run test to verify it fails**
Run: `npx vitest run src/lib/saju.test.ts`
Expected: FAIL "calculateSaju is not defined"

**Step 3: Write minimal implementation**
```typescript
// src/lib/saju.ts
export function calculateSaju(date: Date) {
  // Simplified mock logic for Manse-ryeok
  return {
    palja: ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'],
    elements: { wood: 2, fire: 2, earth: 1, metal: 1, water: 2 }
  };
}
```

**Step 4: Run test to verify it passes**
Run: `npx vitest run src/lib/saju.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/lib/saju.ts src/lib/saju.test.ts
git commit -m "feat: implement basic saju engine"
```

### Task 3: Implement Tarot Engine

**Files:**
- Create: `src/lib/tarot.ts`
- Create: `src/lib/tarot.test.ts`

**Step 1: Write the failing test**
```typescript
// src/lib/tarot.test.ts
import { expect, test } from 'vitest';
import { drawCards } from './tarot';

test('draws exactly 3 random cards', () => {
  const cards = drawCards(3);
  expect(cards.length).toBe(3);
  expect(cards[0].name).toBeDefined();
});
```

**Step 2: Run test to verify it fails**
Run: `npx vitest run src/lib/tarot.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**
```typescript
// src/lib/tarot.ts
export const TAROT_DECK = [
  { id: 0, name: 'The Fool', meaning: 'New beginnings' },
  { id: 1, name: 'The Magician', meaning: 'Manifestation' },
  { id: 2, name: 'The High Priestess', meaning: 'Intuition' },
  // ... mock the rest for now
];

export function drawCards(count = 3) {
  const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
```

**Step 4: Run test to verify it passes**
Run: `npx vitest run src/lib/tarot.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/lib/tarot.ts src/lib/tarot.test.ts
git commit -m "feat: implement tarot engine"
```

### Task 4: Setup API Route for AI Interpret

**Files:**
- Create: `src/app/api/interpret/route.ts`

**Step 1: Create API Endpoint Route**
```typescript
// src/app/api/interpret/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const data = await req.json();
  const prompt = `너는 마스터야... ${JSON.stringify(data)}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // fast inference
      contents: prompt,
    });
    return NextResponse.json({ report: response.text });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to interpret' }, { status: 500 });
  }
}
```

**Step 2: Setup local env (Manual)**
Action: Create `.env.local` and add `GEMINI_API_KEY=dummy`

**Step 3: Commit**
```bash
git add src/app/api/interpret/route.ts
git commit -m "feat: add interpret api route"
```

### Task 5: Build UI component with Framer Motion

(This will be executed step-by-step later: adding the main page, input forms, and 3-card pulling animations)
