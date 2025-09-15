import asyncHandler from '../utils/asyncHandler.utils.js';
import { Resource } from '../model/resource.model.js';
import { uploadCloudinary } from '../utils/cloudinary.utils.js';
import { ApiError } from '../utils/apiError.utils.js';

// ---------------- Upload Resource ----------------
export const uploadResource = asyncHandler(async (req, res) => {
    const { title, description, tags, visibility } = req.body;

    if (!req.file) throw new ApiError(400, 'File is required');

    // Upload file to Cloudinary
    const result = await uploadCloudinary(req.file.path); // using local file path

    if (!result) throw new ApiError(500, 'Failed to upload file to Cloudinary');

    const resource = await Resource.create({
        title,
        description,
        uploader: req.user._id,
        file: { url: result.secure_url, public_id: result.public_id },
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        visibility: visibility || 'college'
    });

    res.status(201).json({ success: true, resource });
});

// ---------------- List Resources ----------------
export const listResources = asyncHandler(async (req, res) => {
    let { q, tags, page = 1, limit = 20 } = req.query;
    page = Number(page);
    limit = Number(limit);

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (tags) filter.tags = { $in: tags.split(',').map(t => t.trim()) };

    // Optionally restrict by visibility based on user role
    // Example: only public or college if user is not admin
    // filter.visibility = { $in: ['public', 'college'] };

    const resources = await Resource.find(filter)
        .skip((page - 1) * limit)
        .limit(limit);

    res.json({ success: true, resources, page, limit });
});
