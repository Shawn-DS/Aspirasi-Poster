import type {
  DecisionChoiceOption,
  DecisionStage,
  PriorityItem,
  PriorityItemId,
  RankingChoiceId,
} from "../types";

export const project = {
  name: "Peluang Kedua",
  groupName: "Simulasi Temu Duga Majikan",
  subject: "Peluang Kedua: Adakah majikan sanggup memberi peluang kerja kepada bekas banduan?",
};

const BINARY_CHOICES: [DecisionChoiceOption, DecisionChoiceOption] = [
  {
    id: "interview",
    label: "Beri temu duga",
    subtitle: "Panggil pemohon untuk sesi temu duga",
  },
  {
    id: "decline",
    label: "Tidak beri temu duga",
    subtitle: "Tolak permohonan tanpa temu duga",
  },
];

export const decisionStages: [DecisionStage, DecisionStage, DecisionStage] = [
  {
    id: "s1-blind",
    stepNumber: 1,
    badge: "Fasa 1 · Pilihan Awal",
    shortTitle: "Pilihan awal",
    narrative:
      "Anda ialah majikan. Seorang bekas banduan datang memohon kerja tanpa sebarang maklumat tambahan lain.",
    question: "Adakah anda mahu memberinya temu duga?",
    choices: BINARY_CHOICES,
  },
  {
    id: "s2-certificate",
    stepNumber: 2,
    badge: "Fasa 2 · Syarat Baharu",
    shortTitle: "+ Sijil latihan",
    revealTag: "Sijil Latihan Rasmi",
    revealDetail: "Menamatkan latihan vokasional rasmi & memiliki sijil yang diiktiraf",
    revealTone: "condition",
    narrative:
      "Maklumat baharu muncul: dia telah menamatkan latihan vokasional rasmi dan memiliki sijil yang diiktiraf.",
    question: "Adakah pilihan anda berubah?",
    choices: BINARY_CHOICES,
  },
  {
    id: "s3-risk",
    stepNumber: 3,
    badge: "Fasa 3 · Risiko Kerja",
    shortTitle: "+ Risiko kerja",
    revealTag: "Amaran Risiko · Juruwang",
    revealDetail: "Kesalahan lampau berkaitan kes kewangan · Jawatan dipohon: juruwang",
    revealTone: "risk",
    narrative:
      "Risiko baharu didedahkan: kesalahan lampaunya berkait terus dengan kerja ini — kes kewangan, manakala jawatan yang dipohon ialah juruwang.",
    question: "Apakah pilihan anda sekarang?",
    choices: BINARY_CHOICES,
  },
];

export const priorityItems: [PriorityItem, PriorityItem, PriorityItem] = [
  {
    id: "law",
    label: "Undang-undang sudah dilaksanakan",
    short: "Undang-undang selesai",
    hint: "Hukuman penjara telah selesai dijalani sepenuhnya",
  },
  {
    id: "safety",
    label: "Keselamatan awam dan mangsa",
    short: "Keselamatan & mangsa",
    hint: "Melindungi pelanggan, rakan sekerja serta perasaan mangsa",
  },
  {
    id: "rehab",
    label: "Bukti perubahan diri",
    short: "Bukti perubahan diri",
    hint: "Sijil latihan rasmi dan usaha membuktikan pemulihan",
  },
];

export const priorityItemMap: Record<PriorityItemId, PriorityItem> = {
  law: priorityItems[0],
  safety: priorityItems[1],
  rehab: priorityItems[2],
};

export const RANKING_PERMUTATIONS: RankingChoiceId[] = [
  "law-safety-rehab",
  "law-rehab-safety",
  "safety-law-rehab",
  "safety-rehab-law",
  "rehab-law-safety",
  "rehab-safety-law",
];

export const rankingStage = {
  id: "s4-ranking" as const,
  stepNumber: 4 as const,
  badge: "Fasa 4 · Susunan 1–3",
  shortTitle: "Keutamaan",
  narrative: "Apakah perkara yang paling anda utamakan?",
  question: "Susun keutamaan",
  submitLabel: "Sahkan & lihat hasil",
};

export function rankingOrderToId(order: readonly [PriorityItemId, PriorityItemId, PriorityItemId]): RankingChoiceId {
  return `${order[0]}-${order[1]}-${order[2]}` as RankingChoiceId;
}

export function rankingIdToOrder(id: RankingChoiceId): [PriorityItemId, PriorityItemId, PriorityItemId] {
  return id.split("-") as [PriorityItemId, PriorityItemId, PriorityItemId];
}

export function rankingIdLabel(id: RankingChoiceId): string {
  return rankingIdToOrder(id)
    .map((itemId, index) => `${index + 1}. ${priorityItemMap[itemId].short}`)
    .join(" → ");
}

export const copy = {
  title: "Peluang Kedua",
  titleAccent: "Di Meja Temu Duga",
  intro:
    "Anda ialah majikan. Buat keputusan temu duga apabila syarat baharu dan risiko kerja muncul satu demi satu, kemudian lihat bagaimana pilihan peserta lain berubah.",
  badge: "SIMULASI KEPUTUSAN MAJIKAN",
  duration: "4 fasa · pilihan & susunan",
  privacy: "Statistik pilihan tanpa identiti",
  stages: ["Pilihan awal", "Sijil latihan", "Risiko kerja", "Susunan nilai"],
  footer: "MPU1032 ASPIRASI NEGARA BANGSA",
  restart: "Main semula",
  translateHint: "Ketik perkataan untuk terjemah",
  loginSubtitle: "Anda ialah seorang majikan.\nMahu beri peluang temu duga?",
  resultBadge: "Fasa 5 · Hasil",
  resultTitle: "Pilihan anda",
};
