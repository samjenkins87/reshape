import { create } from 'zustand'

interface ContextState {
  holdingGroupId: string | null
  agencyId: string | null
  businessUnitId: string | null
  setHoldingGroup: (id: string | null) => void
  setAgency: (id: string | null) => void
  setBusinessUnit: (id: string | null) => void
  setContext: (hg: string | null, agency: string | null, bu: string | null) => void
}

export const useContextStore = create<ContextState>((set) => ({
  holdingGroupId: 'omnicom',
  agencyId: 'fcb-nz',
  businessUnitId: 'fcb-nz-media',
  setHoldingGroup: (id) => set({ holdingGroupId: id, agencyId: null, businessUnitId: null }),
  setAgency: (id) => set({ agencyId: id, businessUnitId: null }),
  setBusinessUnit: (id) => set({ businessUnitId: id }),
  setContext: (hg, agency, bu) => set({ holdingGroupId: hg, agencyId: agency, businessUnitId: bu }),
}))
