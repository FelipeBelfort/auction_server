export interface Bid {
  userID: number;
  amount: number;
}

export type BidMap = Map<number, Bid[]>;

export interface Session {
  userID: number;
  expiresAt: number;
}

export type SessionMap = Map<string, Session>;
