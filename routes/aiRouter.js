import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// AI Study Assistant Route
router.post('/study-ai', verifyFirebaseToken, async (req, res) => {
    try {
        const { prompt, subject, history } = req.body;

        const systemInstruction = `
            You are an intelligent, friendly Academic Study Tutor for Munshigonj Polytechnic Institute (MUPI) students.
            Your goal is to help diploma engineering students understand complex concepts, debug code, and prepare for exams.
            Rules:
            1. Explain concepts clearly in simple Bengali and English (Banglish or standard Bengali as the student prefers).
            2. For coding questions (C, Python, JavaScript, Web Dev, Database, etc.), provide clean, bug-free examples and explain step-by-step.
            3. Encourage learning: guide them through problem-solving rather than just dumping homework answers.
            4. Format responses cleanly using bullet points, bold text, and code blocks.
            ${subject && subject !== 'General' ? `Focus specifically on the subject: ${subject}` : ''}
        `;

        // আগের চ্যাট হিস্ট্রি থাকলে সেটি ফরম্যাট করে নেওয়া (কনটেক্সট ধরে রাখার জন্য)
        const formattedContents = [
            ...(history || []).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            })),
            { role: 'user', parts: [{ text: prompt }] }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: formattedContents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });

        res.status(200).json({ reply: response.text() });
    } catch (error) {
        console.error("Study AI Error:", error);
        res.status(500).json({ message: "Failed to get response from Study AI", error: error.message });
    }
});