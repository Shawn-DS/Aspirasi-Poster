import { Trees } from "lucide-react";
import type { SenderId } from "../types";

export default function Avatar({ sender, group = false }: { sender?: SenderId; group?: boolean }) {
  if (group) return <span className="avatar avatar-group" aria-hidden="true"><Trees size={25} strokeWidth={1.6} /></span>;
  const isAina = sender === "aina";
  const isLim = sender === "lim";
  const background = isAina ? "#e9d8e0" : isLim ? "#f0dfc4" : sender === "admin" ? "#dce7eb" : "#d9e8d6";
  const shirt = isAina ? "#927082" : isLim ? "#c49a5e" : sender === "admin" ? "#6c95a5" : "#669273";
  return <span className="avatar" aria-hidden="true"><svg viewBox="0 0 48 48"><rect width="48" height="48" rx="24" fill={background} /><path d="M7 49Q7 30 24 30Q41 30 41 49" fill={shirt} />{isAina && <path d="M9 35V21Q9 5 24 5Q39 5 39 22V38L24 32Z" fill="#a77f92" />}<rect x="20" y="27" width="8" height="10" rx="3" fill="#bb875f" /><ellipse cx="24" cy="22" rx="10" ry="13" fill="#cc9c74" />{!isAina && <path d={isLim ? "M14 20Q11 6 25 8Q36 8 35 18L32 13Q20 10 14 20" : "M14 21Q9 5 24 7Q39 6 34 22L31 15Q23 20 16 14Z"} fill={isLim ? "#66726b" : "#334a3b"} />}<circle cx="20" cy="22" r="1" fill="#3f4638" /><circle cx="28" cy="22" r="1" fill="#3f4638" /><path d="M21 28Q24 30 27 27" stroke="#936846" strokeWidth="1.3" fill="none" strokeLinecap="round" />{isLim && <g fill="none" stroke="#5e6c5f" strokeWidth="1"><rect x="16" y="20" width="7" height="5" rx="2" /><rect x="25" y="20" width="7" height="5" rx="2" /><path d="M23 22h2" /></g>}</svg></span>;
}
