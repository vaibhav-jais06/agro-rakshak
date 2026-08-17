import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createDummyImage(filepath) {
  // 1x1 pixel PNG (not working with Groq but we will see if we can use a slightly larger valid base64)
  // Groq requires at least 2x2.
  const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMDA4FAp8YDAAAAABJRU5ErkJggg==";
  const buffer = Buffer.from(b64, 'base64');
  fs.writeFileSync(filepath, buffer);
}

async function testEndpoint(type) {
  const realImagePath = "C:/Users/vj700/.gemini/antigravity-ide/brain/f0ea8cb0-3d23-440b-b307-b363d849caf1/.user_uploaded/media_1786887491756.png";

  const form = new FormData();
  form.append('image', fs.createReadStream(realImagePath));
  form.append('analysisType', type);

  console.log(`\n--- Testing ${type.toUpperCase()} Analysis ---`);
  
  try {
    const response = await axios.post('http://localhost:5000/api/diagnosis', form, {
      headers: {
        ...form.getHeaders()
      }
    });
    
    console.log("Success:", response.data.success);
    console.log("Parsed Analysis Data:", JSON.stringify(response.data.analysis, null, 2));
    
  } catch (error) {
    console.error("Test failed:", error.response?.data || error.message);
  }
}

async function runTests() {
  await testEndpoint('plant');
  await testEndpoint('soil');
}

runTests();
