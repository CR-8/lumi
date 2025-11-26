import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GeminiAnalysis {
  uiType: string;
  designSystem: string;
  industryPrediction: string[];
  overallQuality: number;
  wcagComplianceScore: number;
  contrastScore: number;
  cognitiveLoad: {
    level: string;
    score: number;
    reason: string;
  };
  layoutStructure: {
    gridSystem: string;
    alignmentScore: number;
    whitespaceScore: number;
    consistencyScore: number;
    layoutIssues: string[];
  };
  visualAttentionFlow: string[];
  interactionClarity: {
    score: number;
    issues: string[];
  };
  mobileFriendliness: {
    score: number;
    issues: string[];
  };
  typographyAnalysis: {
    fontStyle: string;
    readabilityScore: number;
    issues: string[];
  };
  colorSchemeAnalysis: {
    effectiveness: string;
    issues: string[];
  };
  colorPalette: {
    primary: string[];
    secondary: string[];
    accent: string[];
    text: string[];
    background: string[];
  };
  componentAnalysis: Array<{
    component: string;
    issues: string[];
    wcagViolation: string;
    suggestion: string;
  }>;
  accessibilityIssues: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  targetAudienceMatch: string;
  summary: {
    verdict: string;
    top3Problems: string[];
    top3Fixes: string[];
  };
  emotionalTone: {
    feel: string;
    rating: number;
  };
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        const waitTime = initialDelay * Math.pow(2, i);
        console.log(
          `Error occurred. Retry ${i + 1}/${maxRetries} after ${waitTime}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      throw error;
    }
  }

  throw lastError!;
}

/**
 * Clean and extract JSON from text response
 */
function extractJSON(text: string): string {
  // Check if text is empty or invalid
  if (!text || text.trim().length === 0) {
    console.error("JSON extraction failed: Empty response from API");
    throw new Error("Empty response from Gemini API");
  }

  // Remove markdown code blocks
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

  // Try to find JSON object or array
  const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error(
      "JSON extraction failed. Response text:",
      text.substring(0, 500)
    );
    throw new Error("No valid JSON found in response");
  }

  const jsonStr = jsonMatch[0].trim();

  // Sanitize JSON to escape control characters in strings
  const sanitized = sanitizeJSON(jsonStr);

  // Validate it's parseable
  try {
    JSON.parse(sanitized);
    return sanitized;
  } catch (e) {
    console.error("JSON parse validation failed:", e);
    throw new Error(`Invalid JSON structure: ${e}`);
  }
}

/**
 * Sanitize JSON string by escaping control characters in string literals
 */
function sanitizeJSON(jsonStr: string): string {
  // Replace unescaped control characters in strings with escaped versions
  return jsonStr.replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
    return match.replace(/[\n\r\t]/g, (char) => {
      switch (char) {
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\t":
          return "\\t";
        default:
          return char;
      }
    });
  });
}

function validateAnalysis(data: Record<string, unknown>): GeminiAnalysis {
  // Set defaults for missing fields
  if (!Array.isArray(data.industryPrediction)) data.industryPrediction = [];
  if (!Array.isArray(data.strengths)) data.strengths = [];
  if (!Array.isArray(data.weaknesses)) data.weaknesses = [];
  if (!Array.isArray(data.accessibilityIssues)) data.accessibilityIssues = [];
  if (!Array.isArray(data.recommendations)) data.recommendations = [];
  if (!Array.isArray(data.visualAttentionFlow)) data.visualAttentionFlow = [];
  if (!Array.isArray(data.componentAnalysis)) data.componentAnalysis = [];

  // Validate and set defaults for scores
  if (
    typeof data.overallQuality !== "number" ||
    data.overallQuality < 0 ||
    data.overallQuality > 100
  ) {
    data.overallQuality = 50;
  }
  if (
    typeof data.contrastScore !== "number" ||
    data.contrastScore < 0 ||
    data.contrastScore > 100
  ) {
    data.contrastScore = 50;
  }
  if (
    typeof data.wcagComplianceScore !== "number" ||
    data.wcagComplianceScore < 0 ||
    data.wcagComplianceScore > 100
  ) {
    data.wcagComplianceScore = 50;
  }

  // Validate nested objects
  if (typeof data.cognitiveLoad !== "object" || data.cognitiveLoad === null) {
    data.cognitiveLoad = {
      level: "Unknown",
      score: 50,
      reason: "Not analyzed",
    };
  }
  if (
    typeof data.layoutStructure !== "object" ||
    data.layoutStructure === null
  ) {
    data.layoutStructure = {
      gridSystem: "Unknown",
      alignmentScore: 50,
      whitespaceScore: 50,
      consistencyScore: 50,
      layoutIssues: [],
    };
  }
  if (
    typeof data.interactionClarity !== "object" ||
    data.interactionClarity === null
  ) {
    data.interactionClarity = { score: 50, issues: [] };
  }
  if (
    typeof data.mobileFriendliness !== "object" ||
    data.mobileFriendliness === null
  ) {
    data.mobileFriendliness = { score: 50, issues: [] };
  }
  if (
    typeof data.typographyAnalysis !== "object" ||
    data.typographyAnalysis === null
  ) {
    data.typographyAnalysis = {
      fontStyle: "Unknown",
      readabilityScore: 50,
      issues: [],
    };
  }
  if (
    typeof data.colorSchemeAnalysis !== "object" ||
    data.colorSchemeAnalysis === null
  ) {
    data.colorSchemeAnalysis = { effectiveness: "Not analyzed", issues: [] };
  }
  if (typeof data.colorPalette !== "object" || data.colorPalette === null) {
    data.colorPalette = {
      primary: [],
      secondary: [],
      accent: [],
      text: [],
      background: [],
    };
  }
  if (typeof data.summary !== "object" || data.summary === null) {
    data.summary = { verdict: "Not analyzed", top3Problems: [], top3Fixes: [] };
  }
  if (typeof data.emotionalTone !== "object" || data.emotionalTone === null) {
    data.emotionalTone = { feel: "Neutral", rating: 50 };
  }

  return data as unknown as GeminiAnalysis;
}

/**
 * Analyze UI image using Google Gemini Vision API with rate limiting
 */
export async function analyzeUIWithGemini(
  imageBuffer: Buffer
): Promise<GeminiAnalysis> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    const prompt = `
You are a senior UI/UX expert, accessibility auditor, and design systems analyst.

Analyze the provided UI screenshot in detail and return a STRICTLY VALID JSON response in the structure below.
Do not use markdown. Do not add explanations outside JSON. Do not include any extra text.

Your analysis must be visually inferred ONLY from the screenshot.

{
  "uiType": "",
  "designSystem": "",
  "industryPrediction": [],

  "overallQuality": 0,
  "wcagComplianceScore": 0,
  "contrastScore": 0,

  "cognitiveLoad": {
    "level": "",
    "score": 0,
    "reason": ""
  },

  "layoutStructure": {
    "gridSystem": "",
    "alignmentScore": 0,
    "whitespaceScore": 0,
    "consistencyScore": 0,
    "layoutIssues": []
  },

  "visualAttentionFlow": [],
  
  "interactionClarity": {
    "score": 0,
    "issues": []
  },

  "mobileFriendliness": {
    "score": 0,
    "issues": []
  },

  "typographyAnalysis": {
    "fontStyle": "",
    "readabilityScore": 0,
    "issues": []
  },

  "colorSchemeAnalysis": {
    "effectiveness": "",
    "issues": []
  },

  "colorPalette": {
    "primary": [],
    "secondary": [],
    "accent": [],
    "text": [],
    "background": []
  },

  "componentAnalysis": [
    {
      "component": "",
      "issues": [],
      "wcagViolation": "",
      "suggestion": ""
    }
  ],

  "accessibilityIssues": [],
  "strengths": [],
  "weaknesses": [],
  
  "recommendations": [],

  "targetAudienceMatch": "",

  "summary": {
    "verdict": "",
    "top3Problems": [],
    "top3Fixes": []
  },

  "emotionalTone": {
    "feel": "",
    "rating": 0
  }
}

IMPORTANT INSTRUCTIONS:
- Extract exact HEX color values found in the UI image and place them in the colorPalette
- Evaluate WCAG 2.1 AA compliance (text contrast, focus states, touch targets, hierarchy)
- Predict attention flow based on layout
- Detect contrast failures and give approximate contrastScore (0-100)
- Detect typography style and readability issues
- Detect spacing/alignment problems
- Evaluate mobile responsiveness visually
- Clearly point out interactive element problems (buttons, links, states)
- Scores must be realistic and consistent with visible issues
- overallQuality must be based on a weighted average of: contrast, layout, accessibility, typography, and UX clarity
- All fields must be filled with meaningful data
- Return ONLY valid JSON, ready for parsing
`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/png",
      },
    };

    // Retry with exponential backoff
    const result = await retryWithBackoff(
      async () => {
        return await model.generateContent([prompt, imagePart]);
      },
      3,
      2000
    );

    const response = result.response;
    const text = response.text();
    // Check if response is valid
    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini API");
    }

    const jsonString = extractJSON(text);
    const parsedData = JSON.parse(jsonString);
    const analysis = validateAnalysis(parsedData);

    console.log("Parsed Gemini analysis:", analysis);

    return analysis;
  } catch (error: unknown) {
    console.error("Gemini analysis error:", error);

    // Check if it's still a rate limit error after retries
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      (error as { status: number }).status === 429
    ) {
      return {
        uiType: "Rate Limit Exceeded",
        designSystem: "Unable to analyze",
        industryPrediction: [],
        overallQuality: 0,
        wcagComplianceScore: 0,
        contrastScore: 0,
        cognitiveLoad: {
          level: "Unknown",
          score: 0,
          reason: "API rate limit exceeded",
        },
        layoutStructure: {
          gridSystem: "Unknown",
          alignmentScore: 0,
          whitespaceScore: 0,
          consistencyScore: 0,
          layoutIssues: ["Unable to analyze due to rate limits"],
        },
        visualAttentionFlow: [],
        interactionClarity: { score: 0, issues: ["API rate limit exceeded"] },
        mobileFriendliness: {
          score: 0,
          issues: ["Unable to analyze due to rate limits"],
        },
        typographyAnalysis: {
          fontStyle: "Unknown",
          readabilityScore: 0,
          issues: ["Unable to analyze due to rate limits"],
        },
        colorSchemeAnalysis: {
          effectiveness: "Unable to analyze due to rate limits",
          issues: ["API quota exceeded"],
        },
        colorPalette: {
          primary: [],
          secondary: [],
          accent: [],
          text: [],
          background: [],
        },
        componentAnalysis: [],
        accessibilityIssues: [
          "API quota exceeded - unable to perform analysis",
        ],
        strengths: ["Analysis temporarily unavailable due to API rate limits"],
        weaknesses: ["Please try again in a few minutes"],
        recommendations: [
          "Wait 60 seconds before analyzing another image",
          "Consider upgrading to Gemini API paid tier for higher limits",
          "Reduce analysis frequency",
          "Use batch processing with delays between requests",
          "Monitor usage at https://ai.dev/usage",
        ],
        targetAudienceMatch: "Unable to determine due to rate limits",
        summary: {
          verdict: "Analysis unavailable due to API rate limits",
          top3Problems: ["API quota exceeded"],
          top3Fixes: [
            "Wait and try again",
            "Check API quota",
            "Upgrade API tier",
          ],
        },
        emotionalTone: { feel: "Unavailable", rating: 0 },
      };
    }

    // Generic fallback
    return {
      uiType: "Unknown",
      designSystem: "Custom",
      industryPrediction: [],
      overallQuality: 50,
      wcagComplianceScore: 50,
      contrastScore: 50,
      cognitiveLoad: {
        level: "Medium",
        score: 50,
        reason: "Unable to analyze due to processing error",
      },
      layoutStructure: {
        gridSystem: "Unknown",
        alignmentScore: 50,
        whitespaceScore: 50,
        consistencyScore: 50,
        layoutIssues: ["Unable to analyze due to processing error"],
      },
      visualAttentionFlow: [],
      interactionClarity: {
        score: 50,
        issues: ["Unable to analyze due to processing error"],
      },
      mobileFriendliness: {
        score: 50,
        issues: ["Unable to analyze due to processing error"],
      },
      typographyAnalysis: {
        fontStyle: "Unknown",
        readabilityScore: 50,
        issues: ["Unable to analyze due to processing error"],
      },
      colorSchemeAnalysis: {
        effectiveness: "Unable to analyze due to processing error",
        issues: ["Processing error occurred"],
      },
      colorPalette: {
        primary: [],
        secondary: [],
        accent: [],
        text: [],
        background: [],
      },
      componentAnalysis: [],
      accessibilityIssues: ["Unable to perform automated analysis"],
      strengths: ["Modern appearance", "Functional layout"],
      weaknesses: ["AI analysis unavailable", "Manual review recommended"],
      recommendations: [
        "Perform manual accessibility audit",
        "Test with screen readers (NVDA, JAWS)",
        "Verify color contrast ratios manually",
        "Check keyboard navigation",
        "Validate WCAG 2.1 AA compliance",
      ],
      targetAudienceMatch: "General audience - manual evaluation needed",
      summary: {
        verdict: "Unable to analyze due to processing error",
        top3Problems: ["AI analysis failed"],
        top3Fixes: [
          "Perform manual review",
          "Test with users",
          "Use WCAG tools",
        ],
      },
      emotionalTone: { feel: "Neutral", rating: 50 },
    };
  }
}

/**
 * Get design system recommendations with rate limiting
 */
export async function getDesignSystemRecommendations(
  imageBuffer: Buffer
): Promise<{ name: string; confidence: number; reasoning: string }[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `Analyze this UI and identify design systems. Return ONLY JSON array:

[{"name": "system name", "confidence": 0-100, "reasoning": "why"}]

Consider: Material Design, iOS, Fluent, Tailwind, Ant Design, Bootstrap, Custom.`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/png",
      },
    };

    const result = await retryWithBackoff(async () => {
      return await model.generateContent([prompt, imagePart]);
    });

    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini API");
    }

    const jsonString = extractJSON(text);
    const recommendations = JSON.parse(jsonString);

    if (!Array.isArray(recommendations)) {
      throw new Error("Response is not an array");
    }

    return recommendations;
  } catch (error) {
    console.error("Design system recommendation error:", error);
    return [
      {
        name: "Custom",
        confidence: 50,
        reasoning: "Unable to detect - rate limit or processing error",
      },
    ];
  }
}

/**
 * Extract text with rate limiting
 */
export async function extractTextWithGemini(imageBuffer: Buffer): Promise<{
  text: string;
  words: Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
  }>;
}> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    });

    const prompt = `Extract all visible text from this UI screenshot. You MUST return ONLY a valid JSON object with this exact structure:

{
  "text": "concatenated string of all text found",
  "words": [
    {"text": "individual word or phrase", "estimatedSize": "16", "position": "top left"}
  ]
}

Rules:
- Return ONLY the JSON object, no explanations or markdown
- If no text is found, return {"text": "", "words": []}
- estimatedSize should be a number string (e.g., "14", "16", "20")
- position should combine vertical (top/middle/bottom) and horizontal (left/center/right)`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/png",
      },
    };

    const result = await retryWithBackoff(async () => {
      return await model.generateContent([prompt, imagePart]);
    });

    const response = result.response;
    const text = response.text();
    const jsonString = extractJSON(text);
    const data = JSON.parse(jsonString) as {
      text?: string;
      words?: Array<{ text: string; estimatedSize: string; position?: string }>;
    };

    const words = (data.words || []).map((word) => {
      const size = parseInt(word.estimatedSize) || 16;
      let baseX = 400,
        baseY = 400;

      if (word.position?.includes("left")) baseX = 100;
      if (word.position?.includes("right")) baseX = 700;
      if (word.position?.includes("top")) baseY = 100;
      if (word.position?.includes("bottom")) baseY = 700;

      return {
        text: word.text,
        bbox: {
          x0: baseX,
          y0: baseY,
          x1: baseX + word.text.length * size * 0.6,
          y1: baseY + size,
        },
        confidence: 85,
      };
    });

    return { text: data.text || "", words };
  } catch (error) {
    console.error("Gemini text extraction error:", error);
    return { text: "", words: [] };
  }
}

/**
 * Get accessibility recommendations with rate limiting
 */
export async function getAccessibilityRecommendations(
  imageBuffer: Buffer
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 3072,
      },
    });

    const prompt = `WCAG accessibility analysis. Return ONLY JSON array:

["recommendation 1", "recommendation 2", ...]

Focus: contrast ratios, 16px min text, 44px touch targets, focus indicators, ARIA labels, keyboard nav.`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/png",
      },
    };

    const result = await retryWithBackoff(async () => {
      return await model.generateContent([prompt, imagePart]);
    });

    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini API");
    }

    const jsonString = extractJSON(text);
    const recommendations = JSON.parse(jsonString);

    if (!Array.isArray(recommendations)) {
      throw new Error("Response is not an array");
    }

    return recommendations;
  } catch (error) {
    console.error("Accessibility recommendations error:", error);
    return [
      "Manual WCAG 2.1 AA audit required",
      "Test with screen readers",
      "Verify 44px touch targets",
      "Check 4.5:1 contrast ratios",
      "Test keyboard navigation",
    ];
  }
}
