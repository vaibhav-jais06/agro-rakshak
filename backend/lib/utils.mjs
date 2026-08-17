import dotenv from "dotenv";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

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
    plant: {
      identified: false,
      species: "Unable to identify",
      cropType: "Unknown",
      healthStatus: "Unable to assess",
      confidenceScore: 0,
    },
    diagnosis: {
      hasIssue: false,
      primaryIssue: "Analysis could not be completed",
      scientificName: "N/A",
      causativeAgent: "N/A",
      severity: "Unknown",
      affectedParts: [],
      symptoms: [],
      stage: "Unknown",
      confidence: 0,
    },
    soil: {
      analyzed: false,
      type: "Unknown",
      color: "Unable to assess",
      texture: "Unable to assess",
      moistureLevel: "Unknown",
      visibleIssues: [],
      healthScore: 0,
    },
    treatment: {
      urgency: "Unknown",
      immediateActions: ["Please retry the analysis or contact support"],
      organicTreatments: [],
      chemicalTreatments: [],
      supportiveMeasures: [],
    },
    prevention: {
      culturalPractices: [],
      preventiveSprays: [],
      environmentalManagement: [],
      resistantVarieties: [],
      monitoringTips: [],
    },
    recommendations: {
      nutrientManagement: {
        deficiencies: [],
        fertilizers: [],
        applicationRate: "N/A",
      },
      irrigation: {
        currentAssessment: "Unknown",
        recommendation: "Needs manual assessment",
        frequency: "N/A",
      },
      recovery: {
        expectedTimeline: "Unable to estimate",
        successIndicators: [],
        followUpActions: ["Retry analysis with clearer image"],
      },
      expertConsultation: {
        needed: true,
        reason: errorMessage,
        urgency: "As needed",
      },
    },
    summary: "Analysis could not be completed. Please try again or contact support for assistance.",
  };
}

/**
 * Convert image file to base64 string for Groq API
 */
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
}

/**
 * Get MIME type based on file extension
 */
function getMimeType(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return mimeTypes[ext] || "image/jpeg";
}

