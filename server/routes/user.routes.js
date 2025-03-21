import express from "express";
import {
    fetchUserData,
    updateUser,
} from "../controllers/user.controllers.js";
import verifyAccessToken from "../middleware/auth.middleware.js";
import asyncHandler from "../middleware/async.middleware.js";

const router = express.Router();

// Route definitions
router
    .route("/:id/update")
    .patch(verifyAccessToken, asyncHandler(updateUser));

router
    .route("/i/:id")
    .get(verifyAccessToken, asyncHandler(fetchUserData));

export default router;
