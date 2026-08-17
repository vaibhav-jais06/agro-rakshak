import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function listModels() {
  const models = await groq.models.list();
  console.log("All models:", models.data.map(m => m.id));
}

listModels().catch(console.error);
