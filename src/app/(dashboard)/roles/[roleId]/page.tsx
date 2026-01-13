'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { loadRoles, loadScores, loadBottlenecks } from '@/lib/data'
import { getPriorityColor } from '@/lib/scoring'
import { Role, RoleScore, Bottleneck } from '@/types'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Users,
  Zap,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ListTodo,
  Bot,
  User
} from 'lucide-react'

export default function RoleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params.roleId as string

  const [role, setRole] = useState<Role | null>(null)
  const [score, setScore] = useState<RoleScore | null>(null)
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [rolesData, scoresData, bottlenecksData] = await Promise.all([
          loadRoles(),
          loadScores(),
          loadBottlenecks(),
        ])

        const foundRole = rolesData.find((r) => r.id === roleId)
        const foundScore = scoresData.find((s) => s.roleId === roleId)
        const relatedBottlenecks = bottlenecksData.filter((b) =>
          b.impactedRoles.includes(roleId)
        )

        setRole(foundRole || null)
        setScore(foundScore || null)
        setBottlenecks(relatedBottlenecks)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [roleId])

  const getWaveClassification = (compositeScore: number) => {
    if (compositeScore >= 65) return { wave: 'Wave 1', action: 'Automate', color: 'destructive' }
    if (compositeScore >= 40) return { wave: 'Wave 2', action: 'Augment', color: 'warning' }
    return { wave: 'Retained', action: 'Retain', color: 'success' }
  }

  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'repeatability':
        return <Clock className="h-4 w-4" />
      case 'dataAvailability':
        return <BarChart3 className="h-4 w-4" />
      case 'toolMaturity':
        return <Zap className="h-4 w-4" />
      case 'humanJudgment':
        return <User className="h-4 w-4" />
      case 'clientInteraction':
        return <Users className="h-4 w-4" />
      case 'creativeInput':
        return <Target className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getDimensionLabel = (dimension: string) => {
    const labels: Record<string, string> = {
      repeatability: 'Repeatability',
      dataAvailability: 'Data Availability',
      toolMaturity: 'Tool Maturity',
      humanJudgment: 'Human Judgment Required',
      clientInteraction: 'Client Interaction',
      creativeInput: 'Creative Input',
    }
    return labels[dimension] || dimension
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!role || !score) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium">Role Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The role you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const classification = getWaveClassification(score.compositeScore.now)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Roles
      </Button>

      {/* Role Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline">{role.family}</Badge>
            <Badge className={cn(getPriorityColor(score.redesignPriority))}>
              {score.redesignPriority} Priority
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold">{role.name}</h1>
          <p className="text-muted-foreground mt-1">{role.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className={cn(
            'px-4 py-3',
            classification.color === 'destructive' && 'bg-destructive/10 border-destructive/20',
            classification.color === 'warning' && 'bg-warning/10 border-warning/20',
            classification.color === 'success' && 'bg-success/10 border-success/20'
          )}>
            <div className="text-center">
              <p className="text-2xl font-bold">{score.compositeScore.now}%</p>
              <p className="text-xs text-muted-foreground">Automation Score</p>
            </div>
          </Card>
          <Card className="px-4 py-3">
            <div className="text-center">
              <p className="text-2xl font-bold">{score.compositeScore.future}%</p>
              <p className="text-xs text-muted-foreground">Future Score</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Classification Banner */}
      <Card className={cn(
        classification.color === 'destructive' && 'bg-destructive/5 border-destructive/20',
        classification.color === 'warning' && 'bg-warning/5 border-warning/20',
        classification.color === 'success' && 'bg-success/5 border-success/20'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {classification.color === 'destructive' && <Bot className="h-6 w-6 text-destructive" />}
              {classification.color === 'warning' && <Zap className="h-6 w-6 text-warning" />}
              {classification.color === 'success' && <User className="h-6 w-6 text-success" />}
              <div>
                <p className="font-medium">{classification.wave}: {classification.action}</p>
                <p className="text-sm text-muted-foreground">
                  {classification.color === 'destructive' && 'This role is highly automatable with current AI tools'}
                  {classification.color === 'warning' && 'This role can be augmented with AI to improve efficiency'}
                  {classification.color === 'success' && 'This role requires human skills and should be retained'}
                </p>
              </div>
            </div>
            <Badge className={cn(
              classification.color === 'destructive' && 'bg-destructive text-destructive-foreground',
              classification.color === 'warning' && 'bg-warning text-warning-foreground',
              classification.color === 'success' && 'bg-success text-success-foreground'
            )}>
              {classification.action}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="dimensions">
        <TabsList>
          <TabsTrigger value="dimensions">Score Dimensions</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({role.tasks.length})</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks ({bottlenecks.length})</TabsTrigger>
        </TabsList>

        {/* Dimensions Tab */}
        <TabsContent value="dimensions" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Automation Score Breakdown</CardTitle>
              <CardDescription>
                Analysis of role characteristics affecting automation potential
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Positive Factors */}
              <div>
                <h4 className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Positive Factors (Higher = More Automatable)
                </h4>
                <div className="space-y-4">
                  {['repeatability', 'dataAvailability', 'toolMaturity'].map((dim) => (
                    <div key={dim} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getDimensionIcon(dim)}
                          <span>{getDimensionLabel(dim)}</span>
                        </div>
                        <span className="font-medium">
                          {score.dimensions[dim as keyof typeof score.dimensions]}/5
                        </span>
                      </div>
                      <Progress
                        value={(score.dimensions[dim as keyof typeof score.dimensions] / 5) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Negative Factors */}
              <div>
                <h4 className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Negative Factors (Higher = Less Automatable)
                </h4>
                <div className="space-y-4">
                  {['humanJudgment', 'clientInteraction', 'creativeInput'].map((dim) => (
                    <div key={dim} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getDimensionIcon(dim)}
                          <span>{getDimensionLabel(dim)}</span>
                        </div>
                        <span className="font-medium">
                          {score.dimensions[dim as keyof typeof score.dimensions]}/5
                        </span>
                      </div>
                      <Progress
                        value={(score.dimensions[dim as keyof typeof score.dimensions] / 5) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Future Projection */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Future Score Projection</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Current</span>
                      <span>Future (12-24 months)</span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full">
                      <div
                        className="absolute inset-y-0 left-0 bg-accent rounded-full"
                        style={{ width: `${score.compositeScore.now}%` }}
                      />
                      <div
                        className="absolute inset-y-0 bg-accent/30 rounded-full"
                        style={{
                          left: `${score.compositeScore.now}%`,
                          width: `${score.compositeScore.future - score.compositeScore.now}%`
                        }}
                      />
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +{score.compositeScore.future - score.compositeScore.now}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Tasks</CardTitle>
              <CardDescription>
                Key tasks and responsibilities within this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {role.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{task.workflowStage}</Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              task.frequency === 'Daily' && 'bg-accent/10',
                              task.frequency === 'Weekly' && 'bg-warning/10'
                            )}
                          >
                            {task.frequency}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{task.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{task.timeAllocation}%</p>
                        <p className="text-xs text-muted-foreground">time allocation</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bottlenecks Tab */}
        <TabsContent value="bottlenecks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Bottlenecks</CardTitle>
              <CardDescription>
                Workflow issues affecting this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bottlenecks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">No bottlenecks affecting this role</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bottlenecks.map((bottleneck) => (
                    <div
                      key={bottleneck.id}
                      className="p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={cn(
                          'h-5 w-5 mt-0.5',
                          bottleneck.severity === 'Critical' && 'text-destructive',
                          bottleneck.severity === 'High' && 'text-warning',
                          bottleneck.severity === 'Medium' && 'text-muted-foreground'
                        )} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn(getPriorityColor(bottleneck.severity))}>
                              {bottleneck.severity}
                            </Badge>
                            <Badge variant="outline">{bottleneck.workflowStage}</Badge>
                          </div>
                          <h4 className="font-medium">{bottleneck.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {bottleneck.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
