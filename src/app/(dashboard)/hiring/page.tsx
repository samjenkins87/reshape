'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { loadHiringSignals } from '@/lib/data'
import { HiringSignal, CompanyGroup } from '@/types'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  Building2,
  ExternalLink,
  Lightbulb,
  Briefcase,
  MapPin,
  Code,
  Users,
  Zap
} from 'lucide-react'

export default function HiringPage() {
  const [signals, setSignals] = useState<HiringSignal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const signalsData = await loadHiringSignals()
        setSignals(signalsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Group signals by company group
  const signalsByGroup = useMemo(() => {
    return {
      holdingCo: signals.filter(s => s.companyGroup === 'HoldingCo'),
      aiFirst: signals.filter(s => s.companyGroup === 'AI-First'),
      mediaEntertainment: signals.filter(s => s.companyGroup === 'MediaEntertainment'),
    }
  }, [signals])

  // Group signals by role cluster
  const signalsByCluster = useMemo(() => {
    const clusters = new Map<string, HiringSignal[]>()
    signals.forEach(signal => {
      const existing = clusters.get(signal.roleCluster) || []
      clusters.set(signal.roleCluster, [...existing, signal])
    })
    return clusters
  }, [signals])

  // Get unique companies
  const companies = useMemo(() => {
    return [...new Set(signals.map(s => s.company))]
  }, [signals])

  const getCompanyGroupColor = (group: CompanyGroup) => {
    switch (group) {
      case 'AI-First':
        return 'bg-accent/10 text-accent'
      case 'HoldingCo':
        return 'bg-success/10 text-success'
      case 'MediaEntertainment':
        return 'bg-warning/10 text-warning'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getCompanyGroupIcon = (group: CompanyGroup) => {
    switch (group) {
      case 'AI-First':
        return <Zap className="h-4 w-4" />
      case 'HoldingCo':
        return <Building2 className="h-4 w-4" />
      case 'MediaEntertainment':
        return <Users className="h-4 w-4" />
      default:
        return <Briefcase className="h-4 w-4" />
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
      <div>
        <h1 className="text-2xl font-semibold">Hiring Signals</h1>
        <p className="text-muted-foreground mt-1">
          Market intelligence on AI-related hiring trends across the industry
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{signals.length}</p>
                <p className="text-sm text-muted-foreground">Total Signals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{signalsByGroup.aiFirst.length}</p>
                <p className="text-sm text-muted-foreground">AI-First Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Building2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{signalsByGroup.holdingCo.length}</p>
                <p className="text-sm text-muted-foreground">Holding Companies</p>
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
                <p className="text-2xl font-bold">{companies.length}</p>
                <p className="text-sm text-muted-foreground">Companies Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signals by Company Group */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({signals.length})</TabsTrigger>
          <TabsTrigger value="ai-first" className="gap-2">
            <Zap className="h-3 w-3" />
            AI-First ({signalsByGroup.aiFirst.length})
          </TabsTrigger>
          <TabsTrigger value="holding-co" className="gap-2">
            <Building2 className="h-3 w-3" />
            Holding Co ({signalsByGroup.holdingCo.length})
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-2">
            <Users className="h-3 w-3" />
            Media ({signalsByGroup.mediaEntertainment.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <SignalGrid signals={signals} getCompanyGroupColor={getCompanyGroupColor} getCompanyGroupIcon={getCompanyGroupIcon} />
        </TabsContent>

        <TabsContent value="ai-first" className="mt-4">
          <SignalGrid signals={signalsByGroup.aiFirst} getCompanyGroupColor={getCompanyGroupColor} getCompanyGroupIcon={getCompanyGroupIcon} />
        </TabsContent>

        <TabsContent value="holding-co" className="mt-4">
          <SignalGrid signals={signalsByGroup.holdingCo} getCompanyGroupColor={getCompanyGroupColor} getCompanyGroupIcon={getCompanyGroupIcon} />
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <SignalGrid signals={signalsByGroup.mediaEntertainment} getCompanyGroupColor={getCompanyGroupColor} getCompanyGroupIcon={getCompanyGroupIcon} />
        </TabsContent>
      </Tabs>

      {/* Role Cluster Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Role Clusters</CardTitle>
          <CardDescription>
            Emerging role categories across the industry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from(signalsByCluster.entries()).map(([cluster, clusterSignals]) => (
              <div
                key={cluster}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{cluster}</span>
                </div>
                <p className="text-2xl font-bold">{clusterSignals.length}</p>
                <p className="text-xs text-muted-foreground">open positions</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface SignalGridProps {
  signals: HiringSignal[]
  getCompanyGroupColor: (group: CompanyGroup) => string
  getCompanyGroupIcon: (group: CompanyGroup) => React.ReactNode
}

function SignalGrid({ signals, getCompanyGroupColor, getCompanyGroupIcon }: SignalGridProps) {
  if (signals.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No signals in this category</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {signals.map((signal) => (
        <Card key={signal.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn(getCompanyGroupColor(signal.companyGroup))}>
                    <span className="flex items-center gap-1">
                      {getCompanyGroupIcon(signal.companyGroup)}
                      {signal.companyGroup}
                    </span>
                  </Badge>
                  <Badge variant="outline">{signal.roleCluster}</Badge>
                </div>
                <CardTitle className="text-lg">{signal.roleTitle}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  {signal.company}
                  {signal.location && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <MapPin className="h-3 w-3" />
                      {signal.location}
                    </>
                  )}
                </CardDescription>
              </div>
              {signal.sourceUrl && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={signal.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Key Skills</h4>
              <div className="flex flex-wrap gap-1">
                {signal.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {signal.requirements && signal.requirements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Requirements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {signal.requirements.slice(0, 3).map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Insights */}
            {signal.insights && signal.insights.length > 0 && (
              <div className="pt-3 border-t border-border">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-warning" />
                  <div className="space-y-1">
                    {signal.insights.map((insight, idx) => (
                      <p key={idx} className="text-sm">{insight}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
