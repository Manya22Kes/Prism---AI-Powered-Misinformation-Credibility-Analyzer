import express from 'express';
import { getActivity, logExport } from '../controllers/activity.controller.js';

const router = express.Router();

router.get('/', getActivity);
router.post('/export', logExport);

export default router;
