# Project Rebranding Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Update GitHub remote URL and Firebase project ID in configuration files.

**Architecture:** direct configuration updates to `.git/config`, `.firebaserc`, and `package.json`.

**Tech Stack:** Git, Firebase CLI, Node.js

---

### Task 1: Update Git Remote URL

**Files:**
- Modify: `.git/config` (indirectly via CLI)

**Step 1: Set new origin URL**
Run: `git remote set-url origin https://github.com/WoosangHwang-Jay/pjt_jaydosa.git`

**Step 2: Verify URL**
Run: `git remote -v`
Expected: URL should contain `pjt_jaydosa.git`

**Step 3: Commit**
Run: `git add . && git commit -m "chore: update git remote URL to pjt_jaydosa"`

### Task 2: Update Firebase Project Configuration

**Files:**
- Modify: `.firebaserc`

**Step 1: Update .firebaserc content**
```json
{
  "projects": {
    "default": "pjt-jaydosa"
  }
}
```

**Step 2: Verify active project**
Run: `npx -y firebase-tools@latest use pjt-jaydosa`
Expected: "Now using project pjt-jaydosa"

**Step 3: Commit**
Run: `git add .firebaserc && git commit -m "chore: update firebase project ID to pjt-jaydosa"`

### Task 3: Update package.json Metadata

**Files:**
- Modify: `package.json`

**Step 1: Update name field**
Change `"name": "pjt_rmspro"` (or current name) to `"name": "pjt_jaydosa"`

**Step 2: Commit**
Run: `git add package.json && git commit -m "chore: update project name in package.json"`
