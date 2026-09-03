import express from 'express';
import {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addReportToCollection,
  removeReportFromCollection
} from '../controllers/collection.controller.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const router = express.Router();

router.get('/', getCollections);
router.get('/:id', validateObjectId, getCollectionById);
router.post('/', createCollection);
router.put('/:id', validateObjectId, updateCollection);
router.delete('/:id', validateObjectId, deleteCollection);

router.post('/:id/reports/:reportId', validateObjectId, addReportToCollection);
router.delete('/:id/reports/:reportId', validateObjectId, removeReportFromCollection);

export default router;
