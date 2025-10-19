import jwt from "jsonwebtoken";

// Compute cookie options based on the incoming request and environment.
// Ensures cross-site flows (frontend on different origin) get SameSite=None and secure cookie.
export function getCookieOptions(req) {
  const isProd = process.env.NODE_ENV === "production";

  // Default options (safe defaults)
  const opts = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };

  // Try to derive the backend hostname (for domain) from env or request
  let backendHost = null;
  if (process.env.COOKIE_DOMAIN) {
    backendHost = process.env.COOKIE_DOMAIN.replace(/^\./, '');
  } else if (req) {
    const hostHeader = req.headers && (req.headers.host || req.headers.Host) ? (req.headers.host || req.headers.Host) : null;
    backendHost = hostHeader ? hostHeader.split(':')[0] : (req.hostname || null);
  }

  // Determine request origin host (if available)
  let originHost = null;
  try {
    const origin = req && (req.headers.origin || req.headers.Origin);
    if (origin) {
      originHost = new URL(origin).hostname;
    }
  } catch (e) {
    originHost = null;
  }

  // If origin is different from backend host, treat as cross-site and require None+Secure
  const isCrossSite = originHost && backendHost && originHost !== backendHost;

  if (isCrossSite || process.env.FRONTEND_URL) {
    // Modern browser requirement for third-party cookies: SameSite=None and Secure
    opts.sameSite = 'none';
    opts.secure = true;
  } else {
    // local/same-origin friendly defaults
    opts.sameSite = isProd ? 'none' : 'lax';
    opts.secure = !!isProd;
  }

  if (backendHost && backendHost !== 'localhost') {
    opts.domain = backendHost;
  }

  return opts;
}

export const generateTokenAndSetCookie = (req, res, userId) => {
  // Validate JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const cookieOptions = getCookieOptions(req);

  res.cookie("token", token, cookieOptions);

  return token;
};