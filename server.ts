import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header and apiKey
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "dummy_key",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI Carbon Footprint Analysis endpoint
app.post("/api/gemini/analyze", async (req, res) => {
  const { 
    currentEmissions, 
    location,
    habits,
    historyLength,
    dailyGoal 
  } = req.body;

  if (!currentEmissions) {
    return res.status(400).json({ error: "Missing current emissions data." });
  }

  // Define the local algorithmic fallback generator
  const getFallbackReport = () => {
    const total = currentEmissions.totalCO2;
    const goal = dailyGoal || 15.0;
    
    // 1. Calculate Grade
    let score = "Grade: B";
    if (total <= goal * 0.5) {
      score = "Grade: A+";
    } else if (total <= goal * 0.8) {
      score = "Grade: A";
    } else if (total <= goal * 1.0) {
      score = "Grade: B+";
    } else if (total <= goal * 1.3) {
      score = "Grade: C+";
    } else if (total <= goal * 1.6) {
      score = "Grade: D";
    } else {
      score = "Grade: F";
    }

    // 2. Identify the highest driver
    const parts = [
      { name: "Commuting", value: currentEmissions.commuteCO2, desc: "Transportation fuel usage and solo vehicle commutes." },
      { name: "Electricity", value: currentEmissions.electricityCO2, desc: "Domestic power draw and appliance standby consumption." },
      { name: "Diet", value: currentEmissions.dietCO2, desc: "Agricultural methane and logistics-heavy food systems." },
      { name: "Travel", value: currentEmissions.travelCO2, desc: "Radiative flight factors and hospitality/lodging energy." }
    ];
    parts.sort((a, b) => b.value - a.value);
    const primaryDriver = parts[0];
    const biggestDriver = `Primary influence: ${primaryDriver.name} (${primaryDriver.value.toFixed(1)} kg CO₂e/day), linked to ${primaryDriver.desc}`;

    // 3. Compile custom tips based on primary driver
    let tips: string[] = [];
    if (primaryDriver.name === "Commuting") {
      tips = [
        "Swap solo automobile transit for low-carbon active mobility (cycling, walking) or public passenger rail networks.",
        "Consolidate multiple errands into a single trip itinerary to minimize active vehicle kilometers.",
        "Check tire inflation and clear unnecessary cargo to elevate fuel economy by up to 10%."
      ];
    } else if (primaryDriver.name === "Electricity") {
      tips = [
        "Audit and unplug standby vampire devices, and configure smart certified power intervals.",
        "Slightly reduce ambient thermostat schedules by 1–2°C to secure immense thermal energy offsets.",
        "Transition domestic heavy loads (dishwashing, drying) to clean off-peak grid billing hours if supported."
      ];
    } else if (primaryDriver.name === "Diet") {
      tips = [
        "Adopt plant-centered protein alternatives on chosen days to cut intensive land and fertiliser overhead.",
        "Prioritize locally grown, seasonal food items to drastically curb storage and long-distance transport emissions.",
        "Enforce airtight ingredient storage and proactive portion control to bypass methane-forming wet waste scraps."
      ];
    } else if (primaryDriver.name === "Travel") {
      tips = [
        "Prioritize fuel-efficient direct flights over multi-layover transit paths when air travel is essential.",
        "Swap shorter continental flights with modern high-speed express trains to reduce radiative emissions over 80%.",
        "Select certified sustainable eco-resorts or green-certified local lodging properties."
      ];
    } else {
      tips = [
        "Slightly reduce thermostat schedules to secure thermal energy offsets.",
        "Swap vehicle transit for low-carbon public express systems where feasible.",
        "Incorporate select plant-based dishes into your schedule to curb methane overhead."
      ];
    }

    // 4. Regional insight
    const safeLocation = location || {
      name: "your region",
      gridIntensityGCO2: 350,
      co2PerDayPerCapita: 20.0
    };
    const gridIntensity = safeLocation.gridIntensityGCO2 || 350;
    const capitaAvg = safeLocation.co2PerDayPerCapita || 20.0;
    const gridContext = gridIntensity > 400 
      ? "fossil-dependent power generation, highlighting the high offset value of passive lifestyle choices" 
      : "comparatively low carbon intensity, allowing transportation and dietary shifts to yield the greatest savings";

    const regionalInsight = `In ${safeLocation.name || "your region"}, the local grid load operates at a factor of ${gridIntensity} g CO₂/kWh, corresponding to a regional capita target of ${capitaAvg} kg/day. This local grid utilizes ${gridContext}.`;

    return {
      score,
      biggestDriver,
      tips,
      regionalInsight
    };
  };

  try {
    const prompt = `
You are an expert AI Environmental Scientist and carbon footprint reduction coach. Analyze the user's real-time daily carbon footprint data, regional context, and sustainable active habits to compile personalized mitigation guidance.

User Daily Footprint Breakdown (kg CO2e / day):
- Commuting: ${currentEmissions.commuteCO2.toFixed(2)} kg CO2e
- Electricity: ${currentEmissions.electricityCO2.toFixed(2)} kg CO2e
- Diet: ${currentEmissions.dietCO2.toFixed(2)} kg CO2e
- Travel (Annual amortized + monthly): ${currentEmissions.travelCO2.toFixed(2)} kg CO2e
- Total Footprint: ${currentEmissions.totalCO2.toFixed(2)} kg CO2e
- Daily Limit Target Budget: ${dailyGoal.toFixed(1)} kg CO2e

User Selected Location & Context:
- Name: ${location.name}
- Country: ${location.country}
- Regional average footprint per day per capita: ${location.co2PerDayPerCapita} kg
- Regional electricity grid intensity: ${location.gridIntensityGCO2} g CO2/kWh
- Location Specific Note: ${location.locationNote}

Currently Active Sustainable Habits that the user completed:
${habits.filter((h: any) => h.completed).map((h: any) => `- ${h.title} (saves ${h.co2SavedKg}kg/day)`).join('\n') || 'None'}

Please provide a highly detailed response in JSON format. Provide standard grades (A+ to F), extract the most critical carbon driver immediately, compile 3 actionable and specific tips based on their data (no generic tips like "turn off lights" unless electricity is indeed very high), and provide a location-specific regional grid insight tailored to their city grid intensity and note. Ensure the output conforms EXACTLY to the requested JSON response schema.
`;

    // Check if key is available, fallback if not
    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY environment variable. Invoking high-fidelity algorithmic analyzer...");
      return res.json(getFallbackReport());
    }

    const ai = getAiClient();
    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { 
            type: Type.STRING, 
            description: "A letter grade from A+ (excellent, very low carbon) to F (heavy emissions), e.g. Grade: B+"
          },
          biggestDriver: { 
            type: Type.STRING, 
            description: "A clear 1-sentence identification of the user's primary carbon emission driver." 
          },
          tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Three highly personalized, actionable sustainability lifestyle changes."
          },
          regionalInsight: { 
            type: Type.STRING, 
            description: "A 2-sentence analytical, tailored insight about the user's current city, its electricity fuel grid, or local options." 
          }
        },
        required: ["score", "biggestDriver", "tips", "regionalInsight"]
      }
    };
    
    // Cascade: 1. gemini-2.5-flash, 2. gemini-2.5-pro, 3. gemini-2.0-flash
    const models = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];
    let responseText = "";
    let success = false;

    for (const model of models) {
      try {
        console.log(`Analyzing footprint using cascade model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config
        });
        if (response && response.text) {
          responseText = response.text.trim();
          success = true;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} failed in cascade:`, err.message || err);
      }
    }

    if (success && responseText) {
      const data = JSON.parse(responseText);
      res.json(data);
    } else {
      console.log("All cascade models failed or returned empty content. Invoking high-fidelity algorithmic analyzer...");
      res.json(getFallbackReport());
    }

  } catch (error: any) {
    console.error("Gemini analysis failed during execution:", error);
    try {
      res.json(getFallbackReport());
    } catch (fallbackError) {
      res.status(500).json({ 
        error: "AI Advisor analysis failed completely.", 
        details: error.message || error 
      });
    }
  }
});

