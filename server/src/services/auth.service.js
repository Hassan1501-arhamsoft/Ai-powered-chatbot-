import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const registerUser = async (userData) => {
  const { name, email, password } = userData;
  // NOTE: 'role' is intentionally excluded from destructuring.
  // Role assignment from the client is a critical security vulnerability.
  // All new registrations are always "user". Promote to "admin" via DB only.

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw Object.assign(new Error("Email already in use"), { statusCode: 400 });
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    // role defaults to "user" per schema — never accept from client
  });

  const token = generateToken(user);
  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw Object.assign(new Error("Please provide email and password"), { statusCode: 400 });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  }

  const token = generateToken(user);
  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};