'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { loadRoles, loadScores } from '@/lib/data'
import { Role, RoleScore } from '@/types'
import { useScenarioStore } from '@/stores/scenario-store'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Download,
  RotateCcw,
  Zap,
  Clock,
  Plus,
  Save,
  Building2,
  Calculator,
  PiggyBank,
  Target,
  ArrowRight,
  Trash2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react'
import { AIScenarioModal } from '@/components/scenario/AIScenarioModal'

// Business overhead assumption (staff costs already include 21% loading in preset data)
const BUSINESS_OVERHEAD_RATE = 0.13 // 13% of revenue

// Preset scenarios
const PRESET_SCENARIOS = [
  {
    id: 'mccann-media',
    name: 'McCann Media',
    description: 'Single agency business unit - NZ Media',
    fte: 46,
    staffCost: 6600550,  // Base $5.455M × 1.21 loading
    revenue: 11904526,
    avgSalary: 143490,   // $6.6M / 46 FTE
    aiInvestment: 250000,
  },
  {
    id: 'omnicom-oceania-media',
    name: 'Omnicom Oceania Media',
    description: 'Holding group media division',
    fte: 1200,
    staffCost: 144000000,
    revenue: 320000000,
    avgSalary: 120000,
    aiInvestment: 6000000,
  },
]

interface ScenarioInputs {
  name: string
  fte: number
  staffCost: number
  revenue: number
  avgSalary: number
  aiInvestment: number
}

interface SavedScenario extends ScenarioInputs {
  id: string
  description: string
}

