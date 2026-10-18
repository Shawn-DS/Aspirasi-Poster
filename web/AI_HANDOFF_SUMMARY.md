# Peluang Kedua (Taman Harmoni) — AI 交接與修改總結文件

這份文件整理了目前專案中所有已完成的功能、修改過的檔案路徑、以及**其他 AI 修改程式碼時必須遵守的測試限制**，你可以直接複製這份 Markdown 給其他 AI。

## 1. 專案架構與其他 AI 必讀限制（重要）

1. **嚴格隱私測試限制（`web/tests/unit.mjs`）**：
   - 測試程式會掃描 `web/features/chat/` 底下所有 `.ts` 與 `.tsx` 檔案。
   - 檔案內（**包含註解**）絕對不能出現以下 4 個字詞，否則測試會直接失敗：
     - `localStorage`
     - `sessionStorage`
     - `indexedDB`
     - `fetch`
2. **8 題對話狀態機完整性測試（`web/tests/unit.mjs`）**：
   - 測試會跑完 $3^8 = 6,561$ 種所有作答組合，並嚴格檢查 `web/features/chat/lib/conversation.ts` 產生的 `messages` 數量與順序。
   - 包含 Q4 後的「互助組隊活動（`buddy`）」與 Q7 中的「尋找線索活動（`evidence`）」的活動錨點（`activityAnchors`）與防重送防篡改閘道（`pendingActivity`）。
   - 所有貼圖（Stickers）與訊息表情反應（Reactions）都在 UI 層渲染，不直接修改 `conversation.ts` 的核心對話歷史陣列。
3. **100% 雙語字典覆蓋率（`web/tests/unit.mjs`）**：
   - `web/features/chat/data/story.ts` 與 `web/features/chat/data/activities.ts`（`activityTexts`）裡出現的每一個馬來文單字，都必須在 `web/features/chat/data/dictionary.ts` 裡有對應的中文（`zh`）與英文（`en`）翻譯。

## 2. 已完成的修改與功能清單

### (1) 首頁（輸入學號與 Join Group 頁面）與手機版自適應修復
- **修改檔案**：
  - `web/features/registration/GroupInvitation.tsx`
  - `web/features/chat/hooks/useChatViewport.ts`
  - `web/app/layout.tsx`
  - `web/app/globals.css`
- **修改內容**：
  - 採用米白暖色有機波浪背景（`peluangkedua`）搭配底部毛玻璃輸入卡（`.join-poster-dock`），右下角裝飾植物（`.join-dock-plant`）外移至邊角不遮擋隱私文字。
  - **手機鍵盤與縮放修復**：將輸入框字體設為 `16px`、在 `layout.tsx` 設定 `maximumScale: 1, userScalable: false` 防止 iOS 自動放大；透過 `window.visualViewport` 與 `position: fixed; inset: 0; overflow: hidden` 鎖定畫面，解決手機收起鍵盤後頁面滑動位移的問題。

### (2) 社區群組頭像與個人（Anda）vs Amir 鮮明區隔
- **修改檔案**：
  - `web/features/chat/components/Avatar.tsx`
  - `web/features/chat/data/story.ts`
- **修改內容**：
  - `<Avatar group />` 繪製了 **Taman Harmoni 三間排屋**作為背景，並讓群組 4 位核心成員（**Puan Aina、Uncle Lim、Amir、Admin Komuniti**）並肩微笑同框。
  - **區隔 Anda（玩家我）與 Amir 頭像**：
    - **Amir（更生人鄰居）**：保留其招牌**經典深森林綠（Emerald Green `#2f7a59`）**襯衫、嫩綠背景（`#dcecdf`）與淺綠外圈環（`#86efac`）。
    - **Anda（玩家我）**：改用**清新天空藍背景（Sky Blue `#e0f2fe`）**、亮天藍外環（`#7dd3fc`）、**皇家蔚藍襯衫（Royal Blue `#2563eb`）**、白色圓領領口、深灰俐落短髮（`#1e293b`），名牌色彩更新為湛藍（`#1d6ea5`），一眼即可輕鬆區分自己與 Amir。

### (3) 雙階段背景音樂（Dual-Stage BGM）與互動音效
- **修改檔案**：
  - `web/public/bgm.mp3`
  - `web/features/chat/lib/sound.ts`
