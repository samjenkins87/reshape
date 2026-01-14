// ============================================================
// ORGANIZATION HIERARCHY
// ============================================================

export interface HoldingGroup {
  id: string
  name: string
  logo?: string
  region?: string
  agencies: Agency[]
}

export interface Agency {
  id: string
  holdingGroupId: string
  name: string
  region: string
  businessUnits: BusinessUnit[]
}

export interface BusinessUnit {
  id: string
  agencyId: string
  type: BusinessUnitType
  name: string
  currentState: WorkforceState
  roles: Role[]
  clients: Client[]
}

export type BusinessUnitType =
  | 'media'
  | 'production'
  | 'account_services'
  | 'creative'
  | 'data'
  | 'tech'

export interface WorkforceState {
  fte: number
  staffCost: number
  revenue: number
  revenuePerFTE: number
  operatingMargin: number
}

// ============================================================
// ROLES & TASKS (Extended from original platform)
// ============================================================

export type RoleFamily =
  | "Strategy & Planning"
  | "Buying & Activation"
  | "Data & Analytics"
  | "Creative & Content"
  | "Technology & Operations"
  | "Client Services"
  | "Finance & Administration"

export type WorkflowStage =
  | "Plan"
  | "Build"
  | "Launch"
  | "Optimize"
  | "Measure"
  | "Report"

export type Seniority =
  | "Junior"
  | "Mid"
  | "Senior"
  | "Lead"
  | "Director"
  | "VP"
  | "C-Level"
  | "Executive"

export type PriorityLevel = "Critical" | "High" | "Medium" | "Low"

export interface SalaryBand {
  min: number
  mid: number
  max: number
}

export interface SalaryBands {
  junior: SalaryBand
  intermediate: SalaryBand
  senior: SalaryBand
  lead: SalaryBand
  director: SalaryBand
}

export interface Role {
  id: string
  businessUnitId?: string
  name: string
  family: RoleFamily
  subgroup?: string
  description: string
  seniority: Seniority
  headcountEstimate?: string
  fte?: number
  annualCost?: number
  keyResponsibilities: string[]
  tasks: Task[]
  salaryBands?: SalaryBands
  mccannMapping?: string[]
  taskBreakdown?: {
    commoditisedPct: number
    semiJudgementalPct: number
    highlyJudgementalPct: number
  }
  automationWave?: 'wave1' | 'wave2' | 'retained' | 'new'
  aiMultiplier?: number
  reskillable?: boolean
}

export interface Task {
  id: string
  roleId: string
  name: string
  description: string
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Ad-hoc"
  timeAllocation: number
  workflowStage: WorkflowStage
  automationPotential: {
    now: number
    future: number
  }
}

export interface Client {
  id: string
  businessUnitId?: string
  name: string
  revenue: number
  podAssignment?: string
}

// ============================================================
// ROLE MAPPING (McCann positions to platform roles)
// ============================================================

export interface TaskClassification {
  commoditised: number
  semiJudgment: number
  highJudgment: number
}

export interface RoleEvolutionHorizon {
  title: string
  automationLevel: number
  focusShift: string[]
}

export interface RoleEvolution {
  horizon12mo: RoleEvolutionHorizon
  horizon24mo: RoleEvolutionHorizon
}

export interface PlatformAssessment {
  now: number
  future: number
  rationale: string
}

export interface PositionMapping {
  id: string
  mccannTitle: string
  platformRoleId: string | null
  seniority: 'junior' | 'intermediate' | 'senior' | 'lead' | 'director' | 'executive'
  department: string
  subgroup: string
  headcount: number
  salary: number
  taskClassification: TaskClassification
  platformAssessment?: PlatformAssessment
  evolution: RoleEvolution
}

export interface Department {
  id: string
  name: string
  color: string
}

export interface Subgroup {
  id: string
  name: string
  department: string
}

export interface RoleMappingData {
  departments: Department[]
  subgroups: Subgroup[]
  mappings: PositionMapping[]
  seniorityLevels: { id: string; name: string; yearsExperience: string; order: number }[]
  summary: {
    totalPositions: number
    totalHeadcount: number
    avgSalary: number
    totalSalaryCost: number
    loadedCost: number
    byDepartment: Record<string, { headcount: number; avgSalary: number }>
    bySeniority: Record<string, { headcount: number; avgSalary: number; avgCommoditised: number }>
  }
}

