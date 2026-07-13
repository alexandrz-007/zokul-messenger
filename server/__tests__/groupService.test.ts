import * as groupService from '../src/services/groupService';
import * as chatModel from '../src/models/Chat';

jest.mock('../src/config/db', () => {
  const mockQuery = jest.fn();
  const mockRelease = jest.fn();
  const mockClient = { query: mockQuery, release: mockRelease };
  return {
    pool: {
      connect: jest.fn().mockResolvedValue(mockClient),
      query: mockQuery,
    },
  };
});

jest.mock('../src/models/Chat');

describe('groupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a group with all participants', async () => {
    const { pool } = require('../src/config/db');
    const mockClient = await pool.connect();
    mockClient.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [{ id: 'group1', created_at: new Date().toISOString() }] })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    (chatModel.findChatById as jest.Mock).mockResolvedValue({
      id: 'group1',
      name: 'Test Group',
      isGroup: true,
      participantIds: ['creator', 'user2', 'user3'],
      participants: [],
      createdAt: new Date().toISOString(),
    });

    const chat = await groupService.createGroup('creator', 'Test Group', ['user2', 'user3']);
    expect(chat.isGroup).toBe(true);
    expect(chat.name).toBe('Test Group');
    expect(chat.participantIds).toContain('creator');
    expect(chat.participantIds).toContain('user2');
    expect(chat.participantIds).toContain('user3');
  });

  it('should not duplicate creator in participantIds', async () => {
    const { pool } = require('../src/config/db');
    const mockClient = await pool.connect();
    mockClient.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [{ id: 'group2', created_at: new Date().toISOString() }] })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    (chatModel.findChatById as jest.Mock).mockResolvedValue({
      id: 'group2',
      name: 'Group',
      isGroup: true,
      participantIds: ['creator', 'user2'],
      participants: [],
      createdAt: new Date().toISOString(),
    });

    await groupService.createGroup('creator', 'Group', ['user2', 'creator']);
    const insertCalls = mockClient.query.mock.calls.filter(
      (call: any[]) => typeof call[0] === 'string' && call[0].includes('INSERT INTO chat_participants')
    );
    const userIds = insertCalls.map((call: any[]) => call[1][1]);
    const creatorCount = userIds.filter((id: string) => id === 'creator').length;
    expect(creatorCount).toBe(1);
  });

  it('should rollback on query failure', async () => {
    const { pool } = require('../src/config/db');
    const mockClient = await pool.connect();
    mockClient.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [{ id: 'group3', created_at: new Date().toISOString() }] })
      .mockRejectedValueOnce(new Error('DB error'));

    await expect(groupService.createGroup('creator', 'Group', ['user2'])).rejects.toThrow('DB error');
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });
});
