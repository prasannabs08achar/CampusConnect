import express from 'express';
import {verifyJWT } from '../middleware/auth.middleware.js';
import { getMyChats, createGroupChat } from '../controller/chat.controller.js';

const router = express.Router();

router.route('/').get(verifyJWT, getMyChats);
router.route('/group').post(verifyJWT, createGroupChat);

export default router;
