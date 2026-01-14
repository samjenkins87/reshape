'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { loadRoles, loadScores } from '@/lib/data'
import { Role, RoleScore } from '@/types'
import { useScenarioStore } from '@/stores/scenario-store'
import { cn } from '@/lib/utils'
import {
  CalendarClock,
  ChevronRight,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  Zap,
  Target,
  Users,
  Download,
  Lock,
  Unlock,
  DollarSign,
  TrendingUp,
  Building2,
  Briefcase,
  Bot,
  GraduationCap,
  ArrowRight,
  Check,
  FileText
} from 'lucide-react'

interface CostItem {
  category: string
  description: string
  amount: number
  type: 'investment' | 'recurring' | 'savings'
}

interface PhaseConfig {
  id: string
  name: string
  subtitle: string
  months: string
  status: 'completed' | 'in-progress' | 'pending'
  progress: number
  milestones: { name: string; status: string; week: number }[]
  roleImpact: string[]
  costs: CostItem[]
  fteImpact: { before: number; after: number }
  keyDeliverables: string[]
}

// Enhanced phase configuration with detailed cost breakdowns
const PHASES: PhaseConfig[] = [
  {
    id: 'phase-1',
    name: 'Phase 1: Foundation',
    subtitle: 'Quick Wins & Infrastructure',
    months: '1-3',
    status: 'in-progress',
    progress: 65,
    milestones: [
      { name: 'AI Tool Selection & Procurement', status: 'completed', week: 1 },
      { name: 'Reporting Automation Deployment', status: 'completed', week: 2 },
      { name: 'Traffic Coordination AI Pilot', status: 'in-progress', week: 4 },
      { name: 'Team Training Program Launch', status: 'pending', week: 6 },
      { name: 'Initial Efficiency Metrics', status: 'pending', week: 8 },
    ],
    roleImpact: ['Traffic Coordinator', 'Report Analyst', 'Data Entry Specialist'],
    fteImpact: { before: 8.5, after: 4.2 },
    costs: [
      { category: 'AI Tools', description: 'Claude Team, Copilot licenses', amount: 15000, type: 'investment' },
      { category: 'Infrastructure', description: 'Cloud compute, API costs', amount: 8000, type: 'recurring' },
      { category: 'Training', description: 'Staff upskilling program', amount: 25000, type: 'investment' },
      { category: 'Consulting', description: 'Implementation support', amount: 40000, type: 'investment' },
      { category: 'Headcount', description: 'FTE reduction (4.3 FTE)', amount: -180000, type: 'savings' },
    ],
    keyDeliverables: [
      'Automated weekly reporting pipeline',
      'AI-assisted traffic coordination system',
      'Foundation training completed for all staff',
      'Baseline metrics established',
    ],
  },
  {
    id: 'phase-2',
    name: 'Phase 2: Optimization',
    subtitle: 'Campaign & Buying Automation',
    months: '4-6',
    status: 'pending',
    progress: 0,
    milestones: [
      { name: 'Campaign Optimizer Deployment', status: 'pending', week: 13 },
      { name: 'Programmatic Bidding AI', status: 'pending', week: 15 },
      { name: 'Performance Dashboard v2', status: 'pending', week: 18 },
      { name: 'Client Reporting Automation', status: 'pending', week: 20 },
      { name: 'Mid-Program Review', status: 'pending', week: 24 },
    ],
    roleImpact: ['Media Buyer', 'Campaign Manager', 'Performance Analyst'],
    fteImpact: { before: 12, after: 5.5 },
    costs: [
      { category: 'AI Tools', description: 'Campaign optimization suite', amount: 35000, type: 'investment' },
      { category: 'Infrastructure', description: 'Enhanced compute capacity', amount: 12000, type: 'recurring' },
      { category: 'Integration', description: 'Platform API connections', amount: 20000, type: 'investment' },
      { category: 'Training', description: 'Advanced AI workflows', amount: 15000, type: 'investment' },
      { category: 'Headcount', description: 'FTE optimization (6.5 FTE)', amount: -320000, type: 'savings' },
    ],
    keyDeliverables: [
      'Automated campaign setup and optimization',
      'Real-time bidding AI integration',
      'Self-service performance dashboards',
      'Automated client reporting suite',
    ],
  },
  {
    id: 'phase-3',
    name: 'Phase 3: Transformation',
    subtitle: 'Strategic & Creative Enhancement',
    months: '7-9',
    status: 'pending',
    progress: 0,
    milestones: [
      { name: 'Strategy AI Assistant Launch', status: 'pending', week: 25 },
      { name: 'Creative Brief Generator', status: 'pending', week: 28 },
      { name: 'Cross-Channel Optimization', status: 'pending', week: 30 },
      { name: 'Predictive Analytics v1', status: 'pending', week: 32 },
      { name: 'Pod Structure Implementation', status: 'pending', week: 36 },
    ],
    roleImpact: ['Media Strategist', 'Creative Coordinator', 'Channel Lead'],
    fteImpact: { before: 9, after: 4.8 },
    costs: [
      { category: 'AI Tools', description: 'Strategy & creative AI suite', amount: 45000, type: 'investment' },
      { category: 'Infrastructure', description: 'ML model hosting', amount: 18000, type: 'recurring' },
      { category: 'Development', description: 'Custom AI integrations', amount: 60000, type: 'investment' },
      { category: 'Change Mgmt', description: 'Pod transition support', amount: 30000, type: 'investment' },
      { category: 'Headcount', description: 'Role evolution (4.2 FTE)', amount: -280000, type: 'savings' },
    ],
    keyDeliverables: [
      'AI-powered strategy recommendations',
      'Automated creative brief generation',
      'Cross-channel performance optimization',
      'Pod operating model implemented',
    ],
  },
  {
    id: 'phase-4',
    name: 'Phase 4: Sustainability',
    subtitle: 'Scale & Continuous Improvement',
    months: '10-12',
    status: 'pending',
    progress: 0,
    milestones: [
      { name: 'Full Platform Integration', status: 'pending', week: 37 },
      { name: 'Advanced AI Features', status: 'pending', week: 40 },
      { name: 'Self-Service Client Portal', status: 'pending', week: 44 },
      { name: 'Annual Review & Optimization', status: 'pending', week: 48 },
      { name: 'Year 2 Planning', status: 'pending', week: 52 },
    ],
    roleImpact: ['Account Director', 'Client Partner', 'Operations Lead'],
    fteImpact: { before: 6, after: 3.5 },
    costs: [
      { category: 'AI Tools', description: 'Enterprise AI platform', amount: 25000, type: 'investment' },
      { category: 'Infrastructure', description: 'Scaled operations', amount: 15000, type: 'recurring' },
      { category: 'Portal Dev', description: 'Client self-service build', amount: 80000, type: 'investment' },
      { category: 'Documentation', description: 'Process & training materials', amount: 15000, type: 'investment' },
      { category: 'Headcount', description: 'Efficiency gains (2.5 FTE)', amount: -220000, type: 'savings' },
    ],
    keyDeliverables: [
      'Fully integrated AI platform',
      'Client self-service portal live',
      'Continuous improvement framework',
      'Year 2 transformation roadmap',
    ],
  },
]

