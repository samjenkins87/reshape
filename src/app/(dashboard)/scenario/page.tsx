'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { loadRoles, loadScores } from '@/lib/data'
import { Role, RoleScore } from '@/types'
import { useScenarioStore } from '@/stores/scenario-store'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Download,
  RotateCcw,
  Zap,
  Clock
} from 'lucide-react'

// FCB Media baseline data
const BASELINE = {
  fte: 33,
  staffCost: 6500000,
  revenue: 11900000,
  operatingMargin: 0.45,
}

export default function ScenarioPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [scores, setScores] = useState<RoleScore[]>([])
  const [loading, setLoading] = useState(true)

  const { reductionPercentage, timelineMonths, setReductionPercentage, setTimelineMonths, reset } = useScenarioStore()

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

  // Calculate scenario impacts
  const scenario = useMemo(() => {
    const targetFTE = Math.round(BASELINE.fte * (1 - reductionPercentage / 100))
    const targetStaffCost = BASELINE.staffCost * (1 - reductionPercentage / 100)
    const targetRevenuePerFTE = BASELINE.revenue / targetFTE
    const currentRevenuePerFTE = BASELINE.revenue / BASELINE.fte
    const savings = BASELINE.staffCost - targetStaffCost
    const aiInvestment = 200000
    const netBenefit = savings - aiInvestment
    const roi = netBenefit / aiInvestment
    const targetMargin = (BASELINE.revenue - targetStaffCost) / BASELINE.revenue

    return {
      current: {
        fte: BASELINE.fte,
        staffCost: BASELINE.staffCost,
        revenuePerFTE: currentRevenuePerFTE,
        operatingMargin: BASELINE.operatingMargin,
      },
      target: {
        fte: targetFTE,
        staffCost: targetStaffCost,
        revenuePerFTE: targetRevenuePerFTE,
        operatingMargin: targetMargin,
      },
      savings,
      aiInvestment,
      netBenefit,
      roi,
    }
  }, [reductionPercentage])

  // Calculate role impacts
  const roleImpacts = useMemo(() => {
    // Simplified wave assignment based on score
    const wave1 = scores.filter(s => s.compositeScore.now >= 65)
    const wave2 = scores.filter(s => s.compositeScore.now >= 40 && s.compositeScore.now < 65)
    const retained = scores.filter(s => s.compositeScore.now < 40)

    return { wave1, wave2, retained }
  }, [scores])

  // Calculate risks
  const risks = useMemo(() => {
    const riskList = []

    if (reductionPercentage > 40) {
      riskList.push({
        type: 'client',
        severity: 'high',
        message: 'High client service risk with >40% reduction',
        mitigation: 'Phase changes between campaign cycles',
      })
    }

    if (reductionPercentage > 30 && timelineMonths <= 6) {
      riskList.push({
        type: 'timeline',
        severity: 'medium',
        message: 'Aggressive timeline may cause disruption',
        mitigation: 'Consider 12-month phased approach',
      })
    }

    if (reductionPercentage > 50) {
      riskList.push({
        type: 'capability',
        severity: 'high',
        message: 'Strategy capability at risk',
        mitigation: 'Ensure AI augmentation tools in place',
      })
    }

    return riskList
  }, [reductionPercentage, timelineMonths])

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
          <h1 className="text-2xl font-semibold">Scenario Builder</h1>
          <p className="text-muted-foreground mt-1">
            Model workforce reduction scenarios with real-time impact calculations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transformation Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reduction Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Target Reduction</label>
              <span className="text-2xl font-bold">{reductionPercentage}%</span>
            </div>
            <Slider
              value={[reductionPercentage]}
              onValueChange={(v) => setReductionPercentage(v[0])}
              min={10}
              max={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10%</span>
              <span>20%</span>
              <span>30%</span>
              <span>40%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Timeline</label>
            <div className="flex gap-2">
              {[6, 12, 18, 24].map((months) => (
                <Button
                  key={months}
                  variant={timelineMonths === months ? 'default' : 'outline'}
                  onClick={() => setTimelineMonths(months)}
                  className="flex-1"
                >
                  {months} mo
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(scenario.savings)}</p>
                <p className="text-sm text-muted-foreground">Annual Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(scenario.aiInvestment)}</p>
                <p className="text-sm text-muted-foreground">AI Investment</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{scenario.roi.toFixed(1)}x</p>
                <p className="text-sm text-muted-foreground">ROI</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* State Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">State Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium">Metric</th>
                  <th className="text-right p-3 text-sm font-medium">Current</th>
                  <th className="text-right p-3 text-sm font-medium">Target</th>
                  <th className="text-right p-3 text-sm font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    FTE Count
                  </td>
                  <td className="p-3 text-right font-medium">{scenario.current.fte}</td>
                  <td className="p-3 text-right font-medium">{scenario.target.fte}</td>
                  <td className="p-3 text-right">
                    <Badge variant="destructive">
                      -{scenario.current.fte - scenario.target.fte} ({reductionPercentage}%)
                    </Badge>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Staff Cost
                  </td>
                  <td className="p-3 text-right font-medium">{formatCurrency(scenario.current.staffCost)}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(scenario.target.staffCost)}</td>
                  <td className="p-3 text-right">
                    <Badge variant="success">
                      -{formatCurrency(scenario.savings)}
                    </Badge>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Revenue/FTE
                  </td>
                  <td className="p-3 text-right font-medium">{formatCurrency(scenario.current.revenuePerFTE)}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(scenario.target.revenuePerFTE)}</td>
                  <td className="p-3 text-right">
                    <Badge variant="success">
                      +{Math.round((scenario.target.revenuePerFTE / scenario.current.revenuePerFTE - 1) * 100)}%
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Operating Margin</td>
                  <td className="p-3 text-right font-medium">{(scenario.current.operatingMargin * 100).toFixed(0)}%</td>
                  <td className="p-3 text-right font-medium">{(scenario.target.operatingMargin * 100).toFixed(0)}%</td>
                  <td className="p-3 text-right">
                    <Badge variant="success">
                      +{Math.round((scenario.target.operatingMargin - scenario.current.operatingMargin) * 100)} pts
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Role Impact by Wave</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wave1">
            <TabsList>
              <TabsTrigger value="wave1" className="gap-2">
                <Zap className="h-4 w-4" />
                Wave 1 ({roleImpacts.wave1.length})
              </TabsTrigger>
              <TabsTrigger value="wave2" className="gap-2">
                <Clock className="h-4 w-4" />
                Wave 2 ({roleImpacts.wave2.length})
              </TabsTrigger>
              <TabsTrigger value="retained">
                Retained ({roleImpacts.retained.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wave1" className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Automate immediately with current AI tools (Months 1-6)
              </p>
              <div className="space-y-2">
                {roleImpacts.wave1.map((score) => (
                  <div key={score.roleId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{score.roleName}</p>
                      <p className="text-xs text-muted-foreground">{score.roleFamily}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={score.compositeScore.now} className="w-20 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{score.compositeScore.now}%</span>
                      <Badge variant="destructive">Eliminate</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wave2" className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                AI-augmented roles for efficiency gains (Months 7-12)
              </p>
              <div className="space-y-2">
                {roleImpacts.wave2.map((score) => (
                  <div key={score.roleId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{score.roleName}</p>
                      <p className="text-xs text-muted-foreground">{score.roleFamily}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={score.compositeScore.now} className="w-20 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{score.compositeScore.now}%</span>
                      <Badge variant="warning">Reduce</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="retained" className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Human-critical roles to be retained or expanded
              </p>
              <div className="space-y-2">
                {roleImpacts.retained.map((score) => (
                  <div key={score.roleId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{score.roleName}</p>
                      <p className="text-xs text-muted-foreground">{score.roleFamily}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={score.compositeScore.now} className="w-20 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{score.compositeScore.now}%</span>
                      <Badge variant="success">Retain</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Risk Indicators */}
      {risks.length > 0 && (
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Risk Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.map((risk, index) => (
                <div key={index} className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-start gap-3">
                    <Badge className={risk.severity === 'high' ? 'bg-destructive' : 'bg-warning'}>
                      {risk.severity.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">{risk.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Mitigation: {risk.mitigation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
