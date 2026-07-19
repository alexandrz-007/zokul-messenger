import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnread, useMessages } from '../src/hooks/useChat';
import { Message } from '../src/types';

const emit = vi.fn();
const handlers: Record<string, (...args: any[]) => void> = {};
const on = vi.fn((event: string, cb: (...args: any[]) => void) => { handlers[event] = cb; });
const off = vi.fn((event: string) => { delete handlers[event]; });

vi.mock('../src/contexts/SocketContext', () => ({
  useSocket: () => ({ socket: { emit, on, off, connected: true } as any }),
}));

vi.mock('../src/services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: [] }) },
}));

describe('read receipts (frontend)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const k of Object.keys(handlers)) delete handlers[k];
  });

  it('useUnread.markRead emits chat:read', () => {
    const { result } = renderHook(() => useUnread('c1'));
    act(() => { result.current.markRead('c1'); });
    expect(emit).toHaveBeenCalledWith('chat:read', { chatId: 'c1' });
  });

  it('useMessages updates readBy on message:read for own message', () => {
    const { result } = renderHook(() => useMessages('c1'));

    act(() => {
      handlers['message:new']({ id: 'm1', chatId: 'c1', senderId: 'u1', createdAt: new Date().toISOString() });
    });
    expect(result.current.messages.find((m) => m.id === 'm1')).toBeTruthy();

    act(() => {
      handlers['message:read']({ chatId: 'c1', userId: 'u2', messageIds: ['m1'] });
    });

    const updated = result.current.messages.find((m) => m.id === 'm1');
    expect(updated?.readBy).toContain('u2');
  });

  it('useMessages ignores message:read for other chat', () => {
    const { result } = renderHook(() => useMessages('c1'));
    act(() => {
      handlers['message:read']({ chatId: 'c2', userId: 'u2', messageIds: ['m9'] });
    });
    expect(result.current.messages.length).toBe(0);
  });
});
