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
  TrendingDown,
  Building2,
  ExternalLink,
  Lightbulb,
  Briefcase,
  MapPin,
  Code,
  Users,
  Zap,
  RefreshCw,
  Globe,
  Clock,
  Filter,
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'

// Extended company groups including regional
type ExtendedCompanyGroup = CompanyGroup | 'ANZ-Agency' | 'ANZ-Brand'

// NZ/AU Agency hiring data (simulated - would come from job board APIs)
const ANZ_SIGNALS: HiringSignal[] = [
  {
    id: 'anz-001',
    company: 'OMD New Zealand',
    companyGroup: 'HoldingCo',
    roleTitle: 'Digital Campaign Manager',
    roleCluster: 'Campaign Management',
    skills: ['Google Ads', 'Meta Business Suite', 'Campaign analytics', 'Client management'],
    requirements: ['3+ years digital media experience', 'Agency background', 'Strong data skills'],
    location: 'Auckland, NZ',
    insights: ['Traditional digital buying role - high automation risk', 'Consider AI-augmented campaign tools'],
  },
  {
    id: 'anz-002',
    company: 'PHD Australia',
    companyGroup: 'HoldingCo',
    roleTitle: 'Senior Data Analyst',
    roleCluster: 'Data & Analytics',
    skills: ['SQL', 'Python', 'Tableau', 'Media mix modeling', 'Attribution'],
    requirements: ['5+ years analytics experience', 'Media industry preferred', 'Advanced statistical skills'],
    location: 'Sydney, AU',
    insights: ['Growing demand for advanced analytics in ANZ agencies', 'AI/ML skills increasingly required'],
  },
  {
    id: 'anz-003',
    company: 'Mediabrands Australia',
    companyGroup: 'HoldingCo',
    roleTitle: 'AI & Automation Lead',
    roleCluster: 'AI Strategy',
    skills: ['AI implementation', 'Process automation', 'Change management', 'Stakeholder engagement'],
    requirements: ['7+ years media experience', 'AI/ML project experience', 'Leadership skills'],
    location: 'Melbourne, AU',
    insights: ['New role category emerging in ANZ holding companies', 'Focus on internal AI transformation'],
  },
  {
    id: 'anz-004',
    company: 'Spark Foundry NZ',
    companyGroup: 'HoldingCo',
    roleTitle: 'Programmatic Specialist',
    roleCluster: 'Programmatic',
    skills: ['DV360', 'Trade Desk', 'Programmatic strategy', 'Real-time optimization'],
    requirements: ['2+ years programmatic experience', 'DSP certification', 'Analytical mindset'],
    location: 'Auckland, NZ',
    insights: ['High automation potential - DSPs adding AI-native bidding', 'Role may evolve to AI oversight'],
  },
  {
    id: 'anz-005',
    company: 'Dentsu Australia',
    companyGroup: 'HoldingCo',
    roleTitle: 'Client Strategy Director',
    roleCluster: 'Strategy',
    skills: ['Strategic planning', 'Client leadership', 'Business development', 'Team management'],
    requirements: ['10+ years media experience', 'C-suite client relationships', 'P&L responsibility'],
    location: 'Sydney, AU',
    insights: ['Human-critical role - low automation risk', 'Focus on strategic value, not execution'],
  },
  {
    id: 'anz-006',
    company: 'GroupM New Zealand',
    companyGroup: 'HoldingCo',
    roleTitle: 'Marketing Scientist',
    roleCluster: 'Data Science',
    skills: ['Machine learning', 'Econometrics', 'Python/R', 'Marketing effectiveness'],
    requirements: ['PhD or Masters in quantitative field', 'Marketing analytics experience', 'Communication skills'],
    location: 'Auckland, NZ',
    insights: ['Emerging role in ANZ market', 'Bridges gap between data science and marketing'],
  },
  {
    id: 'anz-007',
    company: 'Wavemaker Australia',
    companyGroup: 'HoldingCo',
    roleTitle: 'Performance Media Manager',
    roleCluster: 'Performance',
    skills: ['Paid search', 'Paid social', 'Performance optimization', 'Budget management'],
    requirements: ['4+ years performance media', 'Google/Meta certifications', 'ROI focus'],
    location: 'Brisbane, AU',
    insights: ['Medium automation risk - AI handling more optimization', 'Evolving toward AI supervision role'],
  },
  {
    id: 'anz-008',
    company: 'Mindshare Australia',
    companyGroup: 'HoldingCo',
    roleTitle: 'Planning Director',
    roleCluster: 'Planning',
    skills: ['Media planning', 'Audience insights', 'Cross-channel strategy', 'Presentation skills'],
    requirements: ['8+ years planning experience', 'Leadership experience', 'Category expertise'],
    location: 'Sydney, AU',
    insights: ['Core planning skills remain valuable', 'AI augmentation for data-heavy tasks'],
  },
]

