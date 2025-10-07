const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { greeting, tone, keywords, input } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'Input is required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are a chatbot with the following settings:
      - Greeting: "${greeting || 'Hello! How can I assist you?'}"
      - Tone: ${tone || 'friendly'}
      - Keywords to focus on: ${keywords && keywords.length ? keywords.join(', ') : 'none'}
      Respond to the user input: "${input}" accordingly.
    `;
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return res.status(200).json({ response });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'Failed to generate chatbot response' });
  }
}
