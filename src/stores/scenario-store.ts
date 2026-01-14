import { create } from 'zustand'

interface ScenarioState {
  reductionPercentage: number
  timelineMonths: number
  setReductionPercentage: (value: number) => void
  setTimelineMonths: (value: number) => void
  reset: () => void
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  reductionPercentage: 20,
  timelineMonths: 12,
  setReductionPercentage: (value) => set({ reductionPercentage: value }),
  setTimelineMonths: (value) => set({ timelineMonths: value }),
  reset: () => set({ reductionPercentage: 20, timelineMonths: 12 }),
}))
