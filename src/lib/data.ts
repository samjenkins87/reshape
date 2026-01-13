import {
  Role,
  RoleScore,
  Bottleneck,
  HiringSignal,
  KPIData,
  RoleFamilyDistribution,
  AutomationTrend,
} from "@/types"

// Data loading functions
export async function loadRoles(): Promise<Role[]> {
  const res = await fetch("/data/roles.json")
  return res.json()
}

export async function loadScores(): Promise<RoleScore[]> {
  const res = await fetch("/data/scores.json")
  return res.json()
}

export async function loadBottlenecks(): Promise<Bottleneck[]> {
  const res = await fetch("/data/bottlenecks.json")
  return res.json()
}

export async function loadHiringSignals(): Promise<HiringSignal[]> {
  const res = await fetch("/data/hiring_signals.json")
  return res.json()
}

// Computed data functions
export function calculateKPIs(
  roles: Role[],
  scores: RoleScore[],
  bottlenecks: Bottleneck[],
  hiringSignals: HiringSignal[]
): KPIData {
  const avgNow = scores.reduce((sum, s) => sum + s.compositeScore.now, 0) / scores.length
  const avgFuture = scores.reduce((sum, s) => sum + s.compositeScore.future, 0) / scores.length
  const highPriority = scores.filter(
    (s) => s.redesignPriority === "Critical" || s.redesignPriority === "High"
  ).length
  const totalTasks = roles.reduce((sum, r) => sum + r.tasks.length, 0)

  return {
    totalRoles: roles.length,
    avgAutomationScore: Math.round(avgNow),
    avgFutureScore: Math.round(avgFuture),
    bottleneckCount: bottlenecks.length,
    highPriorityRoles: highPriority,
    totalTasks,
    hiringSignals: hiringSignals.length,
  }
}

export function getRoleFamilyDistribution(
  roles: Role[],
  scores: RoleScore[]
): RoleFamilyDistribution[] {
  const familyMap = new Map<string, { count: number; totalScore: number }>()

  roles.forEach((role) => {
    const existing = familyMap.get(role.family) || { count: 0, totalScore: 0 }
    const score = scores.find((s) => s.roleId === role.id)
    familyMap.set(role.family, {
      count: existing.count + 1,
      totalScore: existing.totalScore + (score?.compositeScore.now || 0),
    })
  })

  return Array.from(familyMap.entries()).map(([family, data]) => ({
    family: family as RoleFamilyDistribution["family"],
    count: data.count,
    avgScore: Math.round(data.totalScore / data.count),
  }))
}

export function getAutomationTrends(scores: RoleScore[]): AutomationTrend[] {
  const familyMap = new Map<string, { nowTotal: number; futureTotal: number; count: number }>()

  scores.forEach((score) => {
    const existing = familyMap.get(score.roleFamily) || {
      nowTotal: 0,
      futureTotal: 0,
      count: 0,
    }
    familyMap.set(score.roleFamily, {
      nowTotal: existing.nowTotal + score.compositeScore.now,
      futureTotal: existing.futureTotal + score.compositeScore.future,
      count: existing.count + 1,
    })
  })

  return Array.from(familyMap.entries()).map(([family, data]) => ({
    category: family,
    now: Math.round(data.nowTotal / data.count),
    future: Math.round(data.futureTotal / data.count),
  }))
}

export function getTopAutomatableRoles(
  scores: RoleScore[],
  limit: number = 5,
  horizon: "now" | "future" = "now"
): RoleScore[] {
  return [...scores]
    .sort((a, b) =>
      horizon === "now"
        ? b.compositeScore.now - a.compositeScore.now
        : b.compositeScore.future - a.compositeScore.future
    )
    .slice(0, limit)
}

export function getHighestPriorityRoles(scores: RoleScore[], limit: number = 5): RoleScore[] {
  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
  return [...scores]
    .sort((a, b) => priorityOrder[a.redesignPriority] - priorityOrder[b.redesignPriority])
    .slice(0, limit)
}

export function filterRolesByFamily(roles: Role[], family: string): Role[] {
  if (!family || family === "all") return roles
  return roles.filter((r) => r.family === family)
}

export function searchRoles(roles: Role[], query: string): Role[] {
  if (!query) return roles
  const lowerQuery = query.toLowerCase()
  return roles.filter(
    (r) =>
      r.name.toLowerCase().includes(lowerQuery) ||
      r.description.toLowerCase().includes(lowerQuery) ||
      r.family.toLowerCase().includes(lowerQuery)
  )
}
