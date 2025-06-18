import { AuctionService } from '../src/services/auction.service';

describe('AuctionService', () => {
  let service: AuctionService;

  beforeEach(() => {
    service = new AuctionService();
  });

  it('should store and retrieve a single bid', () => {
    service.postBid(1, { userID: 123, amount: 50.0 });
    const top = service.getTopBids(1);
    expect(top).toEqual([{ '123': '50' }]);
  });

  it('should only keep highest bid per user', () => {
    service.postBid(1, { userID: 1, amount: 10 });
    service.postBid(1, { userID: 1, amount: 20 });
    service.postBid(1, { userID: 1, amount: 15 });
    const top = service.getTopBids(1);
    expect(top).toEqual([{ '1': '20' }]);
  });

  it('should limit to 15 top bids', () => {
    for (let i = 1; i <= 20; i++) {
      service.postBid(1, { userID: i, amount: i });
    }

    const top = service.getTopBids(1);
    expect(top.length).toBe(15);
    expect(top[0]).toEqual({ '20': '20' });
    expect(top[14]).toEqual({ '6': '6' });
  });

  it('should return empty list for item with no bids', () => {
    expect(service.getTopBids(99)).toEqual("");
  });
});
