import { generateRefreshToken } from "../utils/generateRefreshToken.js";
import { generateAccessToken } from "../utils/generateAccessToken.js";
import UserModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

// Log In Controller
const logIn = async (req, res) => {
    const { email, password } = req.body;

    const oldUser = await UserModel.findOne({ email });

    if (!oldUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) {
        const error = new Error("Incorrect password");
        error.statusCode = 400;
        throw error;
    }

    const accessToken = generateAccessToken(oldUser);
    const refreshToken = generateRefreshToken(oldUser);

    await oldUser.save();

    res.status(200).json({
        result: oldUser,
        accessToken: accessToken,
        refreshToken
    });
};

// Sign Up Controller
const registerUser = async (req, res) => {
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    const oldUser = await UserModel.findOne({ email });

    if (oldUser) {
        const error = new Error("Email is already in use");
        error.statusCode = 400;
        throw error;
    }

    if (password !== confirmPassword) {
        const error = new Error("Passwords don't match");
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new UserModel({
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    await newUser.save();

    res.status(201).json({
        result: newUser,
        accessToken: accessToken,
        refreshToken
    });
};

// Refresh token controller
const refreshToken = async (req, res) => {
    let { refreshToken } = req.body;

    if (!refreshToken) {
        const error = new Error("Refresh token is required");
        error.statusCode = 400;
        throw error;
    }

    const decodeToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const userId = decodeToken.id;
    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const newToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({
        accessToken: newToken,
        refreshToken: newRefreshToken
    });
};
    
export {
    logIn,  
    registerUser,
    refreshToken
}