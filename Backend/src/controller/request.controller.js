import asyncHandler from '../utils/asyncHandler.utils.js';
import { Request } from '../model/request.model.js';
import { Chat } from '../model/chat.model.js';
import { ApiError } from '../utils/apiError.utils.js';

// ---------------- Send request ----------------
export const sendRequest = asyncHandler(async (req, res) => {
    const { to, message } = req.body;

    if (!to) throw new ApiError(400, 'Recipient required');
    if (String(req.user._id) === String(to)) throw new ApiError(400, 'Cannot send request to yourself');

    // Check duplicate pending request
    const existing = await Request.findOne({ from: req.user._id, to, status: 'pending' });
    if (existing) throw new ApiError(400, 'Request already pending');

    const reqDoc = await Request.create({ from: req.user._id, to, message });

    res.status(201).json({ success: true, request: reqDoc });
});

// ---------------- List incoming requests ----------------
export const incomingRequests = asyncHandler(async (req, res) => {
    const incoming = await Request.find({ to: req.user._id, status: 'pending' })
        .populate('from', 'name branch role');
    res.json({ success: true, incoming });
});

// ---------------- Accept request ----------------
export const acceptRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.body;

    const request = await Request.findById(requestId);
    if (!request) throw new ApiError(404, 'Request not found');
    if (String(request.to) !== String(req.user._id)) throw new ApiError(403, 'Not authorized');

    request.status = 'accepted';
    await request.save();

    // Create one-to-one chat if not exists
    let chat = await Chat.findOne({
        isGroup: false,
        members: { $all: [request.from, request.to], $size: 2 }
    });

    if (!chat) {
        chat = await Chat.create({
            isGroup: false,
            members: [request.from, request.to],
            createdBy: request.to
        });
    }

    res.json({ success: true, chat, request });
});

// ---------------- Reject request ----------------
export const rejectRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.body;

    const request = await Request.findById(requestId);
    if (!request) throw new ApiError(404, 'Request not found');
    if (String(request.to) !== String(req.user._id)) throw new ApiError(403, 'Not authorized');

    request.status = 'rejected';
    await request.save();

    res.json({ success: true, message: 'Request rejected successfully' });
});
