import tinycolor from 'tinycolor2';
import {
  UISchemesSuggestions,
  ContentSuggestions,
  TypographyAnalysis,
  AudienceAnalysis,
  ThemeAnalysis,
  ResponsivenessAnalysis,
  OCRResult,
} from './types';

/**
 * Suggest UI schemes based on palette
 */
export function suggestUISchemes(palette: string[]): UISchemesSuggestions {
  const suggestions = [
    {
      name: 'Material Design',
      confidence: 75,
      tokens: {
        primary: palette[0] || '#2196f3',
        secondary: palette[1] || '#ff4081',
        background: '#ffffff',
        surface: '#f5f5f5',
      },
    },
    {
      name: 'iOS Human Interface',
      confidence: 80,
      tokens: {
        primary: palette[0] || '#007aff',
        secondary: palette[1] || '#5856d6',
        background: '#ffffff',
        surface: '#f2f2f7',
      },
    },
    {
      name: 'Fluent Design',
      confidence: 70,
      tokens: {
        primary: palette[0] || '#0078d4',
        secondary: palette[1] || '#8764b8',
        background: '#ffffff',
        surface: '#f3f2f1',
      },
    },
  ];

  const accessibleSchemes = [
    {
      name: 'High Contrast Light',
      palette: ['#000000', '#ffffff', '#0078d4', '#107c10'],
    },
    {
      name: 'High Contrast Dark',
      palette: ['#ffffff', '#000000', '#1aebff', '#3ff23f'],
    },
  ];

  return { suggestions, accessibleSchemes };
}

/**
 * Analyze content and provide suggestions
 */
export function analyzeContent(ocrResult: OCRResult): ContentSuggestions {
  const text = ocrResult.text.toLowerCase();
  const words = ocrResult.words;

  // Detect headings (larger text)
  const sizes = words.map((w) => w.bbox.y1 - w.bbox.y0);
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  const headings = words.filter((w) => w.bbox.y1 - w.bbox.y0 > avgSize * 1.5);

  const headingSuggestions = headings.map((h) => ({
    current: h.text,
    suggested: h.text.charAt(0).toUpperCase() + h.text.slice(1),
  }));

  // Detect button text
  const buttonKeywords = ['submit', 'click', 'button', 'login', 'sign', 'get', 'start'];
  const buttons = words.filter((w) => buttonKeywords.some((k) => w.text.toLowerCase().includes(k)));

  const buttonTextSuggestions = buttons.map((b) => ({
    current: b.text,
    suggested: b.text.toUpperCase(),
  }));

  // Detect tone
  let tone = 'Neutral';
  if (text.includes('welcome') || text.includes('hi') || text.includes('hello')) {
    tone = 'Friendly';
  } else if (text.includes('enterprise') || text.includes('business') || text.includes('professional')) {
    tone = 'Professional';
  }

  // Clarity score (simplified)
  const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text.split(/\s+/).length;
  const clarityScore = Math.max(0, 100 - avgWordLength * 3);

  const improvements: string[] = [];
  if (avgWordLength > 8) {
    improvements.push('Consider using shorter, more concise words');
  }
  if (headings.length === 0) {
    improvements.push('Add clear headings for better scannability');
  }

  return {
    headings: headingSuggestions.slice(0, 5),
    buttonText: buttonTextSuggestions.slice(0, 5),
    tone,
    clarityScore: Math.round(clarityScore),
    improvements,
  };
}

/**
 * Analyze typography
 */
export function analyzeTypography(ocrResult: OCRResult): TypographyAnalysis {
  const sizes = ocrResult.words.map((w) => w.bbox.y1 - w.bbox.y0);
  const uniqueSizes = [...new Set(sizes.map((s) => Math.round(s)))].sort((a, b) => b - a);

  const pairings = [
    { primary: 'Inter', secondary: 'Inter', score: 95 },
    { primary: 'SF Pro Display', secondary: 'SF Pro Text', score: 98 },
    { primary: 'Roboto', secondary: 'Roboto', score: 90 },
  ];

  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  const readabilityScore = avgSize >= 20 ? 90 : Math.max(50, avgSize * 4);

  const sizeSuggestions = uniqueSizes
    .filter((s) => s < 14)
    .map((s) => ({
      element: 'Text',
      current: `${s}px`,
      suggested: '16px',
    }));

  const lineHeightIssues: string[] = [];
  if (avgSize > 0 && avgSize < 1.5 * 16) {
    lineHeightIssues.push('Line height appears tight, consider 1.5x font size');
  }

  return {
    pairings,
    readabilityScore: Math.round(readabilityScore),
    sizeSuggestions: sizeSuggestions.slice(0, 5),
    lineHeightIssues,
  };
}

