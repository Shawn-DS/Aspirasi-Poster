import type { MessageDraft, SenderId } from "../types";

export type ActivityId = "buddy" | "evidence";

export const buddyOutcomes = {
  youAmir_team1: {
    action: "Saya cadangkan susunan ini: Saya dan Amir di Pasukan 1, manakala Puan Aina dan Uncle Lim di Pasukan 2!",
    replies: [
      { sender: "amir", text: "Terima kasih kerana sudi berganding dengan saya. Jom kita buat yang terbaik bersama!" },
      { sender: "aina", text: "Saya dan Uncle Lim pun satu pasukan. Mari kita saling membantu!" },
    ] as MessageDraft[],
    otherPair: ["aina", "lim"] as [SenderId, SenderId],
  },
  youAmir_team2: {
    action: "Saya cadangkan susunan ini: Puan Aina dan Uncle Lim di Pasukan 1, manakala saya dan Amir di Pasukan 2!",
    replies: [
      { sender: "amir", text: "Terima kasih kerana sudi berganding dengan saya. Jom kita buat yang terbaik bersama!" },
      { sender: "aina", text: "Saya dan Uncle Lim pun satu pasukan. Mari kita saling membantu!" },
    ] as MessageDraft[],
    otherPair: ["aina", "lim"] as [SenderId, SenderId],
  },
  youLim_team1: {
    action: "Saya cadangkan susunan ini: Saya dan Uncle Lim di Pasukan 1, manakala Puan Aina dan Amir di Pasukan 2!",
    replies: [
      { sender: "aina", text: "Baiklah, saya berganding dengan Amir. Jom Amir, kita mulakan tugas ini bersama!" },
      { sender: "amir", text: "Terima kasih Puan Aina. Saya gembira dapat bekerjasama dengan Puan Aina dan Uncle Lim!" },
    ] as MessageDraft[],
    otherPair: ["aina", "amir"] as [SenderId, SenderId],
  },
  youLim_team2: {
    action: "Saya cadangkan susunan ini: Puan Aina dan Amir di Pasukan 1, manakala saya dan Uncle Lim di Pasukan 2!",
    replies: [
      { sender: "aina", text: "Baiklah, saya berganding dengan Amir. Jom Amir, kita mulakan tugas ini bersama!" },
      { sender: "amir", text: "Terima kasih Puan Aina. Saya gembira dapat bekerjasama dengan Puan Aina dan Uncle Lim!" },
    ] as MessageDraft[],
    otherPair: ["aina", "amir"] as [SenderId, SenderId],
  },
  youAina_team1: {
    action: "Saya cadangkan susunan ini: Saya dan Puan Aina di Pasukan 1, manakala Uncle Lim dan Amir di Pasukan 2!",
    replies: [
      { sender: "lim", text: "Baiklah, saya berganding dengan Amir. Mari kita uruskan tugas ini bersama, Amir." },
      { sender: "amir", text: "Terima kasih Uncle Lim kerana sudi bekerjasama dengan saya. Jom kita mula bersama!" },
    ] as MessageDraft[],
    otherPair: ["lim", "amir"] as [SenderId, SenderId],
  },
  youAina_team2: {
    action: "Saya cadangkan susunan ini: Uncle Lim dan Amir di Pasukan 1, manakala saya dan Puan Aina di Pasukan 2!",
    replies: [
      { sender: "lim", text: "Baiklah, saya berganding dengan Amir. Mari kita uruskan tugas ini bersama, Amir." },
      { sender: "amir", text: "Terima kasih Uncle Lim kerana sudi bekerjasama dengan saya. Jom kita mula bersama!" },
    ] as MessageDraft[],
    otherPair: ["lim", "amir"] as [SenderId, SenderId],
  },
} as const;

export function resolveBuddyOutcome(slots: (SenderId | null)[]) {
  const team1 = [slots[0], slots[1]];
  const youInTeam1 = team1.includes("you");
  const partnerTeam = youInTeam1 ? team1 : [slots[2], slots[3]];

  if (partnerTeam.includes("amir")) {
    return youInTeam1 ? buddyOutcomes.youAmir_team1 : buddyOutcomes.youAmir_team2;
  }
  if (partnerTeam.includes("lim")) {
    return youInTeam1 ? buddyOutcomes.youLim_team1 : buddyOutcomes.youLim_team2;
  }
  return youInTeam1 ? buddyOutcomes.youAina_team1 : buddyOutcomes.youAina_team2;
}

