import type { MessageDraft, SenderId } from "../types";

export type ActivityId = "buddy";

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
  },
  waiting: "Selesaikan aktiviti dalam sembang untuk meneruskan.",
  continue: "Lihat aktiviti",
};

// Explicit content export lets the dictionary check cover every attachment and reply.
export const activityTexts = [
  ...Object.values(activityCopy).flatMap(value =>
    typeof value === "string"
      ? [value]
      : Object.values(value)
  ),
  ...Object.values(buddyOutcomes).flatMap(outcome => [outcome.action, ...outcome.replies.map(r => r.text)]),
];
