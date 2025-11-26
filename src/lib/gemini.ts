import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GeminiAnalysis {
  uiType: string;
  designSystem: string;
  strengths: string[];
  weaknesses: string[];
  accessibilityIssues: string[];
  recommendations: string[];
  colorSchemeAnalysis: string;
  layoutAnalysis: string;
  typographyAnalysis: string;
  userExperience: string;
  targetAudienceMatch: string;
  overallQuality: number;
}

/**
 * Analyze UI image using Google Gemini Vision API
 */
export async function analyzeUIWithGemini(imageBuffer: Buffer): Promise<GeminiAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro' });

    const prompt = `You are a UI/UX and accessibility expert. Analyze this UI screenshot and provide a comprehensive analysis in JSON format with the following structure:

{
  "uiType": "type of UI (e.g., Dashboard, Landing Page, Mobile App, etc.)",
  "designSystem": "identified design system (e.g., Material Design, iOS, Fluent, Custom)",
  "strengths": ["list of 3-5 strong points about the design"],
  "weaknesses": ["list of 3-5 areas that need improvement"],
  "accessibilityIssues": ["list of potential WCAG and accessibility concerns"],
  "recommendations": ["list of 5-7 specific actionable recommendations"],
  "colorSchemeAnalysis": "brief analysis of the color scheme effectiveness",
  "layoutAnalysis": "analysis of information hierarchy and layout structure",
  "typographyAnalysis": "analysis of font choices, sizes, and readability",
  "userExperience": "overall user experience assessment",
  "targetAudienceMatch": "who this UI is best suited for",
  "overallQuality": "score from 0-100"
}

Focus on:
- WCAG compliance issues
- Color contrast problems
- Typography and readability
- Layout and hierarchy
- Interactive elements visibility
- Mobile responsiveness indicators
- Visual consistency
- User flow clarity

Provide specific, actionable feedback. Return ONLY valid JSON, no markdown formatting.`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/png',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response');
    }

    const analysis: GeminiAnalysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Gemini analysis error:', error);
    // Return fallback analysis
    return {
      uiType: 'Unknown',
      designSystem: 'Custom',
      strengths: ['Modern appearance'],
      weaknesses: ['Needs accessibility review'],
      accessibilityIssues: ['Unable to perform AI analysis'],
      recommendations: ['Manual review recommended'],
      colorSchemeAnalysis: 'Unable to analyze',
      layoutAnalysis: 'Unable to analyze',
      typographyAnalysis: 'Unable to analyze',
      userExperience: 'Unable to assess',
      targetAudienceMatch: 'General audience',
      overallQuality: 50,
    };
  }
}

/**
 * Get design system recommendations based on detected patterns
 */
export async function getDesignSystemRecommendations(
  imageBuffer: Buffer
): Promise<{ name: string; confidence: number; reasoning: string }[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this UI screenshot and identify which design system it follows or should follow. Return JSON array:

[
  {
    "name": "design system name",
    "confidence": 0-100,
    "reasoning": "why this system matches"
  }
]

Consider: Material Design, iOS Human Interface, Fluent Design, Tailwind UI, Ant Design, Bootstrap, Custom.
Return ONLY valid JSON array, no markdown.`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/png',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Design system recommendation error:', error);
    return [
      { name: 'Custom', confidence: 50, reasoning: 'Unable to detect specific system' },
    ];
  }
}

/**
 * Extract text from UI image using Gemini Vision
 * Replaces Tesseract.js with more reliable AI-based text extraction
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Extract ALL text from this UI screenshot. Return a JSON object:

{
  "text": "all extracted text concatenated",
  "words": [
    {
      "text": "individual word",
      "estimatedSize": "font size in pixels (estimate)",
      "position": "top/middle/bottom and left/center/right"
    }
  ]
}

Extract every visible text element. Estimate font sizes based on visual prominence. Return ONLY valid JSON.`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/png',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse response');
    }

    const data = JSON.parse(jsonMatch[0]);
    
    // Convert Gemini response to our OCRResult format with estimated bounding boxes
    const words = (data.words || []).map((word: any, idx: number) => {
      // Estimate bbox based on position (simplified for now)
      const size = parseInt(word.estimatedSize) || 16;
      const baseX = word.position?.includes('left') ? 100 : word.position?.includes('right') ? 700 : 400;
      const baseY = word.position?.includes('top') ? 100 : word.position?.includes('bottom') ? 700 : 400;
      
      return {
        text: word.text,
        bbox: {
          x0: baseX,
          y0: baseY,
          x1: baseX + word.text.length * size * 0.6,
          y1: baseY + size,
        },
        confidence: 90, // Gemini is generally accurate
      };
    });

    return {
      text: data.text || '',
      words,
    };
  } catch (error) {
    console.error('Gemini text extraction error:', error);
    return {
      text: '',
      words: [],
    };
  }
}

/**
 * Get accessibility-specific recommendations from Gemini
 */
export async function getAccessibilityRecommendations(imageBuffer: Buffer): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a WCAG accessibility expert. Analyze this UI and provide specific accessibility recommendations. Return JSON array of strings:

["recommendation 1", "recommendation 2", ...]

Focus on:
- Color contrast (WCAG AA/AAA)
- Text readability
- Interactive element sizes (44px minimum)
- Focus indicators
- Screen reader compatibility
- Keyboard navigation
- Alt text for images
- Heading hierarchy

Provide 5-10 specific, actionable recommendations. Return ONLY JSON array.`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/png',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Accessibility recommendations error:', error);
    return ['Unable to generate AI-powered recommendations'];
  }
}