// Data source configuration
const DATA_SOURCES = [
  {
    id: 'linkedin',
    name: 'LinkedIn Jobs',
    status: 'connected',
    lastSync: '2 hours ago',
    jobCount: 12,
  },
  {
    id: 'seek',
    name: 'Seek ANZ',
    status: 'connected',
    lastSync: '4 hours ago',
    jobCount: 8,
  },
  {
    id: 'indeed',
    name: 'Indeed',
    status: 'connected',
    lastSync: '1 day ago',
    jobCount: 15,
  },
  {
    id: 'company-careers',
    name: 'Direct Career Pages',
    status: 'manual',
    lastSync: 'Manual updates',
    jobCount: 5,
  },
]

export default function HiringPage() {
  const [signals, setSignals] = useState<HiringSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState<'all' | 'global' | 'anz'>('all')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    async function loadData() {
      try {
        const globalSignals = await loadHiringSignals()
        // Combine with ANZ signals
        setSignals([...globalSignals, ...ANZ_SIGNALS])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLastRefresh(new Date())
    setRefreshing(false)
  }

  // Filter signals
  const filteredSignals = useMemo(() => {
    let result = signals

    // Region filter
    if (regionFilter === 'global') {
      result = result.filter(s => !s.location?.includes('NZ') && !s.location?.includes('AU'))
    } else if (regionFilter === 'anz') {
      result = result.filter(s => s.location?.includes('NZ') || s.location?.includes('AU'))
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.roleTitle.toLowerCase().includes(query) ||
        s.company.toLowerCase().includes(query) ||
        s.skills.some(skill => skill.toLowerCase().includes(query)) ||
        s.roleCluster.toLowerCase().includes(query)
      )
    }

    return result
  }, [signals, regionFilter, searchQuery])

  // Group signals
  const signalsByGroup = useMemo(() => {
    return {
      holdingCo: filteredSignals.filter(s => s.companyGroup === 'HoldingCo'),
      aiFirst: filteredSignals.filter(s => s.companyGroup === 'AI-First'),
      mediaEntertainment: filteredSignals.filter(s => s.companyGroup === 'MediaEntertainment'),
    }
  }, [filteredSignals])

  // ANZ specific stats
  const anzStats = useMemo(() => {
    const anzSignals = signals.filter(s => s.location?.includes('NZ') || s.location?.includes('AU'))
    const nzCount = signals.filter(s => s.location?.includes('NZ')).length
    const auCount = signals.filter(s => s.location?.includes('AU')).length
    return { total: anzSignals.length, nz: nzCount, au: auCount }
  }, [signals])

  // Group signals by role cluster
  const signalsByCluster = useMemo(() => {
    const clusters = new Map<string, HiringSignal[]>()
    filteredSignals.forEach(signal => {
      const existing = clusters.get(signal.roleCluster) || []
      clusters.set(signal.roleCluster, [...existing, signal])
    })
    // Sort by count
    return new Map([...clusters.entries()].sort((a, b) => b[1].length - a[1].length))
  }, [filteredSignals])

  // Get unique companies
  const companies = useMemo(() => {
    return [...new Set(filteredSignals.map(s => s.company))]
  }, [filteredSignals])

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Hiring Signals</h1>
          <p className="text-muted-foreground mt-1">
            Real-time market intelligence on hiring trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Updated {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            {refreshing ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Data Sources */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Data Sources</CardTitle>
            <Badge variant="outline" className="text-xs">
              {DATA_SOURCES.filter(s => s.status === 'connected').length}/{DATA_SOURCES.length} connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DATA_SOURCES.map((source) => (
              <div
                key={source.id}
                className="p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  {source.status === 'connected' ? (
                    <CheckCircle className="h-3 w-3 text-success" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-warning" />
                  )}
                  <span className="text-sm font-medium">{source.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{source.lastSync}</span>
                  <span>{source.jobCount} jobs</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles, companies, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={regionFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setRegionFilter('all')}
            size="sm"
          >
            <Globe className="h-4 w-4 mr-2" />
            All Regions
          </Button>
          <Button
            variant={regionFilter === 'anz' ? 'default' : 'outline'}
            onClick={() => setRegionFilter('anz')}
            size="sm"
          >
            <MapPin className="h-4 w-4 mr-2" />
            ANZ ({anzStats.total})
          </Button>
          <Button
            variant={regionFilter === 'global' ? 'default' : 'outline'}
            onClick={() => setRegionFilter('global')}
            size="sm"
          >
            Global
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredSignals.length}</p>
                <p className="text-xs text-muted-foreground">Total Signals</p>
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
                <p className="text-xs text-muted-foreground">AI-First</p>
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
                <p className="text-xs text-muted-foreground">Holding Cos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{anzStats.nz}</p>
                <p className="text-xs text-muted-foreground">New Zealand</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{anzStats.au}</p>
                <p className="text-xs text-muted-foreground">Australia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Role Clusters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">In-Demand Role Categories</CardTitle>
          <CardDescription>
            Most active hiring areas across tracked companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from(signalsByCluster.entries()).slice(0, 8).map(([cluster, clusterSignals]) => {
              // Determine trend (simulated)
              const isGrowing = ['AI Strategy', 'Data Science', 'AI Engineering', 'ML Engineering'].includes(cluster)
              const isDeclining = ['Campaign Management', 'Programmatic'].includes(cluster)

              return (
                <div
                  key={cluster}
                  className={cn(
                    'p-4 rounded-lg border transition-colors',
                    isGrowing && 'border-success/50 bg-success/5',
                    isDeclining && 'border-warning/50 bg-warning/5',
                    !isGrowing && !isDeclining && 'border-border hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    {isGrowing && <TrendingUp className="h-4 w-4 text-success" />}
                    {isDeclining && <TrendingDown className="h-4 w-4 text-warning" />}
                  </div>
                  <p className="font-medium text-sm mb-1">{cluster}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">{clusterSignals.length}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        isGrowing && 'border-success text-success',
                        isDeclining && 'border-warning text-warning'
                      )}
                    >
                      {isGrowing ? 'Growing' : isDeclining ? 'Declining' : 'Stable'}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Signals by Company Group */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filteredSignals.length})</TabsTrigger>
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
          <SignalGrid signals={filteredSignals} getCompanyGroupColor={getCompanyGroupColor} getCompanyGroupIcon={getCompanyGroupIcon} />
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
          <p className="text-muted-foreground">No signals match your filters</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {signals.map((signal) => {
        const isANZ = signal.location?.includes('NZ') || signal.location?.includes('AU')

        return (
          <Card key={signal.id} className={cn('overflow-hidden', isANZ && 'ring-1 ring-accent/30')}>
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
                    {isANZ && (
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                        ANZ
                      </Badge>
                    )}
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
        )
      })}
    </div>
  )
}
