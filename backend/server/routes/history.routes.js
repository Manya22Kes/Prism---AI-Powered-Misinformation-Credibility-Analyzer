import express from 'express';
import { getHistory, getReportById, getBatchReportById, togglePinStatus, deleteReport } from '../controllers/history.controller.js';

const router = express.Router();

router.get('/', getHistory);
router.get('/report/:id', getReportById);
router.get('/batch/:id', getBatchReportById);

router.patch('/:id/pin', togglePinStatus);
router.delete('/:id', deleteReport);

export default router;
