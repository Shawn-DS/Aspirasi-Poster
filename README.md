# Aspirasi-Poster

**Peluang Kedua: Memupuk Sifat Ihsan Masyarakat Terhadap Bekas Banduan**

網頁程式集中在 [`web/`](web/)，目前為馬來文的 WhatsApp 風格七題群聊原型，每題三個可橫向滑動的選項，各有對應回覆。進入前填學號並按 Join Group；D1 只記學號與首次加入時間，不記錄選擇或聊天。

```powershell
cd web
npm ci
npm run dev
```

預設開啟 `http://127.0.0.1:5173/`。詳細目錄與測試方式見 [`web/README.md`](web/README.md)。

同 Wi-Fi 手機測試的 QR 圖檔位於 [`output/qr/`](output/qr/)。此 QR 使用臨時區域網路位址，電腦預覽服務需保持執行。

七題版已部署至 [線上測試網站](https://peluang-kedua-taman-harmoni.wittyheron1.chatgpt.site)，任何持有連結的人都可直接瀏覽，無需登入。朋友可使用自己的 Wi-Fi 或流動網絡，電腦不用保持開機。請分享 `output/qr/peluang-kedua-online-qr.png`；詳見該目錄的說明。
