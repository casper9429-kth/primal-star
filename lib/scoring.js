import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze target image using Gemini 1.5 Flash
 * @param {Buffer} imageBuffer 
 * @param {string} mimeType 
 */
export async function calculateScore(imageBuffer, mimeType = 'image/jpeg') {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not set. Using mock fallback.');
        return mockFallback();
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

        const prompt = `
      Analyze this image of a shooting target. 
      Identify all visible bullet holes.
      Calculate the score for each shot based on standard precision pistol target rings (10 is the center bullseye, 9 is the next ring, etc.).
      
      Return ONLY a valid JSON object with this structure:
      {
        "totalPoints": number,
        "target": {
            "centerX": number (0-1 relative to width),
            "centerY": number (0-1 relative to height),
            "ringWidth": number (approximate width of one scoring ring 0-1)
        },
        "shots": [
          { "points": number, "x": number (0-1 relative to width), "y": number (0-1 relative to height) }
        ]
      }
      Do not include markdown formatting or backticks.
    `;

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // Validate structure
        if (typeof data.totalPoints !== 'number' || !Array.isArray(data.shots)) {
            console.warn('Invalid JSON structure from Gemini, falling back to mock.');
            return mockFallback();
        }

        return {
            ...data,
            seriesId: Date.now().toString()
        };

    } catch (error) {
        console.error('Gemini AI Error:', error);
        return mockFallback();
    }
}

function mockFallback() {
    // Fallback to previous mock logic if API fails or key is missing
    const shots = [];
    let totalPoints = 0;
    for (let i = 0; i < 5; i++) {
        const points = Math.floor(Math.random() * 4) + 7;
        const x = 0.5 + (Math.random() - 0.5) * 0.2;
        const y = 0.5 + (Math.random() - 0.5) * 0.2;
        shots.push({ points, x, y });
        totalPoints += points;
    }
    return {
        totalPoints,
        shots,
        target: { centerX: 0.5, centerY: 0.5, ringWidth: 0.05 },
        seriesId: Date.now().toString()
    };
}
