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

  // Determine if the incoming request is using HTTPS
  const forwardedProto = req && (req.headers['x-forwarded-proto'] || req.headers['X-Forwarded-Proto']);
  const isRequestHttps = !!(req && (req.secure || forwardedProto === 'https'));

  // If the environment explicitly provides FRONTEND_URL or COOKIE_DOMAIN, or we're in production,
  // prefer SameSite=None and Secure=true so hosted backends work with cross-origin frontends.
  // This mirrors previous behavior that worked for hosted deployments (e.g., Render, Vercel).
  if (process.env.FRONTEND_URL || process.env.COOKIE_DOMAIN || isProd) {
    opts.sameSite = 'none';
    opts.secure = true;
  } else {
    // Only set Secure=true when the incoming request is HTTPS. Browsers ignore Secure cookies over HTTP.
    if (isCrossSite) {
      if (isRequestHttps) {
        opts.sameSite = 'none';
        opts.secure = true;
      } else {
        // Can't set SameSite=None+Secure over HTTP. Fall back to lax for local dev,
        // but cross-site requests may not include the cookie. Recommend running over HTTPS (or use a tunnel).
        console.warn('Cross-site cookie requested but incoming request is not HTTPS. SameSite=None requires Secure and HTTPS; falling back to SameSite=lax for local dev. For full cross-origin cookie support run backend/frontend over HTTPS or set COOKIE_DOMAIN correctly.');
        opts.sameSite = 'lax';
        opts.secure = false;
      }
    } else {
      // same-origin or unknown origin: prefer lax in dev
      opts.sameSite = 'lax';
      opts.secure = false;
    }
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