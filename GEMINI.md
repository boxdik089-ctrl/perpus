# Project Directives: Anti-AI-Slop & Quality Standards

Follow these core directives across all coding, styling, and copy generation in this repository:

## 1. UI & Visual Aesthetics (Zero Generic Slop)
- **No Cliché Gradients:** Do not introduce generic purple/cyan/indigo mesh gradients, tacky glowing borders, or gratuitous glassmorphism that destroys contrast.
- **No Decorative Clutter:** Do not add decorative floating pills, meaningless badges, or fake sparkler emojis. Every UI element must serve a concrete functional or informational purpose.
- **Brand Identity:** Adhere to SMKN 1 Beringin's clean, authoritative academic theme (Deep Navy `#00367E`, Warm Stone/Paper `#F9F6F0`, high contrast text, deliberate whitespace).
- **Mobile First & Zero Spill:** Always ensure zero horizontal overflow (`overflow-x: hidden`) and zero Cumulative Layout Shift (CLS) on mobile viewports (360px–420px).

## 2. Code Architecture & TypeScript (Zero Over-Engineering)
- **No One-Caller Abstractions:** Keep code direct and localized. Do not create single-use utility wrappers, abstract classes, or helper files for one-off logic.
- **Laser-Focused Scope:** Modify only what the prompt requests. No drive-by refactoring or unsolicited reformatting of unrelated files.
- **Clean Deletion:** When replacing code, delete the old implementation entirely. Leave zero commented-out code blocks, ghost variables, or dead imports.
- **Strict TypeScript:** No `any`, `unknown` casts, `// @ts-ignore`, or non-null assertions (`!`) to silence errors.

## 3. Copywriting & Tone (Zero Language Slop)
- **Banned Clichés:** Avoid generic AI buzzwords (*delve, tapestry, landscape, pivotal, robust, seamlessly, beacon, revolutionary, unlock, elevate, di era digital yang serba cepat ini*).
- **Authentic Vocational Context:** Write genuine Indonesian educational copy suitable for SMKN 1 Beringin (*SMK Bisa, SMK Hebat, Vokasi Kuat Menguatkan Indonesia*).
- **Explain WHY, Not WHAT:** Do not narrate obvious code operations line-by-line. Only document non-obvious constraints and business rules.

