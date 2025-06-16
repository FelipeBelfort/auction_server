import { Request, Response } from 'express';
import { AuctionService } from '../services/auction.service';
import { SessionService } from '../services/session.service';

const auctionService = new AuctionService();
const sessionService = new SessionService();

export const login = (req: Request, res: Response) => {
  const userID = parseInt(req.params.userID);
  if (isNaN(userID)) return res.status(400).send('Invalid userID');
  const sessionKey = sessionService.login(userID);
  res.send(sessionKey);
};

export const postBid = (req: Request, res: Response) => {
  const itemID = parseInt(req.params.itemID);
  const sessionKey = req.query.sessionKey as string;
  const bidAmount = parseFloat(req.body);

  if (!sessionKey) return res.status(400).send('Missing sessionKey');
  const userID = sessionService.validate(sessionKey);
  if (!userID) return res.status(403).send('Invalid sessionKey');
  if (isNaN(itemID) || isNaN(bidAmount)) return res.status(400).send('Invalid bid');

  auctionService.postBid(itemID, { userID, amount: bidAmount });
  res.status(200).end();
};

export const getTopBids = (req: Request, res: Response) => {
  const itemID = parseInt(req.params.itemID);
  if (isNaN(itemID)) return res.status(400).send('Invalid itemID');
  const bids = auctionService.getTopBids(itemID);
  res.json(bids);
};
