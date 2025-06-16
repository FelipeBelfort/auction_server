import crypto from 'crypto';
import { Session, SessionMap } from '../types';

export class SessionService {
  private sessions: SessionMap = new Map();

  login(userID: number): string {
    const key = crypto.randomBytes(8).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000;
    this.sessions.set(key, { userID, expiresAt });
    return key;
  }

  validate(key: string): number | null {
    const session = this.sessions.get(key);
    if (session && session.expiresAt > Date.now()) {
      return session.userID;
    }
    return null;
  }
}
