# Anti-AI-Slop Directives & Engineering Standards

Enforce strict quality gates across UI design, code architecture, documentation, and copy. Reject lazy, generic, bloated, or repetitive "AI slop" patterns.

---

## 1. UI & Visual Design (Zero Aesthetic Slop)
- **No Cliché Gradients & Glowing Borders:** Do not use gratuitous purple/indigo/cyan neon gradients, rainbow borders, or generic "cyberpunk/futuristic" glow effects unless explicitly requested.
- **No Gratuitous Glassmorphism:** Avoid blurry low-contrast translucent cards (`backdrop-blur-md bg-white/10`) that make text unreadable. All text must strictly adhere to WCAG AA contrast (≥ 4.5:1 for body, ≥ 3.0:1 for headings).
- **No Meaningless Decorative Badges:** Never scatter random floating pill badges, fake stat pills, or sparkle emojis (✨) that lack interactive purpose or business value.
- **Respect Brand DNA:** Adhere to SMKN 1 Beringin's clean, authoritative academic palette:
  - Primary: Deep Navy (`#00367E`, `#0B2249`)
  - Neutrals: Warm Paper / Stone (`#F9F6F0`, `#FAF8F3`, `slate-900`)
  - High typographic hierarchy, clean whitespace, and deliberate layout balance.
- **Zero Mobile Overflow (CLS = 0):** Always verify mobile viewports (360px – 420px). Never allow uncontrolled horizontal scrolling (`overflow-x`) or unconstrained 3D transforms that spill out of screen boundaries.

---

## 2. Code Architecture & TypeScript (Zero Over-Engineering)
- **No One-Caller Abstractions:** Do not create utility files, helper functions, or custom hooks for logic that is used in only one place. Write clean inline code until reusability is actually proven.
- **No Drive-By Refactoring:** Only touch and modify the files and components directly related to the user's request. Never reformat, reorder, or rename unrelated files or functions.
- **Clean Deletion (Zero Ghost Code):** When replacing or updating an implementation, delete the old code completely. Do NOT leave commented-out code blocks, ghost variables, or orphaned imports.
- **Strict Type Safety:** Absolutely no `any`, `unknown` casts, `// @ts-ignore`, or non-null assertions (`!`) as shortcuts to silence the compiler. Resolve types properly at the root.
- **No Fake Mock Data in Production Paths:** Do not leave dummy stubs or unfinished `// TODO: implement later` in active production paths. Build fully working, verified solutions.

---

## 3. Copywriting & Content (Zero Language Slop)
- **Banned Buzzwords & AI Clichés:**
  - English: *delve, testament, tapestry, landscape, pivotal, robust, seamlessly, beacon, revolutionary, unlock, elevate, harness, empower.*
  - Indonesian: *di era digital yang serba cepat ini, menjadi bukti nyata, merajut, melangkah maju bersama, lanskap, selami keindahan.*
- **No Generic Filler Openers:** Avoid formulaic intro sentences like *"Di era modern ini..."* or *"Tentu, saya dengan senang hati akan membantu..."*.
- **Authentic Vocational (SMK) Tone:** Write copy that reflects real vocational education values: *kompetensi, kejuruan, terampil, mandiri, berkarakter unggul, siap kerja, wirausaha, serta melanjutkan pendidikan.*

---

## 4. Documentation & Communication (Zero Conversational Fluff)
- **Explain WHY, Never WHAT:** Do not write narrative comments that merely restate what the code syntax is doing (e.g., `// filter the books`, `// render the container`). Only document non-obvious constraints, architectural decisions, or browser-specific workarounds.
- **Direct & Action-Oriented:** Keep responses direct, clear, and actionable. Avoid repetitive apologies, sycophantic praise, or bloated explanations of simple edits.

