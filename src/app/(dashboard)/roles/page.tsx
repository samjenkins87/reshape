'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { loadRoles, loadScores, filterRolesByFamily, searchRoles } from '@/lib/data'
import { getScoreBgColor, getPriorityColor } from '@/lib/scoring'
import { Role, RoleScore, RoleFamily } from '@/types'
import { Search, Users, ArrowRight, Filter, DollarSign, Briefcase, Link2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

const ROLE_FAMILIES: RoleFamily[] = [
  'Strategy & Planning',
  'Buying & Activation',
  'Data & Analytics',
  'Creative & Content',
  'Technology & Operations',
  'Client Services',
  'Finance & Administration',
]

const SUBGROUPS = [
  'Planning',
  'Programmatic',
  'Search & Performance',
  'Social',
  'Reporting',
  'Marketing Science',
  'Creative Strategy',
  'Ad Ops',
  'Account Management',
  'Billing & Reconciliation',
  'Media Investment',
  'Retail Media',
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [scores, setScores] = useState<RoleScore[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFamily, setSelectedFamily] = useState<string>('all')
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('all')
  const [showSalary, setShowSalary] = useState(true)
  const [showMccannOnly, setShowMccannOnly] = useState(false)

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

  const filteredRoles = useMemo(() => {
    let result = roles
    if (selectedFamily !== 'all') {
      result = filterRolesByFamily(result, selectedFamily)
    }
    if (selectedSubgroup !== 'all') {
      result = result.filter(r => r.subgroup === selectedSubgroup)
    }
    if (searchQuery) {
      result = searchRoles(result, searchQuery)
    }
    if (showMccannOnly) {
      result = result.filter(r => r.mccannMapping && r.mccannMapping.length > 0)
    }
    return result
  }, [roles, selectedFamily, selectedSubgroup, searchQuery, showMccannOnly])

  // Get available subgroups based on selected family
  const availableSubgroups = useMemo(() => {
    const subgroups = new Set<string>()
    const filteredByFamily = selectedFamily === 'all'
      ? roles
      : roles.filter(r => r.family === selectedFamily)
    filteredByFamily.forEach(r => {
      if (r.subgroup) subgroups.add(r.subgroup)
    })
    return Array.from(subgroups).sort()
  }, [roles, selectedFamily])

  const getScoreForRole = (roleId: string) => {
    return scores.find((s) => s.roleId === roleId)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
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
        <h1 className="text-2xl font-semibold">Role Explorer</h1>
        <p className="text-muted-foreground mt-1">
          Browse and analyze all roles in the organization
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showSalary ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSalary(!showSalary)}
            className="w-fit"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Salary
          </Button>
          <Button
            variant={showMccannOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowMccannOnly(!showMccannOnly)}
            className="w-fit"
          >
            <Link2 className="h-4 w-4 mr-1" />
            McCann Only
          </Button>
        </div>

        {/* Family Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Button
            variant={selectedFamily === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSelectedFamily('all'); setSelectedSubgroup('all') }}
          >
            All Families
          </Button>
          {ROLE_FAMILIES.map((family) => (
            <Button
              key={family}
              variant={selectedFamily === family ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setSelectedFamily(family); setSelectedSubgroup('all') }}
              className="whitespace-nowrap"
            >
              {family.split(' ')[0]}
            </Button>
          ))}
        </div>

        {/* Subgroup Filter */}
        {availableSubgroups.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
            <Button
              variant={selectedSubgroup === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedSubgroup('all')}
            >
              All Subgroups
            </Button>
            {availableSubgroups.map((subgroup) => (
              <Button
                key={subgroup}
                variant={selectedSubgroup === subgroup ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedSubgroup(subgroup)}
                className="whitespace-nowrap"
              >
                {subgroup}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredRoles.length} of {roles.length} roles
      </p>

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map((role) => {
          const score = getScoreForRole(role.id)
          return (
            <Link key={role.id} href={`/roles/${role.id}`}>
              <Card className="h-full hover:border-border-hover hover:bg-muted/50 transition-colors cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-muted">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium group-hover:text-accent transition-colors">
                          {role.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{role.family}</p>
                      </div>
                    </div>
                    {score && (
                      <Badge className={cn(getPriorityColor(score.redesignPriority))}>
                        {score.redesignPriority}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {role.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    {role.subgroup && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {role.subgroup}
                      </Badge>
                    )}
                    <div>
                      <span className="text-muted-foreground">Seniority: </span>
                      <span className="font-medium">{role.seniority}</span>
                    </div>
                    {showSalary && role.salaryBands && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatCurrency(role.salaryBands.junior.min)} - {formatCurrency(role.salaryBands.director.max)}
                        </span>
                      </div>
                    )}
                  </div>

                  {role.mccannMapping && role.mccannMapping.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span>Maps to: </span>
                      <span className="text-foreground">{role.mccannMapping.slice(0, 3).join(', ')}</span>
                      {role.mccannMapping.length > 3 && <span> +{role.mccannMapping.length - 3} more</span>}
                    </div>
                  )}

                  {score && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn('text-xs', getScoreBgColor(score.compositeScore.now))}>
                          Now: {score.compositeScore.now}%
                        </Badge>
                        <Badge variant="outline" className={cn('text-xs', getScoreBgColor(score.compositeScore.future))}>
                          Future: {score.compositeScore.future}%
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No roles found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  )
}
