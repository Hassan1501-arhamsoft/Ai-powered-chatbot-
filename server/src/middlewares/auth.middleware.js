// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { errorResponse } from "../utils/response.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in HTTP-Only cookies first, then standard Bearer headers
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, "Not authorized to access this route", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to request object
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, "The user belonging to this token no longer exists.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "Not authorized, token failed", 401);
  }
};