import asyncHandler from '../utils/asyncHandler.utils.js';
import { Message } from '../model/message.model.js';
import { ApiError } from '../utils/apiError.utils.js';

// ---------------- Fetch messages ----------------
export const fetchMessages = asyncHandler(async (req, res) => {
    let { chatId, page = 1, limit = 30 } = req.query;

    if (!chatId) throw new ApiError(400, 'chatId is required');

    page = Number(page);
    limit = Number(limit);

    const messages = await Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('sender', 'name role branch');

    res.json({ success: true, messages, page, limit });
});
