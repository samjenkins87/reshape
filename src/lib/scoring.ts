import { ScoreDimensions, ScenarioWeights, RoleScore } from "@/types"

// Default weights for scoring
export const DEFAULT_WEIGHTS: ScenarioWeights = {
  repeatability: 0.2,
  dataAvailability: 0.15,
  toolMaturity: 0.2,
  humanJudgment: 0.15,
  stakeholderInteraction: 0.1,
  complianceRisk: 0.1,
  accountability: 0.1,
}

// Future technology multipliers (improvement factors for 12-18 months)
export const FUTURE_MULTIPLIERS = {
  repeatability: 1.0,
  dataAvailability: 1.2,
  toolMaturity: 1.4,
  humanJudgment: 0.85,
  stakeholderInteraction: 0.9,
  complianceRisk: 0.95,
  accountability: 1.0,
}

/**
 * Calculate composite automation score from dimensions
 * Higher score = more automatable
 */
export function calculateCompositeScore(
  dimensions: ScoreDimensions,
  weights: ScenarioWeights = DEFAULT_WEIGHTS,
  horizon: "now" | "future" = "now"
): number {
  const multipliers = horizon === "future" ? FUTURE_MULTIPLIERS : {
    repeatability: 1,
    dataAvailability: 1,
    toolMaturity: 1,
    humanJudgment: 1,
    stakeholderInteraction: 1,
    complianceRisk: 1,
    accountability: 1,
  }

  // Positive factors (higher = more automatable)
  const positiveScore =
    dimensions.repeatability * multipliers.repeatability * weights.repeatability +
    dimensions.dataAvailability * multipliers.dataAvailability * weights.dataAvailability +
    dimensions.toolMaturity * multipliers.toolMaturity * weights.toolMaturity

  // Negative factors (inverse - higher dimension = less automatable)
  const negativeScore =
    (6 - dimensions.humanJudgment) * multipliers.humanJudgment * weights.humanJudgment +
    (6 - dimensions.stakeholderInteraction) * multipliers.stakeholderInteraction * weights.stakeholderInteraction +
    (6 - dimensions.complianceRisk) * multipliers.complianceRisk * weights.complianceRisk +
    (6 - dimensions.accountability) * multipliers.accountability * weights.accountability

  // Normalize to 0-100 scale
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  const rawScore = (positiveScore + negativeScore) / totalWeight
  const normalizedScore = ((rawScore - 1) / 4) * 100

  return Math.round(Math.min(100, Math.max(0, normalizedScore)))
}

/**
 * Recalculate all role scores with custom weights
 */
export function recalculateScores(
  scores: RoleScore[],
  weights: ScenarioWeights
): RoleScore[] {
  return scores.map((score) => ({
    ...score,
    compositeScore: {
      now: calculateCompositeScore(score.dimensions, weights, "now"),
      future: calculateCompositeScore(score.dimensions, weights, "future"),
    },
  }))
}

/**
 * Get score color based on automation percentage
 */
export function getScoreColor(score: number): string {
  if (score >= 75) return "text-success"
  if (score >= 50) return "text-accent"
  if (score >= 25) return "text-warning"
  return "text-destructive"
}

/**
 * Get score background color for badges
 */
export function getScoreBgColor(score: number): string {
  if (score >= 75) return "bg-success/10 text-success"
  if (score >= 50) return "bg-accent/10 text-accent"
  if (score >= 25) return "bg-warning/10 text-warning"
  return "bg-destructive/10 text-destructive"
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "Critical":
      return "bg-destructive/10 text-destructive"
    case "High":
      return "bg-warning/10 text-warning"
    case "Medium":
      return "bg-accent/10 text-accent"
    case "Low":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/**
 * Calculate priority based on score and other factors
 */
export function calculatePriority(
  nowScore: number,
  futureScore: number,
): "Critical" | "High" | "Medium" | "Low" {
  const scoreDelta = futureScore - nowScore
  const avgScore = (nowScore + futureScore) / 2

  if (avgScore >= 70 && scoreDelta >= 15) return "Critical"
  if (avgScore >= 60 || scoreDelta >= 20) return "High"
  if (avgScore >= 40 || scoreDelta >= 10) return "Medium"
  return "Low"
}

/**
 * Calculate wave assignment based on automation potential
 */
export function calculateWave(commoditisedPct: number): 'wave1' | 'wave2' | 'retained' {
  if (commoditisedPct >= 60) return 'wave1'
  if (commoditisedPct >= 30) return 'wave2'
  return 'retained'
}
