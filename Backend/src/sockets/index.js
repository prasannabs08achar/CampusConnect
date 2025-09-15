import jwt from 'jsonwebtoken';
import {User} from '../model/user.model.js';
import {Chat} from '../model/chat.model.js';
import {Message }from '../model/message.model.js';

export default function socketHandler(io) {
    // userId -> Set of socketIds (supports multiple devices per user)
    const onlineUsers = new Map();

    // 🔐 Authentication middleware
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication error'));

        try {
            const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.userId = payload.id; // store user id in socket instance
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const uid = socket.userId;

        // Track multiple sockets per user (multi-device support)
        if (!onlineUsers.has(uid)) onlineUsers.set(uid, new Set());
        onlineUsers.get(uid).add(socket.id);

        // Notify everyone that this user is online
        io.emit('presence:update', { userId: uid, online: true });

        // Join user’s private room
        socket.join(uid);

        // ➡️ Join a specific chat room
        socket.on('chat:join', (chatId) => {
            socket.join(`chat_${chatId}`);
        });

        //  Typing indicator
        socket.on('typing', ({ chatId, typing }) => {
            socket.to(`chat_${chatId}`).emit('typing', { userId: uid, typing });
        });

        //  Sending a message
        socket.on('message:send', async ({ chatId, content, attachments }) => {
            try {
                // Save message in DB
                const msg = await Message.create({
                    chat: chatId,
                    sender: uid,
                    content,
                    attachments: attachments || []
                });

                // Update chat’s last message reference
                await Chat.findByIdAndUpdate(chatId, {
                    $set: { lastMessage: msg._id }
                });

                // Broadcast the new message to everyone in the chat room
                io.to(`chat_${chatId}`).emit('message:new', msg);
            } catch (err) {
                console.error('message send error', err);
                socket.emit('error', 'Message delivery failed');
            }
        });

        // Read receipts
        socket.on('message:read', async ({ chatId, messageIds }) => {
            await Message.updateMany(
                { _id: { $in: messageIds } },
                { $addToSet: { readBy: uid } }
            );
            io.to(`chat_${chatId}`).emit('message:read', { messageIds, userId: uid });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            const set = onlineUsers.get(uid);
            if (set) {
                set.delete(socket.id);
                if (set.size === 0) {
                    onlineUsers.delete(uid);
                    io.emit('presence:update', { userId: uid, online: false });
                }
            }
        });
    });
}
