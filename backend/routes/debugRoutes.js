import express from 'express';

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

export default router;
