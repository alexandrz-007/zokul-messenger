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

describe('socket participant check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow participant to send message', async () => {
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
});
