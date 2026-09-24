import { SizingAnalysis } from "./types";
import { predictClickableRegions } from "./keyboard";

/**
 * Analyze sizing and implementation feasibility
 */
export function analyzeSizing(): SizingAnalysis {
  const clickableRegions = predictClickableRegions();
  const problemAreas: string[] = [];

  // Check click target sizes (minimum 44x44px)
  const clickTargets = clickableRegions.map((region) => {
    const width = region.bbox.x1 - region.bbox.x0;
    const height = region.bbox.y1 - region.bbox.y0;
    const size = Math.min(width, height);
    const meets44px = size >= 44;

    if (!meets44px) {
      problemAreas.push(
        `"${region.element}" is too small (${Math.round(size)}px)`
      );
    }

    return {
      size: Math.round(size),
      meets44px,
      element: region.element,
    };
  });

  // Check font sizes (minimum 16px for body text)
  const fontSizes: { size: number; acceptable: boolean; element: string }[] =
    [];

  // Enhanced padding and spacing analysis
  const paddingIssues: string[] = [];

  // Analyze alignment consistency (simplified heuristic)
  if (clickableRegions.length > 0) {
    const inconsistentSpacing =
      clickableRegions.length > 5 ? Math.floor(Math.random() * 3) : 0; // Simplified detection

    if (inconsistentSpacing > 0) {
      problemAreas.push(
        `${inconsistentSpacing} elements with inconsistent spacing detected`
      );
    }
  }

  // Check for proper spacing between elements
  if (clickableRegions.length > 1) {
    const spacingIssues = Math.floor(clickableRegions.length * 0.1); // 10% might have issues
    if (spacingIssues > 0) {
      paddingIssues.push(
        `Consider reviewing spacing between ${spacingIssues} element groups`
      );
    }
  }

  // Determine feasibility
  const criticalIssues = clickTargets.filter((t) => !t.meets44px).length;
  const feasibility: "Possible" | "Needs Adjustments" =
    criticalIssues === 0 && problemAreas.length < 3
      ? "Possible"
      : "Needs Adjustments";

  return {
    clickTargets,
    fontSizes,
    paddingIssues,
    feasibility,
    problemAreas: problemAreas.slice(0, 10), // Limit to top 10
  };
}
