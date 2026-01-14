'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { KPICard } from '@/components/cards/kpi-card'
import { RoleCard } from '@/components/cards/role-card'
import { loadRoles, loadScores, loadBottlenecks, loadHiringSignals, calculateKPIs, getTopAutomatableRoles, getAutomationTrends } from '@/lib/data'
import { Role, RoleScore, Bottleneck, HiringSignal } from '@/types'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Zap,
  SlidersHorizontal,
  ArrowRight,
  Building2,
  Network,
  CalendarClock,
  GraduationCap,
  MapPin,
  Briefcase,
  ChevronRight
} from 'lucide-react'

// Scenario presets for quick access
const SCENARIOS = [
  {
    id: 'mccann-media',
    name: 'McCann Media',
    description: 'Single agency unit',
    fte: 46,
    revenue: 11904526,
    potential: '25%',
  },
  {
    id: 'omnicom-oceania-media',
    name: 'Omnicom Oceania Media',
    description: 'Holding group division',
    fte: 1200,
    revenue: 320000000,
    potential: '30%',
  },
]

// Sample hiring signals for preview
const HIRING_PREVIEW = [
  { company: 'OMD New Zealand', role: 'Digital Campaign Manager', location: 'Auckland', trend: 'growing' },
  { company: 'PHD Australia', role: 'Programmatic Lead', location: 'Sydney', trend: 'growing' },
  { company: 'Dentsu NZ', role: 'Performance Analyst', location: 'Wellington', trend: 'stable' },
]

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
  const topRoles = getTopAutomatableRoles(scores, 3)
  const trends = getAutomationTrends(scores)

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`
    }
    return `$${(value / 1000).toFixed(0)}K`
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-muted-foreground mt-1">
            McCann New Zealand - Media Business Unit
          </p>
        </div>
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

      {/* Scenario Cards + Hiring Signals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Scenario Cards */}
        {SCENARIOS.map((scenario) => (
          <Link key={scenario.id} href="/scenario">
            <Card className="h-full hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Building2 className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">{scenario.name}</p>
                      <p className="text-xs text-muted-foreground">{scenario.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{scenario.fte}</p>
                    <p className="text-[10px] text-muted-foreground">FTE</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{formatCurrency(scenario.revenue)}</p>
                    <p className="text-[10px] text-muted-foreground">Revenue</p>
                  </div>
                  <div className="p-2 rounded-lg bg-success/10">
                    <p className="text-lg font-bold text-success">{scenario.potential}</p>
                    <p className="text-[10px] text-muted-foreground">Savings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* Hiring Signals Preview */}
        <Link href="/hiring">
          <Card className="h-full hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Hiring Signals</p>
                    <p className="text-xs text-muted-foreground">ANZ agency market</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <div className="space-y-2">
                {HIRING_PREVIEW.map((signal, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{signal.role}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={signal.trend === 'growing' ? 'text-success border-success/30' : 'text-muted-foreground'}
                    >
                      {signal.trend}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Automation Potential + Top Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation Potential */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Automation Potential</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/scorecard">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends.slice(0, 4).map((trend) => (
                <div key={trend.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{trend.category}</span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{trend.now}%</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-success">{trend.future}%</span>
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

        {/* Top Automatable Roles */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Top Automatable Roles</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/roles">
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
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/pods">
          <Card className="hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Network className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium group-hover:text-accent transition-colors">Pods</p>
                  <p className="text-xs text-muted-foreground">Team structures</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/timeline">
          <Card className="hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <CalendarClock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium group-hover:text-accent transition-colors">Timeline</p>
                  <p className="text-xs text-muted-foreground">Implementation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reskilling">
          <Card className="hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <GraduationCap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium group-hover:text-accent transition-colors">Reskilling</p>
                  <p className="text-xs text-muted-foreground">Training paths</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/bottlenecks">
          <Card className="hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium group-hover:text-accent transition-colors">Bottlenecks</p>
                  <p className="text-xs text-muted-foreground">{bottlenecks.length} issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
