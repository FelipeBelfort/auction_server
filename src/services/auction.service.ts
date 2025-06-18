import { BidMap, Bid } from '../types';
import { BidService } from './bids.service';

export class AuctionService {
  private bids: BidMap = new Map();

  postBid(itemID: number, bid: Bid) {
    let itemBids = this.bids.get(itemID);

    if (!itemBids) {
      itemBids = new BidService();
      this.bids.set(itemID, itemBids);
    }
    itemBids.pushBid(bid);
  }

  getTopBids(itemID: number): { [userID: string]: string }[] | string {
    const itemBids = this.bids.get(itemID);
    if (itemBids) {
      return itemBids.getTopBids().map(b => ({ [b.userID]: b.amount.toString() }));
    }
    return "";
  }
}
