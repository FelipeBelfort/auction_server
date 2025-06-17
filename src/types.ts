import { BidService } from "./services/bids.service";

export interface Bid {
  userID: number;
  amount: number;
}

export type BidMap = Map<number, BidService>;

export interface Session {
  userID: number;
  expiresAt: number;
}

export type SessionMap = Map<string, Session>;
