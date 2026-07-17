import { useState, useEffect } from 'react';

const AVATAR_COLORS = [
  '#007AFF', '#E5534B', '#38A169', '#DD6B20', '#7C3AED',
  '#14B8A6', '#EC4899', '#8B5CF6', '#D69E2E', '#10B981',
  '#3B82F6', '#F97316',
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface AvatarProps {
  name: string;
  url?: string;
  size?: number;
}

export default function Avatar({ name, url, size = 40 }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [url]);

  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  if (url && !imgError) {
    return <img key={url} src={url} alt={name} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} onError={() => setImgError(true)} />;
  }
  return (
    <div
      className="rounded-full text-white flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4, backgroundColor: getColorForName(name) }}
    >
      {initials}
    </div>
  );
}
