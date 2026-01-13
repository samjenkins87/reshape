'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { loadBottlenecks, loadRoles } from '@/lib/data'
import { getPriorityColor } from '@/lib/scoring'
import { Bottleneck, Role } from '@/types'
import { AlertTriangle, ChevronDown, ChevronUp, Clock, Zap, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BottlenecksPage() {
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [bottlenecksData, rolesData] = await Promise.all([
          loadBottlenecks(),
          loadRoles(),
        ])
        setBottlenecks(bottlenecksData)
        setRoles(rolesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getRoleName = (roleId: string) => {
    return roles.find((r) => r.id === roleId)?.name || roleId
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Low': return 'bg-success/10 text-success'
      case 'Medium': return 'bg-warning/10 text-warning'
      case 'High': return 'bg-destructive/10 text-destructive'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-success/10 text-success'
      case 'Medium': return 'bg-warning/10 text-warning'
      case 'Low': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="space-y-4">
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

  // Group by severity
  const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'Critical')
  const highBottlenecks = bottlenecks.filter(b => b.severity === 'High')
  const otherBottlenecks = bottlenecks.filter(b => b.severity !== 'Critical' && b.severity !== 'High')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Workflow Bottlenecks</h1>
        <p className="text-muted-foreground mt-1">
          Identify and address workflow issues impacting productivity
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalBottlenecks.length}</p>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highBottlenecks.length}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
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
                <p className="text-2xl font-bold">{otherBottlenecks.length}</p>
                <p className="text-sm text-muted-foreground">Other Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottleneck Cards */}
      <div className="space-y-4">
        {bottlenecks.map((bottleneck) => {
          const isExpanded = expandedId === bottleneck.id
          return (
            <Card key={bottleneck.id} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : bottleneck.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={cn(getPriorityColor(bottleneck.severity))}>
                        {bottleneck.severity}
                      </Badge>
                      <Badge variant="outline">{bottleneck.workflowStage}</Badge>
                    </div>
                    <CardTitle className="text-lg">{bottleneck.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {bottleneck.description}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t border-border pt-4 space-y-6">
                  {/* Root Cause & Current State */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Root Cause</h4>
                      <p className="text-sm text-muted-foreground">{bottleneck.rootCause}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Current State</h4>
                      <p className="text-sm text-muted-foreground">{bottleneck.currentState}</p>
                    </div>
                  </div>

                  {/* Impacted Roles */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Impacted Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {bottleneck.impactedRoles.map((roleId) => (
                        <Badge key={roleId} variant="outline">
                          {getRoleName(roleId)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Impact */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Estimated Impact</h4>
                    <p className="text-sm text-muted-foreground">{bottleneck.estimatedImpact}</p>
                  </div>

                  {/* Mitigations */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Recommended Mitigations</h4>
                    <div className="space-y-3">
                      {bottleneck.mitigations.map((mitigation) => (
                        <div
                          key={mitigation.id}
                          className="p-4 rounded-lg border border-border bg-muted/30"
                        >
                          <p className="text-sm mb-3">{mitigation.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-muted-foreground" />
                              <Badge className={cn('text-xs', getEffortColor(mitigation.effort))}>
                                {mitigation.effort} Effort
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3 text-muted-foreground" />
                              <Badge className={cn('text-xs', getImpactColor(mitigation.impact))}>
                                {mitigation.impact} Impact
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="outline" className="text-xs">
                                {mitigation.timeline}
                              </Badge>
                            </div>
                          </div>
                          {mitigation.dependencies && mitigation.dependencies.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <span className="text-xs text-muted-foreground">
                                Dependencies: {mitigation.dependencies.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
