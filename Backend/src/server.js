import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';

import connectDB from './config/index.db.js';
import app from './app.js';
import socketHandler from './sockets/index.js';

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        // Create a single HTTP server from Express app
        const server = createServer(app);

        // Attach Socket.IO to this server
        const io = new SocketIO(server, {
            cors: {
                origin: process.env.CLIENT_URL || '*',
                methods: ['GET', 'POST'],
            },
        });

        // Setup your socket events
        socketHandler(io);

        // Start listening
        server.listen(PORT, () => {
            console.log(` Server running successfully on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(' MongoDB Connection failed', error);
    });
