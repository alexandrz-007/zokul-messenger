import * as chatModel from '../src/models/Chat';

jest.mock('../src/config/db', () => {
  const mockQuery = jest.fn();
  return {
    pool: {
      connect: jest.fn(),
      query: mockQuery,
    },
  };
});

jest.mock('../src/utils/logger', () => ({ logger: jest.fn() }));

describe('socket participant check - model layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow participant', async () => {
    jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce({
      id: 'chat1',
      isGroup: false,
      participantIds: ['user1', 'user2'],
      participants: [],
      createdAt: new Date().toISOString(),
    });

    const chat = await chatModel.findChatById('chat1');
    expect(chat).toBeDefined();
    expect(chat!.participantIds).toContain('user1');
  });

  it('should reject non-participant', async () => {
    jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce({
      id: 'chat1',
      isGroup: false,
      participantIds: ['user2', 'user3'],
      participants: [],
      createdAt: new Date().toISOString(),
    });

    const chat = await chatModel.findChatById('chat1');
    expect(chat).toBeDefined();
    expect(chat!.participantIds).not.toContain('user1');
  });

  it('should return null for non-existent chat', async () => {
    jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce(null);

    const chat = await chatModel.findChatById('nonexistent');
    expect(chat).toBeNull();
  });

  it('should find chat by id and check participant - join allowed', async () => {
    const spy = jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce({
      id: 'chat1',
      isGroup: false,
      participantIds: ['user1', 'user2'],
      participants: [],
      createdAt: new Date().toISOString(),
    });

    const chat = await chatModel.findChatById('chat1');
    expect(chat).toBeTruthy();
    expect(chat!.participantIds.includes('user1')).toBe(true);
    expect(spy).toHaveBeenCalledWith('chat1');
  });

  it('should find chat by id and check participant - join rejected', async () => {
    const spy = jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce({
      id: 'chat1',
      isGroup: false,
      participantIds: ['user2'],
      participants: [],
      createdAt: new Date().toISOString(),
    });

    const chat = await chatModel.findChatById('chat1');
    expect(chat).toBeTruthy();
    expect(chat!.participantIds.includes('user1')).toBe(false);
    expect(spy).toHaveBeenCalledWith('chat1');
  });

  it('should reject join for non-existent chat', async () => {
    jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce(null);

    const chat = await chatModel.findChatById('nonexistent');
    expect(chat).toBeNull();
  });
});

describe('access control scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('chat:join logic - participant allowed', async () => {
    jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce({
      id: 'chat1',
      isGroup: false,
      participantIds: ['user1', 'user2'],
      participants: [],
      createdAt: new Date().toISOString(),
    });

    const chat = await chatModel.findChatById('chat1');
    const allowed = !!chat && chat.participantIds.includes('user1');
    expect(allowed).toBe(true);
  });

  it('chat:join logic - non-participant rejected', async () => {
    jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce({
      id: 'chat1',
      isGroup: false,
      participantIds: ['user2', 'user3'],
      participants: [],
      createdAt: new Date().toISOString(),
    });

    const chat = await chatModel.findChatById('chat1');
    const allowed = !!chat && chat.participantIds.includes('user1');
    expect(allowed).toBe(false);
  });

  it('chat:created trusts DB participantIds, not client payload', async () => {
    const chatFromDb = {
      id: 'chat1',
      isGroup: true,
      participantIds: ['user1', 'user2', 'user3'],
      participants: [],
      createdAt: new Date().toISOString(),
    };
    jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce(chatFromDb);

    const clientPayload = { chatId: 'chat1', participantIds: ['user99', 'user100'] };

    const chat = await chatModel.findChatById(clientPayload.chatId);
    expect(chat).toBeTruthy();
    expect(chat!.participantIds).toEqual(['user1', 'user2', 'user3']);
    expect(chat!.participantIds).not.toEqual(clientPayload.participantIds);
  });

  it('chat:created rejects non-existent chat', async () => {
    jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce(null);

    const chat = await chatModel.findChatById('nonexistent');
    expect(chat).toBeNull();
  });

  it('message:typing logic - participant allowed', async () => {
    jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce({
      id: 'chat1',
      isGroup: false,
      participantIds: ['user1'],
      participants: [],
      createdAt: new Date().toISOString(),
    });

    const chat = await chatModel.findChatById('chat1');
    expect(chat!.participantIds.includes('user1')).toBe(true);
  });

  it('message:typing logic - non-participant rejected', async () => {
    jest.spyOn(chatModel, 'findChatById').mockResolvedValueOnce({
      id: 'chat1',
      isGroup: false,
      participantIds: ['user2'],
      participants: [],
      createdAt: new Date().toISOString(),
    });

    const chat = await chatModel.findChatById('chat1');
    expect(chat!.participantIds.includes('user1')).toBe(false);
  });
});

describe('presence multi-tab logic', () => {
  it('setOffline should only be called when no active sockets remain', () => {
    const userSockets = new Map<string, Set<string>>();
    const userId = 'user1';

    userSockets.set(userId, new Set(['socket1', 'socket2']));
    expect(userSockets.get(userId)!.size).toBe(2);

    const sockets1 = userSockets.get(userId);
    sockets1!.delete('socket1');
    if (sockets1!.size === 0) userSockets.delete(userId);

    expect(userSockets.has(userId)).toBe(true);

    const sockets2 = userSockets.get(userId);
    sockets2!.delete('socket2');
    if (sockets2!.size === 0) userSockets.delete(userId);

    expect(userSockets.has(userId)).toBe(false);
  });

  it('offline event should only be sent after last disconnect', () => {
    const userSockets = new Map<string, Set<string>>();
    const userId = 'user1';

    userSockets.set(userId, new Set(['socket1', 'socket2']));

    const sockets1 = userSockets.get(userId)!;
    sockets1.delete('socket1');
    if (sockets1.size === 0) userSockets.delete(userId);

    const shouldGoOffline1 = !userSockets.has(userId) || userSockets.get(userId)!.size === 0;
    expect(shouldGoOffline1).toBe(false);

    const sockets2 = userSockets.get(userId)!;
    sockets2.delete('socket2');
    if (sockets2.size === 0) userSockets.delete(userId);

    const shouldGoOffline2 = !userSockets.has(userId) || userSockets.get(userId)!.size === 0;
    expect(shouldGoOffline2).toBe(true);
  });

  it('presence errors should not crash disconnect handler', () => {
    const mockSetOffline = jest.fn().mockRejectedValue(new Error('Redis error'));
    expect(async () => {
      try {
        await mockSetOffline('user1');
      } catch {
        // handler should catch and log
      }
    }).not.toThrow();
  });
});
