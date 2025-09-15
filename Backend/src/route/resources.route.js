import express from 'express';
import {verifyJWT } from '../middleware/auth.middleware.js';
import { uploadResource, listResources } from '../controller/resource.controller.js';
import { upload } from '../middleware/multer.middleware.js'; // your separate file

const router = express.Router();

router.route('/')
    .post(verifyJWT, upload.single('file'), uploadResource)
router.get("/", verifyJWT, listResources);

export default router;
