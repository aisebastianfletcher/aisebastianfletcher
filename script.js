// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Oracle Bot Functionality
    const apiKey = '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';
    const chatToggle = document.getElementById('chat-toggle');
    const chatModal = document.getElementById('chat-modal');
    const closeChat = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendMessage = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');

    const cvContext = `
I am Sebastian Fletcher, a self-taught prompt engineer aspiring to become an AI scientist. My focus lies in prompt design, model alignment, and optimization, with a strong interest in interpretability and safe deployment of AI systems. Through independent study and project work, I have developed skills in structured prompting, workflow automation, Python experimentation, and performance analysis of large language models. Curious and research-driven, I aim to bridge practical application with scientific exploration while contributing to impactful AI projects.

Skills: AI & Prompting (Prompt design, optimization, context management, workflow automation), Programming (Python basic), Data Handling, Research & Communication, Languages (English, Spanish).

Education: IBM AI Engineering 2025, Deeplearning.AI courses completed, ChatGPT prompt engineering developers, Building systems with ChatGPT API, LLM prompting with gemini, Scientific Baccalaureate (Spain, IES IBARS 2012-2014).

Work Experience:
- Sep 2024 - present: AI Engineer at BD Prototypes. Led end-to-end AI adoption strategy (reduces workload by 50%+), AI-driven knowledge management systems (prompt libraries and workflows for non-technical staff), Designed and deployed AI-powered dashboards (extract KPIs and trend insights for real-time decision-making).
- Jul 2020 - Aug 2024: AI Engineer, Online Freelance (Fiverr/Upwork). Delivered customized AI prompt solutions for international clients (improved content generation, workflow automation, customer engagement), Collaborated with non-technical clients for AI use cases (marketing copy, chatbots, data analysis).

Contact: Email: aisebastianfletcher@gmail.com, Phone: +4407359168434, Location: Manchester M41DY.
References: Morgan Christian, CEO at BD Prototypes, Phone: +44 7850547087, Email: morgan@bdprototypes.co.uk.
`;

    if (chatToggle) chatToggle.addEventListener('click', () => chatModal.classList.add('show'));
    if (closeChat) closeChat.addEventListener('click', () => chatModal.classList.remove('show'));
    if (sendMessage) sendMessage.addEventListener('click', sendChatMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }

    async function sendChatMessage() {
        const input = chatInput.value.trim();
        if (!input) return;

        addMessage(input, 'user');
        chatInput.value = '';

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: `You are Oracle Bot, an AI assistant for Sebastian Fletcher's portfolio. Answer questions based on his CV and experience. Be helpful, professional, and concise. CV context: ${cvContext}` },
                        { role: 'user', content: input }
                    ]
                })
            });

            const data = await response.json();
            const botReply = data.choices[0].message.content;
            addMessage(botReply, 'bot');
        } catch (error) {
            addMessage('Sorry, there was an error. Please try again.', 'bot');
        }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
