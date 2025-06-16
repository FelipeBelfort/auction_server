import { BidMap, Bid } from '../types';

export class AuctionService {
  private bids: BidMap = new Map();

  postBid(itemID: number, bid: Bid) {
    const itemBids = this.bids.get(itemID) || [];

    const existing = itemBids.find(b => b.userID === bid.userID);
    if (existing) {
      if (bid.amount > existing.amount) {
        existing.amount = bid.amount;
      }
    } else {
      itemBids.push(bid);
    }

    const sorted = itemBids.sort((a, b) => b.amount - a.amount).slice(0, 15);
    this.bids.set(itemID, sorted);
  }

  getTopBids(itemID: number): { [userID: string]: string }[] {
    const itemBids = this.bids.get(itemID) || [];
    return itemBids.map(b => ({ [b.userID]: b.amount.toString() }));
  }
}
