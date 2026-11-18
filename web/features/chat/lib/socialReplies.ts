import { opening, openingReflections, steps } from "../data/story";
import type { MessageDraft } from "../types";

// Exact story-message matching keeps a reaction to an older message in context.
const contexts = new Map<string, string>();
const key = (message: MessageDraft) => `${message.sender}:${message.text}`;
const storyContexts: Record<string, { prompt: string; choices: string[] }> = {
  "second-chance": {
    prompt: "Hukuman sudah selesai; persoalannya ialah bagaimana masyarakat membuka ruang untuk bermula semula.",
    choices: [
      "Hukuman yang selesai tidak patut disambung dengan penolakan dalam kehidupan harian.",
      "Keselamatan bersama perlu dijaga tanpa menutup peluang seseorang untuk pulih.",
      "Hubungan yang prihatin boleh bermula dengan mendengar tanpa menghakimi.",
    ],
  },
  "neighbour-concern": {
    prompt: "Saya mahu keluarga berasa selamat, tetapi masa lalu Amir sahaja bukan bukti dia membahayakan kita.",
    choices: [
      "Saya mahu mengenali Amir sendiri supaya kerisauan tidak hanya berpunca daripada sangkaan.",
      "Amir berhak dilayan adil seperti penduduk lain selagi tiada kesalahan dibuktikan.",
      "Rondaan itu perlu untuk seluruh kawasan, bukan untuk mengekori Amir seorang.",
    ],
  },
  "majority-justice": {
    prompt: "Sokongan majoriti sahaja tidak menentukan keadilan; maruah Amir dan kesan keputusan juga perlu dipertimbangkan.",
    choices: [
      "Maruah seseorang perlu dihormati walaupun pandangan majoriti berbeza.",
      "Kesan kepada Amir juga sebahagian daripada kesejahteraan seluruh komuniti.",
      "Mendengar kedua-dua pihak membantu kita memahami kebimbangan tanpa mengabaikan perasaan Amir.",
    ],
  },
  "nation-building": {
    prompt: "Perbincangan ini menghubungkan peluang kedua dengan keadilan, perpaduan dan rasa memiliki dalam negara bangsa.",
    choices: [
      "Keadilan perlu diamalkan terhadap semua anggota masyarakat, termasuk bekas banduan.",
      "Sokongan untuk menyumbang semula boleh membawa manfaat bersama dan mengukuhkan perpaduan.",
      "Hubungan yang prihatin membantu seseorang berasa diterima sebagai sebahagian daripada masyarakat.",
    ],
  },
  "community-activity": {
    prompt: "Saya ingin menyumbang dalam gotong-royong dan mengenali jiran dengan lebih dekat.",
    choices: [
      "Saya menghargai peluang menyumbang sebagai jiran yang setara.",
      "Ada teman semasa aktiviti membantu saya berasa lebih selesa mengenali jiran.",
      "Saya sedia membantu, dan saya juga berharap diberi kepercayaan seperti peserta lain.",
    ],
  },
  "next-step": {
    prompt: "Pengalaman ini mengajak kita menimbang keadilan, kesejahteraan bersama dan empati dalam tindakan selepas ini.",
    choices: [
      "Prinsip itu perlu diterjemahkan melalui layanan dan peraturan yang sama dalam kehidupan berjiran.",
      "Kesejahteraan bersama memerlukan sokongan yang terancang serta layanan yang adil.",
      "Saya menghargai rasa dipedulikan, dan kepercayaan itu perlu terus dibina melalui tindakan harian.",
    ],
  },
};
steps.forEach(step => {
  const context = storyContexts[step.id];
  contexts.set(key(step.prompt), context.prompt);
  step.choices.forEach((choice, j) => choice.replies.forEach(message => contexts.set(key(message), context.choices[j])));
  step.fallback.forEach(message => contexts.set(key(message), context.prompt));
  for (const message of step.transition ?? []) {
    if (message.sender === "amir") contexts.set(key(message), "Saya mahu dikenali melalui usaha saya hari ini. Kepercayaan mungkin mengambil masa, dan saya sedia membinanya.");
    if (message.sender === "admin") contexts.set(key(message), "Amir bersetuju untuk masuk; kita beri ruang kepadanya untuk berkongsi sendiri dengan hormat.");
  }
});
contexts.set(key(opening[1]), "Penolakan selepas hukuman boleh menyukarkan seseorang membina hidup baharu. Saya mahu kita fikir cara membantu.");
Object.values(openingReflections).forEach(message => contexts.set(key(message), "Perbincangan ini satu permulaan; keadilan, kesejahteraan bersama dan empati perlu diamalkan selepas ini juga."));

const reactionLead: Record<string, string> = {
  "👍": "Tentang mesej saya tadi:",
  "❤️": "Terima kasih kerana mengambil berat.",
  "🙏": "Terima kasih juga kerana sudi berbincang.",
  "😮": "Saya faham reaksi terkejut itu.",
  "😢": "Saya faham perkara ini menyentuh perasaan anda.",
  "🤝": "Saya hargai kesediaan anda untuk saling membantu.",
};

export function reactionReply(source: MessageDraft, emoji: string | null): MessageDraft | null {
  if (!emoji || !reactionLead[emoji] || source.sender === "you" || source.sender === "system") return null;
  const context = contexts.get(key(source));
  if (!context) return null;
  return { sender: source.sender, text: `${reactionLead[emoji]} ${context}` };
}

const emojiResponses: Record<string, { emoji: string; text: string; amir?: string }> = {
  s12: { emoji: "👋", text: "Salam kembali, jiran! Terima kasih kerana menyapa dengan mesra." },
  s23: { emoji: "❤️", text: "Sikap mengambil berat seperti ini membantu kita berbincang dengan lebih terbuka." },
  s15: { emoji: "🙏", text: "Sama-sama. Terima kasih juga kerana sudi mendengar pandangan jiran." },
  s24: { emoji: "🤝", text: "Terima kasih atas sokongan. Mari pastikan langkah kita tetap adil dan menghormati semua jiran." },
  s08: { emoji: "🌿", text: "Baik, kita berbincang dengan tenang dan dengar dahulu sebelum membuat kesimpulan." },
  s34: { emoji: "✨", text: "Peluang kedua perlu disertai ruang untuk menyumbang dan layanan yang adil.", amir: "Terima kasih. Saya berharap diberi ruang untuk membuktikan usaha saya melalui tindakan." },
  s37: { emoji: "⚖️", text: "Betul, apa-apa tuduhan mesti berasaskan bukti, bukan kisah silam seseorang.", amir: "Saya juga berharap apa-apa kebimbangan ditanya dengan hormat, tanpa terus menuduh." },
  s06: { emoji: "🤝", text: "Menjaga komuniti termasuk menjaga keselamatan dan maruah setiap jiran." },
};

export function stickerReply(source: MessageDraft, stickerId: string) {
  const response = emojiResponses[stickerId];
  if (!response || source.sender === "you" || source.sender === "system") return null;
  return { emoji: response.emoji, message: { sender: source.sender, text: source.sender === "amir" && response.amir ? response.amir : response.text } };
}
