import { describe, it, expect, vi, beforeAll } from 'vitest';
import { getExtension, getSupportedMimeType, shouldCancelGesture, CANCEL_THRESHOLD, MIN_DURATION_MS, isTouchDevice } from '../src/utils/voice';

beforeAll(() => {
  vi.stubGlobal('MediaRecorder', {
    isTypeSupported: vi.fn(),
  });
});

describe('getExtension', () => {
  it('returns .webm for webm mime', () => {
    expect(getExtension('audio/webm')).toBe('.webm');
  });

  it('returns .webm for webm with codecs', () => {
    expect(getExtension('audio/webm;codecs=opus')).toBe('.webm');
  });

  it('returns .mp4 for mp4 mime', () => {
    expect(getExtension('audio/mp4')).toBe('.mp4');
  });

  it('returns .mp4 for mp4 with codecs', () => {
    expect(getExtension('audio/mp4;codecs=mp4a.40.2')).toBe('.mp4');
  });

  it('returns .aac for aac mime', () => {
    expect(getExtension('audio/aac')).toBe('.aac');
  });

  it('returns .ogg for ogg mime', () => {
    expect(getExtension('audio/ogg')).toBe('.ogg');
  });

  it('returns .webm for unknown mime', () => {
    expect(getExtension('audio/x-unknown')).toBe('.webm');
  });

  it('returns .webm for empty string', () => {
    expect(getExtension('')).toBe('.webm');
  });
});

describe('getSupportedMimeType', () => {
  it('returns first supported mime type in preference order', () => {
    MediaRecorder.isTypeSupported = vi.fn((type: string) => {
      return type === 'audio/webm' || type === 'audio/mp4';
    });
    const result = getSupportedMimeType();
    expect(result).toBe('audio/webm');
  });

  it('returns empty string when nothing is supported', () => {
    MediaRecorder.isTypeSupported = vi.fn(() => false);
    const result = getSupportedMimeType();
    expect(result).toBe('');
  });
});

describe('shouldCancelGesture', () => {
  it('returns false when movement is within threshold', () => {
    expect(shouldCancelGesture(100, 100)).toBe(false);
    expect(shouldCancelGesture(100, 50)).toBe(false);
    expect(shouldCancelGesture(100, 21)).toBe(false);
  });

  it('returns true when movement left exceeds threshold', () => {
    expect(shouldCancelGesture(100, 19)).toBe(true);
    expect(shouldCancelGesture(100, 0)).toBe(true);
    expect(shouldCancelGesture(100, -50)).toBe(true);
  });

  it('returns false when moved right (positive direction)', () => {
    expect(shouldCancelGesture(100, 150)).toBe(false);
    expect(shouldCancelGesture(100, 200)).toBe(false);
  });
});

describe('CANCEL_THRESHOLD', () => {
  it('is 80 pixels', () => {
    expect(CANCEL_THRESHOLD).toBe(80);
  });
});

describe('MIN_DURATION_MS', () => {
  it('is 1000 ms', () => {
    expect(MIN_DURATION_MS).toBe(1000);
  });
});

describe('isTouchDevice', () => {
  it('returns boolean based on environment capabilities', () => {
    const result = isTouchDevice();
    expect(typeof result).toBe('boolean');
  });
});
