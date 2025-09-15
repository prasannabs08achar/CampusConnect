import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true, // avoid accidental leading/trailing spaces
        },
        description: {
            type: String,
            trim: true,
        },
        uploader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        file: {
            url: String,
            public_id: String,
        },
        tags: [String],
        visibility: {
            type: String,
            enum: ['public', 'college', 'private'],
            default: 'college',
        },
    },
    { timestamps: true }
);

// ⚡ Enable quick text search by title or tags
resourceSchema.index({ title: 'text', tags: 'text' });

export const Resource = mongoose.model('Resource', resourceSchema);