- **修改內容**：
  - **跳過前奏空白**：直接從 `5.2s` 開始播放。
  - **思考階段（`thinking`：`5.2s – 183.0s`）**：在首頁與回答 8 道倫理情境題時，循環播放溫柔沉靜的鋼琴段落。
  - **完成結算階段（`complete`：`184.8s – 207.2s`）**：第 8 題結束顯示最終倫理反思結果卡時，自動切換並循環播放輕快明亮的木琴與鋼琴段落。
  - **Web Audio 合成音效**：包含收訊氣泡聲 `playMessagePop()`、三種倫理傾向專屬音效 `playChoiceSfx(lens)`、按讚氣泡聲 `playReactionPop()`、以及貼圖/吉祥物彈跳聲 `playMascotBoing()`。

### (4) 長按訊息彈出 WhatsApp 經典 Emoji React
- **修改檔案**：
  - `web/features/chat/components/MessageBubble.tsx`
  - `web/features/chat/data/stickers.ts`
- **修改內容**：
  - 平時訊息氣泡角落隱藏按鈕；**長按訊息約 0.36 秒**（或電腦右鍵）才會彈出 WhatsApp 經典 6 個反應 Emoji（`👍`、`❤️`、`🙏`、`😮`、`😢`、`🤝`）。
  - 玩家送出回答後，氣泡右下角會自動出現鄰居的 Emoji 共鳴（Deontologi `⚖️ 👍`、Utilitarianisme `🛡️ 🤝`、Ethics of Care `❤️ 🙏`）。

### (5) 精選 8 張「附馬來文標語與中文意思」的 WhatsApp 社區貼圖包
- **修改檔案**：
  - `web/public/stickers/`（`s06.png`, `s08.png`, `s12.png`, `s15.png`, `s23.png`, `s24.png`, `s34.png`, `s37.png`）
  - `web/features/chat/data/stickers.ts`
  - `web/features/chat/ChatSimulator.tsx`
- **修改內容**：
  - 底部工具列新增 `Pelekat`（貼圖）按鈕，打開 `2 × 4` 貼圖抽屜（每張附馬來文字牌與中文意思：`SALAM JIRAN! 👋`、`MANISNYA HATI! ❤️`、`TERIMA KASIH! 🙏`、`SAYA SOKONG! 👍`、`BAWA BERTENANG 🌿`、`PELUANG KEDUA ✨`、`JANGAN TUDUH! ⚖️`、`JAGA KOMUNITI 🤝`）。
  - 第 3 題 Amir 入群後與第 8 題 Admin 總結後會自動傳送貼圖；玩家也可隨時從貼圖抽屜發送貼圖到聊天室，鄰居會在 `0.62 秒` 後自動對玩家的貼圖按 Emoji React。

### (6) 進度條「成長型迷你吉祥物」與最終結果卡吉祥物互動
- **修改檔案**：`web/features/chat/ChatSimulator.tsx`
- **修改內容**：
  - **進度條迷你吉祥物（`.chapter-mascot-pill`）**：在 `1 / 8` 旁，尚未作答時顯示小幼苗 `🌱`，開始作答後即時變成目前領先的 Q 版倫理吉祥物徽章，點擊可彈出目前傾向名稱。
  - **最終結果卡吉祥物（`.reflection-mascot-btn`）**：在結果卡（`.reflection-card`）點擊 96px 吉祥物會觸發彈跳動畫、星星特效與音效，並在頭頂依序顯示**最多 3 句**鼓勵句子（`MAX_MASCOT_QUOTES = 3`），點滿 3 次後即自動隱藏點擊提示、不再重複輪播。

#### (7) Gotong-Royong 互助組隊：純拖曳排班看板 + 玩家分組動態對話（Q4 後 `buddy` 活動）
- **修改檔案**：
  - `web/features/chat/components/ChatActivity.tsx`
  - `web/features/chat/data/activities.ts`
  - `web/features/chat/components/chat-activities.css`
  - `web/features/chat/data/dictionary.ts`
