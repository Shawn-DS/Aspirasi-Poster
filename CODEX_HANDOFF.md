# Peluang Kedua — current handoff

## Status (2026-10-18)
Maintenance complete: Emoji drawer, reliable long-press selection, contextual scripted neighbour replies, and dictionary translation for all new reply/quote text. See `AI_HANDOFF_SUMMARY.md` for the existing registration, music and story architecture.

Production: https://peluang-kedua-chat.mpu1032-aspirasi.workers.dev
Cloudflare version: `d640c709-155a-45ca-923f-86fe32d6dcba`. Existing QR is unchanged. Previous releases remain available through Cloudflare Worker deployment rollback.

## Changes
- Latest dictionary fix: `dictionary.ts` has 77 new explicit bilingual entries and an expanded `sama-sama` meaning. Reaction replies, artwork replies, source quotes and the two social labels use `TranslatableText`; unique `social-<id>-label/quote/reply` prefixes prevent selection collisions. `.social-quote > span` styles only the quote wrapper so word tokens stay inline. The dictionary coverage test includes every generated scripted social reply and label.
- `web/features/chat/ChatSimulator.tsx`: English **Emoji** label; drawer height follows available chat area; renders social replies with the original message quoted. Stable callbacks and per-message active-word props allow memoized bubbles to skip unrelated updates.
- `web/app/globals.css`: two phone columns, bounded vertical scrolling, wrapping captions, 44px reaction/close buttons, lighter popup effects and reduced-motion support.
- `web/features/chat/components/MessageBubble.tsx`: long-press click suppression excludes reaction controls, so the first emoji tap works; popup is clamped inside the chat area and repositions on automatic scrolling. Bubbles are memoized. Only user wheel/touch/navigation scrolling dismisses menus, preventing browser focus scrolling from closing them before selection.
- `web/features/chat/components/TranslatableText.tsx`: memoized tokenization and component.
- `web/features/chat/lib/socialReplies.ts`: exact source-message lookup, six reaction variants and eight semantic artwork responses; original speaker replies. Distinguishes unresolved equipment questions from found-equipment replies. Unknown messages produce no invented reply.
- `web/features/chat/hooks/useSocialInteractions.ts`: separate presentation events, current-timeline anchors, cancellation of superseded reactions, deduplication, timer cleanup on restart/unmount. Emoji replies never enter the main reducer or ethics counts.
- `web/features/chat/lib/sound.ts`: removes duplicate touch/click audio unlock paths; preserves existing BGM segments/art/audio assets.
- `web/tests/unit.mjs`: every authored incoming story message × six reactions, semantic artwork replies, speaker/chronology/unknown-message boundaries.

## Evidence
- `npm.cmd run check`: pass.
- `npm.cmd test`: pass, including all 6,561 story paths and registration/privacy/SQLite checks.
- `npm.cmd run deploy`: build and deployment pass.
- Browser at 390×844: real 500ms held click → one emoji tap applies and closes menu → original speaker replies to the quoted source.
- Browser at 320×568: two columns, drawer inside chat area, no horizontal overflow (document 320px); eighth artwork can be scrolled to and sent.
- Immediate restart after reaction: zero stale social replies/reactions; normal choices still advance.
- Regression: right-click an old message after automatic focus scrolling → next single tap selects the reaction; keyboard Enter also opens the menu.
- Translation regression at 390×844: click **Penolakan** in a new reaction reply → `拒絕／排斥` / `rejection / exclusion`; click **banduan** in its source quote → original bilingual entry; send a thanks artwork and click **Sama-sama** in its reply → `不客氣／一起／共同` / `you are welcome / together`. Quote word tokens remain inline. All social response variants pass dictionary coverage.
- Public entry page opens; deployed JS/CSS SHA-256 matches tested build. Production attendance was not populated with test IDs; synthetic registration used local D1 only.

## Constraints and next check
Preserve all preexisting uncommitted artwork/BGM/UI work. No AI, chat storage or answer analytics added; registration still stores only student ID/first join time. Never put persistence/network identifiers prohibited by unit tests under `features/chat/`.

Real iPhone Safari responsiveness and finger scrolling still require a user device check; browser viewport testing is not device FPS evidence. If a gesture issue reproduces on a real phone, capture scroll position and event ordering before changing the gesture logic.

No `DEBUG_HANDOFF.md` created: no root-cause hypothesis failed two repair attempts. Next safest action: refresh original URL on the user's phone and verify Emoji scrolling, single-tap selection and response wording.
