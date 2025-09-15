import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { sendRequest, incomingRequests, acceptRequest, rejectRequest } from '../controller/request.controller.js';

const router = express.Router();

router.route('/').post(verifyJWT, sendRequest);
router.route('/incoming').get(verifyJWT, incomingRequests);
router.route('/accept').post(verifyJWT, acceptRequest);
router.route('/reject').post(verifyJWT, rejectRequest);

export default router;