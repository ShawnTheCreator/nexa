// backend/utils/generateTokenAndSetCookie.js
import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
  // 🔑 Critical: Validate JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // 🍪 Set cookie with production-safe settings for Render
  res.cookie("token", token, {
    httpOnly: true,           // Prevent XSS attacks
    secure: true,             // Always true for HTTPS (Render uses HTTPS)
    sameSite: "none",         // Required for cross-origin requests
    domain: ".onrender.com",  // 👈 Critical: allows cookie to work across Render subdomains
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: "/",                // Available across entire site
  });

  return token;
};