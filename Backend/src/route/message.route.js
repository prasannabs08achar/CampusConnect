import express from 'express';
import {verifyJWT } from '../middleware/auth.middleware.js';
import { fetchMessages } from '../controller/message.controller.js';

const router = express.Router();

router.route('/').get(verifyJWT, fetchMessages);

export default router;
