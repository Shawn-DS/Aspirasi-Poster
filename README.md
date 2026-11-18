# Aspirasi-Poster

**Peluang Kedua: Memupuk Sifat Ihsan Masyarakat Terhadap Bekas Banduan** · MPU1032

仿 WhatsApp 的馬來文群聊互動遊戲。同學掃 QR → 填學號按 **Join Group** → 進入 6 題倫理對話。前四題討論第二次機會、安全、公平與國家團結；Amir 同意入群後，第五題邀請他參與活動並自由分組，第六題反思。每題三個選項分別代表 **Deontologi**、**Utilitarianisme**、**Ethics of Care**，沒有對錯或扣分；完成後顯示個人的倫理傾向分析。

- **線上網址：** https://peluang-kedua-chat.mpu1032-aspirasi.workers.dev
- **公開統計：** https://peluang-kedua-chat.mpu1032-aspirasi.workers.dev/statistik （完成後也可按 **Lihat statistik komuniti** 查看）
- **海報 QR：** [`output/qr/peluang-kedua-cloudflare-qr.png`](output/qr/peluang-kedua-cloudflare-qr.png)（印刷用 [SVG](output/qr/peluang-kedua-cloudflare-qr.svg)）
- **託管：** 你自己的 Cloudflare 免費帳號（Worker `peluang-kedua-chat` + D1 資料庫 `peluang-kedua-db`）

## 修改對話內容

**題目、選項、角色回覆、結尾評語全部在一個檔案：** [`web/features/chat/data/story.ts`](web/features/chat/data/story.ts)

| 想改什麼 | 在 `story.ts` 的哪裡 |
|---|---|
| 6 題的題目、選項、回覆 | `steps` |
| 結尾的倫理傾向評語 | `ethicsProfiles` |
| 群組名稱、角色名字與顏色 | `group`、`people` |
| 介面上的其他文字 | `copy` |

每個選項的 `lens` 決定它算哪一派：`"deontology"`、`"utilitarianism"` 或 `"care"`。每題三個選項必須各佔一派（測試會檢查）。

長按鄰居訊息可選 emoji，鄰居會按原訊息與表情接話；底部 **Emoji** 面板也能送出八款圖案。這些預寫互動文案在 [`web/features/chat/lib/socialReplies.ts`](web/features/chat/lib/socialReplies.ts)，不接 AI，不影響六題進度或倫理傾向，也不記錄到資料庫。

分組文案與六種結果回覆在 [`web/features/chat/data/activities.ts`](web/features/chat/data/activities.ts)。四人可拖放或點選後放入兩隊，完成排列後按 **Cadangkan susunan ini** 發送。發送、重排與人物按鈕使用純文字，敘事訊息保留點詞翻譯。自動測試覆蓋全部 729 條作答路徑、24 種排列及字典。

目前架構與驗證紀錄集中在 [`CODEX_HANDOFF.md`](CODEX_HANDOFF.md)。

## 常用指令

在 `web/` 資料夾執行（PowerShell 請用 `npm.cmd`）：

| 指令 | 用途 |
|---|---|
| `npm.cmd run dev` | 本機預覽：http://127.0.0.1:5173/ |
| `npm.cmd test` | 改完內容後檢查有沒有出錯 |
| `npm.cmd run deploy` | 發布上線（網址和 QR 不變） |
| `npm.cmd run export` | 把參與名單匯出成 CSV 到 `output/participants/` |

`deploy` 和 `export` 需要先登入 Cloudflare 一次：`npx.cmd wrangler login`。

第一次在新電腦使用，先在 `web/` 執行 `npm.cmd ci` 安裝套件。

## 參與名單、匿名統計與隱私

- 參與名單只存 **學號** 和 **首次加入時間**；同一學號只記一次。
- 匿名統計分開存 **開始／完成次數、六題各選項累計**。不保存個人的完整答案、對話、學號或可跨題連結的會話代碼。隨機收據只用於防止重試多算票。
- 公開統計頁提供整體及逐題圓餅圖、比例與 **Muat turun CSV**；公開接口不讀取學號名單。
- 同一瀏覽器分頁內只累計每題第一次選擇，重播與刷新不重複計票；換分頁／裝置可能形成新會話，因此介面標示會話次數而非獨立人數。
- 待重試的匿名選項暫留該分頁，成功後刪除選項內容；失敗可重試。瀏覽器不允許分頁儲存時，僅在目前頁面防重複。
- 名單沒有公開讀取接口。查看方式：`npm.cmd run export`，或 Cloudflare 後台 → **Storage & Databases → D1 → peluang-kedua-db → participants**。
- 匯出的 CSV 含學號，`output/participants/` 已排除在 Git 之外。

## 專案結構

```text
output/qr/                     海報用 QR
web/
  features/chat/data/story.ts  ★ 對話內容（主要修改這裡）
  features/chat/               聊天畫面、對話邏輯、元件
  features/registration/       入群頁與學號驗證
  features/statistics/         匿名統計收據、圓餅圖、CSV
  app/                         頁面入口、樣式、/statistik、/api/join、/api/statistics
  db/、drizzle/                名單與匿名統計的獨立資料表
  scripts/export-participants.mjs   匯出名單
  tests/                       自動測試
  cloudflare.json              Cloudflare Worker 與資料庫設定
  worker.ts、vite.config.ts    建置設定（一般不用改）
```
