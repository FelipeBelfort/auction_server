import { BidService } from '../src/services/bids.service';

describe('BidService', () => {
  let service: BidService;

  beforeEach(() => {
    service = new BidService();
  });

  describe('Basic functionality', () => {
    it('should store and retrieve a single bid', () => {
      service.pushBid({ userID: 123, amount: 50.0 });
      const top = service.getTopBids();
      expect(top).toEqual([{ userID: 123, amount: 50.0 }]);
    });

    it('should return empty array when no bids', () => {
      expect(service.getTopBids()).toEqual([]);
    });
  });

  describe('User bid updates', () => {
    it('should only keep highest bid per user', () => {
      service.pushBid({ userID: 1, amount: 10 });
      service.pushBid({ userID: 1, amount: 20 });
      service.pushBid({ userID: 1, amount: 15 });
      
      const top = service.getTopBids();
      expect(top).toEqual([{ userID: 1, amount: 20 }]);
    });

    it('should handle user at index 0 correctly', () => {
      service.pushBid({ userID: 1, amount: 100 });
      service.pushBid({ userID: 2, amount: 90 });
      service.pushBid({ userID: 1, amount: 110 });
      
      const top = service.getTopBids();
      expect(top[0]).toEqual({ userID: 1, amount: 110 });
      expect(top[1]).toEqual({ userID: 2, amount: 90 });
    });

    it('should handle multiple updates for same user', () => {
      service.pushBid({ userID: 1, amount: 10 });
      service.pushBid({ userID: 1, amount: 20 });
      service.pushBid({ userID: 1, amount: 30 });
      service.pushBid({ userID: 1, amount: 25 });
      service.pushBid({ userID: 1, amount: 40 });
      
      const top = service.getTopBids();
      expect(top).toEqual([{ userID: 1, amount: 40 }]);
      expect(top.length).toBe(1);
    });
  });

  describe('Sorting and order', () => {
    it('should maintain descending order by amount', () => {
      service.pushBid({ userID: 1, amount: 10 });
      service.pushBid({ userID: 2, amount: 30 });
      service.pushBid({ userID: 3, amount: 20 });
      service.pushBid({ userID: 4, amount: 40 });
      service.pushBid({ userID: 5, amount: 25 });
      
      const top = service.getTopBids();
      const amounts = top.map(bid => bid.amount);
      expect(amounts).toEqual([40, 30, 25, 20, 10]);
    });

    it('should maintain order when updating existing bids', () => {
      service.pushBid({ userID: 1, amount: 10 });
      service.pushBid({ userID: 2, amount: 20 });
      service.pushBid({ userID: 3, amount: 30 });
      
      service.pushBid({ userID: 2, amount: 35 });
      
      const top = service.getTopBids();
      expect(top.map(b => b.amount)).toEqual([35, 30, 10]);
      expect(top.map(b => b.userID)).toEqual([2, 3, 1]);
    });
  });

  describe('15-bid limit', () => {
    beforeEach(() => {
      for (let i = 1; i <= 15; i++) {
        service.pushBid({ userID: i, amount: i });
      }
    });

    it('should limit to 15 bids', () => {
      const top = service.getTopBids();
      expect(top.length).toBe(15);
      expect(top[0].amount).toBe(15);
      expect(top[14].amount).toBe(1);
    });

    it('should reject bids lower than minimum when at capacity', () => {
      service.pushBid({ userID: 99, amount: 0.5 });
      
      const top = service.getTopBids();
      expect(top.length).toBe(15);
      expect(top.find(b => b.userID === 99)).toBeUndefined();
    });

    it('should accept bids higher than minimum when at capacity', () => {
      service.pushBid({ userID: 99, amount: 1.5 });
      
      const top = service.getTopBids();
      expect(top.length).toBe(15);
      expect(top.find(b => b.userID === 99)).toBeDefined();
      expect(top.find(b => b.userID === 1)).toBeUndefined();
    });

    it('should update existing user when at capacity', () => {
      service.pushBid({ userID: 5, amount: 20 });
      
      const top = service.getTopBids();
      expect(top.length).toBe(15);
      expect(top[0]).toEqual({ userID: 5, amount: 20 });
      
      const user5Bids = top.filter(b => b.userID === 5);
      expect(user5Bids.length).toBe(1);
    });

    it('should handle capacity edge case with new high bid', () => {
      service.pushBid({ userID: 100, amount: 100 });
      
      const top = service.getTopBids();
      expect(top.length).toBe(15);
      expect(top[0]).toEqual({ userID: 100, amount: 100 });
      expect(top[14].amount).toBe(2);
    });
  });

  describe('Edge cases and stress tests', () => {
    it('should handle zero amounts', () => {
      service.pushBid({ userID: 1, amount: 0 });
      service.pushBid({ userID: 2, amount: 10 });
      
      const top = service.getTopBids();
      expect(top).toEqual([
        { userID: 2, amount: 10 },
        { userID: 1, amount: 0 }
      ]);
    });

    it('should handle negative amounts', () => {
      service.pushBid({ userID: 1, amount: -10 });
      service.pushBid({ userID: 2, amount: 5 });
      
      const top = service.getTopBids();
      expect(top).toEqual([
        { userID: 2, amount: 5 },
        { userID: 1, amount: -10 }
      ]);
    });

    it('should handle identical amounts', () => {
      service.pushBid({ userID: 1, amount: 10 });
      service.pushBid({ userID: 2, amount: 10 });
      service.pushBid({ userID: 3, amount: 10 });
      
      const top = service.getTopBids();
      expect(top.length).toBe(3);
      expect(top.every(bid => bid.amount === 10)).toBe(true);
    });

    it('should handle large user IDs', () => {
      service.pushBid({ userID: 999999999, amount: 100 });
      service.pushBid({ userID: 1000000000, amount: 200 });
      
      const top = service.getTopBids();
      expect(top[0]).toEqual({ userID: 1000000000, amount: 200 });
      expect(top[1]).toEqual({ userID: 999999999, amount: 100 });
    });

    it('should handle rapid successive updates', () => {
      for (let i = 1; i <= 100; i++) {
        service.pushBid({ userID: 1, amount: i });
      }
      
      const top = service.getTopBids();
      expect(top).toEqual([{ userID: 1, amount: 100 }]);
      expect(top.length).toBe(1);
    });

    it('should handle alternating high/low bids', () => {
      const bids = [
        { userID: 1, amount: 100 },
        { userID: 2, amount: 1 },
        { userID: 3, amount: 99 },
        { userID: 4, amount: 2 },
        { userID: 5, amount: 98 }
      ];
      
      bids.forEach(bid => service.pushBid(bid));
      
      const top = service.getTopBids();
      const amounts = top.map(b => b.amount);
      expect(amounts).toEqual([100, 99, 98, 2, 1]);
    });
  });

  describe('Data integrity', () => {
    it('should not mutate returned array', () => {
      service.pushBid({ userID: 1, amount: 100 });
      const top1 = service.getTopBids();
      const top2 = service.getTopBids();
      
      top1.push({ userID: 999, amount: 999 });
      
      expect(top2.length).toBe(1);
      expect(top2[0]).toEqual({ userID: 1, amount: 100 });
    });

    it('should maintain consistency after many operations', () => {
      for (let i = 1; i <= 20; i++) {
        service.pushBid({ userID: i, amount: i * 10 });
      }
      
      service.pushBid({ userID: 5, amount: 300 });
      service.pushBid({ userID: 10, amount: 350 });
      service.pushBid({ userID: 1, amount: 400 });
      
      const top = service.getTopBids();
      
      expect(top.length).toBe(15);
      
      for (let i = 0; i < top.length - 1; i++) {
        expect(top[i].amount).toBeGreaterThanOrEqual(top[i + 1].amount);
      }
      
      const userIds = top.map(b => b.userID);
      const uniqueUserIds = [...new Set(userIds)];
      expect(userIds.length).toBe(uniqueUserIds.length);
      
      expect(top.find(b => b.userID === 1)?.amount).toBe(400);
      expect(top.find(b => b.userID === 10)?.amount).toBe(350);
      expect(top.find(b => b.userID === 5)?.amount).toBe(300);
    });
  });

  describe('Performance indicators', () => {
    it('should handle large number of operations', () => {
      const start = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        service.pushBid({ userID: i % 100, amount: Math.random() * 1000 });
      }
      
      const end = Date.now();
      const top = service.getTopBids();
      
      expect(end - start).toBeLessThan(1000);
      expect(top.length).toBeLessThanOrEqual(15);
    });
  });
});