// AI Chatbot endpoint
app.post("/api/gemini/chat", async (req, res) => {
  const { message, history, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing message parameter." });
  }

  // Get generic chatbot fallback response based on message context
  const getFallbackChatResponse = () => {
    const textLower = message.toLowerCase();
    let reply = "";

    if (textLower.includes("commuting") || textLower.includes("transport") || textLower.includes("car") || textLower.includes("drive") || textLower.includes("bike") || textLower.includes("flight") || textLower.includes("travel")) {
      reply = "That is a brilliant transport/travel query! Moving your transit runs away from traditional internal combustion engines yields rapid carbon dividends. Consolidating long distance itineraries, switching to active transport options (such as cycles and electric scooters), or selecting passenger rail reduces transport footprint factors immensely (often over 80% compared to solo driving).";
    } else if (textLower.includes("diet") || textLower.includes("food") || textLower.includes("vegan") || textLower.includes("meat") || textLower.includes("waste")) {
      reply = "Diet and plant-forward nutrition are fantastic leverage centers! Plant proteins bypass intensive land dependencies and heavy commercial fertilizers. Transitioning to local, seasonal foods also limits sub-freezing supply chain travel, while sorting wet inputs blocks highly potent landfill methane generation.";
    } else if (textLower.includes("electric") || textLower.includes("power") || textLower.includes("grid") || textLower.includes("heat") || textLower.includes("cooling")) {
      reply = "Domestic grids and power usage are vital core pillars. Optimizing your standby vampire loads, lowering baseline heat profiles by 1-2 degrees, and syncing heavy device use with local green off-peak hours cuts electricity emissions significantly depending on local coal dependency.";
    } else if (textLower.includes("berlin") || textLower.includes("paris") || textLower.includes("london") || textLower.includes("tokyo") || textLower.includes("location") || textLower.includes("region")) {
      const locName = context?.location?.name || "your region";
      const gLoad = context?.location?.gridIntensityGCO2 || 350;
      reply = `In ${locName}, energy and grid efficiency metrics are tightly bound to transport and housing. With a local grid load around ${gLoad} g CO₂/kWh, shifting away from heavy power operations during peak fuel draw periods has high leverage. Focusing on active everyday habits provides highly practical daily momentum!`;
    } else {
      reply = `Thank you for sharing your thoughts on sustainability! Selecting active micromobility, prioritizing plants, tracking domestic heating, relative grid parameters, and carbon off-setting are essential steps. Let me know if you would like me to detail transport alternatives, diet breakdowns, or home power vampire savings steps.`;
    }

    if (!process.env.GEMINI_API_KEY) {
      reply += "\n\n(Note: Set up your GEMINI_API_KEY in the Secrets panel of Google AI Studio to unlock live real-time LLM suggestions!)";
    } else {
      reply += "\n\n(Note: Operating in resilient high-fidelity fallback mode due to transient model load levels.)";
    }

    return { reply };
  };

  try {
    // compile a quick context explanation
    const contextPrompt = (context && context.currentEmissions && context.location)
      ? `User Active context:
- Spoots emissions: Commute (${(context.currentEmissions.commuteCO2 || 0).toFixed(1)}kg/day), Electricity (${(context.currentEmissions.electricityCO2 || 0).toFixed(1)}kg/day), Diet (${(context.currentEmissions.dietCO2 || 0).toFixed(1)}kg/day), Travel (${(context.currentEmissions.travelCO2 || 0).toFixed(1)}kg/day).
- Active region: ${context.location.name || "your region"} (${context.location.country || "anywhere"}) with ${context.location.co2PerDayPerCapita || 20.0}kg daily capita emission, grid load ${context.location.gridIntensityGCO2 || 350}g CO2/kWh.
` 
      : "";

    const systemInstruction = `
You are a safe, friendly, humble, and expert AI Environmental Scientist and sustainability coach. Answer user's environmental inquiries related to carbon footprint calculations, greenhouse gas indicators, carbon sequestration, vegan/vegetarian diet comparisons, electrical grid factors, active transit (biking, trains, subways), aviation, hotel emissions, and lifestyle tips. Be objective, supportive, and avoid excessively complex formatting. Use the following context details if relevant to make your advice hyper-focused.
${contextPrompt}
`;

    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found. Invoking high-fidelity smart fallback chatbot...");
      return res.json(getFallbackChatResponse());
    }

    const ai = getAiClient();
    
    const historyChain = history 
      ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.parts[0].text}`).join('\n')
      : "";

    const prompt = `
${historyChain}
User: ${message}
Assistant:
`;

    // Cascade: 1. gemini-2.5-flash, 2. gemini-2.5-pro, 3. gemini-2.0-flash
    const models = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];
    let responseText = "";
    let success = false;

    for (const model of models) {
      try {
        console.log(`Chatting using cascade model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
          }
        });
        if (response && response.text) {
          responseText = response.text;
          success = true;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} failed in chat cascade:`, err.message || err);
      }
    }

    if (success && responseText) {
      res.json({ reply: responseText });
    } else {
      console.log("All cascade models failed or returned empty content. Invoking high-fidelity smart fallback chatbot...");
      res.json(getFallbackChatResponse());
    }

  } catch (error: any) {
    console.error("Gemini chatbot failed during execution:", error);
    try {
      res.json(getFallbackChatResponse());
    } catch (fallbackError) {
      res.status(500).json({ 
        error: "AI Chat failed completely.", 
        details: error.message || error 
      });
    }
  }
});

// Setup Vite or static serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
