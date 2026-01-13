import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { RoleScore } from '@/types'
import { getScoreBgColor, getPriorityColor } from '@/lib/scoring'
import { ArrowRight } from 'lucide-react'

interface RoleCardProps {
  score: RoleScore
  showProgress?: boolean
  className?: string
}

export function RoleCard({ score, showProgress = true, className }: RoleCardProps) {
  return (
    <Link href={`/roles/${score.roleId}`}>
      <Card className={cn(
        'hover:border-border-hover hover:bg-muted/50 transition-colors cursor-pointer group',
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate group-hover:text-accent transition-colors">
                {score.roleName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {score.roleFamily}
              </p>
            </div>
            <Badge className={cn('shrink-0', getPriorityColor(score.redesignPriority))}>
              {score.redesignPriority}
            </Badge>
          </div>

          {showProgress && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Now</span>
                <span className={cn('font-medium', getScoreBgColor(score.compositeScore.now).split(' ')[1])}>
                  {score.compositeScore.now}%
                </span>
              </div>
              <Progress value={score.compositeScore.now} className="h-1.5" />

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Future (12-18mo)</span>
                <span className={cn('font-medium', getScoreBgColor(score.compositeScore.future).split(' ')[1])}>
                  {score.compositeScore.future}%
                </span>
              </div>
              <Progress value={score.compositeScore.future} className="h-1.5" />
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              +{score.compositeScore.future - score.compositeScore.now}% improvement
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
