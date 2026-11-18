# Peluang Kedua — current handoff

## Status (2026-10-24)
Codebase cleanup, structural refactoring, and medium visual upgrade ([CODE_CLEANUP_PLAN.md](./CODE_CLEANUP_PLAN.md)) are complete, verified locally, and deployed to production.

Production URL stays https://peluang-kedua-chat.mpu1032-aspirasi.workers.dev (same QR). Current Cloudflare version: `04318ca8-2409-4115-8937-62fb736bb0c6` (previous statistics release: `91c0f5f2-1f49-4730-bc74-a51f825d9d85`; earlier six-question release: `2f4c8914-5123-4ce9-8fc2-946280023428`).

## Completed cleanup & visual upgrade (2026-10-24)
1. **Removed legacy ending model & unused story copy**:
   - Removed unused `Reflection`, `lastLens`, and `ending` fields from `web/features/chat/types.ts`, `web/features/chat/lib/conversation.ts`, `web/features/chat/hooks/useConversation.ts`, and `web/features/chat/data/story.ts` (preserving `ethicsProfile` and `firstChoice`).
   - Removed unused `copy.placeholder`, `copy.send`, `copy.showSuggestions`, `copy.endTitle`, and `copy.endText` from `web/features/chat/data/story.ts`.
   - Removed empty `web/next.config.ts` after verifying `vinext build` succeeds identically.
2. **Extracted focused frontend components & deduplicated team pods**:
   - Split `web/features/chat/ChatSimulator.tsx` into focused presentational components under `web/features/chat/components/`: `ReflectionCard.tsx`, `WordPopover.tsx`, `StickerDrawer.tsx`, and `CommunityDialog.tsx`.
   - Deduplicated the two team pods in `web/features/chat/components/ChatActivity.tsx` via `TEAM_PODS`.
3. **Consolidated HTTP helpers, statistics validation & test utilities**:
   - Created `web/lib/request.ts` (`NO_STORE_HEADERS`, `jsonReply`, `isSameOriginRequest`, `isJsonContentType`, `readBoundedJson`) shared by `web/features/registration/server.ts` and `web/features/statistics/server.ts`.
   - Added pure validation helpers (`isValidStatisticsChoice`, `statisticsEventSlotKey`, `parseStatisticsEvent`) in `web/features/statistics/catalog.ts` and shared them across `client.ts`, `server.ts`, and `StatisticsDashboard.tsx`.
   - Created `web/tests/helpers.mjs` (`importSource`) shared across `unit.mjs`, `registration.mjs`, `statistics.mjs`, and `statistics-client.mjs`.
4. **Synced Drizzle schema & migration metadata**:
   - Added `statistics_counters_non_negative` and `statistics_receipts_sha256_len` CHECK constraints to `web/db/schema.ts` to match `web/drizzle/0001_anonymous_statistics.sql`.
   - Registered `0001_anonymous_statistics` in `web/drizzle/meta/_journal.json` and added `web/drizzle/meta/0001_snapshot.json` (`npx.cmd drizzle-kit generate` reports `No schema changes, nothing to migrate`).
5. **CSS cleanup & medium visual upgrade (5 screens)**:
   - Removed dead selectors from `web/app/globals.css` (`.composer-form`, `.composer-field`, `.send-button`, `.character-count`, `.too-long`, `.reflection-icon`, `.demo-note`, `.dialog-subject`, `.reflection-card .eyebrow`, `.reflection-card blockquote`, `.invitation-card`, `.invitation-cover`, `.invitation-tag`, `.invitation-spark`, `.join-button`, `@keyframes spark-float`) and consolidated duplicate overrides.
   - Upgraded visual hierarchy, elevation, and color depth across the Join screen, Chat main view, 4-person Team Activity card, Final Reflection Card, and Statistics modal / `/statistik` public page.
   - Fixed `.join-dock-plant` overlapping `.join-dock-privacy` text on 390px and 320px viewports, and fixed `.activity-reset-btn` (`"Susun semula"`) line-wrapping on mobile.

## Current player flow
1. Student ID + Join Group: attendance only.
2. Four debates before Amir joins: second chances, community safety, majority vs fairness, second chances and nation building.
3. Admin states Amir's consent, adds him once, and Amir introduces himself.
4. Question 5 invites him to gotong-royong. After the selected response, the four-person team arrangement pauses question 6.
5. Players drag or tap four neighbours into two teams, then send `Cadangkan susunan ini`. Six proposal variants and their relevant replies reflect the actual teams.
6. Question 6 reflects on civic action; result counts the six ethical choices.
7. `Lihat statistik komuniti` opens anonymous overall/per-question doughnut charts after completion. `/statistik` is a shareable public page with the same charts and aggregate CSV export.

