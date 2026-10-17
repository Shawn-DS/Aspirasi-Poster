import type { EthicsLens, EthicsProfile, EthicsProfileId, MessageDraft, SenderId, StoryStep } from "../types";

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
  { sender: "lim", role: "Suara yang mahukan kepastian", description: "Melihat kesan praktikal dan ketenteraman majoriti penduduk kejiranan." },
  { sender: "amir", role: "Jiran yang mahu bermula semula", description: "Ingin dikenali melalui tindakannya hari ini, bukan hanya masa lalunya." },
  { sender: "admin", role: "Pemudah cara komuniti", description: "Membuka ruang untuk pertimbangan etika yang tenang dan saling menghormati." },
] satisfies { sender: SenderId; role: string; description: string }[];

export const ethicsLensMeta: Record<EthicsLens, { name: string; subtitle: string }> = {
  deontology: { name: "Deontologi", subtitle: "Prinsip & Hak" },
  utilitarianism: { name: "Utilitarianisme", subtitle: "Majoriti & Keselamatan" },
  care: { name: "Ethics of Care", subtitle: "Empati & Hubungan" },
};

export const ethicsProfiles: Record<EthicsProfileId, EthicsProfile> = {
  deontology: {
    id: "deontology",
    badge: "Etika Deontologi",
    title: "Penjaga Prinsip dan Hak Setara",
    summary: "Anda mengutamakan prinsip keadilan, peraturan yang sama rata dan hak setiap individu.",
  },
  utilitarianism: {
    id: "utilitarianism",
    badge: "Etika Utilitarianisme",
    title: "Pengimbang Harmoni dan Majoriti",
    summary: "Anda mengutamakan keselamatan, ketenteraman dan kesejahteraan majoriti penduduk.",
  },
  care: {
    id: "care",
    badge: "Ethics of Care",
    title: "Pembina Jambatan Empati",
    summary: "Anda mengutamakan empati, hubungan manusiawi dan sokongan untuk membina kepercayaan.",
  },
  balanced: {
    id: "balanced",
    badge: "Perspektif Seimbang",
    title: "Pertimbangan Etika Seimbang",
    summary: "Anda mengimbangi hak individu, keselamatan komuniti dan empati mengikut situasi.",
  },
};

