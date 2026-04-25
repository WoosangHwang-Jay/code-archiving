# 타로 UI/UX 개선 (가로 슬라이드 및 순차 공개) Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** 모바일 타로 카드 선택 UI를 가로 슬라이드 방식으로 개선하고, 선택 완료 후 카드를 한 장씩 크게 보여주는 '계시' 단계를 추가하여 사용자 경험을 향상시킴.

**Architecture:** `Home` 컴포넌트의 `Step` 상태에 `'tarot_revealing'`을 추가하고, 해당 단계에서 `useEffect`와 `framer-motion`을 활용하여 순차적인 카드 공개 애니메이션을 구현함. 선택 화면은 `flex-nowrap`과 음수 마진을 활용한 가로 스크롤 레이아웃으로 변경함.

**Tech Stack:** Next.js (App Router), TailwindCSS, Framer Motion, TypeScript

---

### Task 1: 상태 및 타입 정의 수정
**Files:**
- Modify: `src/app/page.tsx:32, 284-300`

**Step 1: `Step` 타입에 `'tarot_revealing'` 추가**
**Step 2: `revealingIndex` 상태 변수 추가 (기본값 0)**
**Step 3: 커밋**

### Task 2: 타로 선택 UI 개선 (가로 슬라이드 적용)
**Files:**
- Modify: `src/app/page.tsx:727-736`

**Step 1: 그리드 레이아웃을 `flex overflow-x-auto`로 변경**
**Step 2: 카드 간 중첩을 위한 음수 마진 및 스타일 적용**
**Step 3: 커밋**

### Task 3: 카드 공개(Revelation) 단계 로직 구현
**Files:**
- Modify: `src/app/page.tsx:389-406` (getFinalInterpretation 수정)
- Modify: `src/app/page.tsx:408-819` (UI 섹션 추가)

**Step 1: `getFinalInterpretation` 함수를 `startRevelation`으로 이름 변경 및 로직 수정**
**Step 2: `tarot_revealing` 단계일 때의 UI 섹션 작성 (중앙 집중형 카드 뷰)**
**Step 3: `useEffect`를 사용하여 1초 간격으로 `revealingIndex` 증가 및 최종 해석 호출 로직 작성**
**Step 4: 커밋**

### Task 4: `MinhwaCard` 컴포넌트 보정
**Files:**
- Modify: `src/app/page.tsx:43-95`

**Step 1: 확대 및 강조를 위한 props 추가 또는 스타일 보정**
**Step 2: 커밋**

### Task 5: 전체 흐름 테스트 및 검증
**Step 1: 브라우저를 통해 카드 선택 -> 1초 간격 순차 공개 -> 최종 리포트 이동 확인**
**Step 2: 모바일 뷰포트에서 가로 스크롤 및 카드 선택 동작 확인**
**Step 3: 최종 커밋**
