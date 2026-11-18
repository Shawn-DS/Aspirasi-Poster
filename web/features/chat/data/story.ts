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
  you: { name: "Anda", color: "#1d6ea5" },
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
    id: "majority-justice", title: "Dilema 3: Adakah majoriti sentiasa adil?",
    prompt: { sender: "lim", text: "Kalau kebanyakan jiran menolak bekas banduan seperti Amir, adakah kita patut ikut keputusan majoriti sahaja?" },
    choices: [
      {
        id: "majority-rights", lens: "deontology",
        text: "Keputusan majoriti mesti menghormati maruah setiap orang. Amir tidak patut ditolak hanya kerana masa lalunya.",
        replies: [{ sender: "admin", text: "Prinsip itu menghadkan kuasa majoriti: penerimaan seseorang perlu dinilai secara adil, bukan berdasarkan label." }],
      },
      {
        id: "majority-outcomes", lens: "utilitarianism",
        text: "Bincang sebab bantahan dan cari aturan yang memberi manfaat kepada semua, termasuk Amir.",
        replies: [{ sender: "lim", text: "Jadi kita menimbang kesan kepada seluruh komuniti, termasuk kesan peminggiran terhadap Amir, sebelum membuat keputusan." }],
      },
      {
        id: "majority-dialogue", lens: "care",
        text: "Dengar kebimbangan jiran dan pandangan Amir sendiri supaya keputusan lahir daripada saling memahami.",
        replies: [{ sender: "aina", text: "Saya mahu mendengar ceritanya sendiri. Hubungan sukar dibina jika kita terus bercakap tentangnya tanpa mendengarnya." }],
      },
    ],
    fallback: [{ sender: "admin", text: "Suara majoriti perlu dipertimbangkan bersama maruah individu, kesan keputusan dan hubungan sesama jiran." }],
  },
  {
    id: "nation-building", title: "Dilema 4: Peluang kedua dan negara bangsa",
    prompt: { sender: "admin", text: "Apakah kesan menerima atau meminggirkan bekas banduan terhadap perpaduan dan pembinaan negara bangsa?" },
    choices: [
      {
        id: "nation-equality", lens: "deontology",
        text: "Negara bangsa yang adil memerlukan layanan setara. Bekas banduan juga sebahagian daripada masyarakat dan berhak dihormati.",
        replies: [{ sender: "admin", text: "Layanan setara menjadikan nilai keadilan sesuatu yang diamalkan, termasuk terhadap mereka yang pernah melakukan kesalahan." }],
      },
      {
        id: "nation-cooperation", lens: "utilitarianism",
        text: "Sokongan untuk kembali bekerja dan menyumbang boleh meningkatkan kesejahteraan bersama serta mengukuhkan perpaduan.",
        replies: [{ sender: "lim", text: "Peluang kedua perlu disertai sokongan yang terancang. Manfaatnya boleh dirasai oleh bekas banduan dan seluruh masyarakat." }],
      },
      {
        id: "nation-belonging", lens: "care",
        text: "Rasa diterima membina kepercayaan dan rasa memiliki. Kita perlu mendengar serta menyokong jiran yang dipinggirkan.",
        replies: [{ sender: "aina", text: "Perpaduan bermula apabila seseorang berasa dirinya dihargai. Ihsan boleh diamalkan melalui hubungan harian kita." }],
      },
    ],
    fallback: [{ sender: "admin", text: "Cara kita melayan bekas banduan mencerminkan keadilan, kesejahteraan dan rasa memiliki dalam negara bangsa." }],
    transition: [
      { sender: "admin", text: "Amir bersetuju untuk menyertai kumpulan ini. Mari kita dengar sendiri apa yang ingin dikongsikannya." },
      { sender: "system", text: "Admin Komuniti menambah Amir." },
      { sender: "amir", text: "Salam semua, saya Amir. Saya sudah menjalani hukuman dan mahu membina hidup baharu dengan jujur di sini." },
    ],
  },
  {
    id: "community-activity", title: "Dilema 5: Menyertai aktiviti bersama",
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
    id: "next-step", title: "Dilema 6: Daripada pendirian kepada tindakan",
    prompt: { sender: "admin", text: "Selepas berbual dan menyusun pasukan bersama Amir, prinsip etika manakah akan memandu tindakan anda terhadap bekas banduan selepas ini?" },
    choices: [
      {
        id: "principle-justice", lens: "deontology",
        text: "Prinsip keadilan & hak: setiap insan yang telah menjalani hukuman wajib dilayan setara di bawah peraturan yang sama.",
        replies: [{ sender: "admin", text: "Prinsip keadilan yang teguh memastikan tiada sesiapa dinafikan haknya kerana sejarah lalu." }],
      },
      {
        id: "collective-good", lens: "utilitarianism",
        text: "Kesejahteraan bersama: integrasi semula yang terancang memberi manfaat keselamatan dan keharmonian kepada seluruh masyarakat.",
        replies: [{ sender: "lim", text: "Apabila bekas banduan dibantu berfungsi semula dalam komuniti yang teratur, seluruh kejiranan menjadi lebih selamat dan sejahtera." }],
      },
      {
        id: "care-connection", lens: "care",
        text: "Etika keprihatinan & ihsan: mendengar dengan empati dan membina hubungan manusiawi yang memulihkan kepercayaan.",
        replies: [{ sender: "amir", text: "Terima kasih kerana melihat saya sebagai jiran dan manusia. Rasa dipedulikan inilah yang memberi kekuatan untuk saya terus berubah." }],
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
  rights: { sender: "admin", text: "Pada awal tadi anda menekankan prinsip hak dan keadilan. Sepanjang 6 dilema ini, kita melihat bagaimana prinsip itu diuji dalam situasi sebenar. 🌿" },
  outcomes: { sender: "admin", text: "Pada awal tadi anda mengutamakan keselamatan dan kesejahteraan bersama. Perbualan ini menunjukkan cabaran mengimbangi ketenteraman ramai dengan hak individu. 🌿" },
  empathy: { sender: "admin", text: "Pada awal tadi anda memilih pendekatan empati dan hubungan manusiawi. Setiap respons menunjukkan betapa pentingnya mendengar kedua-dua pihak. 🌿" },
};

export const copy = {
  title: "Peluang Kedua", titleAccent: "Dalam Kejiranan Kita",
  intro: "Sertai perbualan kejiranan dan terokai 6 dilema etika melalui prinsip hak (Deontologi), kesejahteraan majoriti (Utilitarianisme) dan hubungan empati (Ethics of Care).",
  badge: "SIMULASI DILEMA ETIKA", duration: "6 dilema etika · 1 aktiviti", privacy: "Statistik pilihan tanpa identiti",
  simulation: "Simulasi 6 dilema etika komuniti", today: "HARI INI", promptEnd: "Refleksi Perspektif Etika",
  stepEnd: "SELESAI", typing: "sedang menaip…", waiting: "Dengar dahulu, kemudian pilih pendirian anda.",
  newMessages: "Mesej baharu", restart: "Mulakan semula", suggestions: "Pilih pendekatan etika anda",
  ethicsResultLabel: "PROFIL PERTIMBANGAN ETIKA ANDA",
  endNote: "Amalkan keadilan, kerjasama dan ihsan supaya setiap jiran dapat menyumbang kepada negara bangsa.",
  footer: "MPU1032 ASPIRASI NEGARA BANGSA",
  about: "Kenali Taman Harmoni", close: "Tutup", aboutText: "Kenali jiran baharu kita dan lihat bagaimana Deontologi, Utilitarianisme serta Ethics of Care membentuk keputusan komuniti dalam enam dilema etika.",
  aboutSubtitle: "Tiga perspektif etika dalam komuniti kejiranan", announcementLabel: "PENGUMUMAN KOMUNITI", announcement: "Di sini, setiap pandangan dibincangkan dengan tenang antara prinsip keadilan, kesejahteraan bersama dan empati.",
  peopleLabel: "KENALI JIRAN ANDA", communityQuestion: "Bagaimana kita mengimbangi hak individu, keselamatan ramai dan rasa prihatin?", backToChat: "Kembali ke perbualan", simulationNote: "Statistik pilihan dikongsi tanpa identiti. Perbualan tidak disimpan.",
};
