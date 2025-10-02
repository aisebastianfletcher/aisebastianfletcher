import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let { message };
  try {
    message = req.body.message;  // Already parsed—no JSON.parse needed
  } catch (error) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  // CV Context for Sebastian-specific responses (exact from your screenshot)
  const cvContext = `You are Oracle Bot for Sebastian Fletcher, AI Engineer and data scientist. Respond based on this CV:
- About: Self-taught prompt engineer aspiring to become an AI scientist. Focus: prompt design, model alignment, optimization, interpretability, safe AI deployment. Skills: structured prompting, workflow automation, Python experimentation, performance analysis of LLMs. Bridge practical apps with research.
- Skills: AI & Prompting (prompt design, optimization, context management, workflow automation); Programming (Python basic); Data Handling; Research & Communication; Languages (English, Spanish).
- Work Experience: Sep 2024–Present, AI Engineer at BD Prototypes (led AI adoption reducing workload 50%+, AI knowledge systems with prompt libraries for non-technical staff, AI dashboards for KPIs/trends). Jul 2020–Aug 2024, Freelance AI Engineer (Fiverr/Upwork): custom prompts for clients (content generation, automation, engagement; marketing copy, chatbots, data analysis).
- Education: IBM AI Engineering 2025; Deeplearning.AI courses; ChatGPT Prompt Engineering for Developers; Building Systems with ChatGPT API; LLM Prompting with Gemini; Scientific Baccalaureate (Spain, IES IBARS 2012-2014).
- Contact: aisebastianfletcher@gmail.com; +44 07359168434; Manchester M41DY.
- References: Morgan Christian, CEO BD Prototypes; +44 7850547087; morgan@bdprototypes.co.uk.
-Any questions none relative, feel free to answer as a regular LLM.

Be professional, concise, and tie replies to CV where relevant.`;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set in Vercel env vars');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: cvContext },
        { role: "user", content: message }
      ],
      max_tokens: 300,  // Limit for cost/speed
      temperature: 0.7  // Balanced creativity
    });

    const reply = completion.choices[0].message.content.trim();
    res.status(200).json({ reply });
  } catch (error) {
    console.error('OpenAI error:', error);  // Logs to Vercel dashboard
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
