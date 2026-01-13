'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { KPICard } from '@/components/cards/kpi-card'
import { RoleCard } from '@/components/cards/role-card'
import { loadRoles, loadScores, loadBottlenecks, loadHiringSignals, calculateKPIs, getTopAutomatableRoles, getHighestPriorityRoles, getAutomationTrends } from '@/lib/data'
import { Role, RoleScore, Bottleneck, HiringSignal, AutomationTrend } from '@/types'
import { Users, TrendingUp, AlertTriangle, Zap, SlidersHorizontal, ArrowRight } from 'lucide-react'

export default function OverviewPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [scores, setScores] = useState<RoleScore[]>([])
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([])
  const [hiringSignals, setHiringSignals] = useState<HiringSignal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [rolesData, scoresData, bottlenecksData, hiringData] = await Promise.all([
          loadRoles(),
          loadScores(),
          loadBottlenecks(),
          loadHiringSignals(),
        ])
        setRoles(rolesData)
        setScores(scoresData)
        setBottlenecks(bottlenecksData)
        setHiringSignals(hiringData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const kpis = calculateKPIs(roles, scores, bottlenecks, hiringSignals)
  const topRoles = getTopAutomatableRoles(scores, 4)
  const priorityRoles = getHighestPriorityRoles(scores, 4)
  const trends = getAutomationTrends(scores)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-muted-foreground mt-1">
            FCB New Zealand - Media Business Unit
          </p>
        </div>
        <Button asChild>
          <Link href="/scenario">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Open Scenario Builder
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Roles"
          value={kpis.totalRoles}
          subtitle={`${kpis.totalTasks} total tasks`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Automation Score"
          value={`${kpis.avgAutomationScore}%`}
          subtitle="Average across all roles"
          change={kpis.avgFutureScore - kpis.avgAutomationScore}
          changeLabel="in 12-18mo"
          icon={<Zap className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="High Priority Roles"
          value={kpis.highPriorityRoles}
          subtitle="Critical or High priority"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Bottlenecks"
          value={kpis.bottleneckCount}
          subtitle="Workflow issues identified"
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Automation Potential */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Automation Potential by Family</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.map((trend) => (
              <div key={trend.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{trend.category}</span>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>Now: {trend.now}%</span>
                    <span>Future: {trend.future}%</span>
                    <Badge variant="secondary" className="text-xs">
                      +{trend.future - trend.now}%
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 h-2">
                  <div
                    className="bg-primary rounded-l"
                    style={{ width: `${trend.now}%` }}
                  />
                  <div
                    className="bg-primary/30 rounded-r"
                    style={{ width: `${trend.future - trend.now}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Automatable */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Top Automatable Roles</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/scorecard">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topRoles.map((score) => (
              <RoleCard key={score.roleId} score={score} showProgress={false} />
            ))}
          </CardContent>
        </Card>

        {/* Highest Priority */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Highest Priority</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/scorecard">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityRoles.map((score) => (
              <RoleCard key={score.roleId} score={score} showProgress={false} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-success">{kpis.avgFutureScore}%</p>
            <p className="text-sm text-muted-foreground">Future Automation</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-accent">{hiringSignals.length}</p>
            <p className="text-sm text-muted-foreground">Hiring Signals</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-warning">
              {scores.filter(s => s.redesignPriority === 'Critical').length}
            </p>
            <p className="text-sm text-muted-foreground">Critical Roles</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-destructive">{bottlenecks.length}</p>
            <p className="text-sm text-muted-foreground">Bottlenecks</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
