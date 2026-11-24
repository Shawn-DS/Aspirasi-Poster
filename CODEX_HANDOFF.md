# Peluang Kedua — current handoff

## Status (2026-11-24)
Redesigned the entire experience into a **50% Hand-Drawn Storybook Illustration / 50% Story & Decision Panel** interactive visual simulation (`employer-visual-v1`) styled after the user's *Color Bound* watercolor picture-book reference (warm cream cotton paper `#fbf5ea`, sepia charcoal outlines `#4a3c35`, `Fredoka` + `Nunito` typography, die-cut sticker clue cards, tactile choice buttons, and `/public/art/*.webp` watercolor plates). Verified locally across `390×844`, `320×568`, and `1440×900`; deployed to Cloudflare on 2026-11-24 after user authorization.

Production URL stays https://peluang-kedua-chat.mpu1032-aspirasi.workers.dev (same QR). Current deployed Cloudflare version: `8c7434bb-3690-4ff0-8490-f764de21768a` (`employer-visual-v1`). Previous deployed Cloudflare version: `04318ca8-2409-4115-8937-62fb736bb0c6` (`ethics-six-v1`).

## Current 5-stage visual simulation flow (`employer-visual-v1`)
1. **Login (`GroupInvitation.tsx`)**: Scan QR → enter Student ID (`POST /api/join`, attendance only; never linked to statistics).
2. **Stage 1 (`s1-blind` · Pilihan Awal)**: Upper 50% renders the 2D sunlit interview office & job applicant scene (`SceneStage.tsx`) with a neutral `Maklumat Terhad` card. Lower 50% presents the narrative and 2 large binary buttons: `Beri temu duga` / `Tidak beri temu duga`.
3. **Stage 2 (`s2-certificate` · Syarat Baharu)**: Animated emerald `Sijil Latihan Rasmi` card pops into the 2D scene + certificate appears on the desk; top-right loop pill displays the player's Stage 1 choice. Loops back to `Beri temu duga` / `Tidak beri temu duga` asking `Adakah pilihan anda berubah?`.
4. **Stage 3 (`s3-risk` · Risiko Kerja)**: Scene mood warms to amber-alert; `Amaran Risiko` card (`Kes kewangan · Jawatan juruwang`) and risk dossier pop in beside the retained certificate chip. Top-right pill shows whether S1→S2 changed (`Berubah`/`Kekal`). Loops back to `Beri temu duga` / `Tidak beri temu duga`.
5. **Stage 4 (`s4-ranking` · Susunan Keutamaan)**: Interactive 3-item priority ranker (`PriorityRanker.tsx`) supporting pointer drag-and-drop, tap-to-swap, and ↑/↓ arrow buttons for `Undang-undang sudah dilaksanakan`, `Keselamatan awam dan mangsa`, and `Bukti perubahan diri`. Top-ranked #1 item dynamically spotlights in the upper 2D scene.
6. **Stage 5 (`result` · Keputusan & Statistik)**: Displays personal decision journey (`DecisionSummaryCard.tsx`: S1→S2→S3 choices + `Berubah`/`Kekal` indicators + 1→2→3 ranking) and inline anonymous audience statistics (`StatisticsResult.tsx` + `StatisticsDashboard.tsx`): vertical **Bar Chart** & horizontal split progress bars comparing `% Beri temu duga` across Stages 1 → 2 → 3, plus Stage 4 **#1 / #2 / #3 rank distribution & average rank** computed from the 6 permutation counters, CSV export, and `/statistik` public page.

## Ownership
- `web/features/chat/data/story.ts`: 3 binary stages, 3 priority items, 6 ranking permutations, copy.
- `web/features/chat/lib/simulation.ts` & `hooks/useSimulation.ts`: pure deterministic reducer across all $2^3 \times 6 = 48$ journeys.
- `web/features/chat/components/SceneStage.tsx`: upper 50% 2D vector office illustration & floating stage-reactive clue cards.
- `web/features/chat/components/PriorityRanker.tsx`: Stage 4 drag-and-drop / tap-to-swap / ↑↓ arrow 1–3 ranker.
- `web/features/chat/components/DecisionSummaryCard.tsx`: Stage 5 personal summary card.
- `web/features/chat/ChatSimulator.tsx`: top progress bar, Translate/Mute/Restart controls, 50/50 split layout, Stage 5 result view.
- `web/features/chat/data/dictionary.ts`: 100% bilingual (ZH/EN) word coverage across every stage, scene card, ranker item, and summary text.
- `web/features/statistics/`: `STATISTICS_VERSION = "employer-visual-v1"`, strict validation for 3 binary stages + 6 Stage 4 permutations, server-computed `rankingSummary`, Bar Chart + ranking statistics UI (`StatisticsDashboard.tsx`), and escaped CSV export.

## Verification (2026-11-24)
- `npx.cmd tsc --noEmit --noUnusedLocals --noUnusedParameters`: pass.
- `npm.cmd test`: all 4 suites pass (`unit.mjs`, `registration.mjs`, `statistics.mjs`, `statistics-client.mjs`).
- `npm.cmd run build` (`vinext build`): pass.
- Headless Chrome verification across `390×844`, `320×568`, and `1440×900`: 0 horizontal overflow across all stages and `/statistik`.
- Production smoke checks after deployment: `/`, `/statistik`, all five watercolor assets, `/api/statistics`, and CSV export return HTTP 200; statistics report `employer-visual-v1`, three binary phases, six ranking permutations, and three ranking summary items.
