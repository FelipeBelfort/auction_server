import { MAX_BID_QUANTITY } from "../constants";
import { Bid } from "../types";

export class BidService {
  private topBids: Bid[] = [];
  private bidsMin = 0;
  private bidsLen = 0;

  pushBid(bid: Bid) {
    switch (this.bidsLen) {
      case 0:
        this.bidsMin = bid.amount;
        this.topBids.push(bid);
        this.bidsLen++;
        break;

      case MAX_BID_QUANTITY:
        if (bid.amount > this.bidsMin) {
          const existingIndex = this.topBids.findIndex(b => b.userID === bid.userID);
          if (existingIndex !== -1) {
            if (bid.amount > this.topBids[existingIndex].amount) {
             this.moveToCorrectPosition(existingIndex, bid);
            }
          } else {
            this.topBids.pop();
            this.putInCorrectPosition(MAX_BID_QUANTITY - 2, bid);
          }
          this.bidsMin = this.topBids[MAX_BID_QUANTITY - 1].amount;
        }
        break;
    
      default:
        const existingIndex = this.topBids.findIndex(b => b.userID === bid.userID);
        if (existingIndex !== -1) {
          if (bid.amount > this.topBids[existingIndex].amount) {
            this.topBids[existingIndex].amount = bid.amount;
            this.moveToCorrectPosition(existingIndex, bid);
          }
        } else {
          if (bid.amount <= this.bidsMin) {
            this.bidsMin = bid.amount;
            this.topBids.push(bid);
          } else {
            this.putInCorrectPosition(this.bidsLen - 2, bid);
          }
          this.bidsLen++;
        }
        break;
    }
  }

  private putInCorrectPosition(index: number, bid: Bid) {
    while (index >= 0) {
      if (this.topBids[index] && bid.amount <= this.topBids[index].amount) {
        break;
      }
      index--;
    }
    if (index === -1) {
      this.topBids.unshift(bid);
    } else {
      this.topBids.splice(index + 1, 0, bid);
    }

  }

  private moveToCorrectPosition(index: number, bid: Bid) {
    if (index !== 0 && this.topBids[index - 1].amount < bid.amount) {
      this.topBids.splice(index, 1);
      this.putInCorrectPosition(index - 1, bid);
    }
  }

  getTopBids(): Bid[] {
    return [...this.topBids];
  }

}