## Ownership
- `web/features/chat/data/story.ts`: six steps, choices, consent transition, reflections and copy.
- `web/features/chat/lib/conversation.ts`: deterministic reducer; $3^6 = 729$ routes.
- `web/features/chat/lib/activities.ts`: derives the buddy boundary from `community-activity`'s step ID; gates only after its reply, before the last prompt.
- `web/features/chat/hooks/useConversation.ts`: transient activity completion, timer cancellation, resets.
- `web/features/chat/data/activities.ts`: buddy labels, six outcome scripts and `resolveBuddyOutcome`.
- `web/features/chat/components/ChatActivity.tsx` + `chat-activities.css`: four-person drag/tap/keyboard UI, two staged replies, duplicate-submit guard. Action buttons must remain plain text (no nested `TranslatableText`).
- `web/features/chat/components/ReflectionCard.tsx`, `WordPopover.tsx`, `StickerDrawer.tsx`, `CommunityDialog.tsx`: extracted chat subcomponents.
- `web/features/chat/lib/socialReplies.ts`: contextual reactions matched by original source text; contexts keyed by story IDs.
- `web/features/chat/data/dictionary.ts`: Chinese/English word dictionary; all story, social and activity text covered.
- `web/features/chat/ChatSimulator.tsx`: timeline anchors, Translate/Emoji controls, unread and dictionary popup orchestration.
- `web/lib/request.ts`: shared HTTP security headers, same-origin checks, JSON content-type checks, and 1 KB bounded body reader.
- `web/features/statistics/`: catalog/schema version and pure validators (`catalog.ts`), separate client outbox and network boundary (`client.ts`), atomic aggregate API (`server.ts`), chart/CSV presentation (`StatisticsDashboard.tsx`, `StatisticsResult.tsx`). `app/api/statistics/route.ts` and `app/statistik/page.tsx` own the public routes.

## Contracts to preserve
- Attendance remains student ID + first-join time at `POST /api/join`, with no public attendance read API. Statistics never receives the student ID, transcript, per-person result or cross-question session ID.
- `statistics_counters` stores only versioned counter keys/counts; `statistics_receipts` stores only independent SHA-256 receipt hashes (no answer/type/time/session linkage). D1 batch inserts the receipt and increments its counter atomically. `POST` strictly validates predefined question/option IDs, version, same origin and bounded JSON. `GET` returns only anonymous aggregates; CSV uses the same snapshot.
- First answer per question/start/complete is counted once in a browser tab session. Retry/refresh reuses the same random event receipt. Session storage is owned exclusively by `features/statistics`; blocked storage falls back to memory.
- Chat/privacy tests prohibit `localStorage`, `sessionStorage`, `indexedDB` and `fetch` anywhere in `features/chat` TypeScript (even comments).
- Presentation replies/artwork remain outside reducer messages and ethics counts.
- Six original choices have distinct branch responses, with one deontology/utilitarianism/care option per step. No ranking or moral score.
- Word token IDs must remain unique. Keep `.social-quote > span` as a direct-child selector so tokens remain inline.
- Long-press menu: 360ms; first emoji tap must work. Explicit scrolling dismisses it; automatic focus scrolling must not.
- Preserve current eight artwork assets, avatars and user BGM. Thinking loop 5.2–183.0s; complete 184.8–207.2s.
- Phone uses `visualViewport`; input 16px prevents Safari focus zoom.

## Deployment and commands
Run in `web/`: `npm.cmd run check`; `npm.cmd test`; `npm.cmd run build`; `npm.cmd run dev`; `npm.cmd run deploy`.
Cloudflare Worker `peluang-kedua-chat` + D1 `peluang-kedua-db` (binding `DB`). Deploy builds through Vinext and `wrangler --config dist/server/wrangler.json`.

## Verification (2026-10-24)
- `npm.cmd run check` and `npx.cmd tsc --noEmit --noUnusedLocals --noUnusedParameters`: pass (0 errors).
- `npm.cmd test`: pass (`unit.mjs`, `registration.mjs`, `statistics.mjs`, `statistics-client.mjs` — all 729 paths, 18 distinct choice responses, 24 arrangements/6 proposal variants, 100% dictionary coverage, real SQLite attendance & statistics transaction/dedupe/privacy tests).
- `npm.cmd run build` (`vinext build`): pass.
- `npx.cmd drizzle-kit generate`: `No schema changes, nothing to migrate`.
- Headless Chrome visual & layout verification (`before_*` vs `after_*`, 29 screenshots across `390×844`, `320×568`, and `1440×900`): `scrollW === clientW` and `overflowing: []` on all 29 captures; verified `.join-dock-plant` no longer overlaps `.join-dock-privacy` text and `.activity-reset-btn` (`"Susun semula"`) stays on a single line on 390px and 320px.
