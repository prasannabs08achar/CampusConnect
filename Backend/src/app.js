import express from 'express';
import cors from 'cors';
 import cookieParser from 'cookie-parser';
// import dotenv from 'dotenv';
// dotenv.config();
import http from 'http';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
// import rateLimit from 'express-rate-limit';
// import hpp from 'hpp';
import {errorHandler} from './middleware/errorhandler.middleware.js';
import { upload } from './middleware/multer.middleware.js';
import { uploadResource } from './controller/resource.controller.js';
const server=http.createServer();

const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json(
    {
        limit: '16kb'
    }
));
app.use(express.urlencoded({
    extended: true, limit: "16kb"
}))
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.static("public"))
app.use(cookieParser()); 
app.use(morgan('dev'));
app.use((req, res, next) => {
    if (req.is('multipart/form-data')) return next(); // skip files
    mongoSanitize({ req });
    xss()(req, res, next);
    next();
});

import userRouter from "./route/user.route.js"
import authRouter from "./route/auth.route.js"
import requestRouter from "./route/request.route.js"
import chatRouter from "./route/chat.route.js"
import messageRouter from "./route/message.route.js"
import resourceRouter from "./route/resources.route.js"
app.use("/api/v1/chats",chatRouter)
app.use("/api/v1/requests",requestRouter)
app.use("/api/v1/users",userRouter)
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/messages",messageRouter)
app.use("/api/v1/resources" ,resourceRouter)
app.use(errorHandler);
export default app;