// ============================================================
// SCORING (From original platform)
// ============================================================

export interface ScoreDimensions {
  repeatability: number
  dataAvailability: number
  toolMaturity: number
  humanJudgment: number
  stakeholderInteraction: number
  complianceRisk: number
  accountability: number
}

export interface RoleScore {
  roleId: string
  roleName: string
  roleFamily: RoleFamily
  dimensions: ScoreDimensions
  compositeScore: {
    now: number
    future: number
  }
  redesignPriority: PriorityLevel
  recommendations: string[]
}

export interface ScenarioWeights {
  repeatability: number
  dataAvailability: number
  toolMaturity: number
  humanJudgment: number
  stakeholderInteraction: number
  complianceRisk: number
  accountability: number
}

// ============================================================
// BOTTLENECKS (From original platform)
// ============================================================

export interface Bottleneck {
  id: string
  name: string
  description: string
  workflowStage: WorkflowStage
  impactedRoles: string[]
  severity: PriorityLevel
  rootCause: string
  currentState: string
  mitigations: Mitigation[]
  estimatedImpact: string
}

export interface Mitigation {
  id: string
  description: string
  effort: "Low" | "Medium" | "High"
  impact: "Low" | "Medium" | "High"
  timeline: "Immediate" | "Short-term" | "Medium-term" | "Long-term"
  dependencies?: string[]
}

// ============================================================
// HIRING SIGNALS (From original platform)
// ============================================================

export type CompanyGroup = "HoldingCo" | "AI-First" | "MediaEntertainment"

export interface HiringSignal {
  id: string
  company: string
  companyGroup: CompanyGroup
  roleTitle: string
  roleCluster: string
  skills: string[]
  requirements: string[]
  datePosted?: string
  location?: string
  sourceUrl?: string
  insights: string[]
}

export interface HiringTrend {
  roleCategory: string
  currentCount: number
  previousCount: number
  changePercentage: number
  trend: 'up' | 'down' | 'stable'
  isEmergingRole: boolean
}

// ============================================================
// SCENARIOS (Transformation modeling)
// ============================================================

export interface Scenario {
  id: string
  businessUnitId: string
  name: string
  reductionPercentage: number
  timelineMonths: number
  currentState: WorkforceState
  targetState: WorkforceState
  roleChanges: RoleChange[]
  phases: TransformationPhase[]
  risks: RiskIndicator[]
}

export interface RoleChange {
  roleId: string
  roleName: string
  currentFTE: number
  targetFTE: number
  action: 'eliminate' | 'reduce' | 'retain' | 'expand' | 'new'
  wave: 'wave1' | 'wave2'
  month: number
  annualSavings: number
}

export interface TransformationPhase {
  phase: number
  name: string
  startMonth: number
  endMonth: number
  actions: string[]
  fteReduction: number
  cumulativeFTE: number
  savings: number
  cumulativeSavings: number
}

export interface RiskIndicator {
  type: 'client' | 'capability' | 'legal' | 'timeline' | 'talent'
  severity: 'low' | 'medium' | 'high'
  message: string
  affectedRoles: string[]
  mitigation: string
  triggeredAt: number
}

// ============================================================
// RESKILLING
// ============================================================

export interface ReskillPathway {
  id: string
  currentRole: string
  targetRole: string
  successProbability: number
  durationWeeks: number
  cost: number
  trainingPlan: TrainingItem[]
  skillsToAcquire: string[]
  aiGenerated: boolean
}

export interface TrainingItem {
  week: number
  title: string
  type: 'course' | 'certification' | 'shadowing' | 'project'
  description: string
  provider?: string
  cost?: number
}

// ============================================================
// POD STRUCTURE
// ============================================================

export interface Pod {
  id: string
  name: string
  clients: string[]
  revenue: number
  fte: number
  revenuePerFTE: number
  aiCoverage: number
  team: PodMember[]
}

export interface PodMember {
  role: string
  fte: number
}

// ============================================================
// KPIs & CHARTS
// ============================================================

export interface KPIData {
  totalRoles: number
  avgAutomationScore: number
  avgFutureScore: number
  bottleneckCount: number
  highPriorityRoles: number
  totalTasks: number
  hiringSignals: number
}

export interface RoleFamilyDistribution {
  family: RoleFamily
  count: number
  avgScore: number
}

export interface AutomationTrend {
  category: string
  now: number
  future: number
}
