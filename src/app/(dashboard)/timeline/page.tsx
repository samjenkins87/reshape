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
  Download
} from 'lucide-react'

// Phase configuration based on PRD
const PHASES = [
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
    savings: 180000,
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
    savings: 320000,
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
    savings: 280000,
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
    savings: 220000,
  },
]

export default function TimelinePage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [scores, setScores] = useState<RoleScore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhase, setSelectedPhase] = useState<string | null>('phase-1')

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

  // Calculate timeline metrics
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
    const totalSavings = PHASES.reduce((sum, phase) => sum + phase.savings, 0)
    const overallProgress = Math.round((completedMilestones / totalMilestones) * 100)

    return {
      totalMilestones,
      completedMilestones,
      inProgressMilestones,
      totalSavings,
      overallProgress,
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
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Transformation Timeline</h1>
          <p className="text-muted-foreground mt-1">
            12-month implementation roadmap with milestones and deliverables
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Plan
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <span className="text-success font-medium">{formatCurrency(phase.savings)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Phase Details */}
      {selectedPhase && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {PHASES.find(p => p.id === selectedPhase)?.name}
                </CardTitle>
                <CardDescription>
                  {PHASES.find(p => p.id === selectedPhase)?.subtitle}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(PHASES.find(p => p.id === selectedPhase)?.status || '')}>
                {PHASES.find(p => p.id === selectedPhase)?.status === 'in-progress' ? 'In Progress' :
                 PHASES.find(p => p.id === selectedPhase)?.status === 'completed' ? 'Completed' : 'Upcoming'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Milestones */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Milestones</h4>
              <div className="space-y-2">
                {PHASES.find(p => p.id === selectedPhase)?.milestones.map((milestone, idx) => (
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

            {/* Role Impact */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Impacted Roles</h4>
              <div className="flex flex-wrap gap-2">
                {PHASES.find(p => p.id === selectedPhase)?.roleImpact.map((role) => (
                  <Badge key={role} variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Savings */}
            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-success" />
                  <span className="font-medium">Projected Savings</span>
                </div>
                <span className="text-xl font-bold text-success">
                  {formatCurrency(PHASES.find(p => p.id === selectedPhase)?.savings || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cumulative Savings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cumulative Savings Projection</CardTitle>
          <CardDescription>
            Expected cost savings over the 12-month transformation period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PHASES.map((phase, index) => {
              const cumulativeSavings = PHASES.slice(0, index + 1).reduce((sum, p) => sum + p.savings, 0)
              const percentage = (cumulativeSavings / metrics.totalSavings) * 100

              return (
                <div key={phase.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">After {phase.name.split(':')[0]}</span>
                    <span className="text-success font-medium">{formatCurrency(cumulativeSavings)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Annual Savings</span>
              <span className="text-2xl font-bold text-success">{formatCurrency(metrics.totalSavings)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
