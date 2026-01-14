'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  Scale,
  Zap,
  Clock,
  BarChart3,
  User,
  Users,
  Shield,
  CheckCircle,
  Bot,
  Target
} from 'lucide-react'

const DIMENSION_WEIGHTS = [
  { name: 'Repeatability', weight: 20, type: 'positive', icon: Clock, description: 'How routine and repeatable are the tasks? Higher = more automatable.' },
  { name: 'Data Availability', weight: 15, type: 'positive', icon: BarChart3, description: 'Is structured data available to train AI models? Higher = more automatable.' },
  { name: 'Tool Maturity', weight: 20, type: 'positive', icon: Zap, description: 'How mature are AI tools for this type of work? Higher = more automatable.' },
  { name: 'Human Judgment', weight: 15, type: 'negative', icon: User, description: 'Does the work require nuanced human judgment? Higher = less automatable.' },
  { name: 'Stakeholder Interaction', weight: 10, type: 'negative', icon: Users, description: 'How much client/stakeholder interaction is required? Higher = less automatable.' },
  { name: 'Compliance Risk', weight: 10, type: 'negative', icon: Shield, description: 'What regulatory or compliance risks exist? Higher = less automatable.' },
  { name: 'Accountability', weight: 10, type: 'negative', icon: Target, description: 'How much accountability does this role carry? Higher = less automatable.' },
]

const FUTURE_MULTIPLIERS = [
  { dimension: 'Repeatability', multiplier: 1.0, change: 'Stable' },
  { dimension: 'Data Availability', multiplier: 1.2, change: '+20%' },
  { dimension: 'Tool Maturity', multiplier: 1.4, change: '+40%' },
  { dimension: 'Human Judgment', multiplier: 0.85, change: '-15%' },
  { dimension: 'Stakeholder Interaction', multiplier: 0.9, change: '-10%' },
  { dimension: 'Compliance Risk', multiplier: 0.95, change: '-5%' },
  { dimension: 'Accountability', multiplier: 1.0, change: 'Stable' },
]

const WAVE_THRESHOLDS = [
  { wave: 'Wave 1: Automate', minScore: 65, maxScore: 100, timeline: 'Months 1-6', color: 'destructive', icon: Bot, description: 'Highly automatable roles. Implement AI-first solutions immediately.' },
  { wave: 'Wave 2: Augment', minScore: 40, maxScore: 64, timeline: 'Months 7-12', color: 'warning', icon: Zap, description: 'Moderate automation potential. Deploy AI tools to augment human capabilities.' },
  { wave: 'Retained', minScore: 0, maxScore: 39, timeline: 'Ongoing', color: 'success', icon: User, description: 'Human-critical roles. Maintain with selective AI assistance.' },
]

