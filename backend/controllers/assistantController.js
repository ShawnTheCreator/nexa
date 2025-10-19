// POST /api/assistant
// body: { prompt: string, options?: { ... } }
const handleAssistant = async (req, res) => {
  try {
    const { prompt, options } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'Missing prompt in request body' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'OPENAI_API_KEY not configured on server' });
    }

    // Simple domain whitelist: only answer educational, business/startup, and platform questions.
    // If the prompt doesn't contain any allowed keywords, return a friendly refusal.
    const allowedKeywords = [
      'learn', 'teach', 'explain', 'tutorial', 'how to', 'how do i', 'how do you', 'what is', 'why',
      'startup', 'start up', 'business', 'founder', 'founding', 'pitch', 'investor', 'funding', 'mvp',
      'market', 'marketing', 'sales', 'revenue', 'pricing', 'go to market', 'g2m', 'scale', 'team',
      'platform', 'nexa', 'product', 'feature', 'onboarding', 'docs', 'documentation', 'api', 'integration'
    ];

    const promptLower = prompt.toLowerCase();
    const matches = allowedKeywords.some(k => promptLower.includes(k));
    if (!matches) {
      return res.status(403).json({
        success: false,
        message: 'This assistant only answers questions about education, running a business/startup, and the platform. Please rephrase your question to fit those topics.'
      });
    }

    // Determine a fetch implementation: prefer global fetch (Node 18+ / undici), otherwise try dynamic import of node-fetch.
    let fetchImpl = globalThis.fetch;
    if (!fetchImpl) {
      try {
        const nf = await import('node-fetch');
        fetchImpl = nf.default || nf;
      } catch (err) {
        console.error('No fetch available and node-fetch could not be imported:', err.message || err);
        return res.status(500).json({ success: false, message: 'Server missing global fetch. Please run `npm install node-fetch` or use Node 18+.' });
      }
    }

    // Call OpenAI Responses API (server-side) with the provided prompt.
    const endpoint = 'https://api.openai.com/v1/responses';

    const body = {
      model: options?.model || 'gpt-4.1',
      input: prompt,
      // you can pass additional fields from options if needed
    };

    const r = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('OpenAI API error:', r.status, text);
      return res.status(502).json({ success: false, message: 'AI provider error', detail: text });
    }

    const json = await r.json();

    // Return the provider response wholesale. Frontend can handle parsing.
    return res.status(200).json({ success: true, data: json });
  } catch (err) {
    console.error('Assistant error:', err.message || err);
    return res.status(500).json({ success: false, message: 'Assistant error', detail: err.message });
  }
};

export { handleAssistant };
