import type { MessageDraft, SenderId, StoryStep } from "../types";

export const group = {
  name: "Persatuan Penduduk Taman Harmoni",
  subject: "Peluang Kedua: Memupuk Sifat Ihsan Masyarakat Terhadap Bekas Banduan",
  members: "Puan Aina, Uncle Lim, Admin, Amir, Anda",
  membersBeforeAmir: "Puan Aina, Uncle Lim, Admin, Anda",
};

export const people: Record<SenderId, { name: string; color: string }> = {
  aina: { name: "Puan Aina", color: "#9d527b" },
  lim: { name: "Uncle Lim", color: "#b16e2c" },
  admin: { name: "Admin Komuniti", color: "#40799b" },
  amir: { name: "Amir", color: "#39815a" },
  you: { name: "Anda", color: "#27715b" },
  system: { name: "Sistem", color: "#66766c" },
};

export const communityProfiles = [
  { sender: "aina", role: "Jiran yang mengambil berat", description: "Kebimbangannya membuka perbincangan tentang rasa selamat dan sikap adil." },
  { sender: "lim", role: "Suara yang mahukan kepastian", description: "Sedang belajar membezakan langkah berjaga-jaga dengan prasangka." },
  { sender: "amir", role: "Jiran yang mahu bermula semula", description: "Ingin dikenali melalui tindakannya hari ini, bukan hanya masa lalunya." },
  { sender: "admin", role: "Pemudah cara komuniti", description: "Membuka ruang untuk perbualan yang tenang dan saling menghormati." },
] satisfies { sender: SenderId; role: string; description: string }[];

