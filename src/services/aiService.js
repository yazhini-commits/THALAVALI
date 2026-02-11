import { templates } from "../utils/templates";
import { postProcess } from "../utils/postProcessor";
import { validateContent } from "../utils/validator";
import { trackGeneration } from "../utils/usageTracker";
import {
  saveChatMessage,
  updateChatTitle,
  createChatIfNotExists,
} from "../utils/historyStorage";

function buildVariationPrompt(basePrompt) {
  return `
Generate THREE DISTINCT VARIATIONS of the following content.

Rules:
- Same topic & intent
- Different structure, phrasing, and creativity
- Equal length
- Clearly separate as:
=== VARIATION A ===
=== VARIATION B ===
=== VARIATION C ===

Content:
${basePrompt}
`;
}

function getFeedback() {
  try {
    return JSON.parse(localStorage.getItem("ai_feedback")) || {};
  } catch {
    return {};
  }
}

/* ================= GET USER PROFILE ================= */
function getProfile() {
  try {
    const stored = localStorage.getItem("userProfile");

    if (!stored) {
      return {
        tone: "Professional",
        industry: "",
        style: "",
        language: "English",
      };
    }

    const parsed = JSON.parse(stored);

    return {
      tone: parsed.tone || "Professional",
      industry: parsed.industry || "",
      style: parsed.style || "",
      language: parsed.language || "English",
    };
  } catch {
    return {
      tone: "Professional",
      industry: "",
      style: "",
      language: "English",
    };
  }
}


/* ================= PROMPT BUILDER ================= */
function buildPrompt(type, data, profile) {
  const template = templates[type];
  if (!template) return data.topic;

  let prompt = template.structure;

  const mergedData = {
  topic: data.topic,
  tone: data.tone || profile.tone || "Professional",
  audience: data.audience || profile.industry || "General audience",
  keywords: data.keywords || "",
  length: data.length || "Medium",
  writingStyle: profile.style || "Neutral",
};


  Object.keys(mergedData).forEach((key) => {
    prompt = prompt.replaceAll(`{{${key}}}`, mergedData[key] || "N/A");
  });

  const personalizationBlock = `
User Preferences:
- Default Tone: ${profile.tone || "Professional"}
- Industry: ${profile.industry || "General"}
- Writing Style: ${profile.style || "Neutral"}

LANGUAGE INSTRUCTION:
The user will always type in English.
You MUST generate the FINAL RESPONSE completely in ${profile.language}.
Do NOT translate line by line.
Do NOT show both languages.
Return ONLY the final content in ${profile.language}.
`;


  return `${template.system}\n${personalizationBlock}\n${prompt}`;
}

async function callOpenAI(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional AI content assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!res.ok) throw new Error("OpenAI failed");
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!res.ok) throw new Error("Gemini failed");
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callMistral(prompt) {
  const res = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!res.ok) throw new Error("HuggingFace failed");
  const data = await res.json();
  return data?.[0]?.generated_text || "";
}
async function generateWithFallback(prompt, preferredModel) {
  const order =
    preferredModel === "gpt-3.4"
      ? ["openai", "gemini", "mistral"]
      : preferredModel === "flash-2.5"
      ? ["gemini", "openai", "mistral"]
      : ["mistral", "openai", "gemini"];

  for (const model of order) {
    try {
      if (model === "openai") return await callOpenAI(prompt);
      if (model === "gemini") return await callGemini(prompt);
      if (model === "mistral") return await callMistral(prompt);
    } catch (err) {
      console.warn(`${model} failed. Trying fallback...`);
    }
  }

  throw new Error("All AI providers failed");
}

export async function generateGeneralBulk({
  lines,
  model,
}) {
  const results = [];

  for (const line of lines) {
    const detectedType = detectContentType(line);

    const res = await generateContent({
      chatId: null,
      type: detectedType,
      topic: line,
      model,
    });

    results.push({
      original: line,
      type: detectedType,
      content: res.content,
    });
  }

  return results;
}

/* ================= GENERATE CONTENT ================= */
export async function generateContent({
  chatId,
  type,
  topic,
  tone = "",
  audience = "",
  keywords = "",
  length = "",
  model,
  selectedTemplate = null,
  variationMode = false,
  lockedVariationHint = "",
  manualPrompt = null, // ⭐ NEW (Prompt Panel Edited Prompt)
})

 {

  try {
    const profile = getProfile();
    const feedback = getFeedback();

const feedbackHint =
  feedback[type] === "down"
    ? `
Avoid repeating the previous writing style.
Improve clarity, structure, and engagement.
Use a different tone approach while keeping it professional.
`
    : `
Continue with a similar tone and structure that the user prefers.
`;

    /* ================= ENSURE CHAT EXISTS ================= */
const activeChatId = chatId || createChatIfNotExists(null, topic);



    /* ================= BUILD FINAL PROMPT ================= */
    let basePrompt;

if (selectedTemplate) {
  basePrompt = `
Use the following WRITING TEMPLATE STRICTLY while generating the content.
Follow its structure and placeholders carefully.

TEMPLATE:
${selectedTemplate}

USER INPUT:
${topic}

Preferences:
Tone: ${tone || profile.defaultTone || "Professional"}
Audience: ${audience || profile.industry || "General audience"}
Keywords: ${keywords || "None"}
Length: ${length || "Medium"}
`;
} else {
  basePrompt = buildPrompt(
    type,
    { topic, tone, audience, keywords, length },
    profile
  );
}


let finalPrompt;

// ⭐ If user edited prompt in Prompt Panel → FULL CONTROL
if (manualPrompt && manualPrompt.trim().length > 10) {
  finalPrompt = manualPrompt;
} else {
  finalPrompt = `
${feedbackHint}
${lockedVariationHint}
${basePrompt}
`;
}


if (variationMode) {
  finalPrompt = buildVariationPrompt(finalPrompt);
}

/* ================= FORCE OUTPUT LANGUAGE ================= */
finalPrompt += `

FINAL OUTPUT RULE:
Write the response entirely in ${profile.language}.
Do not include English unless the selected language is English.
`;


    /* ================= SAVE USER MESSAGE (WITH META 🔥) ================= */
    saveChatMessage({
  chatId: activeChatId,
  role: "user",
  content: topic,
meta: {
  type,
  tone,
  audience,
  keywords,
  length,
  edited: !!manualPrompt
},


    });

/* ================= AI PROVIDER CALLS ================= */
const rawContent = await generateWithFallback(finalPrompt, model);


if (!rawContent.trim()) {
  throw new Error("Empty AI response");
}

    /* ================= POST PROCESS ================= */
    const content = postProcess(type, rawContent);
    

    const issues = validateContent(type, content);

    /* ================= SAVE AI MESSAGE ================= */
    saveChatMessage({
      chatId: activeChatId,
      role: "assistant",
      content,
    });

    /* ================= UPDATE PROFILE HEATMAP ================= */
trackGeneration(type);

    /* ================= UPDATE CHAT TITLE (ONCE) ================= */
    if (!chatId) {
  updateChatTitle(activeChatId, topic);
}

    return {
      content,
      issues,
      chatId: activeChatId,
    };
  } catch (error) {
    console.error("AI generation error:", error);

    return {
      content:
        "❌ Unable to generate content right now. Please ensure the AI model is running and try again.",
      issues: ["AI generation failed"],
      chatId,
    };
  }
}
