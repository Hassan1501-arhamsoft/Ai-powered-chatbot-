// src/controllers/auth.controller.js
import { registerUser, loginUser } from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

// Helper to set HTTP-Only Cookie and send response
const sendAuthResponse = (res, statusCode, message, result) => {
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.status(statusCode).cookie("jwt", result.token, options).json({
    success: true,
    message,
    token: result.token,
    data: result.user,
  });
};

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    sendAuthResponse(res, 201, "Registration successful", result);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    sendAuthResponse(res, 200, "Login successful", result);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie("jwt", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  return successResponse(res, null, "Logged out successfully");
};