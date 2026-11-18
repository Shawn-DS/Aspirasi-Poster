import type { SenderId } from "../types";

export default function Avatar({ sender, group = false }: { sender?: SenderId; group?: boolean }) {
  if (group) {
    return (
      <span className="avatar avatar-group" aria-hidden="true">
        <svg viewBox="0 0 100 100">
          <defs>
            <clipPath id="grp-clip">
              <circle cx="50" cy="50" r="50" />
            </clipPath>
            <linearGradient id="grp-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dff7ee" />
              <stop offset="100%" stopColor="#c2ebd9" />
            </linearGradient>
            <linearGradient id="grp-hill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#0d946b" />
            </linearGradient>
          </defs>

          <g clipPath="url(#grp-clip)">
            {/* Sky & Warm Sun */}
            <rect width="100" height="100" fill="url(#grp-sky)" />
            <circle cx="82" cy="18" r="10" fill="#fde68a" opacity="0.65" />
            <circle cx="82" cy="18" r="6.8" fill="#fbbf24" />
            <path d="M14 20 C14 17 18 16 20 18 C22 15 27 16 28 19 C30 19 31 22 28 22 L15 22 C13 22 13 20 14 20 Z" fill="#ffffff" opacity="0.85" />

            {/* Neighbourhood Trees in Background */}
            <circle cx="12" cy="43" r="9" fill="#10b981" />
            <circle cx="88" cy="43" r="9" fill="#10b981" />

            {/* Row of 3 Neighbourhood Terrace Houses (Taman Harmoni Community) */}
            {/* Left House */}
            <rect x="15" y="29" width="22" height="20" rx="1.5" fill="#fef3c7" stroke="#064e45" strokeWidth="1.6" />
            <path d="M12 30 L26 19 L40 30 Z" fill="#e07a5f" stroke="#064e45" strokeWidth="1.6" strokeLinejoin="round" />
            <rect x="21" y="33" width="5" height="5" rx="1" fill="#fde68a" stroke="#064e45" strokeWidth="1.2" />
            <rect x="28" y="33" width="5" height="5" rx="1" fill="#fde68a" stroke="#064e45" strokeWidth="1.2" />

            {/* Right House */}
            <rect x="63" y="29" width="22" height="20" rx="1.5" fill="#fef3c7" stroke="#064e45" strokeWidth="1.6" />
            <path d="M60 30 L74 19 L88 30 Z" fill="#f4a261" stroke="#064e45" strokeWidth="1.6" strokeLinejoin="round" />
            <rect x="67" y="33" width="5" height="5" rx="1" fill="#fde68a" stroke="#064e45" strokeWidth="1.2" />
            <rect x="74" y="33" width="5" height="5" rx="1" fill="#fde68a" stroke="#064e45" strokeWidth="1.2" />

            {/* Center Community House */}
            <rect x="35" y="25" width="30" height="24" rx="2" fill="#fffbeb" stroke="#064e45" strokeWidth="1.8" />
            <path d="M31 26 L50 13 L69 26 Z" fill="#12836c" stroke="#064e45" strokeWidth="1.8" strokeLinejoin="round" />
            <rect x="41" y="30" width="7" height="6" rx="1.2" fill="#fde68a" stroke="#064e45" strokeWidth="1.3" />
            <rect x="52" y="30" width="7" height="6" rx="1.2" fill="#fde68a" stroke="#064e45" strokeWidth="1.3" />

            {/* Green Neighbourhood Lawn */}
            <path d="M0 50 Q50 42 100 50 L100 100 L0 100 Z" fill="url(#grp-hill)" />

            {/* COMMUNITY MEMBERS HUDDLED SHOULDER-TO-SHOULDER */}
            {/* Back-Left: Puan Aina */}
            <g transform="translate(23, 36)">
              <path d="M0 40 Q1 21 15 21 Q29 21 30 40" fill="#8d5875" />
              <path d="M4 27 V14 Q4 2 15 2 Q26 2 26 14 V27 L15 22 Z" fill="#a8728e" />
              <ellipse cx="15" cy="14.5" rx="7.4" ry="9.2" fill="#d4a47c" />
              <circle cx="10.5" cy="16" r="1.5" fill="#e08276" opacity="0.32" />
              <circle cx="19.5" cy="16" r="1.5" fill="#e08276" opacity="0.32" />
              <circle cx="12.2" cy="14.2" r="1.05" fill="#2f362b" />
              <circle cx="17.8" cy="14.2" r="1.05" fill="#2f362b" />
              <path d="M12.8 18.2 Q15 19.8 17.2 18" stroke="#8c5f3e" strokeWidth="1.25" fill="none" strokeLinecap="round" />
            </g>

            {/* Back-Right: Uncle Lim */}
            <g transform="translate(47, 36)">
              <path d="M0 40 Q1 21 15 21 Q29 21 30 40" fill="#b87f3d" />
              <ellipse cx="15" cy="14.5" rx="7.5" ry="9.2" fill="#d4a47c" />
              <path d="M7.5 13 Q5.5 3 15.5 4.5 Q23.5 4.5 22.5 12 L20.5 8.2 Q12.5 6.2 7.5 13" fill="#68746d" />
              <g fill="none" stroke="#465349" strokeWidth="1.05">
                <rect x="9" y="12.5" width="5.2" height="3.8" rx="1.3" fill="#ffffff40" />
                <rect x="15.8" y="12.5" width="5.2" height="3.8" rx="1.3" fill="#ffffff40" />
                <path d="M14.2 14.2 h1.6" />
              </g>
              <circle cx="11.6" cy="14.4" r="0.95" fill="#2f362b" />
              <circle cx="18.4" cy="14.4" r="0.95" fill="#2f362b" />
              <path d="M12.8 18.4 Q15 20 17.2 18.2" stroke="#8c5f3e" strokeWidth="1.25" fill="none" strokeLinecap="round" />
            </g>

            {/* Front-Left: Admin Komuniti */}
            <g transform="translate(4, 54)">
              <path d="M0 48 Q3 24 23 24 Q41 24 44 48" fill="#4e7e94" />
              <path d="M16 25 Q22 29 28 25" fill="none" stroke="#ffffff4d" strokeWidth="1.3" strokeLinecap="round" />
              <rect x="19" y="20" width="6.5" height="7" rx="2.5" fill="#bf8a62" />
              <ellipse cx="22.2" cy="15.5" rx="8.6" ry="10.6" fill="#d4a47c" />
              <path d="M13.8 14.5 Q9.5 2 22.2 3.5 Q34.5 2.8 30.5 15.5 L28 10 Q21 14 15.5 9 Z" fill="#2b424f" />
              <circle cx="18.8" cy="15.5" r="1.15" fill="#2f362b" />
              <circle cx="25.6" cy="15.5" r="1.15" fill="#2f362b" />
              <path d="M19.5 20.2 Q22.2 22.2 25 19.9" stroke="#8c5f3e" strokeWidth="1.35" fill="none" strokeLinecap="round" />
            </g>

            {/* Front-Right: Amir */}
            <g transform="translate(52, 54)">
              <path d="M0 48 Q3 24 21 24 Q41 24 44 48" fill="#498260" />
              <path d="M16 25 Q22 29 28 25" fill="none" stroke="#ffffff4d" strokeWidth="1.3" strokeLinecap="round" />
              <rect x="18.5" y="20" width="6.5" height="7" rx="2.5" fill="#bf8a62" />
              <ellipse cx="21.8" cy="15.5" rx="8.6" ry="10.6" fill="#d4a47c" />
              <circle cx="16.2" cy="17.5" r="1.7" fill="#e08276" opacity="0.3" />
              <circle cx="27.4" cy="17.5" r="1.7" fill="#e08276" opacity="0.3" />
              <path d="M13.4 14.5 Q9 2 21.8 3.5 Q34 2.8 30 15.5 L27.5 10 Q20.5 14 15 9 Z" fill="#2d4737" />
              <circle cx="18.4" cy="15.5" r="1.15" fill="#2f362b" />
              <circle cx="25.2" cy="15.5" r="1.15" fill="#2f362b" />
              <path d="M19 20 Q21.8 22.4 24.6 19.8" stroke="#8c5f3e" strokeWidth="1.35" fill="none" strokeLinecap="round" />
            </g>
          </g>
        </svg>
      </span>
    );
  }
  const isAina = sender === "aina";
  const isLim = sender === "lim";
  const isAdmin = sender === "admin";
  const isYou = sender === "you";
  const background = isAina ? "#f2e2ea" : isLim ? "#f5e6ce" : isAdmin ? "#ddeaf0" : isYou ? "#e0f2fe" : "#dcecdf";
  const ring = isAina ? "#d9bdd0" : isLim ? "#e2c8a2" : isAdmin ? "#b9d2de" : isYou ? "#7dd3fc" : "#86efac";
  const shirt = isAina ? "#8d5875" : isLim ? "#b87f3d" : isAdmin ? "#4e7e94" : isYou ? "#2563eb" : "#2f7a59";
  return (
    <span className="avatar" aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <rect width="48" height="48" rx="24" fill={background} />
        <path d="M7 49Q7 30 24 30Q41 30 41 49" fill={shirt} />
        {isYou ? (
          <path d="M19 30 Q24 34 29 30 L29 32 Q24 36 19 32 Z" fill="#ffffff" />
        ) : (
          <path d="M18 31Q24 35 30 31" fill="none" stroke="#ffffff40" strokeWidth="1.4" strokeLinecap="round" />
        )}
        {isAina && <path d="M9 36V21Q9 5 24 5Q39 5 39 22V38L24 32Z" fill="#a8728e" />}
        <rect x="20" y="27" width="8" height="10" rx="3.5" fill="#bf8a62" />
        <ellipse cx="24" cy="22" rx="10" ry="12.8" fill="#d4a47c" />
        <circle cx="17.5" cy="24.5" r="2.1" fill="#e08276" opacity="0.28" />
        <circle cx="30.5" cy="24.5" r="2.1" fill="#e08276" opacity="0.28" />
        {!isAina && (
          <path
            d={
              isLim
                ? "M14 20Q11 6 25 8Q36 8 35 18L32 13Q20 10 14 20"
                : isYou
                  ? "M13 19Q11 6 24 7Q37 6 35 18L33 13Q25 10 15 15Z"
                  : isAdmin
                    ? "M14 21Q9 5 24 7Q39 6 34 22L31 15Q23 20 16 14Z"
                    : "M14 21Q9 5 24 7Q39 6 34 22L31 15Q23 20 16 14Z"
            }
            fill={isLim ? "#68746d" : isYou ? "#1e293b" : isAdmin ? "#2b424f" : "#1f382b"}
          />
        )}
        <circle cx="20" cy="22" r="1.15" fill="#2f362b" />
        <circle cx="28" cy="22" r="1.15" fill="#2f362b" />
        <path d="M21 27.6Q24 29.8 27 27.2" stroke="#8c5f3e" strokeWidth="1.35" fill="none" strokeLinecap="round" />
        {isLim && (
          <g fill="none" stroke="#536155" strokeWidth="1.1">
            <rect x="15.8" y="19.8" width="7.2" height="5.2" rx="2" />
            <rect x="25" y="19.8" width="7.2" height="5.2" rx="2" />
            <path d="M23 22.2h2" />
          </g>
        )}
        <circle cx="24" cy="24" r="23.2" fill="none" stroke={ring} strokeWidth="1.2" opacity="0.7" />
      </svg>
    </span>
  );
}
