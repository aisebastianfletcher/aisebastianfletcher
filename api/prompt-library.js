const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { task, model } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const selectedModel = genAI.getGenerativeModel({ model: model || "gemini-1.5-pro" });
    const prompt = `Generate an optimized prompt template for the task: "${task}". Ensure it includes clear instructions and placeholders for variables.`;
    const result = await selectedModel.generateContent(prompt);
    const generatedPrompt = result.response.text();

    return res.status(200).json({ prompt: generatedPrompt });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'Failed to generate prompt' });
  }
}