- **修改內容**：
  - **全自由拖曳排班看板**：
    - **Pasukan 1 · Taman & Stor**：`[ 空槽位 1 ]` 🤝 `[ 空槽位 2 ]`
    - **Pasukan 2 · Laluan & Longkang**（走道打掃與水溝清淤，符合最典型社區大掃除工作）：`[ 空槽位 3 ]` 🤝 `[ 空槽位 4 ]`
    - 下方 4 人頭像托盤：**Anda（我）、Amir、Puan Aina、Uncle Lim**。
    - 支援手指/滑鼠拖曳、點擊放入、前 3 人放好時第 4 人智慧補位、槽位間隨意交換、右上角「Susun semula」重新排班。
  - **動態對應玩家實際排定的分組**（`resolveBuddyOutcome`）：
    - 玩家送出的句子與鄰居的回覆**100% 反映玩家實際安排的隊伍名單**。
    - 例如玩家將「Puan Aina & Amir 排在第 1 隊，Uncle Lim & Anda 排在第 2 隊」：
      - Anda 送出：`Saya cadangkan susunan ini: Puan Aina dan Amir di Pasukan 1, manakala saya dan Uncle Lim di Pasukan 2!`
      - Puan Aina 回覆：`Baiklah, saya berganding dengan Amir. Jom Amir, kita mulakan tugas ini bersama!`
      - Amir 回覆：`Terima kasih Puan Aina. Saya gembira dapat bekerjasama dengan Puan Aina dan Uncle Lim!`
    - 全部 6 種組合均有專屬對話與完整馬來文字典釋義。

### (8) 尋找失蹤工具：真實現場插畫 CCTV 畫面 + 純淨無遮擋圖面 + 獨立 [ BM | 中文 | EN ] 語言切換（Q7 中 `evidence` 活動）
- **修改檔案**：
  - `web/public/cctv-pondok.jpg`
  - `web/features/chat/components/ChatActivity.tsx`
  - `web/features/chat/data/activities.ts`
  - `web/features/chat/components/chat-activities.css`
  - `web/features/chat/data/dictionary.ts`
- **修改內容**：
  - **真實現場插畫風格 CCTV 監視器畫面（`cctv-pondok.jpg`）**：
    - 畫面展示早晨 10:15 的客觀監視畫面（早晨大掃除期間大家都在公園與涼亭周圍活動，不管誰與誰搭檔，此畫面記錄的是客觀歷史事件：10:15 AJK 搬移工具箱至 STOR，與 Q4 分組完全和諧不衝突）。
    - 包含 STOR 儲藏室、雙手抱著綠色工具箱的 AJK 委員、PONDOK 涼亭空桌、步道上的手套籃、以及右側雙手握掃帚掃落葉的 Amir。
    - **100% 乾淨無遮擋純圖**：已移除所有覆蓋在圖畫上的實心數字標記，完全不遮擋人物的臉、手部、工具或背景。
    - **下方 4 個獨立線索卡**：使用者直接點擊圖片正下方的 4 個線索卡（`① 08:00 Meja Pondok`、`② 08:30 Amir & Penyapu`、`③ 10:15 AJK & Stor Komuniti`、`④ 10:20 Bakul Sarung Tangan`）進行比對。
    - 點選 `③ 10:15`（AJK 移走工具箱）畫面上即時蓋上綠色「`✓ BUKTI CCTV SAH · 10:15`」認證章，解鎖分享按鈕。
  - **獨立語言切換器（`[ BM | 中文 | EN ]`）**：
    - 將原本堆疊在一起的中英文翻譯**徹底拆開**為分段按鈕：
      - 點擊 **`中文`**：所有標題、操作說明、4 條線索與判定回饋**只顯示清晰中文翻譯**，不再混雜英文。
      - 點擊 **`EN`**：所有內容**只顯示英文翻譯**，不再混雜中文。
      - 點擊 **`BM`**：回到純馬來文原文。

## 3. 常用指令（在 `web/` 目錄下執行）
- **型別檢查**：`npm.cmd run check`
- **執行完整測試（6,561 路線 + 活動狀態機 + 隱私檢查）**：`npm.cmd test`
- **啟動本地預覽（Port 5173/5174）**：`npm.cmd run dev`
- **正式生產環境建置**：`npm.cmd run build`
- **部署至 Cloudflare Workers**：`npm.cmd run deploy`