export default function TimelinePage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [scores, setScores] = useState<RoleScore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhase, setSelectedPhase] = useState<string | null>('phase-1')
  const [planLocked, setPlanLocked] = useState(false)
  const [viewMode, setViewMode] = useState<'timeline' | 'costs' | 'plan'>('timeline')

  const { timelineMonths } = useScenarioStore()

  useEffect(() => {
    async function loadData() {
      try {
        const [rolesData, scoresData] = await Promise.all([
          loadRoles(),
          loadScores(),
        ])
        setRoles(rolesData)
        setScores(scoresData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate timeline and cost metrics
  const metrics = useMemo(() => {
    const totalMilestones = PHASES.reduce((sum, phase) => sum + phase.milestones.length, 0)
    const completedMilestones = PHASES.reduce(
      (sum, phase) => sum + phase.milestones.filter(m => m.status === 'completed').length,
      0
    )
    const inProgressMilestones = PHASES.reduce(
      (sum, phase) => sum + phase.milestones.filter(m => m.status === 'in-progress').length,
      0
    )

    // Calculate costs
    const totalInvestment = PHASES.reduce((sum, phase) =>
      sum + phase.costs.filter(c => c.type === 'investment').reduce((s, c) => s + c.amount, 0), 0
    )
    const annualRecurring = PHASES.reduce((sum, phase) =>
      sum + phase.costs.filter(c => c.type === 'recurring').reduce((s, c) => s + c.amount, 0), 0
    ) * 4 // Annualized
    const annualSavings = Math.abs(PHASES.reduce((sum, phase) =>
      sum + phase.costs.filter(c => c.type === 'savings').reduce((s, c) => s + c.amount, 0), 0
    ))
    const netBenefit = annualSavings - totalInvestment - annualRecurring
    const paybackMonths = Math.round((totalInvestment / (annualSavings / 12)) * 10) / 10

    // FTE impact
    const totalFTEBefore = PHASES.reduce((sum, phase) => sum + phase.fteImpact.before, 0)
    const totalFTEAfter = PHASES.reduce((sum, phase) => sum + phase.fteImpact.after, 0)
    const fteReduction = totalFTEBefore - totalFTEAfter

    const overallProgress = Math.round((completedMilestones / totalMilestones) * 100)

    return {
      totalMilestones,
      completedMilestones,
      inProgressMilestones,
      overallProgress,
      totalInvestment,
      annualRecurring,
      annualSavings,
      netBenefit,
      paybackMonths,
      totalFTEBefore,
      totalFTEAfter,
      fteReduction,
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-accent animate-pulse" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success'
      case 'in-progress':
        return 'bg-accent/10 text-accent'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value)
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absValue)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  const selectedPhaseData = PHASES.find(p => p.id === selectedPhase)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Transformation Timeline</h1>
          <p className="text-muted-foreground mt-1">
            12-month implementation roadmap with milestones, costs, and deliverables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={planLocked ? 'default' : 'outline'}
            onClick={() => setPlanLocked(!planLocked)}
            className={cn(planLocked && 'bg-success hover:bg-success/90')}
          >
            {planLocked ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
            {planLocked ? 'Plan Locked' : 'Lock Plan'}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Locked Plan Banner */}
      {planLocked && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/20">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-success">Transformation Plan Approved & Locked</p>
                <p className="text-sm text-muted-foreground">
                  Locked on {new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })} -
                  Total investment: {formatCurrency(metrics.totalInvestment)} |
                  Annual savings: {formatCurrency(metrics.annualSavings)} |
                  Payback: {metrics.paybackMonths} months
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-success">
                <FileText className="h-4 w-4 mr-1" />
                View Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
        <TabsList>
          <TabsTrigger value="timeline">
            <CalendarClock className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="costs">
            <DollarSign className="h-4 w-4 mr-2" />
            Cost Breakdown
          </TabsTrigger>
          <TabsTrigger value="plan">
            <FileText className="h-4 w-4 mr-2" />
            Full Plan
          </TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-6 mt-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <CalendarClock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{PHASES.length}</p>
                    <p className="text-sm text-muted-foreground">Phases</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Target className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.totalMilestones}</p>
                    <p className="text-sm text-muted-foreground">Milestones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.completedMilestones}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.inProgressMilestones}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.fteReduction.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">FTE Reduced</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.overallProgress}%</p>
                    <p className="text-sm text-muted-foreground">Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Overall Transformation Progress</span>
                  <span className="text-muted-foreground">{metrics.overallProgress}% complete</span>
                </div>
                <Progress value={metrics.overallProgress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Month 1</span>
                  <span>Month 3</span>
                  <span>Month 6</span>
                  <span>Month 9</span>
                  <span>Month 12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {PHASES.map((phase, index) => (
              <Card
                key={phase.id}
                className={cn(
                  'cursor-pointer transition-all',
                  selectedPhase === phase.id ? 'ring-2 ring-accent' : 'hover:border-accent/50',
                  phase.status === 'completed' && 'bg-success/5',
                  phase.status === 'in-progress' && 'bg-accent/5'
                )}
                onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(phase.status)}>
                      {phase.status === 'in-progress' ? 'In Progress' : phase.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">M{phase.months}</span>
                  </div>
                  <CardTitle className="text-base">{phase.name}</CardTitle>
                  <CardDescription className="text-xs">{phase.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={phase.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{phase.milestones.filter(m => m.status === 'completed').length}/{phase.milestones.length} milestones</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Net Benefit</span>
                      <span className="font-medium text-success">
                        {formatCurrency(Math.abs(phase.costs.filter(c => c.type === 'savings').reduce((s, c) => s + c.amount, 0)) -
                          phase.costs.filter(c => c.type !== 'savings').reduce((s, c) => s + c.amount, 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Phase Details */}
          {selectedPhaseData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedPhaseData.name}</CardTitle>
                    <CardDescription>{selectedPhaseData.subtitle}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(selectedPhaseData.status)}>
                    {selectedPhaseData.status === 'in-progress' ? 'In Progress' :
                     selectedPhaseData.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Milestones */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Milestones</h4>
                    <div className="space-y-2">
                      {selectedPhaseData.milestones.map((milestone, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(milestone.status)}
                            <span className={cn(
                              'text-sm',
                              milestone.status === 'completed' && 'line-through text-muted-foreground'
                            )}>
                              {milestone.name}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Week {milestone.week}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Deliverables */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Key Deliverables</h4>
                    <div className="space-y-2">
                      {selectedPhaseData.keyDeliverables.map((deliverable, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                          <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                          <span className="text-sm">{deliverable}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FTE Impact */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium mb-3">FTE Impact</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 text-center p-3 rounded-lg bg-background">
                      <p className="text-2xl font-bold">{selectedPhaseData.fteImpact.before}</p>
                      <p className="text-xs text-muted-foreground">Before</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 text-center p-3 rounded-lg bg-background">
                      <p className="text-2xl font-bold text-success">{selectedPhaseData.fteImpact.after}</p>
                      <p className="text-xs text-muted-foreground">After</p>
                    </div>
                    <div className="flex-1 text-center p-3 rounded-lg bg-success/10">
                      <p className="text-2xl font-bold text-success">
                        -{(selectedPhaseData.fteImpact.before - selectedPhaseData.fteImpact.after).toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Reduction</p>
                    </div>
                  </div>
                </div>

                {/* Role Impact */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Impacted Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPhaseData.roleImpact.map((role) => (
                      <Badge key={role} variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cost Breakdown View */}
        <TabsContent value="costs" className="space-y-6 mt-6">
          {/* Cost Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <DollarSign className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalInvestment)}</p>
                    <p className="text-sm text-muted-foreground">Total Investment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.annualRecurring)}</p>
                    <p className="text-sm text-muted-foreground">Annual Recurring</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Zap className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">{formatCurrency(metrics.annualSavings)}</p>
                    <p className="text-sm text-muted-foreground">Annual Savings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Clock className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">{metrics.paybackMonths} mo</p>
                    <p className="text-sm text-muted-foreground">Payback Period</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Phase-by-Phase Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PHASES.map((phase) => {
              const phaseInvestment = phase.costs.filter(c => c.type === 'investment').reduce((s, c) => s + c.amount, 0)
              const phaseRecurring = phase.costs.filter(c => c.type === 'recurring').reduce((s, c) => s + c.amount, 0)
              const phaseSavings = Math.abs(phase.costs.filter(c => c.type === 'savings').reduce((s, c) => s + c.amount, 0))
              const phaseNet = phaseSavings - phaseInvestment - phaseRecurring

              return (
                <Card key={phase.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{phase.name}</CardTitle>
                      <Badge className={getStatusColor(phase.status)}>M{phase.months}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cost Items */}
                    <div className="space-y-2">
                      {phase.costs.map((cost, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {cost.type === 'investment' && <Briefcase className="h-4 w-4 text-muted-foreground" />}
                            {cost.type === 'recurring' && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                            {cost.type === 'savings' && <Users className="h-4 w-4 text-success" />}
                            <span className={cn(cost.type === 'savings' && 'text-success')}>
                              {cost.category}
                            </span>
                          </div>
                          <span className={cn(
                            'font-medium',
                            cost.type === 'savings' ? 'text-success' : ''
                          )}>
                            {cost.type === 'savings' ? '+' : '-'}{formatCurrency(Math.abs(cost.amount))}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Phase Summary */}
                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Investment</span>
                        <span className="font-medium">-{formatCurrency(phaseInvestment)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Recurring (Q)</span>
                        <span className="font-medium">-{formatCurrency(phaseRecurring)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Savings (Annual)</span>
                        <span className="font-medium text-success">+{formatCurrency(phaseSavings)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                        <span className="font-medium">Net Benefit (Year 1)</span>
                        <span className={cn('font-bold', phaseNet > 0 ? 'text-success' : 'text-destructive')}>
                          {phaseNet > 0 ? '+' : ''}{formatCurrency(phaseNet)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Total Summary */}
          <Card className="bg-success/5 border-success/20">
            <CardHeader>
              <CardTitle className="text-lg">12-Month Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.totalInvestment)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Annual Recurring</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.annualRecurring)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Annual Savings</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(metrics.annualSavings)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Year 1 Net Benefit</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(metrics.netBenefit)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Payback Period</p>
                  <p className="text-2xl font-bold text-success">{metrics.paybackMonths} months</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Full Plan View */}
        <TabsContent value="plan" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transformation Plan Summary</CardTitle>
                  <CardDescription>Complete overview of the 12-month transformation program</CardDescription>
                </div>
                {planLocked && (
                  <Badge className="bg-success/10 text-success">
                    <Lock className="h-3 w-3 mr-1" />
                    Approved
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Executive Summary */}
              <div className="p-6 rounded-lg bg-muted/50 space-y-4">
                <h3 className="font-semibold">Executive Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold">{formatCurrency(metrics.totalInvestment)}</p>
                    <p className="text-sm text-muted-foreground">Total Investment</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-success">{formatCurrency(metrics.annualSavings)}</p>
                    <p className="text-sm text-muted-foreground">Annual Savings</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{metrics.fteReduction.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">FTE Reduction</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-success">{metrics.paybackMonths} mo</p>
                    <p className="text-sm text-muted-foreground">Payback Period</p>
                  </div>
                </div>
              </div>

              {/* Phase Details */}
              {PHASES.map((phase, idx) => {
                const phaseInvestment = phase.costs.filter(c => c.type === 'investment').reduce((s, c) => s + c.amount, 0)
                const phaseSavings = Math.abs(phase.costs.filter(c => c.type === 'savings').reduce((s, c) => s + c.amount, 0))

                return (
                  <div key={phase.id} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full font-bold',
                        phase.status === 'completed' ? 'bg-success text-success-foreground' :
                        phase.status === 'in-progress' ? 'bg-accent text-accent-foreground' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{phase.name}</h3>
                        <p className="text-sm text-muted-foreground">{phase.subtitle} • Months {phase.months}</p>
                      </div>
                      <Badge className={getStatusColor(phase.status)}>
                        {phase.status === 'in-progress' ? 'In Progress' :
                         phase.status === 'completed' ? 'Completed' : 'Upcoming'}
                      </Badge>
                    </div>

                    <div className="ml-14 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Key Activities */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Key Activities</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                          {phase.milestones.slice(0, 3).map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              {getStatusIcon(m.status)}
                              <span className="truncate">{m.name}</span>
                            </div>
                          ))}
                          {phase.milestones.length > 3 && (
                            <p className="text-xs text-muted-foreground">+{phase.milestones.length - 3} more</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* FTE Impact */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">FTE Impact</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{phase.fteImpact.before}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-2xl font-bold text-success">{phase.fteImpact.after}</span>
                          </div>
                          <p className="text-xs text-muted-foreground text-center mt-1">
                            {(phase.fteImpact.before - phase.fteImpact.after).toFixed(1)} FTE reduction
                          </p>
                        </CardContent>
                      </Card>

                      {/* Financial */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Financial</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Investment</span>
                            <span>{formatCurrency(phaseInvestment)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Savings</span>
                            <span className="text-success">{formatCurrency(phaseSavings)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {idx < PHASES.length - 1 && (
                      <div className="ml-14 flex justify-center py-2">
                        <ChevronRight className="h-5 w-5 text-muted-foreground rotate-90" />
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