// Each question presents a genuine ethical dilemma across three lenses:
// Deontology (rights/duty), Utilitarianism (collective outcomes), and Ethics of Care (relational empathy).
export const steps: StoryStep[] = [
  {
    id: "second-chance", title: "Dilema 1: Makna peluang kedua",
    prompt: { sender: "admin", text: "Selepas seseorang selesai menjalani hukuman penjara, apakah pandangan etika anda tentang penerimaannya semula dalam masyarakat?" },
    choices: [
      {
        id: "rights", lens: "deontology",
        text: "Dari segi prinsip keadilan, hutang hukumannya sudah selesai dan haknya mesti dipulihkan sepenuhnya.",
        replies: [{ sender: "admin", text: "Pendirian berasaskan hak dan prinsip: apabila hukuman tamat, seseorang tidak wajar dihukum buat kali kedua." }],
      },
      {
        id: "outcomes", lens: "utilitarianism",
        text: "Terima semula secara berperingkat sambil memastikan keselamatan dan ketenteraman majoriti penduduk terjaga.",
        replies: [{ sender: "lim", text: "Pendekatan yang melihat kesan menyeluruh: keselamatan ramai terjamin dan bekas banduan tidak terus terbiar." }],
      },
      {
        id: "empathy", lens: "care",
        text: "Hadir mendengar dan menyokongnya secara peribadi, kerana manusia pulih melalui hubungan yang prihatin.",
        replies: [{ sender: "aina", text: "Betul. Sokongan dan rasa diterima dalam hubungan seharian membantu seseorang membina semula dirinya." }],
      },
    ],
    fallback: [{ sender: "admin", text: "Terima kasih berkongsi. Mari fikirkan dilema peluang kedua dalam kejiranan kita." }],
  },
  {
    id: "neighbour-concern", title: "Dilema 2: Kebimbangan jiran tetangga",
    prompt: { sender: "aina", text: "Sebenarnya Amir yang baru pindah ke No. 3 ialah bekas banduan. Jujurnya saya risau tentang keluarga kita. Apa yang patut kita lakukan?" },
    choices: [
      {
        id: "care-both", lens: "care",
        text: "Fahami kerisauan Puan Aina, dan ajak berbual sendiri dengan Amir supaya kedua-dua pihak saling mengenali.",
        replies: [{ sender: "aina", text: "Terima kasih kerana memahami perasaan saya. Berbual bersemuka mungkin lebih baik daripada memendam rasa takut." }],
      },
      {
        id: "equal-duty", lens: "deontology",
        text: "Amir belum melakukan sebarang kesalahan di sini; kita wajib melayannya sama seperti jiran lain tanpa prasangka.",
        replies: [{ sender: "admin", text: "Jelas dari sudut prinsip: setiap penduduk berhak mendapat layanan setara selagi tiada peraturan dilanggar." }],
      },
      {
        id: "community-peace", lens: "utilitarianism",
        text: "Tingkatkan rondaan kejiranan umum supaya majoriti penduduk berasa lebih tenang dan selamat.",
        replies: [{ sender: "lim", text: "Langkah itu menjaga ketenteraman ramai penduduk, walaupun kita perlu pastikan ia tidak kelihatan menyasarkan Amir." }],
      },
    ],
    fallback: [{ sender: "admin", text: "Kita boleh mengimbangi rasa selamat komuniti dengan layanan yang adil terhadap Amir." }],
  },
  {
    id: "open-conversation", title: "Dilema 3: Ruang dalam komuniti",
    prompt: { sender: "admin", text: "Amir memohon untuk menyertai kumpulan WhatsApp penduduk ini. Bagaimana kita patut menguruskan kemasukannya?" },
    choices: [
      {
        id: "gradual-harmony", lens: "utilitarianism",
        text: "Bawa Amir masuk dengan panduan kumpulan yang jelas supaya keharmonian dan keselesaan semua ahli terjaga.",
        replies: [{ sender: "lim", text: "Dengan garis panduan yang jelas, majoriti penduduk akan berasa lebih tenang menerima ahli baharu." }],
      },
      {
        id: "warm-welcome", lens: "care",
        text: "Jemput Amir masuk dengan sapaan mesra dan beri ruang dia berkongsi mengikut keselesaannya sendiri.",
        replies: [{ sender: "aina", text: "Setuju. Sapaan yang lembut boleh mengurangkan rasa kekok antara kita semua." }],
      },
      {
        id: "equal-member", lens: "deontology",
        text: "Sebagai penduduk sah di lorong ini, Amir mempunyai hak yang sama untuk menyertai kumpulan tanpa syarat tambahan.",
        replies: [{ sender: "admin", text: "Tepat. Hak penyertaan dalam komuniti terpakai sama rata kepada setiap penduduk." }],
      },
    ],
    fallback: [{ sender: "admin", text: "Amir sudah bersetuju untuk masuk. Mari sambut dengan hormat." }],
    transition: [
      { sender: "system", text: "Admin Komuniti menambah Amir." },
      { sender: "amir", text: "Salam semua, saya Amir. Saya sudah menjalani hukuman dan mahu membina hidup baharu dengan jujur di sini." },
    ],
  },
  {
    id: "community-activity", title: "Dilema 4: Menyertai aktiviti bersama",
    prompt: { sender: "amir", text: "Ahad ini ada gotong-royong taman. Boleh saya turut serta membantu bersama jiran-jiran?" },
    choices: [
      {
        id: "open-right", lens: "deontology",
        text: "Sudah tentu, Amir. Aktiviti komuniti ialah hak dan tanggungjawab bersama setiap penduduk.",
        replies: [{ sender: "amir", text: "Terima kasih kerana menerima saya sebagai penduduk yang setara di taman ini." }],
      },
      {
        id: "walk-together", lens: "care",
        text: "Jom datang Amir! Kita boleh pergi dan bekerja bersama-sama supaya Amir tidak rasa keseorangan.",
        replies: [{ sender: "amir", text: "Terima kasih banyak! Ada teman berbual memang membuatkan saya jauh lebih selesa." }],
      },
      {
        id: "open-area", lens: "utilitarianism",
        text: "Boleh Amir, mulakan di kawasan terbuka taman dahulu supaya semua jiran dapat melihat sumbangan Amir dan berasa yakin.",
        replies: [{ sender: "amir", text: "Baik, saya faham. Saya sedia membantu di kawasan taman supaya jiran-jiran lebih selesa dengan kehadiran saya." }],
      },
    ],
    fallback: [{ sender: "amir", text: "Terima kasih berbual. Saya harap kita dapat saling mengenali semasa aktiviti nanti." }],
  },
  {
    id: "fair-participation", title: "Dilema 5: Amanah dan pengurusan risiko",
    prompt: { sender: "lim", text: "Semasa gotong-royong nanti, peralatan dan kunci stor komuniti akan digunakan. Bagaimana kita uruskan supaya wajar untuk semua?" },
    choices: [
      {
        id: "supervise-risk", lens: "utilitarianism",
        text: "Biar AJK lama sahaja memegang kunci stor utama buat masa ini demi mengelakkan kerisauan ramai penduduk.",
        replies: [{ sender: "lim", text: "Cara itu mengelakkan keresahan majoriti jiran buat masa ini, walaupun Amir mungkin terasa sedikit dibezakan." }],
      },
      {
        id: "same-rules", lens: "deontology",
        text: "Gunakan buku rekod pinjaman yang sama untuk setiap peserta tanpa sebarang layanan dua darjat terhadap Amir.",
        replies: [{ sender: "admin", text: "Adil dan berprinsip. Peraturan yang sama terpakai kepada semua tanpa pengecualian." }],
      },
      {
        id: "buddy-support", lens: "care",
        text: "Bekerja secara berpasangan supaya semua jiran dapat saling membantu dan membina kepercayaan secara semula jadi.",
        replies: [{ sender: "aina", text: "Elok begitu. Bila bekerja berdua, hubungan jadi lebih rapat dan tiada siapa rasa terasing." }],
      },
    ],
    fallback: [{ sender: "admin", text: "Kita bincang pembahagian tugas bersama, dengan panduan yang wajar untuk semua." }],
  },
  {
    id: "privacy", title: "Dilema 6: Privasi atau makluman jiran",
    prompt: { sender: "aina", text: "Ada jiran lorong sebelah bertanya sama ada kita patut memaklumkan latar belakang Amir kepada penduduk lain sebagai langkah berjaga-jaga. Apa pandangan anda?" },
    choices: [
      {
        id: "strict-privacy", lens: "deontology",
        text: "Tidak wajar. Privasi dan kisah silam Amir ialah hak peribadi yang wajib dilindungi daripada disebarkan.",
        replies: [{ sender: "amir", text: "Terima kasih kerana mempertahankan hak privasi saya. Saya mahu dinilai melalui kehidupan saya hari ini." }],
      },
      {
        id: "controlled-info", lens: "utilitarianism",
        text: "Jika khabar angin mula mencetuskan panik ramai orang, biar AJK beri penjelasan ringkas dan terkawal agar keadaan tenang.",
        replies: [{ sender: "admin", text: "Pendekatan itu cuba mengawal keresahan majoriti, namun kita perlu berhati-hati agar tidak melukai maruah Amir." }],
      },
      {
        id: "personal-choice", lens: "care",
        text: "Tanya perasaan Amir dahulu dan bantu perkenalkan dia secara peribadi mengikut apa yang dia sendiri selesa kongsikan.",
        replies: [{ sender: "amir", text: "Saya amat menghargainya. Lebih mudah jika saya sendiri yang bercerita apabila sudah bersedia." }],
      },
    ],
    fallback: [{ sender: "admin", text: "Hormati privasi Amir sambil menjaga keharmonian kejiranan." }],
  },
  {
    id: "presumption-of-innocence", title: "Dilema 7: Apabila timbul syak wasangka",
    prompt: { sender: "lim", text: "Selepas gotong-royong, kotak peralatan di pondok tidak kelihatan. Ada penduduk mula mengesyaki Amir. Bagaimana kita bertindak?" },
    choices: [
      {
        id: "open-check", lens: "utilitarianism",
        text: "Untuk segera meredakan syak wasangka ramai orang, minta semua petugas di pondok tadi sama-sama memeriksa barang secara terbuka.",
        replies: [{ sender: "admin", text: "Semasa pemeriksaan dibuat, AJK memaklumkan kotak itu sudah disimpan di stor. Keadaan kembali tenang walaupun suasana tadi agak tegang." }],
      },
      {
        id: "calm-reassure", lens: "care",
        text: "Tenangkan suasana dahulu dan tanya semua petugas termasuk Amir dengan penuh hormat supaya tiada hati yang terluka.",
        replies: [{ sender: "aina", text: "Lega kita bertanya dengan lembut. Rupa-rupanya AJK sudah simpan di stor; perasaan Amir pun terjaga." }],
      },
      {
        id: "presume-innocent", lens: "deontology",
        text: "Pegang prinsip anggapan tidak bersalah: jangan menuduh sesiapa tanpa bukti sahih, semak rekod penyimpanan dahulu.",
        replies: [{ sender: "lim", text: "Betul kata anda. Selepas disemak, rupa-rupanya AJK sebelah sudah simpan di bilik kunci. Mujur kita berpegang pada prinsip!" }],
      },
    ],
    fallback: [{ sender: "admin", text: "Selepas disemak, AJK bertugas telah menyimpan kotak itu di dalam stor." }],
  },
  {
    id: "next-step", title: "Dilema 8: Pegangan etika masa hadapan",
    prompt: { sender: "admin", text: "Melalui pengalaman bersama Amir ini, apakah asas etika paling penting yang patut menjadi pegangan kejiranan kita?" },
    choices: [
      {
        id: "principle-justice", lens: "deontology",
        text: "Prinsip keadilan & hak: setiap insan yang telah menjalani hukuman wajib dilayan setara di bawah peraturan yang sama.",
        replies: [{ sender: "admin", text: "Prinsip keadilan yang teguh memastikan tiada sesiapa dinafikan haknya kerana sejarah lalu." }],
        ending: { title: "Keadilan sebagai kewajipan moral.", text: "Anda menegaskan bahawa peluang kedua ialah hak yang wajib dihormati, bukan sekadar ehsan. Peraturan yang adil melindungi maruah setiap individu." },
      },
      {
        id: "collective-good", lens: "utilitarianism",
        text: "Kesejahteraan bersama: integrasi semula yang terancang memberi manfaat keselamatan dan keharmonian kepada seluruh masyarakat.",
        replies: [{ sender: "lim", text: "Apabila bekas banduan dibantu berfungsi semula dalam komuniti yang teratur, seluruh kejiranan menjadi lebih selamat dan sejahtera." }],
        ending: { title: "Harmoni dan kebaikan bersama.", text: "Anda melihat peluang kedua daripada sudut kesan jangka panjang: masyarakat yang menyokong pemulihan secara terancang akan melahirkan komuniti yang lebih selamat untuk semua." },
      },
      {
        id: "care-connection", lens: "care",
        text: "Etika keprihatinan & ihsan: mendengar dengan empati dan membina hubungan manusiawi yang memulihkan kepercayaan.",
        replies: [{ sender: "amir", text: "Terima kasih kerana melihat saya sebagai jiran dan manusia. Rasa dipedulikan inilah yang memberi kekuatan untuk saya terus berubah." }],
        ending: { title: "Kepercayaan tumbuh melalui keprihatinan.", text: "Anda memilih untuk mendengar, memahami kebimbangan setiap pihak dan menemani seseorang membina hidup baharu. Hubungan yang berihsan mengubah ketakutan menjadi persefahaman." },
      },
    ],
    fallback: [{ sender: "admin", text: "Setiap perspektif etika membantu kita membina komuniti yang lebih matang." }],
  },
];