// Each question owns its replies and the transition to the next scene.
// Only the current conversation lives in memory; no answers are persisted.
export const steps: StoryStep[] = [
  {
    id: "second-chance", title: "Peluang untuk bermula semula",
    prompt: { sender: "admin", text: "Selepas menjalani hukuman, patutkah seseorang diberi peluang kedua?" },
    choices: [
      { id: "yes", text: "Ya, mereka boleh bermula semula.", replies: [{ sender: "aina", text: "Betul. Diterima semula boleh membantu seseorang membina kehidupan baharu." }] },
      { id: "unsure", text: "Saya masih ragu-ragu.", replies: [{ sender: "admin", text: "Wajar ada persoalan. Mari bincang tanpa terus menghukum seseorang." }] },
      { id: "actions", text: "Lihat juga usahanya sekarang.", replies: [{ sender: "lim", text: "Setuju. Kita kenali tindakannya hari ini, bukan masa lalunya sahaja." }] },
    ],
    fallback: [{ sender: "admin", text: "Terima kasih berkongsi. Mari fikirkan maksud peluang kedua dalam kejiranan kita." }],
  },
  {
    id: "neighbour-concern", title: "Daripada cerita kepada jiran kita",
    prompt: { sender: "aina", text: "Sebenarnya Amir di No. 3 pernah dipenjarakan. Saya risau. Apa patut kita buat?" },
    choices: [
      { id: "listen", text: "Kenali dia dahulu.", replies: [{ sender: "aina", text: "Saya belum bercakap dengannya. Elok kita dengar sendiri sebelum membuat andaian." }] },
      { id: "concern", text: "Bincangkan kebimbangan jiran.", replies: [{ sender: "lim", text: "Mari bincang perkara khusus dengan tenang, tanpa menuduh Amir." }] },
      { id: "fairness", text: "Gunakan peraturan yang sama.", replies: [{ sender: "admin", text: "Ya. Panduan keselamatan terpakai kepada semua, bukan Amir seorang sahaja." }] },
    ],
    fallback: [{ sender: "admin", text: "Kita boleh menjaga keselamatan sambil mengelakkan andaian tentang Amir." }],
  },
  {
    id: "open-conversation", title: "Beri ruang untuk bersuara",
    prompt: { sender: "admin", text: "Amir sudi berkenalan dalam kumpulan ini. Bagaimana kita mulakan?" },
    choices: [
      { id: "welcome", text: "Jemput dan ucap selamat datang.", replies: [{ sender: "admin", text: "Baik, saya jemput Amir masuk. Sapaan kecil boleh membuka perbualan." }] },
      { id: "introduce", text: "Biar Amir memperkenalkan diri.", replies: [{ sender: "aina", text: "Setuju, kita beri dia ruang bercerita mengikut keselesaannya." }] },
      { id: "respect", text: "Ingatkan semua supaya hormat.", replies: [{ sender: "lim", text: "Kita jaga bahasa dan elakkan soalan peribadi yang tidak perlu." }] },
    ],
    fallback: [{ sender: "admin", text: "Amir sudah bersetuju untuk masuk. Mari sambut dengan hormat." }],
    transition: [
      { sender: "system", text: "Admin Komuniti menambah Amir." },
      { sender: "amir", text: "Salam, saya Amir. Saya sudah menjalani hukuman dan mahu membina kehidupan baharu." },
    ],
  },
  {
    id: "community-activity", title: "Daripada berbual kepada menyertai",
    prompt: { sender: "amir", text: "Saya ingin sertai gotong-royong Ahad ini. Boleh kita berkenalan di sana?" },
    choices: [
      { id: "invite", text: "Jom sertai kami, Amir!", replies: [{ sender: "amir", text: "Terima kasih menjemput saya. Saya akan datang ke pondok komuniti pukul 8 pagi." }] },
      { id: "contribute", text: "Apa yang Amir ingin bantu?", replies: [{ sender: "amir", text: "Saya suka berkebun. Kalau sesuai, saya ingin bantu di taman kecil kita." }] },
      { id: "together", text: "Kita boleh pergi bersama.", replies: [{ sender: "amir", text: "Boleh, terima kasih! Saya lebih selesa jika ada teman pada kali pertama." }] },
    ],
    fallback: [{ sender: "amir", text: "Terima kasih berbual. Saya harap kita dapat saling mengenali semasa aktiviti nanti." }],
  },
  {
    id: "fair-participation", title: "Peluang yang adil",
    prompt: { sender: "lim", text: "Bagaimana kita bahagikan tugas supaya semua jiran selesa dan boleh menyumbang?" },
    choices: [
      { id: "interest", text: "Tanya minat setiap orang.", replies: [{ sender: "amir", text: "Saya pilih berkebun. Terima kasih kerana memberi saya suara dalam pembahagian tugas." }] },
      { id: "same-rules", text: "Tetapkan panduan untuk semua.", replies: [{ sender: "admin", text: "Setuju. Panduan penggunaan alat dan keselamatan sama untuk setiap peserta." }] },
      { id: "buddy", text: "Tawarkan kerja berpasangan.", replies: [{ sender: "aina", text: "Boleh. Sesiapa yang mahu teman boleh berpasangan; semuanya secara sukarela." }] },
    ],
    fallback: [{ sender: "admin", text: "Kita bincang pembahagian tugas bersama, dengan panduan yang adil untuk semua." }],
  },
  {
    id: "privacy", title: "Hormati cerita peribadi",
    prompt: { sender: "aina", text: "Perlukah kita ceritakan sejarah Amir kepada jiran lain?" },
    choices: [
      { id: "private", text: "Jaga privasinya.", replies: [{ sender: "aina", text: "Betul, saya tidak akan menyebarkan cerita peribadinya." }] },
      { id: "consent", text: "Biar Amir tentukan sendiri.", replies: [{ sender: "amir", text: "Terima kasih. Saya ingin memilih sendiri apa yang selesa untuk dikongsi." }] },
      { id: "rumours", text: "Hentikan khabar angin.", replies: [{ sender: "lim", text: "Jika ada khabar angin, saya akan ajak jiran berhenti membuat andaian." }] },
    ],
    fallback: [{ sender: "admin", text: "Hormati privasi Amir dan elakkan menyebarkan maklumat peribadi tanpa persetujuannya." }],
  },
  {
    id: "next-step", title: "Satu tindakan kecil",
    prompt: { sender: "admin", text: "Perbualan ini baru permulaan. Apakah satu tindakan kecil yang anda mahu cuba?" },
    choices: [
      { id: "include", text: "Ajak jiran menyertai aktiviti.", replies: [{ sender: "amir", text: "Jemputan seperti ini membuat saya rasa diterima sebagai jiran. Terima kasih." }], ending: { title: "Satu jemputan membuka ruang.", text: "Anda memilih untuk mengajak seseorang menyertai komuniti. Kepercayaan dibina melalui pertemuan dan tindakan seterusnya." } },
      { id: "hear", text: "Dengar dahulu sebelum menilai.", replies: [{ sender: "amir", text: "Terima kasih kerana mahu mendengar. Saya ingin dikenali melalui usaha saya hari ini." }], ending: { title: "Bermula dengan mendengar.", text: "Anda memilih untuk mengenali seseorang sebelum membuat andaian. Mendengar membuka ruang untuk saling memahami." } },
      { id: "speak-up", text: "Tegur prasangka dengan sopan.", replies: [{ sender: "aina", text: "Saya juga mahu mencuba. Kita boleh menegur tanpa memalukan sesiapa." }], ending: { title: "Satu suara boleh mengubah suasana.", text: "Anda memilih untuk menegur prasangka dengan hormat. Komuniti yang menerima memerlukan usaha bersama, sedikit demi sedikit." } },
    ],
    fallback: [{ sender: "admin", text: "Pilih satu langkah kecil yang sesuai dalam kehidupan sebenar. Peluang kedua memerlukan usaha bersama." }],
  },
];

