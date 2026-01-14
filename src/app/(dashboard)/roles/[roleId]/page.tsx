'use client'

import { useEffect, useState } from 'react'
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
import { AutomationScoreCard } from '@/components/cards'
import {
  ArrowLeft,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bot,
  User,
  Users,
  Target,
  DollarSign,
  ArrowRight,
  Briefcase,
  Calendar,
  GraduationCap
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PositionMapping, RoleMappingData } from '@/types'

export default function RoleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params.roleId as string

  const [role, setRole] = useState<Role | null>(null)
  const [score, setScore] = useState<RoleScore | null>(null)
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([])
  const [mappings, setMappings] = useState<PositionMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [showMccannMappings, setShowMccannMappings] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [rolesData, scoresData, bottlenecksData, mappingData] = await Promise.all([
          loadRoles(),
          loadScores(),
          loadBottlenecks(),
          fetch('/data/role-mapping.json').then(r => r.json()) as Promise<RoleMappingData>,
        ])

        const foundRole = rolesData.find((r) => r.id === roleId)
        const foundScore = scoresData.find((s) => s.roleId === roleId)
        const relatedBottlenecks = bottlenecksData.filter((b) =>
          b.impactedRoles.includes(roleId)
        )
        const relatedMappings = mappingData.mappings.filter(
          (m) => m.platformRoleId === roleId
        )

        setRole(foundRole || null)
        setScore(foundScore || null)
        setBottlenecks(relatedBottlenecks)
        setMappings(relatedMappings)
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
              The role you are looking for does not exist or has been removed.
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
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Badge variant="outline">{role.family}</Badge>
          <Badge variant="outline">{role.seniority}</Badge>
        </div>
        <h1 className="text-2xl font-semibold">{role.name}</h1>
        <p className="text-muted-foreground">{role.description}</p>
      </div>

      {/* Automation Score Card (Manus-style) */}
      <AutomationScoreCard
        nowScore={score.compositeScore.now}
        futureScore={score.compositeScore.future}
        priority={score.redesignPriority}
        dimensions={score.dimensions}
        timeHorizon="12-18 Months"
      />

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

      {/* Salary Bands */}
      {role.salaryBands && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Salary Bands
            </CardTitle>
            <CardDescription>
              Compensation ranges by seniority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(['junior', 'intermediate', 'senior', 'lead', 'director'] as const).map((level) => {
                const band = role.salaryBands![level]
                return (
                  <div key={level} className="p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground capitalize mb-2">{level}</p>
                    <p className="text-sm font-medium">{formatCurrency(band.mid)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(band.min)} - {formatCurrency(band.max)}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* McCann Position Mappings - Opt-in */}
      {mappings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  McCann Position Mappings
                </CardTitle>
                <CardDescription>
                  {mappings.length} position{mappings.length !== 1 ? 's' : ''} map to this role
                </CardDescription>
              </div>
              <Button
                variant={showMccannMappings ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMccannMappings(!showMccannMappings)}
              >
                {showMccannMappings ? 'Hide' : 'Show'} Mappings
              </Button>
            </div>
          </CardHeader>
          {showMccannMappings && (
            <CardContent>
              <div className="space-y-3">
                {mappings.map((mapping) => (
                  <div key={mapping.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{mapping.mccannTitle}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {mapping.seniority}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {mapping.headcount} FTE
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(mapping.salary)}
                          </span>
                        </div>

                        {/* Dual Scoring: McCann Internal vs Platform Assessment */}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {/* McCann Internal Assessment */}
                          <div className="p-3 rounded-lg border border-border bg-muted/30">
                            <p className="text-xs font-medium text-muted-foreground mb-2">McCann Internal Audit</p>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
                                <div
                                  className="bg-destructive/70"
                                  style={{ width: `${mapping.taskClassification.commoditised}%` }}
                                />
                                <div
                                  className="bg-warning/70"
                                  style={{ width: `${mapping.taskClassification.semiJudgment}%` }}
                                />
                                <div
                                  className="bg-success/70"
                                  style={{ width: `${mapping.taskClassification.highJudgment}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-sm">
                              <span className="font-semibold">{mapping.taskClassification.commoditised.toFixed(0)}%</span>
                              <span className="text-muted-foreground"> commoditised</span>
                            </p>
                          </div>

                          {/* Platform Assessment */}
                          {mapping.platformAssessment && (
                            <div className="p-3 rounded-lg border border-accent/30 bg-accent/5">
                              <p className="text-xs font-medium text-accent mb-2">Platform Assessment</p>
                              <div className="flex items-center gap-2 text-sm mb-1">
                                <span className="font-semibold text-accent">{mapping.platformAssessment.now}%</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="font-semibold text-success">{mapping.platformAssessment.future}%</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Now → 24 months</p>
                            </div>
                          )}
                        </div>

                        {/* Platform Rationale */}
                        {mapping.platformAssessment && (
                          <p className="mt-2 text-xs text-muted-foreground italic">
                            {mapping.platformAssessment.rationale}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Role Evolution */}
                    <div className="mt-4 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Role Evolution
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground">12 Months</p>
                          <p className="text-sm font-medium">{mapping.evolution.horizon12mo.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {mapping.evolution.horizon12mo.automationLevel}% automated
                          </p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground">24 Months</p>
                          <p className="text-sm font-medium">{mapping.evolution.horizon24mo.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {mapping.evolution.horizon24mo.automationLevel}% automated
                          </p>
                        </div>
                      </div>
                      {mapping.evolution.horizon12mo.focusShift.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {mapping.evolution.horizon12mo.focusShift.map((shift, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {shift}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

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
                Key tasks and responsibilities with automation potential
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
                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-sm font-medium">{task.timeAllocation}%</p>
                          <p className="text-xs text-muted-foreground">time allocation</p>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Automation</p>
                            <div className="flex items-center gap-1 text-sm">
                              <span className={cn(
                                'font-medium',
                                task.automationPotential.now >= 70 && 'text-success',
                                task.automationPotential.now >= 40 && task.automationPotential.now < 70 && 'text-warning',
                                task.automationPotential.now < 40 && 'text-muted-foreground'
                              )}>
                                {task.automationPotential.now}%
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium text-success">
                                {task.automationPotential.future}%
                              </span>
                            </div>
                          </div>
                        </div>
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
