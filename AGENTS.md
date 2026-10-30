<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Anti-AI-Slop & Engineering Directives

You are strictly prohibited from generating lazy, generic, bloated, or boilerplate-heavy "AI slop". Adhere strictly to these execution guidelines:

## 1. Zero UI/Design Slop
- **No Cliché Gradients:** Avoid generic purple/indigo/cyan neon gradients, gratuitous glassmorphism, or low-contrast frosted containers.
- **No Floating Badge Clutter:** Do not add meaningless pill badges, decorative fake counters, or sparkle emojis (✨) without direct functional purpose.
- **Brand Consistency:** Respect the clean, professional visual identity of SMKN 1 Beringin (Deep Navy `#00367E`, warm paper neutrals `#F9F6F0`, high contrast, deliberate whitespace).
- **Zero Mobile Overflow:** Maintain strict responsive layout discipline (no horizontal scroll spill on mobile 360px–420px).

## 2. Zero Code & Architecture Slop
- **No One-Caller Abstractions:** Keep logic inline and direct; do not invent wrapper functions, abstract base classes, or helper files for single-use logic.
- **Minimalist Scope:** Modify only what the user requested. No drive-by refactorings or reformatting of untouched files.
- **Clean Deletions:** Always remove obsolete code completely. Never leave commented-out code blocks, ghost variables, or orphaned imports.
- **Strict TypeScript:** No `any`, `unknown`, `// @ts-ignore`, or non-null assertions (`!`) as shortcuts. Fix the underlying types.

## 3. Zero Language & Comment Slop
- **Banned AI Vocabulary:** Do not use corporate buzzwords (*delve, tapestry, landscape, pivotal, robust, seamlessly, beacon, unlock, elevate, di era digital yang serba cepat ini*).
- **Explain WHY, Never WHAT:** Do not write narrative line-by-line comments explaining obvious code syntax. Document only non-obvious constraints or critical workarounds.
- **Authentic Vocational Tone:** Use genuine Indonesian vocational school terminology (*SMK Bisa, SMK Hebat, Vokasi Kuat Menguatkan Indonesia, BMW: Bekerja, Melanjutkan, Wirausaha*).

