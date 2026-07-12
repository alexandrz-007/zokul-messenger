import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

interface VoiceRecorderProps {
  onSend: (voiceUrl: string, voiceDuration: number) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const durationRef = useRef(0);

  useEffect(() => {
    startRecording();
    return () => stopRecording();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRef.current = recorder;
      chunksRef.current = [];
      durationRef.current = 0;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        clearInterval(timerRef.current);
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length === 0) return;
        const blobType = mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        setUploading(true);
        const ext = blobType === 'audio/webm' ? '.webm' : blobType === 'audio/mp4' ? '.mp4' : '.ogg';
        const finalDuration = durationRef.current;
        uploadBlob(blob, ext, finalDuration);
      };

      recorder.start();
      setRecording(true);

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
      }, 1000);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('Microphone access denied');
      } else if (err?.name === 'NotSupportedError') {
        setError('Audio recording not supported in this browser');
      } else {
        setError('Failed to start recording');
      }
      onCancel();
    }
  };

  const uploadBlob = async (blob: Blob, ext: string, finalDuration: number) => {
    try {
      const formData = new FormData();
      formData.append('file', blob, `voice${ext}`);
      const res = await api.post<{ url: string }>('/upload', formData);
      onSend(res.data.url, finalDuration);
      onCancel();
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
    }
    clearInterval(timerRef.current);
    setRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stream.getTracks().forEach((t) => t.stop());
      mediaRef.current.stop();
    }
    clearInterval(timerRef.current);
    onCancel();
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
        <span className="text-xs text-red-500 flex-1">{error}</span>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  if (uploading) {
    return (
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Uploading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
      <button type="button" onClick={cancelRecording} className="text-gray-400 hover:text-gray-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-sm font-medium tabular-nums">
        {Math.floor(durationRef.current / 60)}:{(durationRef.current % 60).toString().padStart(2, '0')}
      </span>
      <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-pulse w-1/2" />
      </div>
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shrink-0"
      >
        {recording ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <rect x="6" y="6" width="4" height="12" /><rect x="14" y="6" width="4" height="12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>
    </div>
  );
}
