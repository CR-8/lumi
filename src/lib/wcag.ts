import tinycolor from 'tinycolor2';
import { ContrastCheck, WCAGAnalysis } from './types';

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 formula
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const fg = tinycolor(foreground);
  const bg = tinycolor(background);

  const fgLuminance = fg.getLuminance();
  const bgLuminance = bg.getLuminance();

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast passes WCAG standards
 */
export function checkContrastPasses(ratio: number): { AA: boolean; AAA: boolean } {
  return {
    AA: ratio >= 4.5,
    AAA: ratio >= 7,
  };
}

/**
 * Find nearest accessible color
 */
export function findAccessibleColor(
  foreground: string,
  background: string,
  targetRatio = 4.5
): string {
  const fg = tinycolor(foreground);
  const bg = tinycolor(background);

  let adjusted = fg.clone();
  let ratio = calculateContrastRatio(adjusted.toHexString(), bg.toHexString());

  // Try darkening
  if (ratio < targetRatio) {
    for (let i = 0; i < 100; i++) {
      adjusted = adjusted.darken(1);
      ratio = calculateContrastRatio(adjusted.toHexString(), bg.toHexString());
      if (ratio >= targetRatio) break;
    }
  }

  // If still not accessible, try lightening
  if (ratio < targetRatio) {
    adjusted = fg.clone();
    for (let i = 0; i < 100; i++) {
      adjusted = adjusted.lighten(1);
      ratio = calculateContrastRatio(adjusted.toHexString(), bg.toHexString());
      if (ratio >= targetRatio) break;
    }
  }

  return adjusted.toHexString();
}

/**
 * Analyze text/background contrast pairs
 */
export function analyzeContrast(
  textColors: string[],
  backgroundColors: string[]
): ContrastCheck[] {
  const checks: ContrastCheck[] = [];

  for (const fg of textColors) {
    for (const bg of backgroundColors) {
      const ratio = calculateContrastRatio(fg, bg);
      const passes = checkContrastPasses(ratio);

      checks.push({
        foreground: fg,
        background: bg,
        ratio: Math.round(ratio * 100) / 100,
        passes,
        suggestion: !passes.AA ? findAccessibleColor(fg, bg) : undefined,
      });
    }
  }

  return checks;
}

/**
 * Generate full WCAG analysis
 */
export function generateWCAGAnalysis(
  contrastChecks: ContrastCheck[],
  hasAltText: boolean,
  ariaRoles: string[]
): WCAGAnalysis {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check contrast failures
  const failedContrast = contrastChecks.filter((c) => !c.passes.AA);
  if (failedContrast.length > 0) {
    errors.push(`${failedContrast.length} color pairs fail WCAG AA contrast requirements`);
  }

  const warningContrast = contrastChecks.filter((c) => c.passes.AA && !c.passes.AAA);
  if (warningContrast.length > 0) {
    warnings.push(`${warningContrast.length} color pairs pass AA but not AAA`);
  }

  // Check alt text
  if (!hasAltText) {
    errors.push('Images missing alt text');
  }

  // Check ARIA roles
  const requiredRoles = ['button', 'link', 'heading', 'navigation'];
  const missingRoles = requiredRoles.filter((role) => !ariaRoles.includes(role));
  if (missingRoles.length > 0) {
    warnings.push(`Consider adding ARIA roles: ${missingRoles.join(', ')}`);
  }

  // Calculate overall score
  const totalChecks = contrastChecks.length;
  const aaPass = contrastChecks.filter((c) => c.passes.AA).length;
  const aaaPass = contrastChecks.filter((c) => c.passes.AAA).length;

  let score: 'AA' | 'AAA' | 'FAIL' = 'FAIL';
  if (totalChecks > 0) {
    if (aaaPass === totalChecks && hasAltText) {
      score = 'AAA';
    } else if (aaPass >= totalChecks * 0.8) {
      score = 'AA';
    }
  }

  return {
    score,
    textContrast: contrastChecks,
    altText: {
      present: hasAltText,
      suggestions: hasAltText ? [] : ['Add descriptive alt text to all images'],
    },
    ariaRoles: {
      found: ariaRoles,
      missing: missingRoles,
    },
    errors,
    warnings,
  };
}

/**
 * Check color blindness safety
 */
export function checkColorBlindSafety(colors: string[]): number {
  // Simplified check: ensure sufficient luminance differences
  const luminances = colors.map((c) => tinycolor(c).getLuminance());
  const differences: number[] = [];

  for (let i = 0; i < luminances.length; i++) {
    for (let j = i + 1; j < luminances.length; j++) {
      differences.push(Math.abs(luminances[i] - luminances[j]));
    }
  }

  const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length;
  return Math.min(avgDifference * 100, 100);
}