/**
 * Analyze target audience
 */
export function analyzeAudience(ocrResult: OCRResult, palette: string[]): AudienceAnalysis {
  const text = ocrResult.text.toLowerCase();
  const detected: AudienceAnalysis['detected'] = [];

  // Detect based on keywords
  if (text.includes('enterprise') || text.includes('business') || text.includes('dashboard')) {
    detected.push({ category: 'Enterprise', confidence: 75 });
  }
  if (text.includes('learn') || text.includes('course') || text.includes('student')) {
    detected.push({ category: 'Education', confidence: 70 });
  }
  if (text.includes('bank') || text.includes('payment') || text.includes('finance')) {
    detected.push({ category: 'Fintech', confidence: 80 });
  }

  // Detect based on colors
  const isDark = palette.some((c) => tinycolor(c).getLuminance() < 0.3);
  const isBright = palette.some((c) => tinycolor(c).getBrightness() > 200);

  if (isBright && palette.length > 5) {
    detected.push({ category: 'Youth', confidence: 65 });
  }
  if (isDark && palette.length <= 3) {
    detected.push({ category: 'Creative', confidence: 70 });
  }

  if (detected.length === 0) {
    detected.push({ category: 'General', confidence: 50 });
  }

  const suggestions: string[] = [];
  if (detected[0]?.category === 'Enterprise') {
    suggestions.push('Use more muted colors and formal typography');
  }
  if (detected[0]?.category === 'Youth') {
    suggestions.push('Add more interactive elements and vibrant colors');
  }

  return { detected, suggestions };
}

/**
 * Analyze theme and palette
 */
export function analyzeTheme(palette: string[], darkModePalette?: string[]): ThemeAnalysis {
  const basePalette = palette.slice(0, 6);
  const accentColors = palette.slice(1, 4);

  // Generate contrast-safe variants
  const contrastSafeVariants = basePalette.map((color) => {
    const tc = tinycolor(color);
    return tc.getLuminance() > 0.5 ? tc.darken(20).toHexString() : tc.lighten(20).toHexString();
  });

  // Check light/dark consistency
  let consistencyScore = 85;
  if (!darkModePalette) {
    consistencyScore = 60;
  }

  const issues: string[] = [];
  if (!darkModePalette) {
    issues.push('No dark mode palette detected');
  }
  if (basePalette.length < 5) {
    issues.push('Limited color palette - consider adding more shades');
  }

  return {
    basePalette,
    accentColors,
    contrastSafeVariants,
    lightDarkConsistency: consistencyScore,
    issues,
  };
}

/**
 * Analyze responsiveness
 */
export function analyzeResponsiveness(imageDimensions: { width: number; height: number }): ResponsivenessAnalysis {
  const hasAltText = false; // MVP: assume false, would check actual image metadata
  const aspectRatio = imageDimensions.width / imageDimensions.height;

  const aspectRatioIssues: string[] = [];
  if (aspectRatio > 3 || aspectRatio < 0.5) {
    aspectRatioIssues.push('Unusual aspect ratio may cause layout issues');
  }

  const compressionIssues: string[] = [];
  if (imageDimensions.width > 1920 || imageDimensions.height > 1080) {
    compressionIssues.push('Large image size - consider optimization');
  }

  const layoutShiftRisk: 'low' | 'medium' | 'high' = aspectRatioIssues.length > 0 ? 'medium' : 'low';

  const unresponsiveElements: string[] = [];
  if (imageDimensions.width > 1440) {
    unresponsiveElements.push('Design may not scale well on smaller screens');
  }

  return {
    images: {
      hasAltText,
      aspectRatioIssues,
      compressionIssues,
    },
    layoutShiftRisk,
    unresponsiveElements,
  };
}
