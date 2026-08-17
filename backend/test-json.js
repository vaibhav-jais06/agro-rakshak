import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testJson() {
  const dummyImage = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMDA4FAp8YDAAAAABJRU5ErkJggg=="; // 2x2 image
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Output JSON only. {"color": "red"}`,
          },
        ],
      }
    ],
    model: "qwen/qwen3.6-27b",
    temperature: 0.2,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });
  console.log("Response:", chatCompletion.choices[0]?.message?.content);
}

testJson().catch(console.error);
