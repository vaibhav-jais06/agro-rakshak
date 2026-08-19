import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const PLANT_ANALYSIS_PROMPT = `Identify the disease in this plant. Output JSON only.
{
  "plant": "name of plant",
  "disease": "name of disease",
  "cause": "what causes this disease",
  "symptoms": "short description of symptoms",
  "severity": "Mild|Moderate|Severe",
  "treatment": "short treatment advice"
}
Output only the JSON. DO NOT THINK.`;

const SOIL_ANALYSIS_PROMPT = `Analyze the soil image. Output JSON only.
{
  "soilType": "Clay|Sandy|Loamy",
  "moisture": "Dry|Optimal|Wet",
  "issues": "short description of visible issues",
  "recommendation": "short advice"
}
Output only the JSON. DO NOT THINK.`;

function createFallbackResponse(errorMessage, analysisType) {
  return {
    imageType: analysisType === "soil" ? "soil" : "plant",
    plant: { identified: false, species: "Unable to identify", cropType: "Unknown", healthStatus: "Unable to assess", confidenceScore: 0 },
    diagnosis: { hasIssue: false, primaryIssue: "Analysis could not be completed", scientificName: "N/A", causativeAgent: "N/A", severity: "Unknown", affectedParts: [], symptoms: [], stage: "Unknown", confidence: 0 },
    soil: { analyzed: false, type: "Unknown", color: "Unable to assess", texture: "Unable to assess", moistureLevel: "Unknown", visibleIssues: [], healthScore: 0 },
    treatment: { urgency: "Unknown", immediateActions: ["Please retry the analysis or contact support"], organicTreatments: [], chemicalTreatments: [], supportiveMeasures: [] },
    prevention: { culturalPractices: [], preventiveSprays: [], environmentalManagement: [], resistantVarieties: [], monitoringTips: [] },
    recommendations: { nutrientManagement: { deficiencies: [], fertilizers: [], applicationRate: "N/A" }, irrigation: { currentAssessment: "Unknown", recommendation: "Needs manual assessment", frequency: "N/A" }, recovery: { expectedTimeline: "Unable to estimate", successIndicators: [], followUpActions: ["Retry analysis with clearer image"] }, expertConsultation: { needed: true, reason: errorMessage, urgency: "As needed" } },
    summary: "Analysis could not be completed. Please try again or contact support for assistance.",
  };
}

function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
}

function getMimeType(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };
  return mimeTypes[ext] || "image/jpeg";
}