export async function analyzeAgricultureImage(
  imagePath,
  analysisType = "auto",
) {
  try {
    if (!imagePath || !fs.existsSync(imagePath)) {
      throw new Error("Invalid image path or file does not exist");
    }

    const mimeType = getMimeType(imagePath);
    const base64Image = imageToBase64(imagePath);

    let systemPrompt;
    if (analysisType === "soil") {
      systemPrompt = SOIL_ANALYSIS_PROMPT;
    } else if (analysisType === "plant") {
      systemPrompt = PLANT_ANALYSIS_PROMPT;
    } else {
      systemPrompt = PLANT_ANALYSIS_PROMPT;
    }

    if (!groq) {
      throw new Error("GROQ_API_KEY is not set");
    }

    const parts = [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
      {
        text: systemPrompt,
      },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: systemPrompt,
            },
          ],
        }
      ],
      model: "qwen/qwen3.6-27b",
      temperature: 0.2,
      max_tokens: 4000,
      top_p: 1,
      stop: null,
      stream: false,
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";
    console.log("Raw AI Response:", responseText);
    const usedModel = "qwen/qwen3.6-27b";

    let jsonResponse;
    try {
      // Clean up reasoning blocks just in case it still tries
      let cleanedText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '');
      
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonStr = cleanedText.substring(firstBrace, lastBrace + 1);
        const shortJson = JSON.parse(jsonStr);
        
        if (analysisType === 'soil') {
          jsonResponse = {
            imageType: "soil",
            soil: {
              analyzed: true,
              type: shortJson.soilType || "Unknown",
              color: "Typical",
              texture: "Mixed",
              moistureLevel: shortJson.moisture || "Unknown",
              visibleIssues: [shortJson.issues || "None"],
              healthScore: 75
            },
            improvements: [{
              action: "General Improvement",
              method: shortJson.recommendation || "Add organic compost",
              materials: ["Compost"],
              expectedOutcome: "Better soil health",
              timeline: "1 month"
            }],
            fertilization: { primaryNeeds: ["N","P","K"], organicOptions: ["Manure"], chemicalOptions: [], applicationRate: "Standard" },
            summary: `Analyzed soil: ${shortJson.soilType || "Unknown"}. ${shortJson.recommendation || "Maintain care."}`
          };
        } else {
          const isHealthy = !shortJson.disease || shortJson.disease.toLowerCase() === "none" || shortJson.disease.toLowerCase().includes("healthy") || shortJson.disease.toLowerCase().includes("no disease");
          
          jsonResponse = {
            imageType: "plant",
            plant: {
              identified: true,
              species: shortJson.plant || "Unknown Plant",
              cropType: "Crop",
              healthStatus: isHealthy ? "Healthy" : "Diseased",
              confidenceScore: 90
            },
            diagnosis: {
              hasIssue: !isHealthy,
              primaryIssue: shortJson.disease || "No apparent issue",
              scientificName: "N/A",
              causativeAgent: shortJson.cause || "Unknown",
              severity: shortJson.severity || (isHealthy ? "None" : "Moderate"),
              affectedParts: ["Leaves"],
              symptoms: shortJson.symptoms ? [shortJson.symptoms] : ["Visual symptoms detected"],
              stage: "Progressive",
              confidence: 85
            },
            treatment: {
              urgency: shortJson.severity === "Severe" ? "High" : (isHealthy ? "Low" : "Medium"),
              immediateActions: [shortJson.treatment || (isHealthy ? "Continue normal care" : "Isolate affected plants")],
              organicTreatments: isHealthy ? [] : [{
                name: "General Organic Spray",
                ingredients: ["Neem Oil", "Water"],
                preparation: "Mix 5ml per liter of water",
                application: "Foliar spray",
                dosage: "5ml/L",
                frequency: "Weekly",
                duration: "2 weeks"
              }],
              chemicalTreatments: [],
              supportiveMeasures: ["Ensure proper watering and sunlight"]
            },
            prevention: {
              culturalPractices: ["Crop rotation", "Proper spacing"],
              preventiveSprays: [],
              environmentalManagement: ["Improve air circulation"],
              resistantVarieties: [],
              monitoringTips: ["Check leaves weekly"]
            },
            recommendations: {
              nutrientManagement: { deficiencies: [], fertilizers: [], applicationRate: "" },
              irrigation: { currentAssessment: "Normal", recommendation: "Maintain", frequency: "Regular" },
              recovery: { expectedTimeline: "1-2 weeks", successIndicators: ["New healthy growth"], followUpActions: [] },
              expertConsultation: { needed: false, reason: "", urgency: "" }
            },
            summary: isHealthy 
              ? `The ${shortJson.plant || "plant"} appears healthy. ${shortJson.treatment || "Keep up the good work."}`
              : `Detected ${shortJson.disease || "an issue"} on ${shortJson.plant || "the plant"}. ${shortJson.treatment || "Please monitor closely."}`
          };
        }
      } else {
        throw new Error("No JSON object found in response");
      }
    } catch (parseError) {
      throw new Error(
        "Failed to extract JSON from AI response: " + parseError.message + " | Raw: " + responseText.substring(0, 100)
      );
    }

    return {
      success: true,
      data: jsonResponse,
      metadata: {
        analysisType: analysisType,
        timestamp: new Date().toISOString(),
        modelUsed: usedModel || "qwen/qwen3.6-27b",
        provider: "Groq",
      },
    };
  } catch (error) {
    console.error("Error in analyzeAgricultureImage:", error);
    return {
      success: true,
      data: createFallbackResponse(error.message, analysisType),
      metadata: {
        analysisType: analysisType,
        timestamp: new Date().toISOString(),
        modelUsed: "qwen/qwen3.6-27b",
        provider: "Groq",
        error: true,
        errorMessage: error.message,
      },
    };
  }
}

export async function getSoilAnalysisFromGemini(data) {
  if (!data || !data.imagePath) {
    throw new Error("Image path is required for soil analysis");
  }
  return analyzeAgricultureImage(data.imagePath, "soil");
}

export async function analyzePlantHealth(imagePath) {
  return analyzeAgricultureImage(imagePath, "plant");
}

export async function batchAnalyzeImages(imagePaths, analysisType = "auto") {
  const results = [];
  for (const imagePath of imagePaths) {
    const result = await analyzeAgricultureImage(imagePath, analysisType);
    results.push({
      imagePath,
      ...result,
    });
  }
  return results;
}

export async function askVoiceAssistant(prompt) {
  if (!groq) {
    throw new Error("GROQ_API_KEY is not set");
  }
  
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are an agricultural voice assistant. Respond clearly and concisely in a friendly manner. Provide practical advice for farmers in India."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_completion_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "";
}

