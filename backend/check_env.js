
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('No key found');
        return;
    }

    const genAI = new GoogleGenerativeAI(key);
    // Try specifically the models used in utils.mjs
    const models = ['gemini-flash-latest', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];

    for (const m of models) {
        console.log(`Testing model: ${m}`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent('Hello, are you working?');
            const response = await result.response;
            const text = response.text();
            console.log(`SUCCESS with ${m}:`, text.slice(0, 50));
            return; // Success!
        } catch (e) {
            console.error(`FAILED with ${m}:`, e.message);
        }
    }
    console.error('All models failed.');
}

testGemini();
