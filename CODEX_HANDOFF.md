# Peluang Kedua — project handoff

## Current hosting: Cloudflare (2026-10-16) — supersedes the Sites sections below

- Live URL: https://peluang-kedua-chat.mpu1032-aspirasi.workers.dev (QR: `output/qr/peluang-kedua-cloudflare-qr.*`).
- User's own free Cloudflare account; Worker `peluang-kedua-chat`, D1 `peluang-kedua-db` (`ec922046-c116-4f42-b864-b2c71eeaf176`, APAC), binding `DB`. Settings in `web/cloudflare.json`, read by `web/vite.config.ts`.
- Flow: WhatsApp-style invitation (`features/registration/GroupInvitation.tsx`) → POST `/api/join` stores `student_id` + `joined_at` only (deduped, same-origin only, no public read) → seven-question chat. Chat answers are still not stored.
- Commands (from `web/`, after `wrangler login`): `npm.cmd run deploy` (build + deploy), `npm.cmd run export` (CSV to `output/participants/`, git-ignored), `npm.cmd run db:init` (one-time table creation; already done).
- Live-verified: page 200 with join form; join 200; duplicate ID kept one row; empty ID 400; cross-origin 403; GET `/api/join` 405; export produced a correct CSV; test row deleted (table empty at handoff).
- Windows notes: PowerShell blocks `npm.ps1`, so use `npm.cmd`. Wrangler may exit non-zero after success (libuv assertion / stderr warnings); check the output text.
- The old Sites URL still serves the pre-registration version; do not share it.

## Direction and status

Malay-only WhatsApp-style community chat MVP; prototype maintenance. Seven questions, three horizontal choices each, distinct scripted replies, no AI, registration, analytics, database or persisted conversation. Refresh/restart resets the session. The previous invitation-card project was cleaned and renamed `web/`.

## Latest changes

- Removed the round left/right controls above choices; native horizontal scrolling and a swipe hint remain. Keyboard handling is preserved.
- Seven topics: second chances after serving a sentence → neighbours’ concerns → welcoming Amir → gotong-royong → fair tasks → privacy → practical action.
- Amir joins only after question 3. The header omits him before his arrival. Progress is derived from the seven story steps.
- Each of the 21 options has its own reply. Final reflections follow question 7 and recall the opening stance. Free text uses a disclosed neutral fallback and cannot skip a step.
- Story content is in `web/features/chat/data/story.ts`; reducer in `lib/conversation.ts`, playback in `hooks/useConversation.ts`, chips in `components/ReplyChoices.tsx`, viewport fix in `hooks/useChatViewport.ts`.

## Verified

- TypeScript passed, production build passed for both working source and deployment copy.
- Unit checks passed all 2,187 choice combinations, 21 unique option responses, neutral/mixed free-text paths, correct Amir arrival and endings, Unicode input limits, duplicate sends, restart, viewport geometry, reduced motion and no persistence/API surface.
- Browser played all seven rounds: unsure → fairness → introduce → contribute → same-rules → consent → speak-up. Correct replies, ending and opening callback appeared; no console errors.
- Horizontal scrolling worked at 390px with no arrow controls or page overflow. At 320×568, chips were 44px high and composer bottom was 568px. At 390×400 focused, header top was 0 and composer bottom was 400; choices hid behind Lihat cadangan.
- The earlier real iPhone keyboard fix was confirmed by the user. Latest seven-question native touch gestures, a real QR scan and human reading time remain unverified. About two minutes is a design target, not a measured result.

## Running locally

From `web/`: `npm ci`, `npm run dev -- --hostname 0.0.0.0`. LAN URL at last check: http://192.168.68.65:5173/ . The existing LAN QR is retained in `output/qr/`.

## Online friend testing

User wants friends on other networks to test. Seven-question version has been deployed successfully and is now public (anyone with the URL, no login), explicitly approved by the user on 2026-10-16:
https://peluang-kedua-taman-harmoni.wittyheron1.chatgpt.site

- Project: `appgprj_6ad20b362fd0819195b9fa0ec951dc47`; persisted in `web/.openai/hosting.json`.
- Version: `appgprj_6ad20b362fd0819195b9fa0ec951dc47~appgver_405c8d5c44fc8191b800b589c5d5bfa1`.
- Deployment: `appgdep_6ad20c596ab4819196b848f4c4885450`; status succeeded.
- Pushed source commit: `96182463164e42b515e0533f2ebc92f3aa35e0ef`.
- Source checkout and archive: `.sites-deploy/source/` and `.sites-deploy/peluang-kedua.tar.gz`, ignored by the parent repository. The parent repository and `web/` Git history were not committed or pushed. Deployment checkout dependencies reuse `web/node_modules` through a junction.
- Online QR PNG/SVG in `output/qr/` can now be shared with friends on any network; the local PC does not need to remain online.
- The initial automatic review rejection was resolved by explicit user approval: “同意，任何持有連結的人都可瀏覽”. The native access update succeeded with access_mode public, revision 2. No redeployment or workaround was used.
- An unauthenticated HTTP request returned 200 at the Site URL, with the chat markup and page title present; there was no sign-in redirect.

## Windows publishing notes

The Sites build wrapper's npm invocation failed on this machine; the direct bundled Node `scripts/run-framework.mjs build` command passed in the deployment checkout. The source helper successfully pushed and packaged that unchanged build using commands: []. Prepend Git/bin and bundled Node/bin to PATH for packaging, and set TAR_OPTIONS=--force-local so tar treats Windows drive paths as local. Credentials were kept only in tool/session memory, never files.

## Next safe action

Share the existing online QR and URL, then collect physical-phone scan, touch and reading-time feedback. Preserve public access on future updates unless the user asks to change it. Reuse this Site and source checkout; do not create another Site for edits.
