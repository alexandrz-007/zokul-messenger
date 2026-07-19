import * as messageService from '../src/services/messageService';
import * as MessageModel from '../src/models/Message';

jest.mock('../src/models/Message');

describe('messageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a text message', async () => {
    const msg = { id: 'm1', chatId: 'c1', senderId: 'u1', text: 'Hello', createdAt: '' };
    (MessageModel.create as jest.Mock).mockResolvedValue(msg);

    const result = await messageService.createMessage('c1', 'u1', 'Hello');
    expect(result.text).toBe('Hello');
  });

  it('should throw on empty message', async () => {
    await expect(messageService.createMessage('c1', 'u1'))
      .rejects.toThrow('Message must have text, image, or voice');
  });

  it('should get messages with pagination', async () => {
    (MessageModel.findByChatId as jest.Mock).mockResolvedValue([]);
    const result = await messageService.getMessages('c1', 0, 50);
    expect(MessageModel.findByChatId).toHaveBeenCalledWith('c1', 0, 50);
    expect(result).toEqual([]);
  });

  describe('read receipts', () => {
    it('markChatRead delegates to model and returns marked ids', async () => {
      (MessageModel.markChatRead as jest.Mock).mockResolvedValue(['m1', 'm2']);
      const ids = await messageService.markChatRead('c1', 'u2');
      expect(MessageModel.markChatRead).toHaveBeenCalledWith('c1', 'u2');
      expect(ids).toEqual(['m1', 'm2']);
    });

    it('getReadReceipts delegates to model', async () => {
      const receipts = [
        { messageId: 'm1', userId: 'u3', readAt: '2026-07-19T00:00:00Z' },
      ];
      (MessageModel.getReadReceipts as jest.Mock).mockResolvedValue(receipts);
      const result = await messageService.getReadReceipts(['m1'], 'u1');
      expect(MessageModel.getReadReceipts).toHaveBeenCalledWith(['m1'], 'u1');
      expect(result).toEqual(receipts);
    });

    it('markChatRead returns empty array when user is not a participant', async () => {
      (MessageModel.markChatRead as jest.Mock).mockResolvedValue([]);
      const ids = await messageService.markChatRead('c1', 'u9');
      expect(ids).toEqual([]);
    });
  });
});

