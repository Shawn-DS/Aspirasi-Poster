import type { EthicsProfileId } from "../types";

export default function EthicsSticker({
  type,
  size = 108,
  className = "",
}: {
  type: EthicsProfileId;
  size?: number;
  className?: string;
}) {
  if (type === "deontology") {
    // "Si Neraca Adil" — Cute Sapphire Shield & Balance Scale Monster Sticker
    // Flat vector cartoon monster with melty/drip wizard-judge cap, holding golden balance scales, cute determined ":3" face
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 140 140"
        className={`ethics-sticker sticker-deontology ${className}`}
        aria-hidden="true"
      >
        <g className="sticker-diecut">
          {/* White sticker border silhouette */}
          <path
            d="M70 10 C88 10 105 22 108 38 C122 42 132 54 132 68 C132 82 122 92 112 94 C109 112 92 126 70 130 C48 126 31 112 28 94 C18 92 8 82 8 68 C8 54 18 42 32 38 C35 22 52 10 70 10 Z"
            fill="#ffffff"
          />
          {/* Balance scale beam & arms */}
          <path d="M22 60 Q70 52 118 60" stroke="#4a5568" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          {/* Left & Right Scale Strings */}
          <path d="M24 60 L16 78 M24 60 L32 78" stroke="#718096" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M116 60 L108 78 M116 60 L124 78" stroke="#718096" strokeWidth="2.2" strokeLinecap="round" />
          {/* Left & Right Golden Scale Pans */}
          <path d="M11 78 Q24 90 37 78 Z" fill="#f6ad55" />
          <path d="M103 78 Q116 90 129 78 Z" fill="#f6ad55" />
          <circle cx="24" cy="75" r="4" fill="#fbd38d" />
          <circle cx="116" cy="75" r="4" fill="#fbd38d" />

          {/* Main Shield-Monster Body (Sapphire Blue flat vector) */}
          <path
            d="M36 44 C36 34 104 34 104 44 L104 76 C104 102 88 117 70 124 C52 117 36 102 36 76 Z"
            fill="#3b82f6"
          />
          {/* Darker blue bottom wave/drip shadow */}
          <path
            d="M37 82 Q46 76 54 84 Q62 92 70 82 Q78 72 86 84 Q94 92 103 82 C101 103 87 117 70 124 C53 117 39 103 37 82 Z"
            fill="#1d4ed8"
          />

          {/* Melty / Dripping Cyan-Blue Judge Cap on top (matches reference drip style) */}
          <path
            d="M32 45 C32 24 50 15 70 15 C90 15 108 24 108 45 C103 45 100 54 95 54 C90 54 89 44 83 44 C77 44 76 57 70 57 C64 57 63 45 57 45 C51 45 50 55 44 55 C39 55 37 45 32 45 Z"
            fill="#38bdf8"
          />
          {/* Golden justice star badge on cap */}
          <polygon
            points="70,22 73,29 80,29 74.5,33.5 76.5,40.5 70,36 63.5,40.5 65.5,33.5 60,29 67,29"
            fill="#fbbf24"
          />

          {/* Cute Monster Arms holding the scale */}
          <path d="M38 66 Q26 62 24 60" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M102 66 Q114 62 116 60" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" fill="none" />

          {/* Cute Determined Face (> w <) */}
          <path d="M53 65 L61 68" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M87 65 L79 68" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="58" cy="72" r="3.4" fill="#1e293b" />
          <circle cx="82" cy="72" r="3.4" fill="#1e293b" />
          <circle cx="59" cy="70.8" r="1.1" fill="#ffffff" />
          <circle cx="83" cy="70.8" r="1.1" fill="#ffffff" />
          {/* Rosy cheeks */}
          <ellipse cx="50" cy="76" rx="4.5" ry="2.6" fill="#f472b6" opacity="0.65" />
          <ellipse cx="90" cy="76" rx="4.5" ry="2.6" fill="#f472b6" opacity="0.65" />
          {/* Cute ":3" cat mouth */}
          <path
            d="M64 76 Q67 80 70 76 Q73 80 76 76"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Floating drip droplets */}
          <circle cx="28" cy="96" r="3.2" fill="#38bdf8" />
          <circle cx="111" cy="94" r="2.6" fill="#3b82f6" />
        </g>
      </svg>
    );
  }

  if (type === "utilitarianism") {
    // "Si Harmoni Ramai" — Cute Golden-Amber Community Huddle Monster Sticker
    // Big warm sunshine jelly monster hugging 3 cute mini-neighbour blobs under a melty honey/canopy top
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 140 140"
        className={`ethics-sticker sticker-utilitarianism ${className}`}
        aria-hidden="true"
      >
        <g className="sticker-diecut">
          {/* White sticker border */}
          <path
            d="M70 10 C98 10 124 30 126 62 C130 78 128 102 116 116 C104 126 88 130 70 130 C52 130 36 126 24 116 C12 102 10 78 14 62 C16 30 42 10 70 10 Z"
            fill="#ffffff"
          />

          {/* Main Warm Golden-Orange Monster Body */}
          <path
            d="M22 68 C22 32 42 18 70 18 C98 18 118 32 118 68 C118 92 114 114 98 120 C88 124 80 118 70 120 C60 122 52 124 42 120 C26 114 22 92 22 68 Z"
            fill="#f59e0b"
          />

          {/* Melty Cream-Yellow Frosting / Sunshine Canopy on Top (reference cake/mug foam style) */}
          <path
            d="M24 54 C24 28 44 16 70 16 C96 16 116 28 116 54 C110 54 108 65 101 65 C94 65 93 52 86 52 C79 52 78 66 70 66 C62 66 61 53 54 53 C47 53 46 65 39 65 C32 65 30 54 24 54 Z"
            fill="#fef08a"
          />
          {/* Colorful sprinkles on the canopy */}
          <rect x="46" y="28" width="7" height="3" rx="1.5" transform="rotate(-18 46 28)" fill="#fb7185" />
          <rect x="68" y="24" width="7" height="3" rx="1.5" transform="rotate(12 68 24)" fill="#38bdf8" />
          <rect x="88" y="30" width="7" height="3" rx="1.5" transform="rotate(-15 88 30)" fill="#34d399" />
          <circle cx="58" cy="36" r="2.2" fill="#a855f7" />
          <circle cx="82" cy="38" r="2.2" fill="#f97316" />

          {/* Main Monster Happy Face */}
          <circle cx="56" cy="73" r="3.5" fill="#1e293b" />
          <circle cx="84" cy="73" r="3.5" fill="#1e293b" />
          <circle cx="57.2" cy="71.8" r="1.2" fill="#ffffff" />
          <circle cx="85.2" cy="71.8" r="1.2" fill="#ffffff" />
          <ellipse cx="47" cy="77" rx="5" ry="2.8" fill="#ef4444" opacity="0.55" />
          <ellipse cx="93" cy="77" rx="5" ry="2.8" fill="#ef4444" opacity="0.55" />
          <path d="M63 75 Q70 83 77 75" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" fill="none" />

          {/* 3 Cute Mini-Neighbour Blobs huddled together at the bottom (representing Majority / Community) */}
          {/* Left mini blob (Teal) */}
          <path d="M26 118 C26 96 54 96 54 118 Z" fill="#2dd4bf" />
          <circle cx="36" cy="108" r="2" fill="#1e293b" />
          <circle cx="44" cy="108" r="2" fill="#1e293b" />
          <path d="M38 112 Q40 114 42 112" stroke="#1e293b" strokeWidth="1.6" strokeLinecap="round" fill="none" />

          {/* Right mini blob (Pink) */}
          <path d="M86 118 C86 96 114 96 114 118 Z" fill="#f472b6" />
          <circle cx="96" cy="108" r="2" fill="#1e293b" />
          <circle cx="104" cy="108" r="2" fill="#1e293b" />
          <path d="M98 112 Q100 114 102 112" stroke="#1e293b" strokeWidth="1.6" strokeLinecap="round" fill="none" />

          {/* Center mini blob (Mint Green) */}
          <path d="M52 122 C52 94 88 94 88 122 Z" fill="#4ade80" />
          <circle cx="65" cy="108" r="2.3" fill="#1e293b" />
          <circle cx="75" cy="108" r="2.3" fill="#1e293b" />
          <path d="M67 113 Q70 116 73 113" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Big Monster Hugging Arms wrapping around the 3 mini blobs */}
          <path d="M22 84 Q16 102 32 108" stroke="#d97706" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M118 84 Q124 102 108 108" stroke="#d97706" strokeWidth="8" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    );
  }

  if (type === "care") {
    // "Si Hati Prihatin" — Cute Pink Melty Heart-Monster inside a Cozy Mint Teacup Sticker
    // Inspired by the teacup & pink icing cake/donut in the user's reference sheet!
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 140 140"
        className={`ethics-sticker sticker-care ${className}`}
        aria-hidden="true"
      >
        <g className="sticker-diecut">
          {/* White sticker border */}
          <path
            d="M70 12 C94 12 116 28 116 54 C126 58 134 68 134 80 C134 94 124 106 110 110 C102 122 88 128 70 128 C52 128 38 122 30 110 C16 106 6 94 6 80 C6 68 14 58 24 54 C24 28 46 12 70 12 Z"
            fill="#ffffff"
          />

          {/* Floating mini hearts on top */}
          <path
            d="M70 25 C67 20 60 21 60 27 C60 32 70 37 70 37 C70 37 80 32 80 27 C80 21 73 20 70 25 Z"
            fill="#fb7185"
          />

          {/* Pink Melty Jelly Monster rising from the cup */}
          <path
            d="M32 74 C30 44 46 32 70 32 C94 32 110 44 108 74 Z"
            fill="#f472b6"
          />
          {/* Darker berry-pink melty icing top */}
          <path
            d="M34 56 C35 38 49 31 70 31 C91 31 105 38 106 56 C101 56 99 64 94 64 C89 64 88 54 82 54 C76 54 75 65 70 65 C65 65 64 54 58 54 C52 54 51 64 46 64 C41 64 39 56 34 56 Z"
            fill="#ec4899"
          />

          {/* Cozy Mint-Green Teacup Base (like reference image 1 bottom-right!) */}
          <path
            d="M110 76 C124 76 127 98 106 100"
            stroke="#6ee7b7"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M24 72 L116 72 C114 104 96 120 70 120 C44 120 26 104 24 72 Z"
            fill="#a7f3d0"
          />
          <ellipse cx="70" cy="120" rx="24" ry="5" fill="#6ee7b7" />

          {/* Pink Monster Dripping Over the Cup Rim (exactly like the teacup monster in image 1!) */}
          <path
            d="M24 72 C30 72 33 92 38 92 C43 92 44 75 52 75 C59 75 61 98 67 98 C73 98 75 76 84 76 C91 76 93 90 98 90 C103 90 105 72 116 72 Z"
            fill="#f472b6"
          />

          {/* Cute Open Hugging Arms */}
          <path d="M34 66 Q18 60 16 70" stroke="#f472b6" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M106 66 Q122 60 124 70" stroke="#f472b6" strokeWidth="8" strokeLinecap="round" fill="none" />

          {/* Sweet Empathetic Face */}
          <circle cx="57" cy="62" r="3.4" fill="#1e293b" />
          <circle cx="83" cy="62" r="3.4" fill="#1e293b" />
          <circle cx="58.2" cy="60.8" r="1.2" fill="#ffffff" />
          <circle cx="84.2" cy="60.8" r="1.2" fill="#ffffff" />
          <ellipse cx="48" cy="66" rx="5" ry="2.8" fill="#fb7185" opacity="0.75" />
          <ellipse cx="92" cy="66" rx="5" ry="2.8" fill="#fb7185" opacity="0.75" />
          <path d="M64 65 Q70 71 76 65" stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" fill="none" />

          {/* Cute heart emblem on the teacup */}
          <path
            d="M70 98 C68 94 62 95 62 100 C62 104 70 108 70 108 C70 108 78 104 78 100 C78 95 72 94 70 98 Z"
            fill="#10b981"
          />
        </g>
      </svg>
    );
  }

  // "Si Harmoni Seimbang" — Balanced Three-Scoop / Sprout Monster Sticker
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      className={`ethics-sticker sticker-balanced ${className}`}
      aria-hidden="true"
    >
      <g className="sticker-diecut">
        <path
          d="M70 10 C96 10 122 30 124 64 C126 96 106 126 70 128 C34 126 14 96 16 64 C18 30 44 10 70 10 Z"
          fill="#ffffff"
        />
        {/* Leaf sprout on top */}
        <path d="M70 30 L70 16" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
        <path d="M70 18 C56 12 50 24 70 26 Z" fill="#4ade80" />
        <path d="M70 18 C84 12 90 24 70 26 Z" fill="#22c55e" />

        {/* Main Emerald Monster Body */}
        <path
          d="M26 74 C26 40 44 28 70 28 C96 28 114 40 114 74 C114 102 98 120 70 120 C42 120 26 102 26 74 Z"
          fill="#34d399"
        />
        {/* Tri-color melty icing crown representing all 3 lenses (Blue + Gold + Pink) */}
        <path
          d="M28 58 C30 38 46 28 70 28 C94 28 110 38 112 58 C106 58 103 68 96 68 C89 68 88 55 81 55 C74 55 75 69 68 69 C61 69 60 55 53 55 C46 55 45 67 38 67 C32 67 31 58 28 58 Z"
          fill="#10b981"
        />
        {/* 3 lens gems on crown */}
        <circle cx="48" cy="44" r="6" fill="#38bdf8" />
        <circle cx="70" cy="40" r="6.5" fill="#fbbf24" />
        <circle cx="92" cy="44" r="6" fill="#f472b6" />

        {/* Happy Face */}
        <circle cx="56" cy="76" r="3.5" fill="#1e293b" />
        <circle cx="84" cy="76" r="3.5" fill="#1e293b" />
        <circle cx="57.2" cy="74.8" r="1.2" fill="#ffffff" />
        <circle cx="85.2" cy="74.8" r="1.2" fill="#ffffff" />
        <ellipse cx="47" cy="80" rx="5" ry="2.8" fill="#fb7185" opacity="0.6" />
        <ellipse cx="93" cy="80" rx="5" ry="2.8" fill="#fb7185" opacity="0.6" />
        <path d="M63 79 Q70 86 77 79" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
