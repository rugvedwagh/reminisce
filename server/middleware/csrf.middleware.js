import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import createHttpError from "../utils/create-error.js";

const verifyCsrfToken = async (req, res, next) => {
    `CF=098765432QWZ1   3 
    `
    const refreshToken = req.cookies?.refreshToken;
    const sessionId = req.headers['x-session-id'];
    const csrfToken = req.headers['x-xsrf-token'];

    if (!csrfToken || !refreshToken || !sessionId) {
        return next(createHttpError("Missing CSRF, refresh token, or session ID", 403));
    }

    let decodedToken;
    let secret = process.env.REFRESH_TOKEN_SECRET;
    
    if (!secret) {
        return next(createHttpError('Server misconfiguration: missing REFRESH_TOKEN_SECRET', 500));
    }

    try {
        decodedToken = jwt.verify(refreshToken, secret);  // Throws synchrnously for some errors so in try catch
    } catch (err) {
        return next(createHttpError('Invalid or expired refresh token', 403));
    }
    const userId = decodedToken.id;

    const user = await User.findById(userId);
    if (!user) {
        return next(createHttpError('User not found', 404));
    }

    const session = user.sessions.find(
        s => s.sessionId === sessionId && s.refreshToken === refreshToken
    );

    if (!session || session.csrfToken !== csrfToken) {
        return next(createHttpError('Invalid session or CSRF token', 403));
    }

    return next();
};

export default verifyCsrfToken;
