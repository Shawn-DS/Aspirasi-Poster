# Peluang Kedua — 模擬社區群聊

馬來文的 WhatsApp 風格互動原型。共七題，每題三個橫向滑動選項，各自有對應的角色回覆。先討論服完刑的人是否應得到第二次機會，再談居民顧慮；第三題回覆後 Amir 才入群。之後依序討論活動參與、公平分工、私隱及實際行動。最後根據第七題顯示反思結尾，並回應開場的態度。尚未接入 AI。

也可自行輸入；完全符合當輪選項文字時會走該分支，其他文字收到一般預寫回覆，不會判讀語意。

入群時只收集學號及首次加入時間，存入 Sites 管理的 D1 資料庫。學號去除首尾空白並統一大寫後去重。沒有姓名、IP、聊天、作答或完成度紀錄；加入代表開始參與，並不證明完成七題。刷新後重新顯示邀請頁，同學號不會增加名單筆數；遊戲內重播不會再次提交登記。

## 本地啟動

需要 Node.js 22.13 或更新版本。

```powershell
cd web
npm ci
npm run dev
```

打開終端顯示的本機網址，預設為 `http://127.0.0.1:5173/`。這是電腦本機網址，手機不能直接使用同一個網址連入。

## 檔案分類

```text
app/                    頁面入口、整體樣式與網頁 metadata
features/chat/
  ChatSimulator.tsx     群聊畫面、輸入與捲動行為
  components/           頭像、消息氣泡、正在輸入動畫
  data/story.ts         馬來文劇情、人物與回覆提示
  hooks/                消息播放計時與 React 狀態連接
  lib/                  純對話狀態邏輯
  types.ts              消息與對話類型
features/registration/ 入群邀請頁、學號驗證及公開登記寫入邏輯
app/api/join/           只接受 POST 的同源登記接口，沒有公開名單查詢
db/schema.ts           只有 student_id、joined_at 的名單資料表
drizzle/               資料表遷移 SQL 及 Drizzle 產生的版本資訊
public/                 網站圖示、聊天背景
tests/                  對話流程與隱私邊界檢查
build/                  Sites／Vinext 建置整合及其授權
scripts/                安裝、開發與建置工具
```

`build/` 和 `scripts/` 是啟動／建置實際使用的工具，並非舊版頁面。舊邀請卡、管理頁、選擇統計接口、範例和未使用 UI 元件已移除；最新要求加入的學號登記獨立放在 registration 與 db 目錄。

## 驗證

```powershell
npm run check
npm test
npm run build
```

手動試玩：學號留空應提示必填 → 輸入測試學號並 Join Group → 等開場消息播放 → 橫向滑動並選擇回覆 → 第三題後 Amir 加入 → 完成七次回覆 → 查看結尾。用頂欄重播按鈕測試重新開始；上捲閱讀時，新消息應以提示通知，避免拉走閱讀位置。

## 手機與 QR 測試

```powershell
npm run dev -- --hostname 0.0.0.0
```

讓手機和電腦連同一個 Wi-Fi，在手機打開終端列出的 `Network` 網址。當前測試位址為 `http://192.168.68.65:5173/`，對應 QR 位於根目錄的 `output/qr/`。電腦或 IP 更換後需要重新產生 QR；正式公開活動應改用穩定的公開網址。

鍵盤出現時，聊天介面會配合可視區域的高度與位移調整。選項採橫向滑動，不設左右方向鍵；打字時收起，按 **Lihat cadangan** 可收起鍵盤並查看。請用實體手機測試滑動、開啟／關閉鍵盤及旋轉螢幕。

點左上角或群名可打開故事與角色介紹，並返回原本的對話。

七題版仍以約兩分鐘為設計目標，沒有倒數或超時懲罰；實際閱讀與操作時間需要現場計時確認。

## 後續 AI 接入位置

目前回覆來源位於 `features/chat/data/story.ts`，播放狀態由 `useConversation` 管理。正式接 AI 時應新增伺服器端接口，將金鑰留在伺服器；本版沒有金鑰設定或對外 AI 請求。

## 資料庫與名單查看

網站使用 Sites 內建 Cloudflare D1，無需另開資料庫帳戶或填入前端金鑰；目前適用 Sites 公測方案包含的功能與用量限制，沒有替你購買獨立付費資料庫。

在 Sites 的網站設定／資料庫檢視器查看 `DB` → `participants`，或在這個聊天要求讀取或匯出參與名單。這是管理工具的受限操作；公開遊戲沒有讀取名單或導出學號的接口。此登記採自行填寫，沒有連接學校驗證系統。

若儲存失敗，畫面保留輸入並可重試。回傳不透露某學號是否已存在。正式活動前請以自己的手機測試一次。

首次本機設定資料庫（本機與線上完全分開）：

```powershell
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_rainy_tarot.sql
```

只在本機遷移尚未執行時套用一次。後續修改 schema 後執行 `npm run db:generate`，保留已套用的遷移；Sites 發布時會套用線上遷移。
