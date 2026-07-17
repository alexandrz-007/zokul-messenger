import { useState, useRef } from 'react';

interface VoicePlayerProps {
  voiceUrl: string;
  voiceDuration?: number;
}

export default function VoicePlayer({ voiceUrl, voiceDuration }: VoicePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(voiceDuration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {
        setPlaying(false);
      });
      setPlaying(true);
    }
  };

  const handleLoaded = () => {
    const audio = audioRef.current;
    if (audio && !voiceDuration) {
      setDuration(audio.duration);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  };

  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <audio
        ref={audioRef}
        src={voiceUrl}
        onLoadedMetadata={handleLoaded}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      <button type="button" onClick={toggle} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
        {playing ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 ml-0.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>
      <div className="flex-1">
        <div className="h-1 bg-[#C9D6E4] dark:bg-gray-600 rounded-full cursor-pointer" onClick={handleSeek}>
          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <span className="text-[10px] text-gray-400 tabular-nums w-10 text-right">
        {formatDuration(currentTime)}/{formatDuration(duration)}
      </span>
    </div>
  );
}
