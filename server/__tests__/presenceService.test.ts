import * as presenceService from '../src/services/presenceService';

const mockScan = jest.fn();
const mockSet = jest.fn();
const mockDel = jest.fn();
const mockGet = jest.fn();
const mockMget = jest.fn();
const mockQuit = jest.fn();

jest.mock('../src/config/redis', () => ({
  getRedis: () => ({
    scan: mockScan,
    set: mockSet,
    del: mockDel,
    get: mockGet,
    mget: mockMget,
    quit: mockQuit,
  }),
}));

describe('presenceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOnlineUserIds', () => {
    it('should return all online user IDs using SCAN', async () => {
      mockScan
        .mockResolvedValueOnce(['0', ['online:user1', 'online:user2']]);

      const ids = await presenceService.getAllOnlineUserIds();
      expect(ids).toEqual(['user1', 'user2']);
      expect(mockScan).toHaveBeenCalledWith('0', 'MATCH', 'online:*', 'COUNT', 100);
    });

    it('should handle paginated SCAN results', async () => {
      mockScan
        .mockResolvedValueOnce(['5', ['online:user1']])
        .mockResolvedValueOnce(['0', ['online:user2', 'online:user3']]);

      const ids = await presenceService.getAllOnlineUserIds();
      expect(ids).toEqual(['user1', 'user2', 'user3']);
      expect(mockScan).toHaveBeenCalledTimes(2);
    });

    it('should return empty array when no users online', async () => {
      mockScan
        .mockResolvedValueOnce(['0', []]);

      const ids = await presenceService.getAllOnlineUserIds();
      expect(ids).toEqual([]);
    });
  });

  describe('setOnline', () => {
    it('should set user online with TTL', async () => {
      mockSet.mockResolvedValueOnce('OK');
      await presenceService.setOnline('user1');
      expect(mockSet).toHaveBeenCalledWith('online:user1', 'true', 'EX', 30);
    });
  });

  describe('setOffline', () => {
    it('should remove user from online', async () => {
      mockDel.mockResolvedValueOnce(1);
      await presenceService.setOffline('user1');
      expect(mockDel).toHaveBeenCalledWith('online:user1');
    });
  });

  describe('isOnline', () => {
    it('should return true if user is online', async () => {
      mockGet.mockResolvedValueOnce('true');
      const result = await presenceService.isOnline('user1');
      expect(result).toBe(true);
    });

    it('should return false if user is offline', async () => {
      mockGet.mockResolvedValueOnce(null);
      const result = await presenceService.isOnline('user1');
      expect(result).toBe(false);
    });
  });

  describe('getOnlineUsers', () => {
    it('should return map of online statuses', async () => {
      mockMget.mockResolvedValueOnce(['true', null, 'true']);
      const map = await presenceService.getOnlineUsers(['user1', 'user2', 'user3']);
      expect(map.get('user1')).toBe(true);
      expect(map.get('user2')).toBe(false);
      expect(map.get('user3')).toBe(true);
    });
  });
});
