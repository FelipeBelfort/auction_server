import { SessionService } from '../src/services/session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    service = new SessionService();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
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

  describe('Session replacement', () => {
    it('should replace existing session when user logs in again', () => {
      const firstKey = service.login(1234);
      const secondKey = service.login(1234);
      
      expect(firstKey).not.toBe(secondKey);
      expect(service.validate(firstKey)).toBeNull();
      expect(service.validate(secondKey)).toBe(1234);
    });

    it('should clean up old session data when user logs in again', () => {
      const firstKey = service.login(1234);
      service.login(1234);
      
      expect(service['sessions'].has(firstKey)).toBe(false);
      expect(service['sessions'].size).toBe(1);
    });
  });

  describe('Multiple users', () => {
    it('should handle multiple users simultaneously', () => {
      const key1 = service.login(1001);
      const key2 = service.login(1002);
      const key3 = service.login(1003);
      
      expect(service.validate(key1)).toBe(1001);
      expect(service.validate(key2)).toBe(1002);
      expect(service.validate(key3)).toBe(1003);
    });

    it('should maintain separate sessions for different users', () => {
      const key1 = service.login(1001);
      const key2 = service.login(1002);
      
      service['sessions'].get(key1)!.expiresAt = Date.now() - 1000;
      
      expect(service.validate(key1)).toBeNull();
      expect(service.validate(key2)).toBe(1002);
    });
  });

  describe('Key generation', () => {
    it('should generate unique keys for the same user across different logins', () => {
      const keys = new Set();
      for (let i = 0; i < 100; i++) {
        const key = service.login(1234);
        expect(keys.has(key)).toBe(false);
        keys.add(key);
      }
    });

    it('should generate different keys for different users', () => {
      const key1 = service.login(1001);
      const key2 = service.login(1002);
      
      expect(key1).not.toBe(key2);
    });

  });

  describe('Edge cases', () => {
    it('should handle userID of 0', () => {
      const key = service.login(0);
      expect(service.validate(key)).toBe(0);
    });

    it('should handle large userIDs', () => {
      const largeID = Number.MAX_SAFE_INTEGER;
      const key = service.login(largeID);
      expect(service.validate(key)).toBe(largeID);
    });

    it('should handle empty string as session key', () => {
      expect(service.validate('')).toBeNull();
    });

    it('should handle whitespace session key', () => {
      expect(service.validate('   ')).toBeNull();
    });
  });

  describe('Session expiration', () => {
    it('should create sessions that expire in the future', () => {
      const key = service.login(1234);
      const session = service['sessions'].get(key);
      
      expect(session!.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should not validate sessions that just expired', () => {
      const key = service.login(1234);
      const session = service['sessions'].get(key)!;
      
      session.expiresAt = Date.now();
      
      jest.advanceTimersByTime(1);
      expect(service.validate(key)).toBeNull();
    });

    it('should validate sessions that expire in exactly 1ms', () => {
      const key = service.login(1234);
      const session = service['sessions'].get(key)!;
      
      session.expiresAt = Date.now() + 1;
      
      expect(service.validate(key)).toBe(1234);
    });
  });

  describe('Cleanup functionality', () => {
    beforeEach(() => {
      jest.doMock('../src/constants', () => ({
        CLEANUP_INTERVAL: 1000,
        SESSION_TIMEOUT: 5000
      }));
      
      service['lastCleanup'] = 0;
    });

    it('should remove expired sessions during cleanup', () => {
      const key1 = service.login(1001);
      const key2 = service.login(1002);
      
      service['sessions'].get(key1)!.expiresAt = Date.now() - 1000;
      
      service['cleanupExpired']();
      
      expect(service['sessions'].has(key1)).toBe(false);
      expect(service['sessions'].has(key2)).toBe(true);
      expect(service['userSessions'].has(1001)).toBe(false);
      expect(service['userSessions'].has(1002)).toBe(true);
    });

    it('should handle cleanup with no expired sessions', () => {
      const key1 = service.login(1001);
      const key2 = service.login(1002);
      
      const initialSessionCount = service['sessions'].size;
      service['cleanupExpired']();
      
      expect(service['sessions'].size).toBe(initialSessionCount);
      expect(service.validate(key1)).toBe(1001);
      expect(service.validate(key2)).toBe(1002);
    });
  });

  describe('Memory management', () => {
    it('should not leak memory when sessions are replaced', () => {
      const userID = 1234;
      
      for (let i = 0; i < 10; i++) {
        service.login(userID);
      }
      
      expect(service['sessions'].size).toBe(1);
      expect(service['userSessions'].size).toBe(1);
    });

    it('should clean up both sessions and userSessions maps', () => {
      const key = service.login(1234);
      service['sessions'].get(key)!.expiresAt = Date.now() - 1000;
      
      service['cleanupExpired']();
      
      expect(service['sessions'].size).toBe(0);
      expect(service['userSessions'].size).toBe(0);
    });
  });

  describe('Concurrency simulation', () => {
    it('should handle rapid sequential logins for same user', () => {
      const userID = 1234;
      let lastKey: string;
      
      for (let i = 0; i < 5; i++) {
        lastKey = service.login(userID);
      }
      
      expect(service.validate(lastKey!)).toBe(userID);
      expect(service['sessions'].size).toBe(1);
    });

    it('should handle validation of expired session during cleanup', () => {
      const key = service.login(1234);
      
      service['sessions'].get(key)!.expiresAt = Date.now() - 1000;
      
      const result = service.validate(key);
      
      expect(result).toBeNull();
    });
  });
});