export default function MethodologyPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Scoring Methodology</h1>
        <p className="text-muted-foreground mt-1">
          How we calculate automation potential and transformation waves
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Scoring Framework
          </CardTitle>
          <CardDescription>
            Our 7-dimension model for assessing role automation potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Each role is scored across 7 dimensions on a 0-5 scale. Three dimensions are <span className="text-success font-medium">positive factors</span> (higher = more automatable) and four are <span className="text-destructive font-medium">negative factors</span> (higher = less automatable). The weighted combination produces a composite automation score from 0-100%.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-medium text-success">Positive Factors</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Repeatability, Data Availability, Tool Maturity
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Higher scores increase automation potential
              </p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="font-medium text-destructive">Negative Factors</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Human Judgment, Stakeholder Interaction, Compliance Risk, Accountability
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Higher scores decrease automation potential
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Dimension Weights
          </CardTitle>
          <CardDescription>
            How each dimension contributes to the overall score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DIMENSION_WEIGHTS.map((dim) => {
              const Icon = dim.icon
              return (
                <div key={dim.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${dim.type === 'positive' ? 'text-success' : 'text-destructive'}`} />
                      <span className="font-medium">{dim.name}</span>
                      <Badge variant="outline" className={dim.type === 'positive' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}>
                        {dim.type === 'positive' ? '+' : '-'}
                      </Badge>
                    </div>
                    <span className="font-medium">{dim.weight}%</span>
                  </div>
                  <Progress value={dim.weight * 5} className="h-2" />
                  <p className="text-xs text-muted-foreground">{dim.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Future Multipliers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Future Score Projections (12-18 Months)
          </CardTitle>
          <CardDescription>
            Expected technology improvements and their impact on automation potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Future scores account for anticipated AI advancements. Tool maturity is expected to improve most significantly (+40%), while the importance of human judgment in certain tasks may decrease as AI becomes more capable.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium">Dimension</th>
                  <th className="text-right p-3 text-sm font-medium">Multiplier</th>
                  <th className="text-right p-3 text-sm font-medium">Impact</th>
                </tr>
              </thead>
              <tbody>
                {FUTURE_MULTIPLIERS.map((item) => (
                  <tr key={item.dimension} className="border-b border-border">
                    <td className="p-3">{item.dimension}</td>
                    <td className="p-3 text-right font-mono">{item.multiplier}x</td>
                    <td className="p-3 text-right">
                      <Badge variant="outline" className={
                        item.change.includes('+') ? 'bg-success/10 text-success' :
                        item.change.includes('-') ? 'bg-destructive/10 text-destructive' :
                        'bg-muted text-muted-foreground'
                      }>
                        {item.change}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Wave Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Transformation Waves
          </CardTitle>
          <CardDescription>
            How roles are classified into transformation waves based on their scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {WAVE_THRESHOLDS.map((wave) => {
              const Icon = wave.icon
              return (
                <div
                  key={wave.wave}
                  className={`p-4 rounded-lg border ${
                    wave.color === 'destructive' ? 'bg-destructive/5 border-destructive/20' :
                    wave.color === 'warning' ? 'bg-warning/5 border-warning/20' :
                    'bg-success/5 border-success/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${
                        wave.color === 'destructive' ? 'text-destructive' :
                        wave.color === 'warning' ? 'text-warning' :
                        'text-success'
                      }`} />
                      <span className="font-medium">{wave.wave}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{wave.minScore}-{wave.maxScore}%</Badge>
                      <Badge variant="outline">{wave.timeline}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{wave.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Data Sources & Validation
          </CardTitle>
          <CardDescription>
            Where our data comes from and its validation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Role Definitions & Tasks</p>
                <p className="text-sm text-muted-foreground">AOTF Task Summary with Salaries</p>
              </div>
              <Badge className="bg-success/10 text-success">Verified</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Automation Scoring Framework</p>
                <p className="text-sm text-muted-foreground">Industry research + AI capability assessment</p>
              </div>
              <Badge className="bg-success/10 text-success">Verified</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Future Technology Multipliers</p>
                <p className="text-sm text-muted-foreground">Based on AI development trajectories</p>
              </div>
              <Badge className="bg-warning/10 text-warning">Estimate</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Financial Assumptions</p>
                <p className="text-sm text-muted-foreground">21% staff loading, 13% business overhead</p>
              </div>
              <Badge className="bg-warning/10 text-warning">Assumption</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Score Calculation Formula
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm space-y-2">
            <p className="text-muted-foreground">{`// Positive factors (higher = more automatable)`}</p>
            <p>positiveScore = (repeatability × 0.20) + (dataAvailability × 0.15) + (toolMaturity × 0.20)</p>
            <p className="text-muted-foreground mt-4">{`// Negative factors (inverted: 6 - score)`}</p>
            <p>negativeScore = ((6 - humanJudgment) × 0.15) + ((6 - stakeholder) × 0.10) + ((6 - compliance) × 0.10) + ((6 - accountability) × 0.10)</p>
            <p className="text-muted-foreground mt-4">{`// Composite score (normalized to 0-100)`}</p>
            <p>compositeScore = ((positiveScore + negativeScore - 1) / 4) × 100</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
