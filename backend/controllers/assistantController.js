import fetch from 'node-fetch';

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

    // Call OpenAI Responses API (server-side) with the provided prompt.
    const endpoint = 'https://api.openai.com/v1/responses';

    const body = {
      model: options?.model || 'gpt-4.1',
      input: prompt,
      // you can pass additional fields from options if needed
    };

    const r = await fetch(endpoint, {
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
