'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { loadRoles, loadScores } from '@/lib/data'
import { Role, RoleScore } from '@/types'
import { cn } from '@/lib/utils'
import {
  Network,
  Users,
  Bot,
  User,
  Plus,
  Settings,
  Zap,
  Target,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  X,
  Eye,
  Play,
  Pause,
  ChevronRight,
  Clock,
  DollarSign
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Enhanced pod configuration with before/after data
const PODS = [
  {
    id: 'campaign-pod',
    name: 'Campaign Execution Pod',
    description: 'End-to-end campaign delivery from planning to optimization',
    type: 'Hybrid',
    before: {
      roles: [
        { name: 'Campaign Manager', fte: 2, type: 'human' },
        { name: 'Media Buyer', fte: 2, type: 'human' },
        { name: 'Trafficking Coordinator', fte: 1, type: 'human' },
        { name: 'Performance Analyst', fte: 1, type: 'human' },
        { name: 'Creative Coordinator', fte: 1, type: 'human' },
      ],
      totalFTE: 7,
      annualCost: 980000,
      avgTurnaround: '5 days',
    },
    after: {
      roles: [
        { name: 'Campaign Strategist', fte: 1, type: 'human' },
        { name: 'Creative Director', fte: 0.5, type: 'human' },
        { name: 'AI Campaign Optimizer', fte: 0, type: 'ai' },
        { name: 'Automated Bid Manager', fte: 0, type: 'ai' },
        { name: 'Performance Analyst AI', fte: 0, type: 'ai' },
      ],
      totalFTE: 1.5,
      annualCost: 285000,
      aiCost: 45000,
      avgTurnaround: '4 hours',
    },
    workflows: [
      { name: 'Brief Intake', handler: 'human', duration: '1 hour' },
      { name: 'Campaign Setup', handler: 'ai', duration: '15 min' },
      { name: 'Creative Routing', handler: 'ai', duration: '5 min' },
      { name: 'Bid Strategy', handler: 'ai', duration: '2 min' },
      { name: 'Launch Review', handler: 'human', duration: '30 min' },
      { name: 'Performance Monitoring', handler: 'ai', duration: 'Continuous' },
      { name: 'Optimization', handler: 'ai', duration: 'Real-time' },
      { name: 'Reporting', handler: 'ai', duration: '5 min' },
      { name: 'Strategic Review', handler: 'human', duration: '1 hour' },
    ],
    efficiency: 340,
    costReduction: 71,
  },
  {
    id: 'analytics-pod',
    name: 'Analytics & Insights Pod',
    description: 'Data-driven insights and reporting automation',
    type: 'AI-Heavy',
    before: {
      roles: [
        { name: 'Senior Analyst', fte: 1, type: 'human' },
        { name: 'Data Analyst', fte: 2, type: 'human' },
        { name: 'Report Coordinator', fte: 1, type: 'human' },
        { name: 'BI Developer', fte: 0.5, type: 'human' },
      ],
      totalFTE: 4.5,
      annualCost: 630000,
      avgTurnaround: '3 days',
    },
    after: {
      roles: [
        { name: 'Analytics Lead', fte: 1, type: 'human' },
        { name: 'Data Aggregator AI', fte: 0, type: 'ai' },
        { name: 'Insight Generator', fte: 0, type: 'ai' },
        { name: 'Report Builder AI', fte: 0, type: 'ai' },
        { name: 'Anomaly Detector', fte: 0, type: 'ai' },
      ],
      totalFTE: 1,
      annualCost: 180000,
      aiCost: 35000,
      avgTurnaround: '2 hours',
    },
    workflows: [
      { name: 'Data Collection', handler: 'ai', duration: '10 min' },
      { name: 'Data Cleaning', handler: 'ai', duration: '5 min' },
      { name: 'Analysis', handler: 'ai', duration: '15 min' },
      { name: 'Anomaly Detection', handler: 'ai', duration: 'Continuous' },
      { name: 'Insight Generation', handler: 'ai', duration: '10 min' },
      { name: 'Report Building', handler: 'ai', duration: '5 min' },
      { name: 'Quality Review', handler: 'human', duration: '30 min' },
      { name: 'Strategic Commentary', handler: 'human', duration: '1 hour' },
      { name: 'Distribution', handler: 'ai', duration: '1 min' },
    ],
    efficiency: 520,
    costReduction: 66,
  },
  {
    id: 'client-pod',
    name: 'Client Services Pod',
    description: 'Client relationship management and communication',
    type: 'Human-Heavy',
    before: {
      roles: [
        { name: 'Account Director', fte: 1, type: 'human' },
        { name: 'Account Manager', fte: 2, type: 'human' },
        { name: 'Account Coordinator', fte: 1, type: 'human' },
      ],
      totalFTE: 4,
      annualCost: 620000,
      avgTurnaround: '2 days',
    },
    after: {
      roles: [
        { name: 'Account Director', fte: 1, type: 'human' },
        { name: 'Client Partner', fte: 1, type: 'human' },
        { name: 'Strategy Lead', fte: 0.5, type: 'human' },
        { name: 'Meeting Summarizer AI', fte: 0, type: 'ai' },
        { name: 'Proposal Generator', fte: 0, type: 'ai' },
      ],
      totalFTE: 2.5,
      annualCost: 425000,
      aiCost: 20000,
      avgTurnaround: '4 hours',
    },
    workflows: [
      { name: 'Client Meetings', handler: 'human', duration: '1 hour' },
      { name: 'Meeting Summary', handler: 'ai', duration: '5 min' },
      { name: 'Action Items', handler: 'ai', duration: '2 min' },
      { name: 'Proposal Draft', handler: 'ai', duration: '30 min' },
      { name: 'Strategic Input', handler: 'human', duration: '2 hours' },
      { name: 'Client Presentation', handler: 'human', duration: '1 hour' },
      { name: 'Follow-up', handler: 'ai', duration: '10 min' },
    ],
    efficiency: 180,
    costReduction: 28,
  },
  {
    id: 'creative-pod',
    name: 'Creative Production Pod',
    description: 'Asset creation and adaptation at scale',
    type: 'Hybrid',
    before: {
      roles: [
        { name: 'Creative Director', fte: 0.5, type: 'human' },
        { name: 'Art Director', fte: 1, type: 'human' },
        { name: 'Designer', fte: 2, type: 'human' },
        { name: 'Copywriter', fte: 1, type: 'human' },
        { name: 'Production Artist', fte: 1, type: 'human' },
      ],
      totalFTE: 5.5,
      annualCost: 715000,
      avgTurnaround: '1 week',
    },
    after: {
      roles: [
        { name: 'Creative Director', fte: 0.5, type: 'human' },
        { name: 'Art Director', fte: 0.5, type: 'human' },
        { name: 'Asset Generator AI', fte: 0, type: 'ai' },
        { name: 'Copy Variant AI', fte: 0, type: 'ai' },
        { name: 'Format Adapter', fte: 0, type: 'ai' },
        { name: 'Brand Checker AI', fte: 0, type: 'ai' },
      ],
      totalFTE: 1,
      annualCost: 190000,
      aiCost: 60000,
      avgTurnaround: '2 hours',
    },
    workflows: [
      { name: 'Brief Intake', handler: 'human', duration: '30 min' },
      { name: 'Concept Development', handler: 'human', duration: '2 hours' },
      { name: 'Asset Generation', handler: 'ai', duration: '10 min' },
      { name: 'Copy Variants', handler: 'ai', duration: '5 min' },
      { name: 'Format Adaptation', handler: 'ai', duration: '5 min' },
      { name: 'Brand Check', handler: 'ai', duration: '2 min' },
      { name: 'Creative Review', handler: 'human', duration: '30 min' },
      { name: 'Final Approval', handler: 'human', duration: '15 min' },
    ],
    efficiency: 420,
    costReduction: 65,
  },
]

export default function PodsPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [scores, setScores] = useState<RoleScore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPod, setSelectedPod] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'visual'>('cards')

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

  const activePod = PODS.find(p => p.id === selectedPod)

  // Calculate pod metrics
  const metrics = useMemo(() => {
    const totalHumansBefore = PODS.reduce((sum, pod) => sum + pod.before.totalFTE, 0)
    const totalHumansAfter = PODS.reduce((sum, pod) => sum + pod.after.totalFTE, 0)
    const totalAI = PODS.reduce((sum, pod) => sum + pod.after.roles.filter(r => r.type === 'ai').length, 0)
    const totalSavings = PODS.reduce((sum, pod) => sum + (pod.before.annualCost - pod.after.annualCost - (pod.after.aiCost || 0)), 0)
    const avgEfficiency = Math.round(PODS.reduce((sum, pod) => sum + pod.efficiency, 0) / PODS.length)

    return {
      totalHumansBefore,
      totalHumansAfter,
      totalAI,
      totalSavings,
      avgEfficiency,
      fteReduction: totalHumansBefore - totalHumansAfter,
    }
  }, [])

  const getPodTypeColor = (type: string) => {
    switch (type) {
      case 'AI-Heavy':
        return 'bg-accent/10 text-accent'
      case 'Human-Heavy':
        return 'bg-success/10 text-success'
      case 'Hybrid':
        return 'bg-warning/10 text-warning'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Pod Visualizer</h1>
          <p className="text-muted-foreground mt-1">
            Human + AI team configurations for optimal workflow delivery
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <Network className="h-4 w-4 mr-2" />
            Cards
          </Button>
          <Button
            variant={viewMode === 'visual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('visual')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Visual
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Pod
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Network className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{PODS.length}</p>
                <p className="text-xs text-muted-foreground">Active Pods</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Users className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalHumansBefore} → {metrics.totalHumansAfter}</p>
                <p className="text-xs text-muted-foreground">FTE Reduction</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalAI}</p>
                <p className="text-xs text-muted-foreground">AI Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalSavings)}</p>
                <p className="text-xs text-muted-foreground">Annual Savings</p>
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
                <p className="text-2xl font-bold">{metrics.avgEfficiency}%</p>
                <p className="text-xs text-muted-foreground">Avg Efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pod List / Visual View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {PODS.map((pod) => (
            <Card
              key={pod.id}
              className={cn(
                'overflow-hidden cursor-pointer transition-all',
                selectedPod === pod.id ? 'ring-2 ring-accent' : 'hover:border-accent/50'
              )}
              onClick={() => setSelectedPod(selectedPod === pod.id ? null : pod.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getPodTypeColor(pod.type)}>{pod.type}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {pod.after.totalFTE} FTE + {pod.after.roles.filter(r => r.type === 'ai').length} AI
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{pod.name}</CardTitle>
                    <CardDescription className="mt-1">{pod.description}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPod(pod.id)
                      setViewMode('visual')
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Before/After Comparison */}
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">BEFORE</p>
                    <p className="text-lg font-bold">{pod.before.totalFTE} FTE</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(pod.before.annualCost)}/yr</p>
                    <p className="text-xs text-muted-foreground">{pod.before.avgTurnaround} turnaround</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-success mb-2">AFTER</p>
                    <p className="text-lg font-bold text-success">{pod.after.totalFTE} FTE</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(pod.after.annualCost + (pod.after.aiCost || 0))}/yr</p>
                    <p className="text-xs text-success">{pod.after.avgTurnaround} turnaround</p>
                  </div>
                </div>

                {/* Pod Composition */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-success" />
                      <span className="text-xs font-medium">Humans</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pod.after.roles.filter(r => r.type === 'human').map((role) => (
                        <Badge key={role.name} variant="outline" className="text-xs bg-success/5">
                          {role.name} ({role.fte})
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-accent" />
                      <span className="text-xs font-medium">AI Agents</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pod.after.roles.filter(r => r.type === 'ai').map((role) => (
                        <Badge key={role.name} variant="outline" className="text-xs bg-accent/5">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-success" />
                    <span className="text-sm">
                      <strong>{pod.efficiency}%</strong> efficiency
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-accent" />
                    <span className="text-sm">
                      <strong>{pod.costReduction}%</strong> cost reduction
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Visual Pod View
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {activePod ? activePod.name : 'Select a Pod'}
                </CardTitle>
                <CardDescription>
                  {activePod ? 'Visual workflow representation' : 'Click a pod below to view its workflow'}
                </CardDescription>
              </div>
              {activePod && (
                <Badge className={getPodTypeColor(activePod.type)}>{activePod.type}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!activePod ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {PODS.map((pod) => (
                  <button
                    key={pod.id}
                    onClick={() => setSelectedPod(pod.id)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all',
                      selectedPod === pod.id
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/50'
                    )}
                  >
                    <p className="font-medium text-sm">{pod.name}</p>
                    <p className="text-xs text-muted-foreground">{pod.after.totalFTE} FTE + {pod.after.roles.filter(r => r.type === 'ai').length} AI</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pod Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {PODS.map((pod) => (
                    <Button
                      key={pod.id}
                      variant={selectedPod === pod.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPod(pod.id)}
                    >
                      {pod.name}
                    </Button>
                  ))}
                </div>

                {/* Before/After Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before State */}
                  <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                    <div className="flex items-center gap-2 mb-4">
                      <X className="h-5 w-5 text-destructive" />
                      <h3 className="font-semibold">Before: Traditional Team</h3>
                    </div>
                    <div className="space-y-2 mb-4">
                      {activePod.before.roles.map((role, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-background/50">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{role.name}</span>
                          </div>
                          <Badge variant="outline">{role.fte} FTE</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-destructive/20 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total FTE:</span>
                        <span className="font-medium">{activePod.before.totalFTE}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Annual Cost:</span>
                        <span className="font-medium">{formatCurrency(activePod.before.annualCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Turnaround:</span>
                        <span className="font-medium">{activePod.before.avgTurnaround}</span>
                      </div>
                    </div>
                  </div>

                  {/* After State */}
                  <div className="p-4 rounded-lg border border-success/30 bg-success/5">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <h3 className="font-semibold">After: AI-Augmented Pod</h3>
                    </div>
                    <div className="space-y-2 mb-4">
                      {activePod.after.roles.map((role, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-background/50">
                          <div className="flex items-center gap-2">
                            {role.type === 'human' ? (
                              <User className="h-4 w-4 text-success" />
                            ) : (
                              <Bot className="h-4 w-4 text-accent" />
                            )}
                            <span className="text-sm">{role.name}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={role.type === 'ai' ? 'bg-accent/10 text-accent' : ''}
                          >
                            {role.type === 'ai' ? 'AI' : `${role.fte} FTE`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-success/20 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total FTE:</span>
                        <span className="font-medium text-success">{activePod.after.totalFTE}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Annual Cost:</span>
                        <span className="font-medium text-success">{formatCurrency(activePod.after.annualCost + (activePod.after.aiCost || 0))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Turnaround:</span>
                        <span className="font-medium text-success">{activePod.after.avgTurnaround}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Visualization */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Workflow Steps
                  </h3>
                  <div className="relative">
                    <div className="space-y-2">
                      {activePod.workflows.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {/* Step Number */}
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0',
                            step.handler === 'human'
                              ? 'bg-success/20 text-success'
                              : 'bg-accent/20 text-accent'
                          )}>
                            {idx + 1}
                          </div>

                          {/* Step Content */}
                          <div className={cn(
                            'flex-1 p-3 rounded-lg border',
                            step.handler === 'human'
                              ? 'border-success/30 bg-success/5'
                              : 'border-accent/30 bg-accent/5'
                          )}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {step.handler === 'human' ? (
                                  <User className="h-4 w-4 text-success" />
                                ) : (
                                  <Bot className="h-4 w-4 text-accent" />
                                )}
                                <span className="font-medium text-sm">{step.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs',
                                    step.handler === 'human' ? 'border-success/50' : 'border-accent/50'
                                  )}
                                >
                                  {step.handler === 'human' ? 'Human' : 'AI'}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {step.duration}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Arrow */}
                          {idx < activePod.workflows.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 md:opacity-100" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Savings Summary */}
                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Total Pod Savings</p>
                      <p className="text-sm text-muted-foreground">
                        {activePod.before.totalFTE - activePod.after.totalFTE} FTE reduction + AI efficiency gains
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(activePod.before.annualCost - activePod.after.annualCost - (activePod.after.aiCost || 0))}
                      </p>
                      <p className="text-xs text-muted-foreground">per year</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
