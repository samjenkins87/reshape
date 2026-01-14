'use client'

import { ChevronRight, Building2, Briefcase, Layers } from 'lucide-react'
import { useContextStore } from '@/stores/context-store'
import { Button } from '@/components/ui/button'

// Demo data - will be moved to data files
const DEMO_DATA = {
  holdingGroups: [
    { id: 'omnicom', name: 'Omnicom' },
    { id: 'wpp', name: 'WPP' },
    { id: 'publicis', name: 'Publicis' },
  ],
  agencies: {
    omnicom: [
      { id: 'mccann-nz', name: 'McCann New Zealand', region: 'NZ' },
      { id: 'mccann-au', name: 'McCann Australia', region: 'AU' },
      { id: 'ddb-nz', name: 'DDB New Zealand', region: 'NZ' },
    ],
  },
  businessUnits: {
    'mccann-nz': [
      { id: 'mccann-nz-media', name: 'Media', type: 'media' },
      { id: 'mccann-nz-production', name: 'Production', type: 'production' },
      { id: 'mccann-nz-creative', name: 'Creative', type: 'creative' },
    ],
  },
}

export function ContextSwitcher() {
  const { holdingGroupId, agencyId, businessUnitId } = useContextStore()

  const holdingGroup = DEMO_DATA.holdingGroups.find((h) => h.id === holdingGroupId)
  const agencies = holdingGroupId ? DEMO_DATA.agencies[holdingGroupId as keyof typeof DEMO_DATA.agencies] || [] : []
  const agency = agencies.find((a) => a.id === agencyId)
  const businessUnits = agencyId ? DEMO_DATA.businessUnits[agencyId as keyof typeof DEMO_DATA.businessUnits] || [] : []
  const businessUnit = businessUnits.find((b) => b.id === businessUnitId)

  return (
    <Button
      variant="outline"
      className="h-auto py-2 px-3 justify-start gap-2 text-left max-w-md"
    >
      <div className="flex items-center gap-2 text-sm">
        {holdingGroup && (
          <>
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium truncate">{holdingGroup.name}</span>
          </>
        )}
        {agency && (
          <>
            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{agency.name}</span>
          </>
        )}
        {businessUnit && (
          <>
            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{businessUnit.name}</span>
          </>
        )}
      </div>
    </Button>
  )
}
