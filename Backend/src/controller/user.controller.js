import asyncHandler from '../utils/asyncHandler.utils.js';
import { User } from '../model/user.model.js';

// ---------------- Get my profile ----------------
export const getMe = asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user });
});

// ---------------- Update profile ----------------
export const updateProfile = asyncHandler(async (req, res) => {
    const allowedFields = ['name', 'branch', 'year', 'skills', 'bio', 'department', 'interests'];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });

    await req.user.save();

    const updatedUser = await User.findById(req.user._id).select('-password -refreshToken -emailVerificationToken');

    res.json({ success: true, user: updatedUser });
});

// ---------------- Search seniors (filtering) ----------------
export const searchUsers = asyncHandler(async (req, res) => {
    let { q, branch, skill, role = 'senior', page = 1, limit = 20 } = req.query;
    page = Number(page);
    limit = Number(limit);

    const filter = { role: role.toLowerCase() }; // normalize role

    if (branch) filter.branch = branch;
    if (skill) filter.skills = skill;
    if (q) filter.$text = { $search: q };

    const users = await User.find(filter)
        .select('-password -refreshToken -emailVerificationToken')
        .skip((page - 1) * limit)
        .limit(limit);

    res.json({ success: true, results: users, page, limit });
});
