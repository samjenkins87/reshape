'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { ScoreDimensions } from '@/types'
import { cn } from '@/lib/utils'

interface DimensionConfig {
  key: keyof ScoreDimensions
  label: string
  fullName: string
  isNegative: boolean
}

const DIMENSION_CONFIG: DimensionConfig[] = [
  { key: 'repeatability', label: 'Repeatability', fullName: 'Repeatability', isNegative: false },
  { key: 'dataAvailability', label: 'Data Availability', fullName: 'Data Availability', isNegative: false },
  { key: 'toolMaturity', label: 'Tool Maturity', fullName: 'Tool Maturity', isNegative: false },
  { key: 'humanJudgment', label: 'Human Judgment', fullName: 'Human Judgment Required', isNegative: true },
  { key: 'stakeholderInteraction', label: 'Stakeholder', fullName: 'Stakeholder Interaction', isNegative: true },
  { key: 'complianceRisk', label: 'Compliance', fullName: 'Compliance Risk', isNegative: true },
  { key: 'accountability', label: 'Accountability', fullName: 'Accountability', isNegative: true },
]

export interface AutomationRadarChartProps {
  dimensions: ScoreDimensions
  size?: number
  showLabels?: boolean
  showLegend?: boolean
  futureDimensions?: ScoreDimensions
  className?: string
}

interface ChartDataPoint {
  dimension: string
  fullName: string
  value: number
  futureValue?: number
  isNegative: boolean
  impact: string
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }> }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium">{data.fullName}</p>
      <p className="text-muted-foreground text-xs mb-2">{data.impact}</p>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Score:</span>
        <span className="font-medium">{data.value}/5</span>
      </div>
      {data.futureValue !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Future:</span>
          <span className="font-medium">{data.futureValue}/5</span>
        </div>
      )}
    </div>
  )
}

export function AutomationRadarChart({
  dimensions,
  size = 300,
  showLegend = false,
  futureDimensions,
  className,
}: AutomationRadarChartProps) {
  // Transform dimensions to chart data
  const chartData: ChartDataPoint[] = DIMENSION_CONFIG.map((dim) => ({
    dimension: dim.label,
    fullName: dim.fullName,
    value: dimensions[dim.key],
    futureValue: futureDimensions?.[dim.key],
    isNegative: dim.isNegative,
    impact: dim.isNegative ? 'Higher = Less automatable' : 'Higher = More automatable',
  }))

  return (
    <div className={cn('w-full', className)} style={{ height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <PolarAngleAxis
            dataKey="dimension"
            tick={({ x, y, payload, textAnchor }) => {
              const item = chartData.find((d) => d.dimension === payload.value)
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  className={cn(
                    'text-[11px] fill-current',
                    item?.isNegative ? 'text-muted-foreground' : 'text-foreground'
                  )}
                >
                  {payload.value}
                </text>
              )
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tickCount={6}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />

          {/* Current scores polygon */}
          <Radar
            name="Automation Potential"
            dataKey="value"
            stroke="hsl(212, 100%, 48%)"
            fill="hsl(212, 100%, 48%)"
            fillOpacity={0.25}
            strokeWidth={2}
          />

          {/* Optional: Future scores polygon */}
          {futureDimensions && (
            <Radar
              name="Future (12-18mo)"
              dataKey="futureValue"
              stroke="hsl(212, 100%, 48%)"
              fill="hsl(212, 100%, 48%)"
              fillOpacity={0.1}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          )}

          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
