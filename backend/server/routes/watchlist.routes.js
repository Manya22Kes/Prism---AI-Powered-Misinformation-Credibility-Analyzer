import express from 'express';
import {
  getWatchlistItems,
  getWatchlistItemById,
  createWatchlistItem,
  updateWatchlistItem,
  deleteWatchlistItem,
  checkWatchlistItem
} from '../controllers/watchlist.controller.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const router = express.Router();

router.get('/', getWatchlistItems);
router.get('/:id', validateObjectId, getWatchlistItemById);
router.post('/', createWatchlistItem);
router.put('/:id', validateObjectId, updateWatchlistItem);
router.delete('/:id', validateObjectId, deleteWatchlistItem);
router.post('/:id/check', validateObjectId, checkWatchlistItem);

export default router;
