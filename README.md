# Aspirasi-Poster

**Peluang Kedua: Memupuk Sifat Ihsan Masyarakat Terhadap Bekas Banduan** · MPU1032

仿 WhatsApp 的馬來文群聊互動遊戲。同學掃 QR → 填學號按 **Join Group** → 進入 8 題倫理兩難對話。每題三個選項分別代表 **Deontologi**、**Utilitarianisme**、**Ethics of Care**，沒有對錯或扣分；完成後顯示個人的倫理傾向分析。

- **線上網址：** https://peluang-kedua-chat.mpu1032-aspirasi.workers.dev
- **海報 QR：** [`output/qr/peluang-kedua-cloudflare-qr.png`](output/qr/peluang-kedua-cloudflare-qr.png)（印刷用 [SVG](output/qr/peluang-kedua-cloudflare-qr.svg)）
- **託管：** 你自己的 Cloudflare 免費帳號（Worker `peluang-kedua-chat` + D1 資料庫 `peluang-kedua-db`）

## 修改對話內容

**題目、選項、角色回覆、結尾評語全部在一個檔案：** [`web/features/chat/data/story.ts`](web/features/chat/data/story.ts)

| 想改什麼 | 在 `story.ts` 的哪裡 |
|---|---|
| 8 題的題目、選項、回覆 | `steps` |
| 結尾的倫理傾向評語 | `ethicsProfiles` |
| 群組名稱、角色名字與顏色 | `group`、`people` |
| 介面上的其他文字 | `copy` |

每個選項的 `lens` 決定它算哪一派：`"deontology"`、`"utilitarianism"` 或 `"care"`。每題三個選項必須各佔一派（測試會檢查）。

長按鄰居訊息可選 emoji，鄰居會按原訊息與表情接話；底部 **Emoji** 面板也能送出八款圖案。這些預寫互動文案在 [`web/features/chat/lib/socialReplies.ts`](web/features/chat/lib/socialReplies.ts)，不接 AI，不影響八題進度或倫理傾向，也不記錄到資料庫。

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

## 參與名單與隱私

- 資料庫只存 **學號** 和 **首次加入時間**；同一學號只記一次。
- 遊戲中的選擇與對話 **完全不記錄**。
- 名單沒有公開讀取接口。查看方式：`npm.cmd run export`，或 Cloudflare 後台 → **Storage & Databases → D1 → peluang-kedua-db → participants**。
- 匯出的 CSV 含學號，`output/participants/` 已排除在 Git 之外。

## 專案結構

```text
output/qr/                     海報用 QR
web/
  features/chat/data/story.ts  ★ 對話內容（主要修改這裡）
  features/chat/               聊天畫面、對話邏輯、元件
  features/registration/       入群頁與學號驗證
  app/                         頁面入口、樣式（globals.css）、/api/join 接口
  db/、drizzle/                名單資料表定義
  scripts/export-participants.mjs   匯出名單
  tests/                       自動測試
  cloudflare.json              Cloudflare Worker 與資料庫設定
  worker.ts、vite.config.ts    建置設定（一般不用改）
```
