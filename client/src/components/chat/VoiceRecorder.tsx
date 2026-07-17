import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { getSupportedMimeType, getExtension } from '../../utils/voice';

interface VoiceRecorderProps {
  onSend: (voiceUrl: string, voiceDuration: number) => void;
  onCancel: () => void;
  isCancelling?: boolean;
}

export default function VoiceRecorder({ onSend, onCancel, isCancelling }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef(0);
  const discardRef = useRef(false);

  useEffect(() => {
    startRecording();
    return () => stopTracks();
  }, []);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRef.current = recorder;
      chunksRef.current = [];
      discardRef.current = false;
      setDuration(0);
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        clearInterval(timerRef.current);
        stopTracks();
        if (discardRef.current || chunksRef.current.length === 0) return;
        const actualMimeType = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        setUploading(true);
        const ext = getExtension(actualMimeType);
        const elapsed = Date.now() - startTimeRef.current;
        const finalDuration = Math.max(1, Math.round(elapsed / 1000));
        uploadBlob(blob, ext, finalDuration);
      };

      recorder.start();
      setRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const domErr = err as { name?: string };
      if (domErr.name === 'NotAllowedError' || domErr.name === 'PermissionDeniedError') {
        setError('Microphone access denied');
      } else if (domErr.name === 'NotSupportedError') {
        setError('Audio recording not supported in this browser');
      } else {
        setError('Failed to start recording');
      }
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
    discardRef.current = true;
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
    }
    clearInterval(timerRef.current);
    stopTracks();
    setRecording(false);
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
    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 select-none">
      <button type="button" onClick={cancelRecording} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label="Cancel recording">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
      <span className="text-sm font-medium tabular-nums">
        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
      </span>
      <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${isCancelling ? 'bg-red-500 w-full' : 'bg-primary w-1/2 animate-pulse'}`} />
      </div>
      {typeof isCancelling !== 'undefined' ? (
        <span className={`text-[10px] whitespace-nowrap transition-colors ${isCancelling ? 'text-red-500' : 'text-gray-400'}`}>
          {isCancelling ? 'Release to cancel' : 'Slide to cancel'}
        </span>
      ) : (
        <button
          type="button"
          onClick={stopRecording}
          className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shrink-0"
          aria-label="Stop recording"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <rect x="6" y="6" width="4" height="12" /><rect x="14" y="6" width="4" height="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
