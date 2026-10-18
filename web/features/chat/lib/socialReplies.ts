import { opening, openingReflections, steps } from "../data/story";
import type { MessageDraft } from "../types";

// Exact story-message matching keeps a reaction to an older message in context.
const contexts = new Map<string, string>();
const key = (message: MessageDraft) => `${message.sender}:${message.text}`;
const promptContexts = [
  "Hukuman sudah selesai; persoalannya ialah bagaimana masyarakat membuka ruang untuk bermula semula.",
  "Saya mahu keluarga berasa selamat, tetapi masa lalu Amir sahaja bukan bukti dia membahayakan kita.",
  "Kita sedang membincangkan cara menyambut Amir dalam kumpulan dengan hormat.",
  "Saya ingin menyumbang dalam gotong-royong dan mengenali jiran dengan lebih dekat.",
  "Pengurusan kunci dan peralatan perlu jelas serta adil kepada semua peserta.",
  "Rasa risau tidak bermakna kita boleh menyebarkan kisah peribadi Amir sesuka hati.",
  "Kotak belum kelihatan ketika mesej itu dihantar; semak dahulu dan jangan menuduh tanpa bukti.",
  "Pengalaman ini mengajak kita menimbang keadilan, keselamatan bersama dan empati.",
];
const choiceContexts = [
  ["Hukuman yang selesai tidak patut disambung dengan penolakan dalam kehidupan harian.", "Keselamatan bersama perlu dijaga tanpa menutup peluang seseorang untuk pulih.", "Hubungan yang prihatin boleh bermula dengan mendengar tanpa menghakimi."],
  ["Saya mahu mengenali Amir sendiri supaya kerisauan tidak hanya berpunca daripada sangkaan.", "Amir berhak dilayan adil seperti penduduk lain selagi tiada kesalahan dibuktikan.", "Rondaan itu perlu untuk seluruh kawasan, bukan untuk mengekori Amir seorang."],
  ["Panduan kumpulan perlu membantu semua ahli berasa selesa, bukan menjadi halangan khusus untuk Amir.", "Sapaan mesra boleh membantu Amir berasa diterima tanpa memaksanya bercerita.", "Hak menyertai kumpulan sebagai penduduk perlu terpakai sama rata."],
  ["Saya menghargai peluang menyumbang sebagai jiran yang setara.", "Ada teman semasa aktiviti membantu saya berasa lebih selesa mengenali jiran.", "Saya sedia membantu, dan saya juga berharap diberi kepercayaan seperti peserta lain."],
  ["Saya juga perlu fikir kesannya kepada Amir; pembahagian amanah jangan sampai meminggirkannya.", "Buku rekod pinjaman yang sama membolehkan semua peserta dipertanggungjawabkan dengan adil.", "Kerja berpasangan patut membantu semua peserta, bukan menjadikan Amir rasa dia diawasi."],
  ["Saya mahu kisah peribadi saya dihormati dan diri saya dinilai melalui tindakan hari ini.", "Penjelasan AJK perlu menenangkan keadaan tanpa mendedahkan kisah peribadi Amir tanpa persetujuannya.", "Saya lebih selesa berkongsi sendiri apabila sudah bersedia, tanpa dipaksa."],
  ["Kotak sudah ditemui di stor. Kita perlu membetulkan sangkaan tadi supaya Amir tidak terus dipersalahkan.", "Kotak sebenarnya disimpan AJK; cara bertanya yang lembut membantu menjaga perasaan semua.", "Semakan menunjukkan AJK yang menyimpannya, jadi sangkaan terhadap Amir perlu dihentikan."],
  ["Prinsip itu perlu diterjemahkan melalui layanan dan peraturan yang sama dalam kehidupan berjiran.", "Kesejahteraan bersama memerlukan sokongan yang terancang serta layanan yang adil.", "Saya menghargai rasa dipedulikan, dan kepercayaan itu perlu terus dibina melalui tindakan harian."],
];
steps.forEach((step, i) => {
  contexts.set(key(step.prompt), promptContexts[i]);
  step.choices.forEach((choice, j) => choice.replies.forEach(message => contexts.set(key(message), choiceContexts[i][j])));
  step.fallback.forEach(message => contexts.set(key(message), i === 6 ? choiceContexts[i][0] : promptContexts[i]));
});
contexts.set(key(opening[1]), "Penolakan selepas hukuman boleh menyukarkan seseorang membina hidup baharu. Saya mahu kita fikir cara membantu.");
for (const message of steps[2].transition ?? []) {
  if (message.sender === "amir") contexts.set(key(message), "Saya mahu dikenali melalui usaha saya hari ini. Kepercayaan mungkin mengambil masa, dan saya sedia membinanya.");
}
Object.values(openingReflections).forEach(message => contexts.set(key(message), "Perbincangan ini satu permulaan; keadilan, keselamatan dan empati perlu diamalkan selepas ini juga."));

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
