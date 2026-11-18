import type { EthicsLens } from "../types";

export interface StickerItem {
  id: string;
  src: string;
  caption: string;
  meaning: string;
  color: string;
}

// 8 curated, expressive stickers with clear community captions & meanings
export const STICKER_PACK: StickerItem[] = [
  {
    id: "s12",
    src: "/stickers/s12.png",
    caption: "SALAM JIRAN! 👋",
    meaning: "熱情招呼",
    color: "#c26a1b",
  },
  {
    id: "s23",
    src: "/stickers/s23.png",
    caption: "MANISNYA HATI! ❤️",
    meaning: "太暖心了",
    color: "#d6336c",
  },
  {
    id: "s15",
    src: "/stickers/s15.png",
    caption: "TERIMA KASIH! 🙏",
    meaning: "非常感謝",
    color: "#b4235a",
  },
  {
    id: "s24",
    src: "/stickers/s24.png",
    caption: "SAYA SOKONG! 👍",
    meaning: "非常贊同",
    color: "#0f766e",
  },
  {
    id: "s08",
    src: "/stickers/s08.png",
    caption: "BAWA BERTENANG 🌿",
    meaning: "冷靜思考",
    color: "#a15c38",
  },
  {
    id: "s34",
    src: "/stickers/s34.png",
    caption: "PELUANG KEDUA ✨",
    meaning: "支持自新",
    color: "#0369a1",
  },
  {
    id: "s37",
    src: "/stickers/s37.png",
    caption: "JANGAN TUDUH! ⚖️",
    meaning: "別亂猜忌",
    color: "#4d7c0f",
  },
  {
    id: "s06",
    src: "/stickers/s06.png",
    caption: "JAGA KOMUNITI 🤝",
    meaning: "守護社區",
    color: "#1e40af",
  },
];

export const STICKER_BY_ID: Record<string, StickerItem> = Object.fromEntries(
  STICKER_PACK.map(item => [item.id, item]),
);

// Classic, intuitive WhatsApp reactions shown when long-pressing any message
export const WHATSAPP_REACTION_EMOJIS = [
  { emoji: "👍", label: "Setuju" },
  { emoji: "❤️", label: "Prihatin" },
  { emoji: "🙏", label: "Terima kasih" },
  { emoji: "😮", label: "Terkejut" },
  { emoji: "😢", label: "Simpati" },
  { emoji: "🤝", label: "Sokong" },
] as const;

// Neighbours' automatic emoji reactions on the player's sent messages
export const AUTO_EMOJI_REACTIONS: Record<EthicsLens, { emojis: [string, string]; label: string }> = {
  deontology: {
    emojis: ["⚖️", "👍"],
    label: "Reaksi jiran: prinsip dan setuju",
  },
  utilitarianism: {
    emojis: ["🛡️", "🤝"],
    label: "Reaksi jiran: keselamatan dan muafakat",
  },
  care: {
    emojis: ["❤️", "🙏"],
    label: "Reaksi jiran: empati dan menghargai",
  },
};
