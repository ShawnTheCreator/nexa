// backend/utils/generateTokenAndSetCookie.js
import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
  // Validate JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Build cookie options conditionally so local/dev works and production remains secure.
  const isProd = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProd, // only send secure cookies in production (HTTPS)
    sameSite: isProd ? "none" : "lax", // none for cross-site in prod, lax for local dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };

  // Allow specifying a production cookie domain via env var (e.g. ".onrender.com").
  // Only set when provided to avoid blocking localhost/dev cookies.
  if (isProd && process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }

  res.cookie("token", token, cookieOptions);

  return token;
};