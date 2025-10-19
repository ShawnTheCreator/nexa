import express from 'express';
import { getCookieOptions } from '../utils/generateTokenAndSetCookie.js';

const router = express.Router();

// Temporary debug endpoint to inspect incoming cookies and headers
router.get('/cookies', (req, res) => {
  try {
    const info = {
      cookies: req.cookies || {},
      headers: {
        host: req.get('host'),
        origin: req.get('origin'),
        referer: req.get('referer'),
        authorization: req.get('authorization'),
      },
      hostname: req.hostname,
      ip: req.ip,
    };

    // Avoid leaking secrets in logs; only log keys
    console.log('DEBUG /api/debug/cookies - cookies keys:', Object.keys(info.cookies));

    res.status(200).json({ success: true, info });
  } catch (err) {
    console.error('Debug cookies error:', err.message);
    res.status(500).json({ success: false, message: 'Debug error' });
  }
});

// Return the cookie options the server computes for the incoming request
router.get('/cookie-options', (req, res) => {
  try {
    const opts = getCookieOptions(req);
    res.status(200).json({ success: true, options: opts });
  } catch (err) {
    console.error('Debug cookie-options error:', err.message);
    res.status(500).json({ success: false, message: 'Debug error' });
  }
});

export default router;
