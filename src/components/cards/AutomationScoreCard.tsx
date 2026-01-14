'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AutomationRadarChart } from '@/components/charts'
import { ScoreDimensions } from '@/types'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface AutomationScoreCardProps {
  nowScore: number
  futureScore: number
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  dimensions: ScoreDimensions
  timeHorizon?: string
  className?: string
}

export function AutomationScoreCard({
  nowScore,
  futureScore,
  priority,
  dimensions,
  timeHorizon = '12-18 Months',
  className,
}: AutomationScoreCardProps) {
  const getPriorityStyles = (p: string) => {
    switch (p) {
      case 'Critical':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'High':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'Medium':
        return 'bg-accent/10 text-accent border-accent/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side: Score summary */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Automation Score</h3>
              <Badge className={cn('border', getPriorityStyles(priority))}>
                {priority} Priority
              </Badge>
            </div>

            {/* Score progression */}
            <div className="flex items-center gap-4 mb-6">
              <div>
                <p className="text-4xl font-bold">{nowScore}%</p>
                <p className="text-sm text-muted-foreground">Now</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-4xl font-bold text-success">{futureScore}%</p>
                <p className="text-sm text-muted-foreground">{timeHorizon}</p>
              </div>
            </div>

            {/* Score change indicator */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Score increase:</span>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                +{futureScore - nowScore}%
              </Badge>
            </div>
          </div>

          {/* Right side: Radar chart */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <AutomationRadarChart
              dimensions={dimensions}
              size={280}
              showLabels={true}
            />
            <div className="flex items-center gap-2 mt-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(212,100%,48%)] opacity-25" />
              <span className="text-xs text-muted-foreground">Automation Potential</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
