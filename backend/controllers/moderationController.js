// Simple moderation endpoint (placeholder)
// In production, replace with real AI moderation service (OpenAI/GCP/Azure)
export async function moderateText(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    // Very small blacklist example
    const blacklist = ['badword1', 'badword2', 'explicit'];
    const lower = text.toLowerCase();
    const matched = blacklist.filter((w) => lower.includes(w));

    if (matched.length > 0) {
      return res.status(200).json({ success: true, ok: false, reasons: matched });
    }

    // If passes quick checks, return ok: true
    return res.status(200).json({ success: true, ok: true });
  } catch (err) {
    console.error('moderateText error:', err.message);
    res.status(500).json({ success: false, message: 'Moderation failed' });
  }
}
