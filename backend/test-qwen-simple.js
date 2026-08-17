import fs from 'fs';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  const imagePath = 'C:/Users/vj700/.gemini/antigravity-ide/brain/f0ea8cb0-3d23-440b-b307-b363d849caf1/.user_uploaded/media_1786884605343.png';
  const base64 = fs.readFileSync(imagePath, 'base64');
  
  console.log("Sending request...");
  const t0 = Date.now();
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Identify the disease in this plant. Output a valid JSON like {\"disease\": \"name\"} and nothing else." },
          { type: "image_url", image_url: { url: `data:image/png;base64,${base64}` } }
        ]
      }
    ],
    model: "qwen/qwen3.6-27b",
    temperature: 0.1,
    max_tokens: 4000
  });
  
  console.log(`Took ${Date.now() - t0}ms`);
  console.log(completion.choices[0].message.content);
}

test().catch(console.error);
