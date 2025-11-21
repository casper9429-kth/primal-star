import { calculateScore } from './lib/scoring.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
    try {
        console.log('Testing Gemini AI Scoring...');
        const imagePath = path.join(process.cwd(), 'real_target.jpg');

        if (!fs.existsSync(imagePath)) {
            console.error('Error: real_target.jpg not found!');
            return;
        }

        const imageBuffer = fs.readFileSync(imagePath);
        console.log('Image loaded, size:', imageBuffer.length);

        const models = [
            'gemini-2.5-pro',
            'gemini-2.5-flash-preview-09-2025',
            'gemini-3-pro-preview'
        ];

        for (const modelName of models) {
            console.log(`\nTesting model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const prompt = 'Analyze this image and return a JSON object with "totalPoints" (number) and "shots" (array).';

                const imagePart = {
                    inlineData: {
                        data: imageBuffer.toString('base64'),
                        mimeType: 'image/png'
                    },
                };

                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                console.log(`SUCCESS: ${modelName} worked!`);
                console.log(response.text().substring(0, 100) + '...');
                return; // Exit on first success
            } catch (e) {
                console.error(`FAILED: ${modelName} - ${e.message}`);
            }
        }
        console.error('FAILURE: No Gemini model succeeded.');

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testGemini();
