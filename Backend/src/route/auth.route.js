import express from 'express';
import { register, login, verifyEmail, refreshToken } from '../controller/auth.controller.js';

const router = express.Router();
router.route('/register').post(register)
router.route('/verify').post(verifyEmail)
router.route('/login').post(login)
router.route('/refresh').post(refreshToken)


export default router;
