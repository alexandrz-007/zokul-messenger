const MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/aac',
];

export function getSupportedMimeType(): string {
  for (const type of MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

export function getExtension(mimeType: string): string {
  if (mimeType.includes('webm')) return '.webm';
  if (mimeType.includes('mp4')) return '.mp4';
  if (mimeType.includes('aac')) return '.aac';
  if (mimeType.includes('ogg')) return '.ogg';
  return '.webm';
}

export const MIN_DURATION_MS = 1000;

export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}