export const activityCopy = {
  buddy: {
    title: "Cadangan pasukan gotong-royong",
    intro: "Bagaimanakah cadangan susunan pasukan gotong-royong kita? Seret avatar ahli ke dalam slot pasukan untuk menyusun jadual.",
    task: "Susun 4 ahli ke dalam 2 pasukan",
    hint: "Seret avatar ke dalam slot kosong, atau ketik avatar kemudian ketik slot pasukan.",
    selectedHint: "Sekarang ketik slot pasukan untuk meletakkan ahli ini.",
    readyHint: "Semua ahli sudah disusun! Ketik butang di bawah untuk menghantar cadangan anda.",
    teamA: "Pasukan 1 · Taman & Stor",
    teamB: "Pasukan 2 · Laluan & Longkang",
    emptySlot: "Slot kosong",
    reset: "Susun semula",
    confirm: "Cadangkan susunan ini",
    matched: "Cadangan dipersetujui: Pasukan gotong-royong telah disusun!",
    joined: "Semua ahli bersetuju dengan susunan pasukan ini!",
    action: buddyOutcomes.youAmir_team1.action,
    replies: buddyOutcomes.youAmir_team1.replies,
  },
  evidence: {
    title: "Rakaman CCTV & rekod pondok",
    intro: "Ini imej CCTV dan rekod di pondok hari ini. Ketik rekod di bawah untuk melihat apa sebenarnya berlaku kepada kotak peralatan.",
    preview: "Buka imej CCTV · Cari bukti",
    label: "Pondok Komuniti · Kamera CCTV 10:15",
    hint: "Ketik rekod di bawah imej CCTV untuk memeriksa bukti.",
    wrong: "Bahagian ini belum menjelaskan siapa yang mengalihkan kotak peralatan. Cuba periksa rekod lain.",
    found: "Bukti CCTV ditemui: Pada 10:15, AJK memindahkan kotak peralatan ke stor komuniti manakala Amir sedang menyapu.",
    share: "Kongsi bukti CCTV",
    shared: "Bukti CCTV dikongsi",
    close: "Tutup imej",
    choose: "Pilih rekod bukti",
    translate: "Translate",
    closeTranslation: "Tutup terjemahan",
    translateHint: "Terjemahan Bahasa Cina dan Bahasa Inggeris dipaparkan di bawah.",
    action: "Rekod 10:15: AJK telah memindahkan kotak peralatan ke stor komuniti. Mari semak di sana dahulu.",
    replies: [
      { sender: "lim", text: "Catatan itu menjelaskan lokasi kotak. Saya tarik balik sangkaan terhadap Amir tadi." },
      { sender: "amir", text: "Terima kasih kerana menyemak bukti dan memberi saya ruang untuk didengar." },
    ] as MessageDraft[],
  },
  waiting: "Selesaikan aktiviti dalam sembang untuk meneruskan.",
  continue: "Lihat aktiviti",
};

export const toolRecords = [
  { id: "setup", time: "08:00", text: "AJK meletakkan kotak peralatan di pondok." },
  { id: "broom", time: "08:30", text: "Uncle Lim meminjam dua batang penyapu." },
  { id: "storage", time: "10:15", text: "AJK memindahkan kotak peralatan ke stor komuniti." },
  { id: "gloves", time: "10:20", text: "Puan Aina memulangkan sarung tangan." },
] as const;

export const EVIDENCE_RECORD_ID = "storage";

// Full sentence translations for the Evidence CCTV modal when Translate is toggled ON.
export const evidenceBilingual = {
  title: {
    zh: "社區涼亭 CCTV 監視畫面與紀錄",
    en: "Community Gazebo CCTV Footage & Log",
  },
  hint: {
    zh: "請點擊 CCTV 畫面下方的紀錄線索，找出工具箱真正的去向。",
    en: "Tap the clue records below the CCTV image to find out what really happened to the equipment box.",
  },
  wrong: {
    zh: "這個紀錄還沒說明是誰移走了工具箱。請點擊下方其他線索看看！",
    en: "This record doesn't explain who moved the equipment box yet. Try inspecting another clue below!",
  },
  found: {
    zh: "找到關鍵證據！10:15 的 CCTV 拍到是 AJK 委員將工具箱搬進社區儲藏室，而 Amir 當時正拿著掃帚在旁掃地，並未偷拿工具。",
    en: "Key CCTV evidence found! At 10:15, an AJK committee member moved the equipment box to the community storeroom while Amir was sweeping nearby.",
  },
  share: {
    zh: "分享 CCTV 證據到群組",
    en: "Share CCTV Evidence",
  },
  records: {
    setup: {
      spot: "Meja Pondok",
      zh: "08:00 — 委員會（AJK）早上將工具箱放在涼亭桌上（目前桌面已空）。",
      en: "08:00 — AJK placed the equipment box on the gazebo table (now empty).",
    },
    broom: {
      spot: "Amir & Penyapu",
      zh: "08:30 — Uncle Lim 借了兩把掃帚；畫面中 Amir 兩手只拿著掃帚在掃地，沒有拿工具箱。",
      en: "08:30 — Uncle Lim borrowed two brooms; CCTV shows Amir only holding a broom sweeping, not taking the box.",
    },
    storage: {
      spot: "AJK & Stor Komuniti",
      zh: "10:15 — 【關鍵證據】CCTV 拍到 AJK 委員抱著綠色工具箱搬往社區儲藏室（Stor）！",
      en: "10:15 — [KEY PROOF] CCTV captured the AJK member carrying the green equipment box into the community storeroom!",
    },
    gloves: {
      spot: "Bakul Sarung Tangan",
      zh: "10:20 — Puan Aina 歸還了工作手套放在涼亭籃子裡。",
      en: "10:20 — Puan Aina returned the work gloves to the basket.",
    },
  },
} as const;

// Explicit content export lets the dictionary check cover every attachment and reply.
export const activityTexts = [
  ...Object.values(activityCopy).flatMap(value =>
    typeof value === "string"
      ? [value]
      : Object.values(value).flatMap(item => (typeof item === "string" ? [item] : item.map(message => message.text)))
  ),
  ...Object.values(buddyOutcomes).flatMap(outcome => [outcome.action, ...outcome.replies.map(r => r.text)]),
  ...toolRecords.map(record => record.text),
];
