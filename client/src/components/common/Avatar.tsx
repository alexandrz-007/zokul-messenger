import { useState, useEffect } from 'react';

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
    return <img key={url} src={url} alt={name} className="rounded-full" style={{ width: size, height: size }} onError={() => setImgError(true)} />;
  }
  return (
    <div
      className="rounded-full bg-primary text-white flex items-center justify-center font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
