import * as chatService from '../src/services/chatService';
import * as ChatModel from '../src/models/Chat';

jest.mock('../src/models/Chat');

describe('chatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a chat', async () => {
    (ChatModel.findExistingChat as jest.Mock).mockResolvedValue(null);
    (ChatModel.createChat as jest.Mock).mockResolvedValue({
      id: 'chat1',
      participantIds: ['user1', 'user2'],
      createdAt: new Date().toISOString(),
    });

    const chat = await chatService.createChat('user1', 'user2');
    expect(chat.participantIds).toContain('user1');
    expect(chat.participantIds).toContain('user2');
  });

  it('should return existing chat instead of creating duplicate', async () => {
    const existing = { id: 'chat1', participantIds: ['user1', 'user2'], createdAt: '' };
    (ChatModel.findExistingChat as jest.Mock).mockResolvedValue(existing);

    const chat = await chatService.createChat('user1', 'user2');
    expect(chat).toEqual(existing);
    expect(ChatModel.createChat).not.toHaveBeenCalled();
  });

  it('should throw when creating chat with self', async () => {
    await expect(chatService.createChat('user1', 'user1'))
      .rejects.toThrow('Cannot create chat with yourself');
  });
});
