import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            trim: true, // optional: removes accidental spaces
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

// Index for faster queries: "find all pending requests for a user"
requestSchema.index({ to: 1, status: 1 });

// Export model (named export for consistency)
export const Request = mongoose.model('Request', requestSchema);
