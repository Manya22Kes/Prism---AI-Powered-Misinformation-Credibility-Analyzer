import express from 'express';
import { getHistory, getReportById, getBatchReportById, togglePinStatus, deleteReport, getSavedReports, toggleSaveStatus } from '../controllers/history.controller.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const router = express.Router();

router.get('/', getHistory);
router.get('/saved', getSavedReports);
router.get('/report/:id', validateObjectId, getReportById);
router.get('/batch/:id', validateObjectId, getBatchReportById);

router.patch('/:id/pin', validateObjectId, togglePinStatus);
router.patch('/:id/save', validateObjectId, toggleSaveStatus);
router.delete('/:id', validateObjectId, deleteReport);

export default router;