export default function ScenarioPage() {
  const [, setRoles] = useState<Role[]>([])
  const [scores, setScores] = useState<RoleScore[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activePreset, setActivePreset] = useState<string>('mccann-media')
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([])
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [showAssumptions, setShowAssumptions] = useState(false)

  const [inputs, setInputs] = useState<ScenarioInputs>({
    name: 'McCann Media',
    fte: 46,
    staffCost: 6600550,
    revenue: 11904526,
    avgSalary: 143490,
    aiInvestment: 250000,
  })

  // Load saved scenarios from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('reshape-custom-scenarios')
    if (stored) {
      try {
        setSavedScenarios(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load saved scenarios:', e)
      }
    }
  }, [])

  const { reductionPercentage, timelineMonths, setReductionPercentage, setTimelineMonths, reset } = useScenarioStore()

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

  const loadPreset = (presetId: string) => {
    const preset = PRESET_SCENARIOS.find(p => p.id === presetId)
    if (preset) {
      setInputs({
        name: preset.name,
        fte: preset.fte,
        staffCost: preset.staffCost,
        revenue: preset.revenue,
        avgSalary: preset.avgSalary,
        aiInvestment: preset.aiInvestment,
      })
      setActivePreset(presetId)
      setIsEditing(false)
    }
  }

  const loadSavedScenario = (scenarioId: string) => {
    const scenario = savedScenarios.find(s => s.id === scenarioId)
    if (scenario) {
      setInputs({
        name: scenario.name,
        fte: scenario.fte,
        staffCost: scenario.staffCost,
        revenue: scenario.revenue,
        avgSalary: scenario.avgSalary,
        aiInvestment: scenario.aiInvestment,
      })
      setActivePreset(scenarioId)
      setIsEditing(false)
    }
  }

  const saveCustomScenario = () => {
    if (!inputs.name || inputs.fte <= 0) return

    const newScenario: SavedScenario = {
      id: `custom-${Date.now()}`,
      name: inputs.name,
      description: 'Custom scenario',
      fte: inputs.fte,
      staffCost: inputs.staffCost,
      revenue: inputs.revenue,
      avgSalary: inputs.avgSalary,
      aiInvestment: inputs.aiInvestment,
    }

    const updated = [...savedScenarios, newScenario]
    setSavedScenarios(updated)
    localStorage.setItem('reshape-custom-scenarios', JSON.stringify(updated))
    setActivePreset(newScenario.id)
    setIsEditing(false)
  }

  const deleteCustomScenario = (scenarioId: string) => {
    const updated = savedScenarios.filter(s => s.id !== scenarioId)
    setSavedScenarios(updated)
    localStorage.setItem('reshape-custom-scenarios', JSON.stringify(updated))

    // If we deleted the active scenario, switch to default
    if (activePreset === scenarioId) {
      loadPreset('mccann-media')
    }
  }

  const handleAIScenarioCreate = (
    scenario: ScenarioInputs,
    reductionPct: number,
    timeline: number
  ) => {
    // Update the inputs
    setInputs(scenario)

    // Save as custom scenario
    const newScenario: SavedScenario = {
      id: `ai-${Date.now()}`,
      name: scenario.name,
      description: 'AI-generated scenario',
      fte: scenario.fte,
      staffCost: scenario.staffCost,
      revenue: scenario.revenue,
      avgSalary: scenario.avgSalary,
      aiInvestment: scenario.aiInvestment,
    }

    const updated = [...savedScenarios, newScenario]
    setSavedScenarios(updated)
    localStorage.setItem('reshape-custom-scenarios', JSON.stringify(updated))
    setActivePreset(newScenario.id)
    setIsEditing(false)

    // Apply suggested parameters
    setReductionPercentage(reductionPct)
    setTimelineMonths(timeline)
  }

  // Calculate scenario impacts
  const scenario = useMemo(() => {
    const targetFTE = Math.round(inputs.fte * (1 - reductionPercentage / 100))
    const fteReduction = inputs.fte - targetFTE
    const targetStaffCost = inputs.staffCost * (1 - reductionPercentage / 100)
    const targetAvgSalary = targetFTE > 0 ? targetStaffCost / targetFTE : 0
    const targetRevenuePerFTE = targetFTE > 0 ? inputs.revenue / targetFTE : 0
    const currentRevenuePerFTE = inputs.fte > 0 ? inputs.revenue / inputs.fte : 0

    // Calculate overhead based on revenue (13%)
    const currentOverhead = inputs.revenue * BUSINESS_OVERHEAD_RATE
    const targetOverhead = inputs.revenue * BUSINESS_OVERHEAD_RATE * 0.95 // Slight reduction due to efficiency

    // Gross margin = (Revenue - Staff Cost) / Revenue
    const currentGrossMargin = inputs.revenue > 0 ? (inputs.revenue - inputs.staffCost) / inputs.revenue : 0
    const targetGrossMargin = inputs.revenue > 0 ? (inputs.revenue - targetStaffCost) / inputs.revenue : 0

    // Operating margin = (Revenue - Staff Cost - Overhead) / Revenue
    const currentMargin = inputs.revenue > 0 ? (inputs.revenue - inputs.staffCost - currentOverhead) / inputs.revenue : 0
    const targetMargin = inputs.revenue > 0 ? (inputs.revenue - targetStaffCost - targetOverhead) / inputs.revenue : 0

    const savings = inputs.staffCost - targetStaffCost
    const netBenefit = savings - inputs.aiInvestment
    const roi = inputs.aiInvestment > 0 ? netBenefit / inputs.aiInvestment : 0
    const paybackMonths = savings > 0 ? Math.ceil((inputs.aiInvestment / savings) * 12) : 0

    return {
      current: {
        fte: inputs.fte,
        staffCost: inputs.staffCost,
        avgSalary: inputs.avgSalary,
        revenue: inputs.revenue,
        revenuePerFTE: currentRevenuePerFTE,
        grossMargin: currentGrossMargin,
        operatingMargin: currentMargin,
        overhead: currentOverhead,
      },
      target: {
        fte: targetFTE,
        staffCost: targetStaffCost,
        avgSalary: targetAvgSalary,
        revenue: inputs.revenue,
        revenuePerFTE: targetRevenuePerFTE,
        grossMargin: targetGrossMargin,
        operatingMargin: targetMargin,
        overhead: targetOverhead,
      },
      fteReduction,
      savings,
      aiInvestment: inputs.aiInvestment,
      netBenefit,
      roi,
      paybackMonths,
    }
  }, [inputs, reductionPercentage])

  // Calculate role impacts
  const roleImpacts = useMemo(() => {
    const wave1 = scores.filter(s => s.compositeScore.now >= 65)
    const wave2 = scores.filter(s => s.compositeScore.now >= 40 && s.compositeScore.now < 65)
    const retained = scores.filter(s => s.compositeScore.now < 40)

    return { wave1, wave2, retained }
  }, [scores])

  // Calculate risks
  const risks = useMemo(() => {
    const riskList = []

    if (reductionPercentage > 40) {
      riskList.push({
        type: 'client',
        severity: 'high',
        message: 'High client service risk with >40% reduction',
        mitigation: 'Phase changes between campaign cycles',
      })
    }

    if (reductionPercentage > 30 && timelineMonths <= 6) {
      riskList.push({
        type: 'timeline',
        severity: 'medium',
        message: 'Aggressive timeline may cause disruption',
        mitigation: 'Consider 12-month phased approach',
      })
    }

    if (reductionPercentage > 50) {
      riskList.push({
        type: 'capability',
        severity: 'high',
        message: 'Strategy capability at risk',
        mitigation: 'Ensure AI augmentation tools in place',
      })
    }

    if (scenario.paybackMonths > 24) {
      riskList.push({
        type: 'financial',
        severity: 'medium',
        message: 'Long payback period (>24 months)',
        mitigation: 'Review AI investment allocation',
      })
    }

    return riskList
  }, [reductionPercentage, timelineMonths, scenario.paybackMonths])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Scenario Builder</h1>
          <p className="text-muted-foreground mt-1">
            Model workforce transformation scenarios at any scale
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { reset(); loadPreset('mccann-media'); }}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Scenario</CardTitle>
          <CardDescription>Choose a preset or create your own custom scenario</CardDescription>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Preset Scenarios */}
              {PRESET_SCENARIOS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset.id)}
                  className={cn(
                    'p-4 rounded-lg border text-left transition-all',
                    activePreset === preset.id
                      ? 'border-accent bg-accent/5 ring-2 ring-accent'
                      : 'border-border hover:border-accent/50 hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{preset.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{preset.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">FTE:</span>{' '}
                      <span className="font-medium">{preset.fte.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Revenue:</span>{' '}
                      <span className="font-medium">{formatCurrency(preset.revenue)}</span>
                    </div>
                  </div>
                </button>
              ))}

              {/* Saved Custom Scenarios */}
              {savedScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={cn(
                    'p-4 rounded-lg border text-left transition-all relative group',
                    activePreset === scenario.id
                      ? 'border-accent bg-accent/5 ring-2 ring-accent'
                      : 'border-border hover:border-accent/50 hover:bg-muted/50'
                  )}
                >
                  <button
                    onClick={() => loadSavedScenario(scenario.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-accent" />
                      <span className="font-medium">{scenario.name}</span>
                      <Badge variant="outline" className="text-[10px] ml-auto">Custom</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{scenario.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">FTE:</span>{' '}
                        <span className="font-medium">{scenario.fte.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue:</span>{' '}
                        <span className="font-medium">{formatCurrency(scenario.revenue)}</span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteCustomScenario(scenario.id)
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 text-destructive"
                    title="Delete scenario"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* Create Your Own Card */}
              <button
                onClick={() => {
                  setIsEditing(true)
                  setActivePreset('')
                  setInputs({
                    name: '',
                    fte: 0,
                    staffCost: 0,
                    revenue: 0,
                    avgSalary: 0,
                    aiInvestment: 0,
                  })
                }}
                className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 text-left transition-all hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center min-h-[140px]"
              >
                <div className="p-3 rounded-full bg-muted mb-3">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="font-medium">Create Your Own</span>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Custom scenario with your inputs
                </p>
              </button>
            </div>

            {/* AI Create Button */}
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={() => setAiModalOpen(true)}
                variant="outline"
                className="w-full border-accent/50 hover:bg-accent/10"
              >
                <Sparkles className="h-4 w-4 mr-2 text-accent" />
                Create with AI
                <span className="ml-2 text-xs text-muted-foreground">
                  Describe your scenario in plain English
                </span>
              </Button>
            </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Custom Scenario</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    loadPreset('mccann-media')
                  }}
                >
                  Cancel
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Scenario Name</label>
                  <Input
                    value={inputs.name}
                    onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                    placeholder="e.g., My Agency"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total FTE</label>
                  <Input
                    type="number"
                    value={inputs.fte || ''}
                    onChange={(e) => setInputs({ ...inputs, fte: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 150"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Revenue</label>
                  <Input
                    type="number"
                    value={inputs.revenue || ''}
                    onChange={(e) => setInputs({ ...inputs, revenue: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 25000000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Staff Cost</label>
                  <Input
                    type="number"
                    value={inputs.staffCost || ''}
                    onChange={(e) => setInputs({ ...inputs, staffCost: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 15000000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Avg Salary</label>
                  <Input
                    type="number"
                    value={inputs.avgSalary || ''}
                    onChange={(e) => setInputs({ ...inputs, avgSalary: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 120000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Investment</label>
                  <Input
                    type="number"
                    value={inputs.aiInvestment || ''}
                    onChange={(e) => setInputs({ ...inputs, aiInvestment: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 500000"
                  />
                </div>
              </div>
              {inputs.name && inputs.fte > 0 && (
                <div className="pt-4 border-t border-border">
                  <Button onClick={saveCustomScenario}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Scenario
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transformation Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reduction Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Target FTE Reduction</label>
              <div className="text-right">
                <span className="text-2xl font-bold">{reductionPercentage}%</span>
                <p className="text-xs text-muted-foreground">
                  {scenario.fteReduction} roles
                </p>
              </div>
            </div>
            <Slider
              value={[reductionPercentage]}
              onValueChange={(v) => setReductionPercentage(v[0])}
              min={5}
              max={60}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5%</span>
              <span>20%</span>
              <span>35%</span>
              <span>50%</span>
              <span>60%</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Implementation Timeline</label>
            <div className="flex gap-2">
              {[6, 12, 18, 24].map((months) => (
                <Button
                  key={months}
                  variant={timelineMonths === months ? 'default' : 'outline'}
                  onClick={() => setTimelineMonths(months)}
                  className="flex-1"
                >
                  {months} months
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <PiggyBank className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(scenario.savings)}</p>
                <p className="text-xs text-muted-foreground">Annual Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(inputs.aiInvestment)}</p>
                <p className="text-xs text-muted-foreground">AI Investment</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xl font-bold">{scenario.roi.toFixed(1)}x</p>
                <p className="text-xs text-muted-foreground">First Year ROI</p>
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
                <p className="text-xl font-bold">{scenario.paybackMonths} mo</p>
                <p className="text-xs text-muted-foreground">Payback Period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Financial Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Financial Breakdown: {inputs.name}
          </CardTitle>
          <CardDescription>
            Complete comparison of current state vs. target state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium">Metric</th>
                  <th className="text-right p-3 text-sm font-medium">Current State</th>
                  <th className="text-center p-3 text-sm font-medium w-12">
                    <ArrowRight className="h-4 w-4 mx-auto text-muted-foreground" />
                  </th>
                  <th className="text-right p-3 text-sm font-medium">Target State</th>
                  <th className="text-right p-3 text-sm font-medium">Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-muted/30">
                  <td className="p-3 font-medium" colSpan={5}>Workforce</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 pl-6 flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Total FTE
                  </td>
                  <td className="p-3 text-right font-mono">{scenario.current.fte.toLocaleString()}</td>
                  <td></td>
                  <td className="p-3 text-right font-mono">{scenario.target.fte.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <Badge variant="destructive">
                      -{scenario.fteReduction} ({reductionPercentage}%)
                    </Badge>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 pl-6 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Total Staff Cost
                  </td>
                  <td className="p-3 text-right font-mono">{formatCurrency(scenario.current.staffCost)}</td>
                  <td></td>
                  <td className="p-3 text-right font-mono">{formatCurrency(scenario.target.staffCost)}</td>
                  <td className="p-3 text-right">
                    <Badge className="bg-success text-success-foreground">
                      -{formatCurrency(scenario.savings)}
                    </Badge>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 pl-6 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Average Salary
                  </td>
                  <td className="p-3 text-right font-mono">{formatCurrency(scenario.current.avgSalary)}</td>
                  <td></td>
                  <td className="p-3 text-right font-mono">{formatCurrency(scenario.target.avgSalary)}</td>
                  <td className="p-3 text-right">
                    <Badge variant="outline">
                      {scenario.target.avgSalary >= scenario.current.avgSalary ? '+' : ''}
                      {Math.round((scenario.target.avgSalary / scenario.current.avgSalary - 1) * 100)}%
                    </Badge>
                  </td>
                </tr>

                <tr className="border-b border-border bg-muted/30">
                  <td className="p-3 font-medium" colSpan={5}>Revenue & Efficiency</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 pl-6 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Total Revenue
                  </td>
                  <td className="p-3 text-right font-mono">{formatCurrency(scenario.current.revenue)}</td>
                  <td></td>
                  <td className="p-3 text-right font-mono">{formatCurrency(scenario.target.revenue)}</td>
                  <td className="p-3 text-right">
                    <Badge variant="outline">No change</Badge>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 pl-6 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Revenue per FTE
                  </td>
                  <td className="p-3 text-right font-mono">{formatCurrency(scenario.current.revenuePerFTE)}</td>
                  <td></td>
                  <td className="p-3 text-right font-mono">{formatCurrency(scenario.target.revenuePerFTE)}</td>
                  <td className="p-3 text-right">
                    <Badge className="bg-success text-success-foreground">
                      +{Math.round((scenario.target.revenuePerFTE / scenario.current.revenuePerFTE - 1) * 100)}%
                    </Badge>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 pl-6 flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    Operating Margin
                  </td>
                  <td className="p-3 text-right font-mono">{(scenario.current.operatingMargin * 100).toFixed(1)}%</td>
                  <td></td>
                  <td className="p-3 text-right font-mono">{(scenario.target.operatingMargin * 100).toFixed(1)}%</td>
                  <td className="p-3 text-right">
                    <Badge className="bg-success text-success-foreground">
                      +{((scenario.target.operatingMargin - scenario.current.operatingMargin) * 100).toFixed(1)} pts
                    </Badge>
                  </td>
                </tr>

                <tr className="border-b border-border bg-muted/30">
                  <td className="p-3 font-medium" colSpan={5}>Investment & Returns</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 pl-6 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    AI Investment (Year 1)
                  </td>
                  <td className="p-3 text-right font-mono">-</td>
                  <td></td>
                  <td className="p-3 text-right font-mono">{formatCurrency(inputs.aiInvestment)}</td>
                  <td className="p-3 text-right">
                    <Badge variant="outline">One-time</Badge>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 pl-6 flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                    Net Annual Benefit
                  </td>
                  <td className="p-3 text-right font-mono">-</td>
                  <td></td>
                  <td className="p-3 text-right font-mono text-success">{formatCurrency(scenario.netBenefit)}</td>
                  <td className="p-3 text-right">
                    <Badge className="bg-success text-success-foreground">
                      {scenario.roi.toFixed(1)}x ROI
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assumptions & Methodology Panel */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setShowAssumptions(!showAssumptions)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Assumptions & Methodology</CardTitle>
            </div>
            <Button variant="ghost" size="sm">
              {showAssumptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <CardDescription>
            Financial model assumptions and data sources
          </CardDescription>
        </CardHeader>
        {showAssumptions && (
          <CardContent className="space-y-6">
            {/* Staff Loading */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Staff Loading (21% on base salaries)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">KiwiSaver</p>
                  <p className="font-medium">3.0%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Bonuses & Incentives</p>
                  <p className="font-medium">10.0%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">ACC Levy (NZ)</p>
                  <p className="font-medium">1.5%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Leave & Other</p>
                  <p className="font-medium">6.5%</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Formula: Total Staff Cost = Base Salaries × 1.21
              </p>
            </div>

            {/* Business Overhead */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Business Overhead (13% of revenue)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Rent & Facilities</p>
                  <p className="font-medium">4.0%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Technology & Software</p>
                  <p className="font-medium">3.0%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Travel & Entertainment</p>
                  <p className="font-medium">1.5%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Other Operating</p>
                  <p className="font-medium">4.5%</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Current overhead: {formatCurrency(scenario.current.overhead)}
              </p>
            </div>

            {/* Data Sources */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Data Sources
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">FTE Count (46)</p>
                    <p className="text-xs text-muted-foreground">Org Chart - Jan 2026</p>
                  </div>
                  <Badge className="bg-success/10 text-success">Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Base Salary Data ($5.455M)</p>
                    <p className="text-xs text-muted-foreground">AOTF Task Summary with Salaries</p>
                  </div>
                  <Badge className="bg-success/10 text-success">Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">2026 Revenue ($11.9M)</p>
                    <p className="text-xs text-muted-foreground">Revenue Plan 2025 vs 2026</p>
                  </div>
                  <Badge className="bg-success/10 text-success">Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Staff Loading (21%)</p>
                    <p className="text-xs text-muted-foreground">Industry standard estimate</p>
                  </div>
                  <Badge className="bg-warning/10 text-warning">Assumption</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Business Overhead (13%)</p>
                    <p className="text-xs text-muted-foreground">Industry standard estimate</p>
                  </div>
                  <Badge className="bg-warning/10 text-warning">Assumption</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Role Impact by Wave */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Role Impact by Wave</CardTitle>
          <CardDescription>
            Based on automation scores, scaled to {inputs.name} headcount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wave1">
            <TabsList>
              <TabsTrigger value="wave1" className="gap-2">
                <Zap className="h-4 w-4" />
                Wave 1 ({roleImpacts.wave1.length})
              </TabsTrigger>
              <TabsTrigger value="wave2" className="gap-2">
                <Clock className="h-4 w-4" />
                Wave 2 ({roleImpacts.wave2.length})
              </TabsTrigger>
              <TabsTrigger value="retained">
                Retained ({roleImpacts.retained.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wave1" className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                High automation potential - implement in months 1-6
              </p>
              <div className="space-y-2">
                {roleImpacts.wave1.map((score) => (
                  <div key={score.roleId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{score.roleName}</p>
                      <p className="text-xs text-muted-foreground">{score.roleFamily}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={score.compositeScore.now} className="w-20 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{score.compositeScore.now}%</span>
                      <Badge variant="destructive">Automate</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wave2" className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Medium automation - AI-augment in months 7-12
              </p>
              <div className="space-y-2">
                {roleImpacts.wave2.map((score) => (
                  <div key={score.roleId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{score.roleName}</p>
                      <p className="text-xs text-muted-foreground">{score.roleFamily}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={score.compositeScore.now} className="w-20 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{score.compositeScore.now}%</span>
                      <Badge className="bg-warning text-warning-foreground">Augment</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="retained" className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Human-critical roles requiring strategic judgment
              </p>
              <div className="space-y-2">
                {roleImpacts.retained.map((score) => (
                  <div key={score.roleId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{score.roleName}</p>
                      <p className="text-xs text-muted-foreground">{score.roleFamily}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={score.compositeScore.now} className="w-20 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{score.compositeScore.now}%</span>
                      <Badge className="bg-success text-success-foreground">Retain</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Risk Indicators */}
      {risks.length > 0 && (
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Risk Indicators ({risks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.map((risk, index) => (
                <div key={index} className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-start gap-3">
                    <Badge className={risk.severity === 'high' ? 'bg-destructive' : 'bg-warning'}>
                      {risk.severity.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">{risk.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Mitigation: {risk.mitigation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Scenario Modal */}
      <AIScenarioModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        onScenarioCreate={handleAIScenarioCreate}
      />
    </div>
  )
}
