"use client";
import { forwardRef } from "react";
import { Leaf, X } from "lucide-react";
import { communityProfiles, copy, people } from "../data/story";
import Avatar from "./Avatar";

const CommunityDialog = forwardRef<HTMLDialogElement>(function CommunityDialog(_, ref) {
  function closeDialog() {
    if (ref && typeof ref !== "function") ref.current?.close();
  }

  return (
    <dialog
      className="about-dialog community-dialog"
      ref={ref}
      aria-labelledby="community-title"
      onClick={e => {
        if (e.target === e.currentTarget) closeDialog();
      }}
    >
      <div className="dialog-heading">
        <Avatar group />
        <button type="button" className="icon-button" aria-label={copy.close} onClick={closeDialog}>
          <X size={21} />
        </button>
      </div>
      <p className="eyebrow">PERSATUAN PENDUDUK</p>
      <h2 id="community-title">{copy.about}</h2>
      <p className="community-subtitle">{copy.aboutSubtitle}</p>
      <div className="community-announcement">
        <span>{copy.announcementLabel}</span>
        <p>{copy.announcement}</p>
      </div>
      <p>{copy.aboutText}</p>
      <p className="eyebrow profile-label">{copy.peopleLabel}</p>
      <ul className="community-people">
        {communityProfiles.map(profile => (
          <li key={profile.sender}>
            <Avatar sender={profile.sender} />
            <div>
              <strong style={{ color: people[profile.sender].color }}>{people[profile.sender].name}</strong>
              <span>{profile.role}</span>
              <p>{profile.description}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="community-question">
        <Leaf size={21} />
        <p>{copy.communityQuestion}</p>
      </div>
      <p className="community-simulation">{copy.simulationNote}</p>
      <button type="button" className="dialog-close" onClick={closeDialog}>
        {copy.backToChat}
      </button>
    </dialog>
  );
});

export default CommunityDialog;
