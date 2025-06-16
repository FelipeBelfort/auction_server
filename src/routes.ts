import { Router } from 'express';
import { login, postBid, getTopBids } from './controllers/auction.controller';

const router = Router();

router.get('/:userID/login', login);
router.post('/:itemID/bid', postBid);
router.get('/:itemID/topBidList', getTopBids);

export default router;
