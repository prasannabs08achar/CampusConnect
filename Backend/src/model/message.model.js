import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            default: '',
            trim: true,        // remove accidental leading/trailing spaces
        },
        attachments: [
            {
                url: String,
                public_id: String,
                type: String,    // e.g. "image", "video", "file"
            },
        ],
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    { timestamps: true }
);

// ⚡ Quickly fetch messages for a chat sorted by newest first
messageSchema.index({ chat: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
