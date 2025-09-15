import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
    {
        isGroup: {
            type: Boolean,
            default: false,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true, // usually you want at least one member
            },
        ],
        name: {
            type: String,
            trim: true, // removes accidental spaces (optional but good)
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

// ⚡ For quick queries like "find all chats a user is part of"
chatSchema.index({ members: 1 });

export const Chat = mongoose.model('Chat', chatSchema);
