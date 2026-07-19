import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import ChatView from '../src/components/chat/ChatView';
import { ChatProvider } from '../src/contexts/ChatContext';
import { Message } from '../src/types';

const emit = vi.fn();
const on = vi.fn();
const off = vi.fn();
vi.mock('../src/contexts/SocketContext', () => ({
  useSocket: () => ({ socket: { emit, on, off, connected: true } as any }),
}));

function makeMsg(id: string, chatId: string): Message {
  return { id, chatId, senderId: 'u1', text: `msg ${id}`, createdAt: new Date().toISOString() };
}

describe('ChatView auto-scroll', () => {
  let scrollToMock: ReturnType<typeof vi.fn>;
  let scrollIntoViewMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollToMock = vi.fn(function (this: any, arg: any) {
      if (arg && typeof arg === 'object') this.scrollTop = arg.top;
    });
    scrollIntoViewMock = vi.fn();
    (Element.prototype as any).scrollTo = scrollToMock;
    (HTMLElement.prototype as any).scrollIntoView = scrollIntoViewMock;
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => 1000 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 500 });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', { configurable: true, writable: true, value: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to bottom when opening a chat with messages', () => {
    const { container } = render(
      <ChatProvider>
        <ChatView
          messages={[makeMsg('m1', 'c1')]}
          currentUserId="u1"
          currentUserName="Me"
          participants={[]}
          chatId="c1"
          loading={false}
          error=""
        />
      </ChatProvider>
    );
    const scrollEl = container.querySelector('.overflow-y-auto') as HTMLElement;
    expect(scrollEl).toBeTruthy();
    expect(scrollEl.scrollTop).toBe(1000);
  });

  it('scrolls to bottom again when switching to another chat', () => {
    const { container, rerender } = render(
      <ChatProvider>
        <ChatView
          messages={[makeMsg('m1', 'c1')]}
          currentUserId="u1"
          currentUserName="Me"
          participants={[]}
          chatId="c1"
          loading={false}
          error=""
        />
      </ChatProvider>
    );
    const first = container.querySelector('.overflow-y-auto') as HTMLElement;
    expect(first.scrollTop).toBe(1000);

    act(() => {
      rerender(
        <ChatProvider>
          <ChatView
            messages={[makeMsg('m2', 'c2')]}
            currentUserId="u1"
            currentUserName="Me"
            participants={[]}
            chatId="c2"
            loading={false}
            error=""
          />
        </ChatProvider>
      );
    });
    const second = container.querySelector('.overflow-y-auto') as HTMLElement;
    expect(second.scrollTop).toBe(1000);
  });
});
