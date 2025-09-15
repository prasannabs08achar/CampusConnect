import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.utils.js';
import { ApiError } from '../utils/apiError.utils.js';
import { User } from '../model/user.model.js';
import sendEmail from '../utils/sendemail.utils.js';
// import { generateToken } from '../utils/generateToken.js'; // optional if you use utils
// // import { ApiResponse } from '../utils/apiResponse.utils.js'; // uncomment if used

const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

// ---------------- Register ----------------
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, role, branch, year, skills } = req.body;
    if (!name || !email || !password || !role) throw new ApiError(400, 'Missing required fields');

    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(400, 'Email already in use');

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
        name, email, password, role, branch, year, skills, emailVerificationToken: verificationToken,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&id=${user._id}`;
    const html = `<p>Hi ${user.name}, click <a href="${verifyUrl}">here</a> to verify your email</p>`;
    await sendEmail({ to: user.email, subject: 'Verify your email', html });

    res.status(201).json({ success: true, message: 'Registered successfully. Please verify your email.' });
});

// ---------------- Verify Email ----------------
export const verifyEmail = asyncHandler(async (req, res) => {
    const { id, token } = req.body;
    const user = await User.findById(id);
    if (!user) throw new ApiError(400, 'Invalid verification link');
    if (user.verified) return res.json({ success: true, message: 'Already verified' });
    if (user.emailVerificationToken !== token) throw new ApiError(400, 'Invalid token');

    user.verified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
});

// ---------------- Login ----------------
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const match = await user.isPasswordCorrect(password);
    if (!match) throw new ApiError(401, 'Invalid credentials');

    if (!user.verified) {
        // throw new ApiError(403, 'Please verify your email');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // only true in production
        sameSite: 'strict',
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json({
            success: true,
            data: {
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
            message: 'User logged in successfully',
        });
});

// ---------------- Refresh Token ----------------
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(401, 'Refresh token missing');

    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) throw new ApiError(401, 'Invalid refresh token');

    const accessToken = user.generateAccessToken();
    res.json({ success: true, token: accessToken });
});
