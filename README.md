# Aspirasi-Poster

**Peluang Kedua: Memupuk Sifat Ihsan Masyarakat Terhadap Bekas Banduan** · MPU1032

水彩繪本風格的馬來文互動模擬。同學掃 QR → 填學號 → 扮演僱主，依序在資訊有限、取得正式訓練證書、得知工作風險三個階段決定是否給予面試機會，再排列法律、公眾安全與個人改變三項考量。完成後顯示個人決策歷程與匿名群體統計，沒有對錯或扣分。

- **線上網址：** https://peluang-kedua-chat.mpu1032-aspirasi.workers.dev
- **公開統計：** https://peluang-kedua-chat.mpu1032-aspirasi.workers.dev/statistik （完成後也可按 **Lihat statistik komuniti** 查看）
- **海報 QR：** [`output/qr/peluang-kedua-cloudflare-qr.png`](output/qr/peluang-kedua-cloudflare-qr.png)（印刷用 [SVG](output/qr/peluang-kedua-cloudflare-qr.svg)）
- **託管：** 你自己的 Cloudflare 免費帳號（Worker `peluang-kedua-chat` + D1 資料庫 `peluang-kedua-db`）

## 修改對話內容

**階段敘事、選項與排序項目：** [`web/features/chat/data/story.ts`](web/features/chat/data/story.ts)

| 想改什麼 | 在 `story.ts` 的哪裡 |
|---|---|
| 三個面試決策階段 | `decisionStages` |
| 三項優先考量與六種排列 | `priorityItems`、`RANKING_PERMUTATIONS` |
| 介面上的文字 | `copy` |

前三個階段各有兩個選項，第四階段支援拖曳、點選交換及上下按鈕排序。敘事支援中英點詞翻譯；自動測試覆蓋全部 48 條決策歷程、六種排序及字典。

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
- 匿名統計分開存 **開始／完成次數、三個決策階段各選項與六種排序的累計**。不保存個人的完整答案、學號或可跨題連結的會話代碼。隨機收據只用於防止重試多算票；目前統計版本為 `employer-visual-v1`。
- 公開統計頁提供三階段面試選擇長條圖、排序分布、平均名次與 **Muat turun CSV**；公開接口不讀取學號名單。
- 同一瀏覽器分頁內只累計每題第一次選擇，重播與刷新不重複計票；換分頁／裝置可能形成新會話，因此介面標示會話次數而非獨立人數。
- 待重試的匿名選項暫留該分頁，成功後刪除選項內容；失敗可重試。瀏覽器不允許分頁儲存時，僅在目前頁面防重複。
- 名單沒有公開讀取接口。查看方式：`npm.cmd run export`，或 Cloudflare 後台 → **Storage & Databases → D1 → peluang-kedua-db → participants**。
- 匯出的 CSV 含學號，`output/participants/` 已排除在 Git 之外。

## 專案結構

```text
output/qr/                     海報用 QR
web/
  features/chat/data/story.ts  ★ 階段敘事與排序內容（主要修改這裡）
  features/chat/               水彩場景、決策流程、排序與結果元件
  features/registration/       入群頁與學號驗證
  features/statistics/         匿名統計收據、長條圖、排序統計、CSV
  app/                         頁面入口、樣式、/statistik、/api/join、/api/statistics
  db/、drizzle/                名單與匿名統計的獨立資料表
  scripts/export-participants.mjs   匯出名單
  tests/                       自動測試
  cloudflare.json              Cloudflare Worker 與資料庫設定
  worker.ts、vite.config.ts    建置設定（一般不用改）
```
