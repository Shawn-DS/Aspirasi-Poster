# Peluang Kedua (Taman Harmoni) — Project & Feature Handoff Summary (For AI Assistants)

## Latest maintenance — 2026-10-18
- Dictionary follow-up: added 77 explicit Chinese/English word entries for social replies and fixed `sama-sama`'s polite response meaning. `ChatSimulator.tsx` now renders social reply text, quoted source and social labels through `TranslatableText`. All scripted social outputs are included in dictionary coverage tests. Preserve `.social-quote > span` (direct child selector) to avoid rendering each word on its own line.
- Read `CODEX_HANDOFF.md` first for current changes, tests and production version.
- The display label is now English **Emoji**, with two columns and bounded internal vertical scrolling on phones. The original eight artwork assets are retained.
- Long-press click suppression no longer swallows the first reaction-control tap. Memoized bubbles/text and stable callbacks reduce unrelated rendering; duplicate audio unlock listeners were removed.
- `lib/socialReplies.ts` matches the original authored message + reaction to a scripted contextual response from that same speaker. `hooks/useSocialInteractions.ts` owns separate ephemeral UI events and cancels/deduplicates pending replies. It never mutates the story reducer, answer counts or attendance records. No AI service is used.
- Production updated at the same URL; existing QR remains valid. Browser mobile viewport checks and all automated tests pass; actual iPhone performance still needs device confirmation.

## 1. Project Overview
- **Project Name**: *Peluang Kedua: Dalam Kejiranan Kita* (`MPU1032 Aspirasi Negara Bangsa`)
- **Purpose**: An interactive WhatsApp group chat simulator (`Persatuan Penduduk Taman Harmoni`) where students explore **8 ethical dilemmas** regarding the reintegration of a former prisoner (**Amir**) into a residential neighbourhood.
- **Three Ethical Lenses**:
  1. **Deontologi** (`deontology`) — Principles, equal rights, rule-based duty.
  2. **Utilitarianisme** (`utilitarianism`) — Collective safety, harmony, majority well-being.
  3. **Ethics of Care** (`care`) — Relational empathy, listening, personal support.
- **Tech Stack**:
  - **Framework**: Next.js / Vinext (`web/` directory) deployed to **Cloudflare Workers** via `@cloudflare/vite-plugin` and `wrangler`.
  - **Database**: Cloudflare D1 (`peluang-kedua-db`, SQLite), binding `DB`, used **exclusively** for student attendance registration (`POST /api/join`).

## 2. Strict Architectural & Test Constraints (CRITICAL for Any AI Modifying Code)
1. **Strict Privacy Boundary (`web/tests/unit.mjs`)**:
   - The unit test suite scans every `.ts` and `.tsx` file under `web/features/chat/` and **fails if any of the following 4 words appear anywhere in the file (even inside comments)**:
     - `localStorage`
     - `sessionStorage`
     - `indexedDB`
     - `fetch`
   - Never use those 4 identifiers inside `web/features/chat/`.
2. **Deterministic 8-Question State Machine (`web/tests/unit.mjs`)**:
   - `web/tests/unit.mjs` exhaustively tests all $3^8 = 6,561$ choice combinations in `web/features/chat/lib/conversation.ts` and asserts exact message counts, sender orders, and step transitions.
   - Any decorative UI elements (such as WhatsApp stickers or reactions) **must be rendered in the React UI layer** (`MessageBubble.tsx` / `ChatSimulator.tsx`) rather than mutating the `messages` array inside `lib/conversation.ts`.
3. **100% Bilingual Dictionary Coverage (`web/tests/unit.mjs`)**:
   - Every Malay word used in `web/features/chat/data/story.ts` must have a matching Chinese (`zh`) and English (`en`) entry in `web/features/chat/data/dictionary.ts`.

## 3. Summary of Implemented Features & Recent Changes

### A. Entry / Attendance Registration Screen (`GroupInvitation.tsx` & `globals.css`)
- **Files**:
  - `web/features/registration/GroupInvitation.tsx`
  - `web/app/globals.css`
  - `web/app/layout.tsx`
