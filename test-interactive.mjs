import { calculateScore } from './lib/scoring.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function testInteractive() {
    console.log('Testing Interactive Scoring Backend...');

    const imagePath = path.join(process.cwd(), 'real_target.jpg');
    if (!fs.existsSync(imagePath)) {
        console.error('Error: real_target.jpg not found!');
        return;
    }

    const imageBuffer = fs.readFileSync(imagePath);

    try {
        // Simulate what analyzeImage does
        console.log('Calling calculateScore...');
        const result = await calculateScore(imageBuffer, 'image/jpeg');

        console.log('\nAnalysis Result:');
        console.log(JSON.stringify(result, null, 2));

        if (result.target && result.target.centerX && result.target.ringWidth) {
            console.log('\nSUCCESS: Target geometry returned!');
        } else {
            console.error('\nFAILURE: Target geometry missing!');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testInteractive();