export const opening: MessageDraft[] = [
  { sender: "system", text: "Anda menyertai perbualan komuniti." },
  { sender: "aina", text: "Saya terbaca kisah bekas banduan yang sukar diterima masyarakat. Apa pandangan anda?" },
  steps[0].prompt,
];

export const openingReflections: Record<string, MessageDraft> = {
  rights: { sender: "admin", text: "Pada awal tadi anda menekankan prinsip hak dan keadilan. Sepanjang 8 dilema ini, kita melihat bagaimana prinsip itu diuji dalam situasi sebenar. 🌿" },
  outcomes: { sender: "admin", text: "Pada awal tadi anda mengutamakan keselamatan dan kesejahteraan bersama. Perbualan ini menunjukkan cabaran mengimbangi ketenteraman ramai dengan hak individu. 🌿" },
  empathy: { sender: "admin", text: "Pada awal tadi anda memilih pendekatan empati dan hubungan manusiawi. Setiap respons menunjukkan betapa pentingnya mendengar kedua-dua pihak. 🌿" },
};

export const copy = {
  title: "Peluang Kedua", titleAccent: "Dalam Kejiranan Kita",
  intro: "Sertai perbualan kejiranan dan terokai 8 dilema etika melalui prinsip hak (Deontologi), kesejahteraan majoriti (Utilitarianisme) dan hubungan empati (Ethics of Care).",
  badge: "SIMULASI DILEMA ETIKA", duration: "8 dilema etika (~3 minit)", privacy: "Tiada rekod jawapan atau perbualan",
  simulation: "Simulasi 8 dilema etika komuniti", today: "HARI INI", promptEnd: "Refleksi Perspektif Etika",
  stepEnd: "SELESAI", placeholder: "Tulis mesej…", send: "Hantar mesej", typing: "sedang menaip…", waiting: "Dengar dahulu, kemudian pilih pendirian anda.",
  newMessages: "Mesej baharu", restart: "Mulakan semula", suggestions: "Pilih pendekatan etika anda", showSuggestions: "Lihat cadangan",
  ethicsResultLabel: "PROFIL PERTIMBANGAN ETIKA ANDA",
  endTitle: "Satu perbualan ialah permulaan.", endText: "Setiap dilema etika menuntut kita menimbang antara hak individu, keselamatan komuniti dan hubungan sesama manusia.", endNote: "Memahami pelbagai sudut etika membantu kita membina masyarakat yang lebih adil dan berihsan.",
  footer: "MPU1032 ASPIRASI NEGARA BANGSA",
  about: "Kenali Taman Harmoni", close: "Tutup", aboutText: "Kenali jiran baharu kita dan lihat bagaimana Deontologi, Utilitarianisme serta Ethics of Care membentuk keputusan komuniti dalam lapan dilema etika.",
  aboutSubtitle: "Tiga perspektif etika dalam komuniti kejiranan", announcementLabel: "PENGUMUMAN KOMUNITI", announcement: "Di sini, setiap pandangan dibincangkan dengan tenang antara prinsip keadilan, kesejahteraan bersama dan empati.",
  peopleLabel: "KENALI JIRAN ANDA", communityQuestion: "Bagaimana kita mengimbangi hak individu, keselamatan ramai dan rasa prihatin?", backToChat: "Kembali ke perbualan", simulationNote: "Simulasi perbualan interaktif tanpa rekod jawapan",
};
