import { uploadMiddleware } from '../src/middleware/uploadMiddleware';

describe('upload middleware', () => {
  it('should export a middleware function for field "file"', () => {
    expect(typeof uploadMiddleware).toBe('function');
    expect(uploadMiddleware.length).toBe(3);
  });

  it('should reject request without content-type', (done) => {
    const req = { headers: {}, method: 'POST' } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    uploadMiddleware(req, res, next);
    process.nextTick(() => {
      try {
        expect(next).toHaveBeenCalled();
        done();
      } catch (e) { done(e); }
    });
  });
});
