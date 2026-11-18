"use client";
import { X } from "lucide-react";
import { STICKER_PACK } from "../data/stickers";

export default function StickerDrawer({
  maxHeight,
  onSelectSticker,
  onClose,
}: {
  maxHeight: number;
  onSelectSticker: (stickerId: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="sticker-drawer"
      role="dialog"
      aria-label="Emoji komuniti"
      style={{ maxHeight }}
      onKeyDown={e => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="sticker-drawer-head">
        <strong>Emoji Komuniti · 8 pilihan</strong>
        <button
          type="button"
          className="sticker-drawer-close"
          onClick={onClose}
          aria-label="Tutup emoji"
        >
          <X size={15} />
        </button>
      </div>
      <div className="sticker-drawer-grid">
        {STICKER_PACK.map(stk => (
          <button
            key={stk.id}
            type="button"
            className="sticker-drawer-item"
            onClick={() => onSelectSticker(stk.id)}
            aria-label={`Hantar ${stk.caption} (${stk.meaning})`}
            title={`${stk.caption} · ${stk.meaning}`}
          >
            <img src={stk.src} alt={stk.caption} loading="lazy" draggable={false} />
            <strong className="sticker-item-caption" style={{ backgroundColor: stk.color }}>
              {stk.caption}
            </strong>
            <span className="sticker-item-meaning">{stk.meaning}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
