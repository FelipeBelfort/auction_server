import { CLEANUP_INTERVAL, SESSION_TIMEOUT } from '../constants';
import { SessionMap } from '../types';

export class SessionService {
  private sessions: SessionMap = new Map();
  private userSessions: Map<number, string> = new Map();
  private lastCleanup = 0;

  login(userID: number): string {
    this.maybeCleanup();

    const existingKey = this.userSessions.get(userID);
    if (existingKey) {
      this.sessions.delete(existingKey);
      this.userSessions.delete(userID);
    }
    
    const key = this.generateKey(userID);
    const expiresAt = Date.now() + SESSION_TIMEOUT;
    
    this.sessions.set(key, { userID, expiresAt });
    this.userSessions.set(userID, key);

    return key;
  }

  validate(key: string): number | null {
    const session = this.sessions.get(key);
    if (session && session.expiresAt > Date.now()) {
      return session.userID;
    }
    this.maybeCleanup();
    return null;
  }

  private generateKey(userID: number): string {
    return `${userID}${Math.random().toString(36).substring(2)}`;
  }

  private maybeCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup > CLEANUP_INTERVAL) {
      this.lastCleanup = now;
      setTimeout(() => this.cleanupExpired(), 1);
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, session] of this.sessions) {
      if (session.expiresAt < now) {
        this.sessions.delete(key);
        this.userSessions.delete(session.userID);
      }
    }
  }
}
