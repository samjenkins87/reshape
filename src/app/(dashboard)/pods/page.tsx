'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  CheckCircle
} from 'lucide-react'

// Pod configuration data (would come from API in production)
const PODS = [
  {
    id: 'campaign-pod',
    name: 'Campaign Execution Pod',
    description: 'End-to-end campaign delivery from planning to optimization',
    type: 'Hybrid',
    humanRoles: ['Campaign Strategist', 'Creative Director'],
    aiRoles: ['AI Campaign Optimizer', 'Automated Bid Manager', 'Performance Analyst AI'],
    workflows: ['Campaign Planning', 'Creative Brief', 'Media Buying', 'Performance Reporting'],
    efficiency: 340,
    costReduction: 45,
  },
  {
    id: 'analytics-pod',
    name: 'Analytics & Insights Pod',
    description: 'Data-driven insights and reporting automation',
    type: 'AI-Heavy',
    humanRoles: ['Analytics Lead'],
    aiRoles: ['Data Aggregator AI', 'Insight Generator', 'Report Builder AI', 'Anomaly Detector'],
    workflows: ['Data Collection', 'Analysis', 'Visualization', 'Insight Distribution'],
    efficiency: 520,
    costReduction: 62,
  },
  {
    id: 'client-pod',
    name: 'Client Services Pod',
    description: 'Client relationship management and communication',
    type: 'Human-Heavy',
    humanRoles: ['Account Director', 'Client Partner', 'Strategy Lead'],
    aiRoles: ['Meeting Summarizer AI', 'Proposal Generator'],
    workflows: ['Client Meetings', 'Proposal Creation', 'Status Updates', 'Strategic Planning'],
    efficiency: 180,
    costReduction: 25,
  },
  {
    id: 'creative-pod',
    name: 'Creative Production Pod',
    description: 'Asset creation and adaptation at scale',
    type: 'Hybrid',
    humanRoles: ['Creative Director', 'Art Director'],
    aiRoles: ['Asset Generator AI', 'Copy Variant AI', 'Format Adapter', 'Brand Checker AI'],
    workflows: ['Brief Intake', 'Concept Development', 'Asset Production', 'Adaptation'],
    efficiency: 420,
    costReduction: 55,
  },
]

export default function PodsPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [scores, setScores] = useState<RoleScore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPod, setSelectedPod] = useState<string | null>(null)

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

  // Calculate pod metrics
  const metrics = useMemo(() => {
    const totalHumans = PODS.reduce((sum, pod) => sum + pod.humanRoles.length, 0)
    const totalAI = PODS.reduce((sum, pod) => sum + pod.aiRoles.length, 0)
    const avgEfficiency = Math.round(PODS.reduce((sum, pod) => sum + pod.efficiency, 0) / PODS.length)
    const avgCostReduction = Math.round(PODS.reduce((sum, pod) => sum + pod.costReduction, 0) / PODS.length)

    return {
      totalPods: PODS.length,
      totalHumans,
      totalAI,
      avgEfficiency,
      avgCostReduction,
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Pod
        </Button>
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
                <p className="text-2xl font-bold">{metrics.totalPods}</p>
                <p className="text-sm text-muted-foreground">Active Pods</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <User className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalHumans}</p>
                <p className="text-sm text-muted-foreground">Human Roles</p>
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
                <p className="text-sm text-muted-foreground">AI Agents</p>
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
                <p className="text-2xl font-bold">{metrics.avgEfficiency}%</p>
                <p className="text-sm text-muted-foreground">Avg Efficiency</p>
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
                <p className="text-2xl font-bold">{metrics.avgCostReduction}%</p>
                <p className="text-sm text-muted-foreground">Cost Reduction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pod Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PODS.map((pod) => (
          <Card
            key={pod.id}
            className={cn(
              'overflow-hidden cursor-pointer transition-colors',
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
                      {pod.humanRoles.length + pod.aiRoles.length} members
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{pod.name}</CardTitle>
                  <CardDescription className="mt-1">{pod.description}</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pod Composition Visual */}
              <div className="flex items-center gap-4">
                {/* Humans */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-success" />
                    <span className="text-xs font-medium text-muted-foreground">Humans</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pod.humanRoles.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs bg-success/5">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Connector */}
                <div className="flex flex-col items-center gap-1">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">+</span>
                </div>

                {/* AI */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-accent" />
                    <span className="text-xs font-medium text-muted-foreground">AI Agents</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pod.aiRoles.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs bg-accent/5">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics */}
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

              {/* Expanded Content */}
              {selectedPod === pod.id && (
                <div className="pt-4 border-t border-border space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Workflows</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {pod.workflows.map((workflow, idx) => (
                        <div key={workflow} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {workflow}
                          </Badge>
                          {idx < pod.workflows.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Pod
                    </Button>
                    <Button variant="outline" size="sm">
                      View Metrics
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pod Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pod Performance Comparison</CardTitle>
          <CardDescription>
            Efficiency and cost metrics across all configured pods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PODS.map((pod) => (
              <div key={pod.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{pod.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      Efficiency: <strong>{pod.efficiency}%</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Cost Reduction: <strong>{pod.costReduction}%</strong>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full"
                      style={{ width: `${Math.min(100, pod.efficiency / 5)}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${pod.costReduction}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
