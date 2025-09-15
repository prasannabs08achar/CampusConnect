import { ApiError } from '../utils/apiError.utils.js';

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Make sure user was attached by verifyJWT
        if (!req.user) {
            // user is not authenticated
            return next(new ApiError(401, 'Not authenticated'));
        }

        //  Check if the user’s role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            // user’s role does not have permission
            return next(new ApiError(403, 'Forbidden: insufficient role'));
        }

        //  All good, continue
        next();
    };
};
