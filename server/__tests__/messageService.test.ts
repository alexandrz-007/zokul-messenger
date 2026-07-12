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
});
