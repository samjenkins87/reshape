'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import {
  Sparkles,
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react'
import type { ExtractedScenario, SuggestedParameters } from '@/lib/ai/scenario-extraction'

interface ScenarioInputs {
  name: string
  fte: number
  staffCost: number
  revenue: number
  avgSalary: number
  aiInvestment: number
}

interface AIScenarioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScenarioCreate: (
    scenario: ScenarioInputs,
    reductionPercentage: number,
    timelineMonths: number
  ) => void
}

type Step = 'input' | 'review'

export function AIScenarioModal({
  open,
  onOpenChange,
  onScenarioCreate,
}: AIScenarioModalProps) {
  const [step, setStep] = useState<Step>('input')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Extracted scenario state
  const [extractedScenario, setExtractedScenario] = useState<ExtractedScenario | null>(null)
  const [suggestedParams, setSuggestedParams] = useState<SuggestedParameters | null>(null)

  // Editable fields for review step
  const [editedScenario, setEditedScenario] = useState<ScenarioInputs>({
    name: '',
    fte: 0,
    staffCost: 0,
    revenue: 0,
    avgSalary: 0,
    aiInvestment: 0,
  })
  const [editedReduction, setEditedReduction] = useState(20)
  const [editedTimeline, setEditedTimeline] = useState<6 | 12 | 18 | 24>(12)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles].slice(0, 5)) // Max 5 files
  }, [])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = droppedFiles.filter(f =>
      /\.(xlsx|xls|csv|pdf|txt|docx)$/i.test(f.name)
    )
    setFiles(prev => [...prev, ...validFiles].slice(0, 5))
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe your scenario')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('description', description)
      files.forEach(file => formData.append('files', file))

      const response = await fetch('/api/scenario/generate', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate scenario')
      }

      setExtractedScenario(result.scenario)
      setSuggestedParams(result.suggestedParameters)

      // Populate editable fields
      setEditedScenario({
        name: result.scenario.name,
        fte: result.scenario.fte,
        staffCost: result.scenario.staffCost,
        revenue: result.scenario.revenue,
        avgSalary: result.scenario.avgSalary,
        aiInvestment: result.scenario.aiInvestment,
      })
      setEditedReduction(result.suggestedParameters.reductionPercentage)
      setEditedTimeline(result.suggestedParameters.timelineMonths)

      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleUseScenario = () => {
    onScenarioCreate(editedScenario, editedReduction, editedTimeline)
    handleClose()
  }

  const handleClose = () => {
    setStep('input')
    setDescription('')
    setFiles([])
    setError(null)
    setExtractedScenario(null)
    setSuggestedParams(null)
    onOpenChange(false)
  }

  const getConfidenceBadge = (level: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-success/10 text-success border-success/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      low: 'bg-muted text-muted-foreground border-border',
    }
    const dots = {
      high: '●●●',
      medium: '●●○',
      low: '●○○',
    }
    return (
      <span className={cn('text-xs px-1.5 py-0.5 rounded border', styles[level])}>
        {dots[level]}
      </span>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        {step === 'input' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Create with AI
              </DialogTitle>
              <DialogDescription>
                Describe your scenario and let AI extract the key metrics
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Description Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Describe your scenario</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., I'm running Omnicom Oceania's media division. We have about 2,500 people across ANZ with total revenue of $300M. Staff costs are around $200M. Average salary is roughly $105K. Looking to invest $5M in AI tools over the next year to improve efficiency..."
                  className="min-h-[150px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Include headcount, revenue, costs, and any transformation goals
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload documents (optional)</label>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    'hover:border-accent hover:bg-accent/5',
                    'border-muted-foreground/25'
                  )}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drop files or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, Excel, CSV supported
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv,.pdf,.txt,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* File List */}
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-sm"
                      >
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(i)
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Scenario
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Review Your Scenario
              </DialogTitle>
              <DialogDescription>
                Review and edit the extracted values before creating
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Confidence Legend */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {getConfidenceBadge('high')} Explicit
                </span>
                <span className="flex items-center gap-1">
                  {getConfidenceBadge('medium')} Derived
                </span>
                <span className="flex items-center gap-1">
                  {getConfidenceBadge('low')} Inferred
                </span>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Scenario Name</label>
                    {extractedScenario && getConfidenceBadge(extractedScenario.confidence.name)}
                  </div>
                  <Input
                    value={editedScenario.name}
                    onChange={(e) => setEditedScenario(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Total FTE</label>
                    {extractedScenario && getConfidenceBadge(extractedScenario.confidence.fte)}
                  </div>
                  <Input
                    type="number"
                    value={editedScenario.fte || ''}
                    onChange={(e) => setEditedScenario(prev => ({ ...prev, fte: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Annual Revenue</label>
                    {extractedScenario && getConfidenceBadge(extractedScenario.confidence.revenue)}
                  </div>
                  <Input
                    type="number"
                    value={editedScenario.revenue || ''}
                    onChange={(e) => setEditedScenario(prev => ({ ...prev, revenue: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Staff Costs</label>
                    {extractedScenario && getConfidenceBadge(extractedScenario.confidence.staffCost)}
                  </div>
                  <Input
                    type="number"
                    value={editedScenario.staffCost || ''}
                    onChange={(e) => setEditedScenario(prev => ({ ...prev, staffCost: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Avg Salary</label>
                    {extractedScenario && getConfidenceBadge(extractedScenario.confidence.avgSalary)}
                  </div>
                  <Input
                    type="number"
                    value={editedScenario.avgSalary || ''}
                    onChange={(e) => setEditedScenario(prev => ({ ...prev, avgSalary: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">AI Investment</label>
                    {extractedScenario && getConfidenceBadge(extractedScenario.confidence.aiInvestment)}
                  </div>
                  <Input
                    type="number"
                    value={editedScenario.aiInvestment || ''}
                    onChange={(e) => setEditedScenario(prev => ({ ...prev, aiInvestment: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Suggested Parameters */}
              {suggestedParams && (
                <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-accent" />
                    Recommended Transformation
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">FTE Reduction</label>
                      <select
                        value={editedReduction}
                        onChange={(e) => setEditedReduction(parseInt(e.target.value))}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(v => (
                          <option key={v} value={v}>{v}%</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Timeline</label>
                      <select
                        value={editedTimeline}
                        onChange={(e) => setEditedTimeline(parseInt(e.target.value) as 6 | 12 | 18 | 24)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value={6}>6 months</option>
                        <option value={12}>12 months</option>
                        <option value={18}>18 months</option>
                        <option value={24}>24 months</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground italic">
                    "{suggestedParams.rationale}"
                  </p>
                </div>
              )}

              {/* Assumptions */}
              {extractedScenario && extractedScenario.assumptions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Assumptions made</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {extractedScenario.assumptions.map((assumption, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-accent">•</span>
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleUseScenario} className="flex-1">
                Use This Scenario
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
