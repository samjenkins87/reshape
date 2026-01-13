import { NextRequest, NextResponse } from 'next/server'
import { extractScenarioFromText, ScenarioExtractionResult } from '@/lib/ai/scenario-extraction'
import { parseDocumentServerSide } from '@/lib/parsers/document-parser'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const description = formData.get('description') as string

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      )
    }

    // Parse uploaded files
    const documentTexts: string[] = []
    const files = formData.getAll('files') as File[]

    for (const file of files) {
      if (file && file.size > 0) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer())
          const parsedContent = await parseDocumentServerSide(
            buffer,
            file.name,
            file.type
          )
          documentTexts.push(parsedContent)
        } catch (error) {
          console.error(`Failed to parse file ${file.name}:`, error)
        }
      }
    }

    const combinedDocumentText = documentTexts.join('\n\n---\n\n')

    // Extract scenario using AI
    const result: ScenarioExtractionResult = await extractScenarioFromText(
      description,
      combinedDocumentText || undefined
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Scenario generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate scenario'
      },
      { status: 500 }
    )
  }
}
