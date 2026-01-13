'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { loadScores } from '@/lib/data'
import { getScoreBgColor, getPriorityColor } from '@/lib/scoring'
import { RoleScore, PriorityLevel } from '@/types'
import { Search, ArrowUpDown, Download, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

type SortField = 'name' | 'now' | 'future' | 'priority' | 'delta'
type SortDirection = 'asc' | 'desc'

export default function ScorecardPage() {
  const [scores, setScores] = useState<RoleScore[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('now')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all')

  useEffect(() => {
    async function loadData() {
      try {
        const scoresData = await loadScores()
        setScores(scoresData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredAndSortedScores = useMemo(() => {
    let result = [...scores]

    // Filter by search
    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.roleName.toLowerCase().includes(lower) ||
          s.roleFamily.toLowerCase().includes(lower)
      )
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      result = result.filter((s) => s.redesignPriority === priorityFilter)
    }

    // Sort
    const priorityOrder: Record<PriorityLevel, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.roleName.localeCompare(b.roleName)
          break
        case 'now':
          comparison = a.compositeScore.now - b.compositeScore.now
          break
        case 'future':
          comparison = a.compositeScore.future - b.compositeScore.future
          break
        case 'priority':
          comparison = priorityOrder[a.redesignPriority] - priorityOrder[b.redesignPriority]
          break
        case 'delta':
          comparison =
            (a.compositeScore.future - a.compositeScore.now) -
            (b.compositeScore.future - b.compositeScore.now)
          break
      }
      return sortDirection === 'desc' ? -comparison : comparison
    })

    return result
  }, [scores, searchQuery, sortField, sortDirection, priorityFilter])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className={cn(
        'flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors',
        sortField === field ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Automation Scorecard</h1>
          <p className="text-muted-foreground mt-1">
            Ranked view of all roles by automation potential
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
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
        <div className="flex items-center gap-2">
          <Button
            variant={priorityFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('all')}
          >
            All
          </Button>
          {(['Critical', 'High', 'Medium', 'Low'] as PriorityLevel[]).map((priority) => (
            <Button
              key={priority}
              variant={priorityFilter === priority ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriorityFilter(priority)}
            >
              {priority}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredAndSortedScores.length} of {scores.length} roles
      </p>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4">
                    <SortButton field="name">Role</SortButton>
                  </th>
                  <th className="text-left p-4">Family</th>
                  <th className="text-center p-4">
                    <SortButton field="now">Now</SortButton>
                  </th>
                  <th className="text-center p-4">
                    <SortButton field="future">Future</SortButton>
                  </th>
                  <th className="text-center p-4">
                    <SortButton field="delta">Delta</SortButton>
                  </th>
                  <th className="text-center p-4">
                    <SortButton field="priority">Priority</SortButton>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedScores.map((score, index) => (
                  <tr
                    key={score.roleId}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <Link
                        href={`/roles/${score.roleId}`}
                        className="font-medium hover:text-accent transition-colors"
                      >
                        {score.roleName}
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {score.roleFamily}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={score.compositeScore.now} className="w-16 h-2" />
                        <span className={cn('text-sm font-medium w-10 text-right', getScoreBgColor(score.compositeScore.now).split(' ')[1])}>
                          {score.compositeScore.now}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={score.compositeScore.future} className="w-16 h-2" />
                        <span className={cn('text-sm font-medium w-10 text-right', getScoreBgColor(score.compositeScore.future).split(' ')[1])}>
                          {score.compositeScore.future}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="secondary">
                        +{score.compositeScore.future - score.compositeScore.now}%
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge className={cn(getPriorityColor(score.redesignPriority))}>
                        {score.redesignPriority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedScores.map((score) => (
            <Link key={score.roleId} href={`/roles/${score.roleId}`}>
              <Card className="h-full hover:border-border-hover hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-medium">{score.roleName}</h3>
                      <p className="text-xs text-muted-foreground">{score.roleFamily}</p>
                    </div>
                    <Badge className={cn(getPriorityColor(score.redesignPriority))}>
                      {score.redesignPriority}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Now</span>
                        <span className="font-medium">{score.compositeScore.now}%</span>
                      </div>
                      <Progress value={score.compositeScore.now} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Future</span>
                        <span className="font-medium">{score.compositeScore.future}%</span>
                      </div>
                      <Progress value={score.compositeScore.future} className="h-2" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border text-center">
                    <Badge variant="secondary">
                      +{score.compositeScore.future - score.compositeScore.now}% improvement
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
