'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { loadRoles, loadScores } from '@/lib/data'
import { Role, RoleScore } from '@/types'
import { cn } from '@/lib/utils'
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  Zap,
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  Circle
} from 'lucide-react'

// Reskilling pathway data (would come from API in production)
const RESKILLING_PATHWAYS = [
  {
    id: 'data-to-analytics',
    fromRole: 'Media Planner',
    toRole: 'Analytics Lead',
    duration: '3-6 months',
    difficulty: 'Medium',
    skills: ['Advanced Analytics', 'Python/R', 'Data Visualization', 'Statistical Modeling'],
    courses: [
      { name: 'Google Analytics Certification', duration: '40 hours', provider: 'Google' },
      { name: 'Data Analysis with Python', duration: '60 hours', provider: 'Coursera' },
      { name: 'Tableau Desktop Specialist', duration: '30 hours', provider: 'Tableau' },
    ],
    successRate: 85,
  },
  {
    id: 'buyer-to-strategist',
    fromRole: 'Media Buyer',
    toRole: 'AI Strategy Consultant',
    duration: '6-9 months',
    difficulty: 'High',
    skills: ['AI/ML Fundamentals', 'Prompt Engineering', 'Strategic Planning', 'Client Consulting'],
    courses: [
      { name: 'AI for Everyone', duration: '20 hours', provider: 'DeepLearning.AI' },
      { name: 'Prompt Engineering for ChatGPT', duration: '15 hours', provider: 'Vanderbilt' },
      { name: 'Strategic Thinking', duration: '40 hours', provider: 'LinkedIn Learning' },
    ],
    successRate: 72,
  },
  {
    id: 'coordinator-to-automation',
    fromRole: 'Campaign Coordinator',
    toRole: 'Marketing Automation Specialist',
    duration: '2-4 months',
    difficulty: 'Low',
    skills: ['Marketing Automation Platforms', 'Workflow Design', 'CRM Integration', 'Email Marketing'],
    courses: [
      { name: 'HubSpot Marketing Software', duration: '25 hours', provider: 'HubSpot' },
      { name: 'Salesforce Marketing Cloud', duration: '35 hours', provider: 'Salesforce' },
      { name: 'Zapier Expert', duration: '15 hours', provider: 'Zapier' },
    ],
    successRate: 92,
  },
  {
    id: 'ops-to-ai-ops',
    fromRole: 'Ad Operations',
    toRole: 'AI Operations Manager',
    duration: '4-6 months',
    difficulty: 'Medium',
    skills: ['AI Tool Management', 'Process Optimization', 'Quality Assurance', 'Team Leadership'],
    courses: [
      { name: 'AI Tools for Business', duration: '30 hours', provider: 'edX' },
      { name: 'Process Improvement with AI', duration: '25 hours', provider: 'Udemy' },
      { name: 'Leadership Essentials', duration: '20 hours', provider: 'LinkedIn Learning' },
    ],
    successRate: 78,
  },
]

export default function ReskillingPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [scores, setScores] = useState<RoleScore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null)

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

  // Calculate reskilling metrics
  const metrics = useMemo(() => {
    const highAutomation = scores.filter(s => s.compositeScore.now >= 65)
    const mediumAutomation = scores.filter(s => s.compositeScore.now >= 40 && s.compositeScore.now < 65)
    const totalAffected = highAutomation.length + mediumAutomation.length

    return {
      totalAffected,
      highAutomation: highAutomation.length,
      mediumAutomation: mediumAutomation.length,
      pathwaysAvailable: RESKILLING_PATHWAYS.length,
      avgSuccessRate: Math.round(
        RESKILLING_PATHWAYS.reduce((sum, p) => sum + p.successRate, 0) / RESKILLING_PATHWAYS.length
      ),
    }
  }, [scores])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Low':
        return 'bg-success/10 text-success'
      case 'Medium':
        return 'bg-warning/10 text-warning'
      case 'High':
        return 'bg-destructive/10 text-destructive'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded w-16 mb-2" />
                <div className="h-4 bg-muted rounded w-24" />
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
          <h1 className="text-2xl font-semibold">AI Reskilling Engine</h1>
          <p className="text-muted-foreground mt-1">
            Pathways to transition workforce into AI-augmented roles
          </p>
        </div>
        <Button>
          <GraduationCap className="h-4 w-4 mr-2" />
          Create Custom Pathway
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalAffected}</p>
                <p className="text-sm text-muted-foreground">Roles to Reskill</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.pathwaysAvailable}</p>
                <p className="text-sm text-muted-foreground">Available Pathways</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Award className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.avgSuccessRate}%</p>
                <p className="text-sm text-muted-foreground">Avg Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">3-6</p>
                <p className="text-sm text-muted-foreground">Avg Months</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reskilling Pathways */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommended Pathways</CardTitle>
          <CardDescription>
            AI-generated reskilling paths based on current role skills and market demand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RESKILLING_PATHWAYS.map((pathway) => (
              <div
                key={pathway.id}
                className={cn(
                  'p-4 rounded-lg border border-border transition-colors cursor-pointer',
                  selectedPathway === pathway.id ? 'bg-accent/5 border-accent' : 'hover:bg-muted/50'
                )}
                onClick={() => setSelectedPathway(selectedPathway === pathway.id ? null : pathway.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Pathway Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline">{pathway.fromRole}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Badge className="bg-accent/10 text-accent">{pathway.toRole}</Badge>
                    </div>

                    {/* Pathway Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{pathway.duration}</span>
                      </div>
                      <Badge className={getDifficultyColor(pathway.difficulty)}>
                        {pathway.difficulty} Difficulty
                      </Badge>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-success">{pathway.successRate}% success rate</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {pathway.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>

                {/* Expanded Content */}
                {selectedPathway === pathway.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <h4 className="text-sm font-medium">Recommended Courses</h4>
                    <div className="space-y-2">
                      {pathway.courses.map((course, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-medium text-accent">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{course.name}</p>
                              <p className="text-xs text-muted-foreground">{course.provider}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {course.duration}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button className="flex-1">
                        <Zap className="h-4 w-4 mr-2" />
                        Enroll Team Members
                      </Button>
                      <Button variant="outline">
                        Download Pathway
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skills Gap Analysis</CardTitle>
          <CardDescription>
            Current workforce capabilities vs. AI-augmented role requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { skill: 'AI/ML Fundamentals', current: 25, required: 80 },
              { skill: 'Data Analysis', current: 60, required: 85 },
              { skill: 'Automation Tools', current: 40, required: 90 },
              { skill: 'Strategic Thinking', current: 70, required: 75 },
              { skill: 'Client Communication', current: 85, required: 80 },
              { skill: 'Process Optimization', current: 45, required: 85 },
            ].map((skill) => (
              <div key={skill.skill} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{skill.skill}</span>
                  <span className="text-muted-foreground">
                    {skill.current}% → {skill.required}%
                  </span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-accent/30 rounded-full"
                    style={{ width: `${skill.required}%` }}
                  />
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full',
                      skill.current >= skill.required ? 'bg-success' : 'bg-accent'
                    )}
                    style={{ width: `${skill.current}%` }}
                  />
                </div>
                {skill.current < skill.required && (
                  <p className="text-xs text-destructive">
                    Gap: {skill.required - skill.current}% improvement needed
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