- **What Was Done**:
  - Redesigned the entry screen into a warm cream & sage green organic wave poster (`peluangkedua`) with a bottom frosted-glass dock (`.join-poster-dock`).
  - Added a custom SVG decorative plant (`.join-dock-plant`) positioned at the outer bottom-right corner (`right: 2px; bottom: -14px`) so it never overlaps the privacy notice text.
  - **Mobile Viewport & Keyboard Fixes**:
    - Set input `font-size: 16px` and viewport `maximumScale: 1, userScalable: false` in `web/app/layout.tsx` to prevent iOS Safari auto-zoom when focusing the Student ID field.
    - Used `window.visualViewport` in `web/features/chat/hooks/useChatViewport.ts` to lock the screen (`position: fixed; inset: 0; overflow: hidden`) so the page never shifts or scrolls out of bounds after dismissing the mobile keyboard.
    - When `keyboardOpen` is active on mobile, compact styles automatically shrink the header ring so the Student ID input and `Join Group` button remain fully visible above the on-screen keyboard.

### B. Custom Community Group Avatar (`Avatar.tsx`)
- **File**: `web/features/chat/components/Avatar.tsx`
- **What Was Done**:
  - Replaced the generic group icon with a custom vector illustration (`<Avatar group />`) showing **all 4 Taman Harmoni neighbours** standing shoulder-to-shoulder in front of 3 neighbourhood terrace houses (`Taman Harmoni`):
    - **Puan Aina** (plum hijab, warm smile)
    - **Uncle Lim** (round glasses, grey hair & moustache, orange collar shirt)
    - **Amir** (emerald collar shirt, friendly wave)
    - **Admin Komuniti** (blue lanyard & glasses)

### C. Dual-Stage Background Music & Web Audio Sound Effects (`sound.ts` & `public/bgm.mp3`)
- **Files**:
  - `web/public/bgm.mp3`
  - `web/features/chat/lib/sound.ts`
- **What Was Done**:
  - Replaced `web/public/bgm.mp3` with the new piano & xylophone track (`211.7s` total duration).
  - Implemented **Dual-Stage BGM looping** in `sound.ts`:
    - **Skips initial silence** (`0.0s – 5.2s`): Automatically starts playback at `THINKING_START = 5.2s`.
    - **Thinking Stage (`mode === "thinking"`, `5.2s – 183.0s`)**: Loops the calm, reflective solo piano section while on the entry screen and during the 8 ethical dilemma questions.
    - **Completion Stage (`mode === "complete"`, `184.8s – 207.2s`)**: Automatically seeks to and loops the cheerful, upbeat xylophone & piano finale as soon as Question 8 is completed and the Ethics Reflection Card appears.
  - Added synthesized Web Audio API sound effects:
    - `playMessagePop()` — Soft incoming message bubble pop.
    - `playChoiceSfx(lens)` — Distinct musical chime for each ethical lens (`deontology`, `utilitarianism`, `care`).
    - `playReactionPop()` — Crisp high-pitched pop when reacting to a message or receiving a reaction.
    - `playMascotBoing()` — Playful springy boing when tapping stickers or mascots.

### D. WhatsApp Long-Press Emoji Reactions (`MessageBubble.tsx` & `stickers.ts`)
- **Files**:
  - `web/features/chat/components/MessageBubble.tsx`
  - `web/features/chat/data/stickers.ts`
  - `web/app/globals.css`
- **What Was Done**:
  - **Authentic Long-Press Trigger**: Message bubbles have no permanent reaction buttons cluttering the UI. Holding/long-pressing a message bubble for `360ms` (or right-clicking on desktop) pops up the floating WhatsApp reaction bar (`.whatsapp-reaction-popover`) with haptic feedback (`navigator.vibrate(18)`).
  - **6 Classic WhatsApp Reaction Emojis**: `👍` (*Setuju*), `❤️` (*Prihatin*), `🙏` (*Terima kasih*), `😮` (*Terkejut*), `😢` (*Simpati*), `🤝` (*Sokong*).
  - **Automatic Neighbour Reactions on Player Choices**: When the player sends an ethical choice, neighbours automatically attach a matching reaction pill to the bottom-right of the player's bubble:
    - `deontology` → `⚖️ 👍`
    - `utilitarianism` → `🛡️ 🤝`
    - `care` → `❤️ 🙏`