export async function analyzeAgricultureImage(imagePath, analysisType = "auto") {
  try {
    if (!genAI) throw new Error("GEMINI_API_KEY is not set");
    if (!imagePath || !fs.existsSync(imagePath)) throw new Error("Invalid image path or file does not exist");

    const mimeType = getMimeType(imagePath);
    const base64Image = imageToBase64(imagePath);
    const systemPrompt = analysisType === "soil" ? SOIL_ANALYSIS_PROMPT : PLANT_ANALYSIS_PROMPT;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ]);

    const responseText = result.response.text();
    console.log("Raw AI Response:", responseText);

    let jsonResponse;
    try {
      let cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonStr = cleanedText.substring(firstBrace, lastBrace + 1);
        const shortJson = JSON.parse(jsonStr);
        if (analysisType === 'soil') {
          jsonResponse = { imageType: "soil", soil: { analyzed: true, type: shortJson.soilType || "Unknown", color: "Typical", texture: "Mixed", moistureLevel: shortJson.moisture || "Unknown", visibleIssues: [shortJson.issues || "None"], healthScore: 75 }, improvements: [{ action: "General Improvement", method: shortJson.recommendation || "Add organic compost", materials: ["Compost"], expectedOutcome: "Better soil health", timeline: "1 month" }], fertilization: { primaryNeeds: ["N","P","K"], organicOptions: ["Manure"], chemicalOptions: [], applicationRate: "Standard" }, summary: `Analyzed soil: ${shortJson.soilType || "Unknown"}. ${shortJson.recommendation || "Maintain care."}` };
        } else {
          const isHealthy = !shortJson.disease || shortJson.disease.toLowerCase() === "none" || shortJson.disease.toLowerCase().includes("healthy") || shortJson.disease.toLowerCase().includes("no disease");
          jsonResponse = { imageType: "plant", plant: { identified: true, species: shortJson.plant || "Unknown Plant", cropType: "Crop", healthStatus: isHealthy ? "Healthy" : "Diseased", confidenceScore: 90 }, diagnosis: { hasIssue: !isHealthy, primaryIssue: shortJson.disease || "No apparent issue", scientificName: "N/A", causativeAgent: shortJson.cause || "Unknown", severity: shortJson.severity || (isHealthy ? "None" : "Moderate"), affectedParts: ["Leaves"], symptoms: shortJson.symptoms ? [shortJson.symptoms] : ["Visual symptoms detected"], stage: "Progressive", confidence: 85 }, treatment: { urgency: shortJson.severity === "Severe" ? "High" : (isHealthy ? "Low" : "Medium"), immediateActions: [shortJson.treatment || (isHealthy ? "Continue normal care" : "Isolate affected plants")], organicTreatments: isHealthy ? [] : [{ name: "General Organic Spray", ingredients: ["Neem Oil", "Water"], preparation: "Mix 5ml per liter of water", application: "Foliar spray", dosage: "5ml/L", frequency: "Weekly", duration: "2 weeks" }], chemicalTreatments: [], supportiveMeasures: ["Ensure proper watering and sunlight"] }, prevention: { culturalPractices: ["Crop rotation", "Proper spacing"], preventiveSprays: [], environmentalManagement: ["Improve air circulation"], resistantVarieties: [], monitoringTips: ["Check leaves weekly"] }, recommendations: { nutrientManagement: { deficiencies: [], fertilizers: [], applicationRate: "" }, irrigation: { currentAssessment: "Normal", recommendation: "Maintain", frequency: "Regular" }, recovery: { expectedTimeline: "1-2 weeks", successIndicators: ["New healthy growth"], followUpActions: [] }, expertConsultation: { needed: false, reason: "", urgency: "" } }, summary: isHealthy ? `The ${shortJson.plant || "plant"} appears healthy. ${shortJson.treatment || "Keep up the good work."}` : `Detected ${shortJson.disease || "an issue"} on ${shortJson.plant || "the plant"}. ${shortJson.treatment || "Please monitor closely."}` };
        }
      } else {
        throw new Error("No JSON object found in response");
      }
    } catch (parseError) {
      throw new Error("Failed to extract JSON from AI response: " + parseError.message);
    }
    return { success: true, data: jsonResponse, metadata: { analysisType, timestamp: new Date().toISOString(), modelUsed: "gemini-1.5-flash", provider: "Google Gemini" } };
  } catch (error) {
    console.error("Error in analyzeAgricultureImage:", error);
    return { success: false, data: createFallbackResponse(error.message, analysisType), metadata: { analysisType, timestamp: new Date().toISOString(), modelUsed: "gemini-1.5-flash", provider: "Google Gemini", error: true, errorMessage: error.message } };
  }
}

export async function getSoilAnalysisFromGemini(data) {
  if (!data || !data.imagePath) throw new Error("Image path is required for soil analysis");
  return analyzeAgricultureImage(data.imagePath, "soil");
}

export async function analyzePlantHealth(imagePath) {
  return analyzeAgricultureImage(imagePath, "plant");
}

export async function batchAnalyzeImages(imagePaths, analysisType = "auto") {
  const results = [];
  for (const imagePath of imagePaths) {
    const result = await analyzeAgricultureImage(imagePath, analysisType);
    results.push({ imagePath, ...result });
  }
  return results;
}

export async function askVoiceAssistant(prompt) {
  if (!genAI) throw new Error("GEMINI_API_KEY is not set");
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", 
    systemInstruction: "You are an agricultural voice assistant. Respond clearly and concisely in a friendly manner. Provide practical advice for farmers in India. Do not use markdown, formatting, or <think> tags. Speak conversationally in a single response block." 
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
