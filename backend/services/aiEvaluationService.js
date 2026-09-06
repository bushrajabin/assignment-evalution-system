const axios = require("axios");
const stringSimilarity = require("string-similarity");

/**
 * Unified AI evaluation entry point.
 * Returns: { score, feedback, mistakes: string[], raw }
 * `score` is on a 0-100 scale; the caller converts it to the assignment's maxMarks.
 */
async function evaluateSubmission({ question, expectedAnswer, studentAnswer, maxMarks }) {
  const provider = (process.env.AI_PROVIDER || "local").toLowerCase();

  if (!studentAnswer || !studentAnswer.trim()) {
    return {
      score: 0,
      feedback: "No answer content was found to evaluate. Please check the submission.",
      mistakes: ["No content submitted."],
      raw: null,
    };
  }

  try {
    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      return await evaluateWithOpenAI({ question, expectedAnswer, studentAnswer, maxMarks });
    }
    if (provider === "gemini" && process.env.GEMINI_API_KEY) {
      return await evaluateWithGemini({ question, expectedAnswer, studentAnswer, maxMarks });
    }
  } catch (err) {
    console.error(`AI provider "${provider}" failed, falling back to local evaluator:`, err.message);
  }

  return evaluateLocally({ question, expectedAnswer, studentAnswer });
}

function buildPrompt({ question, expectedAnswer, studentAnswer, maxMarks }) {
  return `You are a strict but fair teaching assistant grading a student's assignment.

Question:
${question}

Model / expected answer:
${expectedAnswer}

Student's submitted answer:
${studentAnswer}

Grade the student's answer against the model answer on a scale of 0 to 100 (100 = fully correct and complete).
Respond ONLY with a raw JSON object (no markdown fences, no extra text) in exactly this shape:
{
  "score": <integer 0-100>,
  "feedback": "<2-4 sentences of constructive overall feedback>",
  "mistakes": ["<specific mistake 1>", "<specific mistake 2>", "..."]
}
If the answer is fully correct, "mistakes" can be an empty array.`;
}

function safeParseJSON(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

async function evaluateWithOpenAI({ question, expectedAnswer, studentAnswer, maxMarks }) {
  const prompt = buildPrompt({ question, expectedAnswer, studentAnswer, maxMarks });

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const text = response.data.choices[0].message.content;
  const parsed = safeParseJSON(text);

  return {
    score: clampScore(parsed.score),
    feedback: parsed.feedback || "",
    mistakes: parsed.mistakes || [],
    raw: parsed,
  };
}

async function evaluateWithGemini({ question, expectedAnswer, studentAnswer, maxMarks }) {
  const prompt = buildPrompt({ question, expectedAnswer, studentAnswer, maxMarks });
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 },
    },
    { headers: { "Content-Type": "application/json" } }
  );

  const text = response.data.candidates[0].content.parts[0].text;
  const parsed = safeParseJSON(text);

  return {
    score: clampScore(parsed.score),
    feedback: parsed.feedback || "",
    mistakes: parsed.mistakes || [],
    raw: parsed,
  };
}

/**
 * Local, dependency-free fallback evaluator. Works out of the box with no API key.
 * Uses text similarity + keyword coverage to approximate a score, so the
 * system is fully demoable without any external AI account.
 */
function evaluateLocally({ question, expectedAnswer, studentAnswer }) {
  const similarity = stringSimilarity.compareTwoStrings(
    normalize(expectedAnswer),
    normalize(studentAnswer)
  );

  const expectedKeywords = extractKeywords(expectedAnswer);
  const studentNormalized = normalize(studentAnswer);
  const missingKeywords = expectedKeywords.filter(
    (kw) => !studentNormalized.includes(kw)
  );
  const coverage =
    expectedKeywords.length > 0
      ? (expectedKeywords.length - missingKeywords.length) / expectedKeywords.length
      : similarity;

  // Blend text similarity and keyword coverage.
  const blended = 0.5 * similarity + 0.5 * coverage;
  const score = Math.round(clampScore(blended * 100));

  const mistakes = [];
  if (missingKeywords.length > 0) {
    mistakes.push(
      `Missing or unaddressed key point(s): ${missingKeywords.slice(0, 6).join(", ")}`
    );
  }
  if (studentAnswer.trim().split(/\s+/).length < expectedAnswer.trim().split(/\s+/).length * 0.4) {
    mistakes.push("The answer looks significantly shorter than expected — some detail may be missing.");
  }
  if (mistakes.length === 0) {
    mistakes.push("No major issues detected by the automated check.");
  }

  const feedback =
    score >= 85
      ? "Strong answer that closely matches the expected solution. Well done."
      : score >= 60
      ? "Reasonable attempt, but some important points from the expected answer are missing or underdeveloped."
      : score >= 35
      ? "The answer only partially addresses the question. Review the expected solution's key points."
      : "The answer diverges significantly from the expected solution. Consider revisiting the core concepts.";

  return {
    score,
    feedback: `${feedback} (Scored using the built-in local evaluator — set AI_PROVIDER=openai or gemini in .env for LLM-based grading.)`,
    mistakes,
    raw: { similarity, coverage, missingKeywords },
  };
}

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "in", "on", "of", "to", "and",
  "or", "for", "with", "that", "this", "it", "as", "by", "be", "at", "from",
  "which", "can", "will", "has", "have", "not", "but", "if", "then", "so",
]);

function extractKeywords(text) {
  const words = normalize(text).split(" ").filter((w) => w.length > 3 && !STOPWORDS.has(w));
  return Array.from(new Set(words));
}

function clampScore(score) {
  const n = Number(score);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

module.exports = { evaluateSubmission };
