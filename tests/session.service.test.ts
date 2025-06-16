import { SessionService } from '../src/services/session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    service = new SessionService();
  });

  it('should return a session key when logging in', () => {
    const key = service.login(1234);
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(0);
  });

  it('should validate a valid session key', () => {
    const key = service.login(1234);
    const userID = service.validate(key);
    expect(userID).toBe(1234);
  });

  it('should invalidate expired sessions', () => {
    const key = service.login(1234);
    service['sessions'].get(key)!.expiresAt = Date.now() - 1000;

    const result = service.validate(key);
    expect(result).toBeNull();
  });

  it('should return null for unknown session key', () => {
    expect(service.validate('invalid')).toBeNull();
  });
});
