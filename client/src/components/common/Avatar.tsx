import { useState, useEffect, useMemo } from 'react';

interface AvatarProps {
  name: string;
  url?: string;
  size?: number;
}

const FALLBACK_COLORS = [
  '#2F7CF6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#06B6D4',
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default function Avatar({ name, url, size = 40 }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [url]);

  const bgColor = useMemo(() => {
    return FALLBACK_COLORS[hashName(name) % FALLBACK_COLORS.length];
  }, [name]);

  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  if (url && !imgError) {
    return <img key={url} src={url} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} onError={() => setImgError(true)} />;
  }
  return (
    <div
      className="rounded-full text-white flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4, backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
}