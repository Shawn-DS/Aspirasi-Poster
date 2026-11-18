# App 程式碼清理與重構計畫

日期：2026-10-24  
專案：Peluang Kedua — Taman Harmoni 群聊互動遊戲  
狀態：**已完成本地清理、結構重構、中度視覺升級、完整驗證並部署至正式環境（Cloudflare Version ID：`04318ca8-2409-4115-8937-62fb736bb0c6`）。**

## 執行摘要（2026-10-24）

1. **移除未使用舊結局模型與文案**：
   - 自 `web/features/chat/types.ts`、`web/features/chat/lib/conversation.ts`、`web/features/chat/hooks/useConversation.ts` 與 `web/features/chat/data/story.ts` 移除未使用的 `Reflection`、`lastLens`、`ending` 及 `copy.placeholder`、`copy.send`、`copy.showSuggestions`、`copy.endTitle`、`copy.endText`（保留 `ethicsProfile` 與 `firstChoice`）。
   - 更新 `web/tests/unit.mjs` 以驗證現行 `ethicsProfile` 與 `openingReflections[firstChoice]`。
   - 移除空白設定檔 `web/next.config.ts`，並確認 `vinext build` 正常通過。
2. **前端元件拆分與重複 JSX 整理**：
   - 自 `web/features/chat/ChatSimulator.tsx` 拆出 `ReflectionCard.tsx`、`WordPopover.tsx`、`StickerDrawer.tsx` 與 `CommunityDialog.tsx`。
   - 以 `TEAM_PODS` 整理 `web/features/chat/components/ChatActivity.tsx` 的兩個分組區域，保留拖放、點選、鍵盤操作與純文字送出按鈕。
3. **共用 HTTP 與統計驗證邏輯**：
   - 新增 `web/lib/request.ts` 提供共用 headers、同源檢查、JSON content-type 檢查與 1 KB 串流讀取限制，供 `registration/server.ts` 與 `statistics/server.ts` 共用。
   - 於 `web/features/statistics/catalog.ts` 新增純驗證函式 `isValidStatisticsChoice`、`statisticsEventSlotKey`、`parseStatisticsEvent`，統一 `client.ts`、`server.ts` 與 `StatisticsDashboard.tsx` 的版本與題目結構驗證。
   - 新增 `web/tests/helpers.mjs` 統一 4 個測試檔的 `importSource` 載入器。
4. **同步 Drizzle Schema 與 Migration Metadata**：
   - 於 `web/db/schema.ts` 補齊 `statistics_counters_non_negative` 與 `statistics_receipts_sha256_len` CHECK constraints。
   - 更新 `web/drizzle/meta/_journal.json` 並建立 `web/drizzle/meta/0001_snapshot.json`，確認 `npx.cmd drizzle-kit generate` 輸出無須新增 migration。
5. **CSS 清理與五大畫面中度視覺升級**：
   - 刪除 `web/app/globals.css` 確認無引用的舊選擇器並整合重複覆寫規則，補齊 `:root` 的 `--sans` 變數。
   - 升級五大畫面（Join 入口、聊天主畫面、四人分組活動卡、結尾個人結果卡、統計彈窗與 `/statistik` 公開頁）的色彩層次、卡片立體感與玻璃擬態質感。
   - 修正手機版 Join 畫面右下角盆栽 `.join-dock-plant` 壓到隱私說明文字的問題，以及分組活動卡 `"Susun semula"` 按鈕在窄螢幕斷成兩行的問題。
6. **驗證結果**：
   - `npm.cmd run check`、`npx.cmd tsc --noEmit --noUnusedLocals --noUnusedParameters`、`npm.cmd test`（4 個測試套件全數通過）、`npm.cmd run build` 均通過。
   - 390×844、320×568、1440×900 共 29 張修改後截圖（`after_*`）全數確認 `scrollW === clientW` 且無任何橫向溢出或遮擋。

---

## 原始計畫與保留規範（供查考）

### 目標與保留範圍

- 整理重複邏輯、過大的元件、累積覆寫的 CSS，以及確認沒有使用的舊資料和樣式。
- 保持現有外觀架構、六題劇情、每個選項的對應回覆、動畫和操作方式，並進行中度視覺質感升級。
- 保留 Student ID 登記、Emoji、Translate 字典、長按互動、四人分組、音樂、結果及匿名統計圓餅圖。
- 保留已儲存的參與名單與統計資料，保持兩者無法連結到個人的作答。
- 不增加劇情文字、問題、AI API、道德排名或新玩法。

### 特別容易回歸的互動（已全數保留並驗證）

- 手機 `visualViewport`、鍵盤及輸入字級相容處理。
- 360 ms 長按後，第一次點 Emoji 就可操作；使用者捲動會關閉選單，自動焦點捲動不誤關閉。
- `.social-quote > span` 的直接子元素結構及文字連續排版。
- Amir 在第四題後加入；第五題回覆後進入分組；送出分組並完成回覆才到第六題。
- 分組按鈕 `Cadangkan susunan ini` 使用純文字，不嵌套可點擊翻譯元件。
- 分組支援拖放、點選及鍵盤；送出內容與實際隊伍一致，重設會取消舊計時器。
- 音樂解鎖、靜音、分頁可見性和目前循環／結束片段設定。
- Emoji、社交互動及分組訊息不增加六題倫理選擇計數。
