export default function Avatar({ group = false }: { group?: boolean }) {
  if (!group) return null;
  return (
    <span className="avatar avatar-group" aria-hidden="true">
      <img src="/art/poster-emblem.webp?v=2" alt="" className="poster-emblem-img" />
    </span>
  );
}
