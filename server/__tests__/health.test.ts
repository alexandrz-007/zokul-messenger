import { pool } from '../src/config/db';

jest.mock('../src/config/db', () => ({
  pool: { query: jest.fn() },
}));

describe('health endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return ok when DB is connected', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    const { resetStartTime } = require('../src/routes/healthRoutes');
    resetStartTime();

    const router = require('../src/routes/healthRoutes').default;
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const handler = router.stack[0].route.stack[0].handle;
    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ok', db: 'connected' })
    );
  });

  it('should return error when DB is disconnected', async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error('DB down'));

    const { resetStartTime } = require('../src/routes/healthRoutes');
    resetStartTime();

    const router = require('../src/routes/healthRoutes').default;
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const handler = router.stack[0].route.stack[0].handle;
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', db: 'disconnected' })
    );
  });
});