export const opening: MessageDraft[] = [
  { sender: "system", text: "Anda menyertai perbualan komuniti." },
  { sender: "aina", text: "Saya terbaca kisah bekas banduan yang sukar diterima masyarakat. Apa pandangan anda?" },
  steps[0].prompt,
];

export const openingReflections: Record<string, MessageDraft> = {
  yes: { sender: "admin", text: "Tadi anda menyokong peluang kedua. Kini ada langkah kecil untuk memulakannya. 🌿" },
  unsure: { sender: "admin", text: "Kita bermula dengan keraguan. Terima kasih kerana terus mendengar dan berbincang. 🌿" },
  actions: { sender: "admin", text: "Tadi kita mahu melihat usaha hari ini. Aktiviti bersama boleh membuka ruang itu. 🌿" },
};

export const copy = {
  title: "Satu mesej.", titleAccent: "Satu peluang kedua.",
  intro: "Masuk ke perbualan kejiranan. Dengar, beri pandangan dan lihat bagaimana satu respons boleh membuka ruang untuk seseorang.",
  badge: "PENGALAMAN INTERAKTIF", duration: "7 pilihan · Sekitar 2 minit", privacy: "Tiada rekod jawapan atau perbualan",
  simulation: "Kisah rekaan · Balasan pratulis", today: "HARI INI", promptEnd: "Ruang untuk renungan",
  stepEnd: "SELESAI", placeholder: "Tulis mesej…", send: "Hantar mesej", typing: "sedang menaip…", waiting: "Dengar dahulu, kemudian beri respons.",
  newMessages: "Mesej baharu", restart: "Mulakan semula", suggestions: "Pilih balasan anda", showSuggestions: "Lihat cadangan",
  swipeChoices: "Leret untuk lihat pilihan", freeTextHint: "Mesej sendiri menerima balasan umum.",
  endTitle: "Satu perbualan ialah permulaan.", endText: "Kepercayaan terbina dengan masa. Apakah peluang kecil yang boleh anda berikan dalam kehidupan sebenar?", endNote: "Ihsan bermula dengan mendengar, menghormati dan memberi peluang.",
  footer: "MPU1032 · ASPIRASI NEGARA BANGSA",
  about: "Kenali Taman Harmoni", close: "Tutup", aboutText: "Seorang jiran baharu. Sebuah perbualan kecil. Cara anda membalas boleh membuka ruang untuk lebih memahami satu sama lain.",
  aboutSubtitle: "Satu kejiranan. Banyak sudut pandang.", announcementLabel: "PENGUMUMAN KOMUNITI", announcement: "Di sini, setiap orang berhak didengar, dihormati dan diberi peluang untuk menyumbang.",
  peopleLabel: "KENALI JIRAN ANDA", communityQuestion: "Adakah setiap orang di sini mempunyai ruang untuk bermula semula?", backToChat: "Kembali ke perbualan", simulationNote: "Kisah rekaan · Balasan pratulis · Tiada rekod perbualan",
};
