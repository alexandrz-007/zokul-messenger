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

// ResizeObserver polyfill: fires callback immediately on observe so we can
// drive the "container grew after mount" path that real RO covers. Keeps the
// last instance so tests can trigger a resize after mount.
let lastRO: MockResizeObserver | null = null;
class MockResizeObserver {
  cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) { this.cb = cb; lastRO = this; }
  observe(el: Element) { this.cb([] as any, this as any); }
  unobserve() {}
  disconnect() {}
  trigger() { this.cb([] as any, this as any); }
}
(globalThis as any).ResizeObserver = MockResizeObserver;

// Controllable scrollHeight so we can simulate growth after mount.
let scrollHeightValue = 1000;

function makeMsg(id: string, chatId: string): Message {
  return { id, chatId, senderId: 'u1', text: `msg ${id}`, createdAt: new Date().toISOString() };
}

function renderChat(props: Partial<React.ComponentProps<typeof ChatView>> = {}) {
  return render(
    <ChatProvider>
      <ChatView
        messages={[makeMsg('m1', 'c1')]}
        currentUserId="u1"
        currentUserName="Me"
        participants={[]}
        chatId="c1"
        loading={false}
        error=""
        {...props}
      />
    </ChatProvider>
  );
}

describe('ChatView auto-scroll', () => {
  let scrollToMock: ReturnType<typeof vi.fn>;
  let scrollIntoViewMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollHeightValue = 1000;
    scrollToMock = vi.fn(function (this: any, arg: any) {
      if (arg && typeof arg === 'object') this.scrollTop = arg.top;
    });
    scrollIntoViewMock = vi.fn();
    (Element.prototype as any).scrollTo = scrollToMock;
    (HTMLElement.prototype as any).scrollIntoView = scrollIntoViewMock;
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeightValue,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 500 });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', { configurable: true, writable: true, value: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to bottom when opening a chat with messages', () => {
    const { container } = renderChat();
    const scrollEl = container.querySelector('.overflow-y-auto') as HTMLElement;
    expect(scrollEl).toBeTruthy();
    expect(scrollEl.scrollTop).toBe(1000);
  });

  it('scrolls to bottom again when switching to another chat', () => {
    const { container, rerender } = renderChat();
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

  it('sticks to bottom when container height grows after mount', () => {
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
    expect(scrollEl.scrollTop).toBe(1000);

    // Simulate the list growing taller after first paint (async messages/reflow):
    // the ResizeObserver must re-pin us to the new bottom.
    scrollHeightValue = 2000;
    act(() => {
      lastRO?.trigger();
    });
    expect(scrollEl.scrollTop).toBe(2000);
  });

  it('does not yank down when user scrolled up (near-bottom false)', () => {
    scrollHeightValue = 1000;
    const { container } = renderChat();
    const scrollEl = container.querySelector('.overflow-y-auto') as HTMLElement;
    expect(scrollEl.scrollTop).toBe(1000);

    // User scrolls up; near-bottom becomes false.
    Object.defineProperty(scrollEl, 'scrollTop', { configurable: true, writable: true, value: 100 });
    act(() => {
      scrollEl.dispatchEvent(new Event('scroll'));
    });
    expect(scrollEl.scrollTop).toBe(100);

    // A new message arrives; should NOT auto-scroll because user is not near bottom.
    act(() => {
      renderChat({ messages: [makeMsg('m1', 'c1'), makeMsg('m2', 'c1')] });
    });
    expect(scrollEl.scrollTop).toBe(100);
  });
});