### E. 8 Curated WhatsApp Community Stickers with Captions (`stickers.ts`, `MessageBubble.tsx`, `ChatSimulator.tsx`)
- **Files**:
  - `web/public/stickers/s06.png`, `s08.png`, `s12.png`, `s15.png`, `s23.png`, `s24.png`, `s34.png`, `s37.png`
  - `web/features/chat/data/stickers.ts`
  - `web/features/chat/components/MessageBubble.tsx` (`ChatStickerBubble`)
  - `web/features/chat/ChatSimulator.tsx` (`.sticker-drawer`)
- **What Was Done**:
  - Extracted and background-removed 8 cute transparent PNG illustrations from the user-provided sticker sheets, pairing each with a clear Malay sticker ribbon (`caption`) and Chinese meaning (`meaning`) in a clean `2 × 4` Sticker Drawer (`Pelekat` button in the bottom toolbar):
    1. `s12` (Toast): **`SALAM JIRAN! 👋`** (`熱情招呼`)
    2. `s23` (Donut): **`MANISNYA HATI! ❤️`** (`太暖心了`)
    3. `s15` (Cupcake): **`TERIMA KASIH! 🙏`** (`非常感謝`)
    4. `s24` (Mushroom): **`SAYA SOKONG! 👍`** (`非常贊同`)
    5. `s08` (Candle): **`BAWA BERTENANG 🌿`** (`冷靜思考`)
    6. `s34` (Envelope Octopus): **`PELUANG KEDUA ✨`** (`支持自新`)
    7. `s37` (Cactus): **`JANGAN TUDUH! ⚖️`** (`別亂猜忌`)
    8. `s06` (Bat): **`JAGA KOMUNITI 🤝`** (`守護社區`)
  - **Automatic Story Stickers**:
    - Amir sends `SALAM JIRAN! 👋` (`s12`) after his introduction at the end of Dilemma 3.
    - Admin sends `MANISNYA HATI! ❤️` (`s23`) after the closing reflection at the end of Dilemma 8.
  - **Player-Sent Stickers**:
    - Players can open the `Pelekat` drawer anytime and send any of the 8 stickers into the chat; after `620ms`, a neighbour automatically reacts to the player's sticker with an emoji pill.

### F. Evolving Mini Mascot in Chapter Bar & Interactive Result Card Mascot (`ChatSimulator.tsx`)
- **File**: `web/features/chat/ChatSimulator.tsx`
- **What Was Done**:
  - **Chapter Progress Bar Mini Mascot (`.chapter-mascot-pill`)**:
    - Next to the `1 / 8` step counter in `.chapter-bar`, displays a sprout (`🌱 Tunas Etika`) before the first answer, and dynamically evolves into the leading `<EthicsSticker size={22} />` (`deontology`, `utilitarianism`, `care`, or `balanced`) as the player answers dilemmas.
    - Tapping the mini mascot plays `sound.playMascotBoing()` and shows a floating label of the current leading ethical compass.
  - **Final Reflection Card Mascot Interaction (`.reflection-mascot-btn`)**:
    - On the final result card (`.reflection-card`), clicking the 96px `<EthicsSticker />` triggers a bounce animation, star sparkles (`.mascot-poke-sparkles`), `sound.playMascotBoing()`, and displays up to **3 encouraging speech bubbles** (`MAX_MASCOT_QUOTES = 3` in `MASCOT_QUOTES`), after which the tap prompt disappears.

## 4. Verification & Commands
- **Typecheck**: `npm.cmd run check` (`tsc --noEmit`)
- **Test Suite**: `npm.cmd test` (`node tests/unit.mjs && node tests/registration.mjs`)
- **Local Dev Server**: `npm.cmd run dev` (`http://localhost:5173`)
- **Cloudflare Deployment**: `npm.cmd run deploy` (builds via `vinext build` and deploys via `wrangler deploy`)
