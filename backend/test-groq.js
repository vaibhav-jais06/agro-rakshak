const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function main() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "hello" }],
      model: "llama-3.2-11b-vision-8192",
    });
    console.log(chatCompletion.choices[0]?.message?.content);
  } catch(e) {
    console.error(e);
  }
}
main();
