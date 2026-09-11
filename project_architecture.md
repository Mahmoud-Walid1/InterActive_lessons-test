# Project Architecture: Interactive Lessons Platform (PWA & Encrypted Runtime)

## Overview
A secure, mobile-first Web Application / PWA for interactive primary school lessons with device-bound encryption (AES-256-GCM), offline capabilities (IndexedDB/Dexie.js), orientation enforcement, anti-tamper protections, and Salla license key validation.

---

## Directory Structure

```
.
├── project_architecture.md           # [Doc] File tree mapping & architectural documentation
├── public/
│   ├── manifest.json                 # PWA Manifest configuration
│   └── sw.js                         # Service Worker script for offline app shell caching
├── src/
│   ├── app/                          # Next.js App Router Page Routes
│   │   ├── layout.tsx                # Root layout with RTL support, Tajawal/Baloo fonts, PWA setup
│   │   ├── page.tsx                  # License Activation Gate & Landing Page
│   │   ├── globals.css               # Paper theme palette, fonts, RTL base styles
│   │   ├── grades/
│   │   │   ├── page.tsx              # Grade Selection Grid (الصف الأول -> الصف السادس)
│   │   │   └── [gradeId]/
│   │   │       └── subjects/
│   │   │           ├── page.tsx      # Subject Selection Grid (العلوم، الرياضيات، إلخ)
│   │   │           └── [subjectId]/
│   │   │               └── lessons/
│   │   │                   └── page.tsx  # Lessons Map, Online/Offline Badges & Download Actions
│   │   ├── player/
│   │   │   └── [lessonId]/
│   │   │       └── page.tsx      # Encrypted Lesson Launcher Shell
│   │   └── admin/
│   │       └── licenses/
│   │           └── page.tsx      # Admin License Generator Dashboard (for Salla)
│   ├── components/                   # UI & Logic Modular Components
│   │   ├── pwa/
│   │   │   └── PwaInstallBanner.tsx  # Bottom-sheet / banner prompt for PWA installation
│   │   ├── orientation/
│   │   │   ├── LandscapeGuard.tsx    # Full-screen forced landscape rotation guard modal
│   │   │   └── useOrientation.ts     # Custom hook listening for orientation & aspect ratio
│   │   ├── security/
│   │   │   ├── AntiTamperGuard.tsx   # Anti-DevTools, context-menu & selection blocker
│   │   │   └── SecurityWatermark.tsx # Transparent user watermark overlay
│   │   ├── player/
│   │   │   ├── LessonPlayerShell.tsx # RAM-decrypted lesson container
│   │   │   ├── MascotRobert.tsx      # Animated Robert Mascot component
│   │   │   ├── SlideCard.tsx         # Slide content renderer
│   │   │   ├── InteractiveQuiz.tsx   # Mini-game choices & interactive quizzes
│   │   │   └── StarRewardScreen.tsx  # Lesson completion & star rewards screen
│   │   └── ui/
│   │       ├── Header.tsx            # App navigation header
│   │       ├── GradeCard.tsx         # Primary grade card element
│   │       ├── SubjectCard.tsx       # Subject card element
│   │       ├── LessonCard.tsx        # Lesson status card element
│   │       ├── DownloadProgress.tsx  # Circular progress indicator for downloads
│   ├── lib/                          # Services & Core Utilities
│   │   ├── crypto/
│   │   │   ├── fingerprint.ts        # Composite hardware/browser fingerprint generator
│   │   │   ├── keyDerivation.ts      # PBKDF2 key derivation (License + Fingerprint)
│   │   │   └── aesGcm.ts             # Web Crypto AES-256-GCM encryption/decryption
│   │   ├── db/
│   │   │   ├── dexieDb.ts            # Dexie IndexedDB instance & tables schema
│   │   │   └── offlineStore.ts       # Offline download, storage & signature verification
│   │   ├── auth/
│   │   │   ├── sessionManager.ts     # Active session single-concurrency & device binding
│   │   │   └── licenseValidator.ts   # 16-character license key verifier & generator
│   │   └── lessons/
│   │       ├── sampleLessons.ts      # Built-in lesson data & sample interactive slide payloads
│   │       └── lessonPackager.ts     # Converts lesson JSON/HTML into encrypted `.bin` payload
│   └── types/
│       ├── lesson.ts                 # TypeScript types for Slides, Quizzes, Lessons
│       ├── auth.ts                   # TypeScript types for Licenses, Devices, Sessions
│       └── offline.ts                # TypeScript types for IndexedDB records
├── lessons-workspace/                # [Isolated] Content Engineers & Teachers Workspace
│   ├── .gitignore                    # Content repo gitignore
│   ├── INSTRUCTIONS.md               # Guide for content authors & teachers
│   ├── template/                     # Pure Web Standards template
│   │   ├── index.html                # Isolated scoped lesson container
│   │   ├── style.css                 # Scoped CSS for lesson container
│   │   ├── script.js                 # IIFE runtime engine with Web Audio Synthesizer fallback
│   │   ├── lesson.json               # Canonical LessonData schema (100% matched to types/lesson.ts)
│   │   └── assets/                   # Sample audio & image assets
│   ├── lessons/                      # Content submission directory by grade
│   │   ├── grade-1/ ... grade-6/     # Primary grades folders
│   └── preview/                      # Zero-server offline preview & checklist workbench
│       └── index.html                # Drag-and-drop lesson tester & audio diagnostics
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS styling configuration
└── package.json                      # Project dependencies
```

---

## Content Workspace Isolation Boundary
The `lessons-workspace/` directory is designed to be pushed or distributed as an isolated Git repository or separate branch for content creators.
- **Zero Platform Leakage**: Does not contain any crypto (`src/lib/crypto`), security guards (`src/components/security`), admin logic (`src/app/admin`), agent instructions (`AGENTS.md`, `CLAUDE.md`), or licensing logic.
- **Zero-Dependency Runtime**: Built purely with HTML5, Scoped Vanilla CSS, Vanilla JS (IIFE), and Web Audio API. Content authors require no Node.js or build steps.
- **Automated Ingestion Ready**: Every `lesson.json` strictly adheres to `src/types/lesson.ts` so `lessonPackager.ts` can ingest, encrypt, and bundle lessons directly into the platform offline cache.
- **UI/UX Pro Max Design System**:
  - Palette: Storybook parchment (`#FBF3DE`) + Deep forest ink (`#182E2B`) + Terracotta clay (`#C1502E`) + Leaf green (`#3D6A35`) + Ocean sky (`#0284C7`) + Amber gold (`#E8A93B`).
  - Typography: Google Fonts `Baloo 2` (headings, badges, counters) + `Tajawal` (body).
  - Component Standards: Zero structural emojis (pure SVG vector icons with 2.5px stroke), true 3D flip architecture (`preserve-3d` + `backface-visibility: hidden`), centered floating capsule dock with strict LTR counter (`<bdi dir="ltr">`), and top-left companion mascot.
- **Dedicated Remote Repository**:
  - URL: `https://github.com/Mahmoud-Walid1/lessons-workspace.git`
  - Pull lessons updates: `npm run workspace:pull`
  - Push template updates: `npm run workspace:push`
