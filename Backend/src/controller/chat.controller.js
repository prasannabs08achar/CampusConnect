import asyncHandler from '../utils/asyncHandler.utils.js';
import { Chat } from '../model/chat.model.js';
import { ApiError } from '../utils/apiError.utils.js';

// ---------------- Get my chats ----------------
export const getMyChats = asyncHandler(async (req, res) => {
    const chats = await Chat.find({ members: req.user._id })
        .populate('members', 'name email role branch')
        .populate('lastMessage');

    res.json({ success: true, chats });
});

// ---------------- Create group chat ----------------
export const createGroupChat = asyncHandler(async (req, res) => {
    const { name, members } = req.body;

    if (!name || !members || !Array.isArray(members) || members.length === 0) {
        throw new ApiError(400, 'Group name and members are required');
    }

    // Include the creator in the members array
    const allMembers = [req.user._id, ...members];

    const chat = await Chat.create({
        name,
        members: allMembers,
        isGroup: true,
        createdBy: req.user._id
    });

    const populatedChat = await Chat.findById(chat._id).populate('members', 'name email role branch');

    res.status(201).json({ success: true, chat: populatedChat });
});
