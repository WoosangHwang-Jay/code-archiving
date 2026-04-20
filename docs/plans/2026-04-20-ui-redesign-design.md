# UI Redesign Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** 짙은 네이비 배경에 자개(Nacre) 오로라 그라데이션, 샴페인 골드 명조체 텍스트, 네온 블루 버튼 등 K-Fusion 힙(Hip) 스타일로 UI를 전면 개편합니다.

**Architecture:** 글로벌 CSS(`globals.css`)의 Tailwind Theme 변수와 배경 설정을 개편하고, `page.tsx` 내부의 텍스트 클래스를 얇은 명조체(font-myeongjo, font-light 등) 단위로 업데이트합니다.

**Tech Stack:** Tailwind CSS (v4), React, Framer Motion

---

### Task 1: 전역 CSS 및 Tailwind 설정 변경 (globals.css)

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Write the minimal implementation**
- 기존 `--background`, `--foreground`, `--accent` 등의 변수를 새로운 힙한 K-Fusion 팔레트로 수정합니다.
- 배경 무늬를 `radial-gradient` 조합과 노이즈 SVG(url로 base64 삽입 또는 외부 링크)로 겹쳐 텍스처를 구현합니다.

```css
@import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@300;400;700&family=Outfit:wght@300;500;700&display=swap');
@import "tailwindcss";

:root {
  --background: #0a0e17; /* 짙은 네이비 */
  --foreground: #ffffff; /* 순백색 텍스트(선택적) */
  --accent: #f1e5ac;     /* 샴페인 골드 */
  --btn-neon: #00e5ff;   /* 네온 블루 */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
  --color-neon: var(--btn-neon);
  --font-mystic: 'Nanum Myeongjo', serif; /* 극도로 얇고 우아한 명조체 느낌 활용 */
  --font-sans: 'Outfit', sans-serif;
}

body {
  background-color: var(--background);
  background-image: 
    radial-gradient(circle at 15% 20%, rgba(45, 27, 78, 0.4) 0%, transparent 40%),  /* #2d1b4e 보라 */
    radial-gradient(circle at 85% 80%, rgba(26, 60, 94, 0.4) 0%, transparent 40%),  /* #1a3c5e 블루 */
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  background-blend-mode: color-dodge, normal, normal;
  color: var(--foreground);
  font-family: var(--font-sans);
  min-height: 100vh;
}

.glass {
  background: rgba(10, 14, 23, 0.4);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(241, 229, 172, 0.3); /* 샴페인 골드 테두리 */
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.title-gold {
  font-family: var(--font-mystic);
  color: var(--accent);
  font-weight: 300; /* 극도로 얇은 굵기 */
}
```

---

### Task 2: Page.tsx UI 컴포넌트 리팩토링

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Write the minimal implementation**
1. 메인 타이틀 폰트와 스타일 변경 (`MINHWA ORACLE`, `Jay Dosa의 천명 지도`) -> `title-gold text-5xl font-light`
2. 버튼의 텍스트와 배경색을 네온 블루 및 Sans-serif 글꼴로 교체. (e.g. `bg-neon text-background font-bold tracking-widest`)
3. 타이틀 텍스트 "Jay Dosa의 천명(天命) 지도" 와 "MINHWA ORACLE" 색상을 `text-accent font-mystic font-light` 로 일관되게 맞춤.

```tsx
// 변경할 포인트 예시
// <motion.h1 className="text-6xl mb-4 tracking-tighter text-accent font-mystic font-light">
//   MINHWA ORACLE
// </motion.h1>

// 사주 분석 버튼
// <button onClick={handleSajuStart} disabled={loading} className="w-full bg-neon text-[#0a0e17] font-bold py-5 rounded-2xl hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all text-lg tracking-wider mt-4">
//   {loading ? '천기를 읽는 중...' : 'Start My Destiny Analysis'}
// </button>
```

---

### Task 3: ApiKeyModal 컴포넌트 스타일 점검

**Files:**
- Modify: `src/components/ApiKeyModal.tsx`

**Step 1: Write the minimal implementation**
- 모달 디자인 역시 샴페인 골드 테두리의 글래스모피즘 폼 및 네온 버튼 스타일로 일치시킵니다.
- `bg-[#1a1630]` 대신 글래스모피즘용 투명한 다크 네이비로 처리.
- "저장하기" 버튼도 네온 색상으로 변경.

```tsx
// className="w-full max-w-md p-6 border border-accent/30 rounded-2xl bg-[#0a0e17]/80 backdrop-blur-md shadow-2xl relative"
// button: className="w-full py-4 text-lg font-bold transition-all rounded-xl bg-neon text-[#0a0e17]"
```
