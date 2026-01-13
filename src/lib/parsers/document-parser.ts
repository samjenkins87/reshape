import * as XLSX from 'xlsx'

export interface ParsedDocument {
  filename: string
  content: string
  type: string
}

export async function parseDocument(
  file: File
): Promise<ParsedDocument> {
  const filename = file.name
  const extension = filename.split('.').pop()?.toLowerCase() || ''

  try {
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return await parseExcel(file, filename)
      case 'csv':
        return await parseCSV(file, filename)
      case 'pdf':
        return await parsePDF(file, filename)
      case 'txt':
        return await parseText(file, filename)
      case 'docx':
        return await parseWord(file, filename)
      default:
        return {
          filename,
          content: `Unsupported file type: ${extension}`,
          type: extension
        }
    }
  } catch (error) {
    console.error(`Error parsing ${filename}:`, error)
    return {
      filename,
      content: `Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      type: extension
    }
  }
}

async function parseExcel(file: File, filename: string): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  let content = `=== Excel File: ${filename} ===\n\n`

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]

    content += `--- Sheet: ${sheetName} ---\n`

    // Convert to readable format
    for (const row of json.slice(0, 100)) { // Limit to first 100 rows
      if (Array.isArray(row) && row.length > 0) {
        content += row.map(cell => String(cell ?? '')).join('\t') + '\n'
      }
    }

    content += '\n'
  }

  return {
    filename,
    content,
    type: 'excel'
  }
}

async function parseCSV(file: File, filename: string): Promise<ParsedDocument> {
  const text = await file.text()

  return {
    filename,
    content: `=== CSV File: ${filename} ===\n\n${text.slice(0, 50000)}`,
    type: 'csv'
  }
}

async function parsePDF(file: File, filename: string): Promise<ParsedDocument> {
  // For client-side, we can't use pdf-parse directly
  // We'll handle PDF parsing on the server side
  // Return a placeholder that signals server-side processing needed
  return {
    filename,
    content: `[PDF file - will be processed server-side]`,
    type: 'pdf'
  }
}

async function parseText(file: File, filename: string): Promise<ParsedDocument> {
  const text = await file.text()

  return {
    filename,
    content: `=== Text File: ${filename} ===\n\n${text.slice(0, 50000)}`,
    type: 'text'
  }
}

async function parseWord(file: File, filename: string): Promise<ParsedDocument> {
  // For client-side, mammoth needs to be handled differently
  // Return a placeholder for server-side processing
  return {
    filename,
    content: `[Word document - will be processed server-side]`,
    type: 'docx'
  }
}

// Server-side document parsing (for API route)
export async function parseDocumentServerSide(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const extension = filename.split('.').pop()?.toLowerCase() || ''

  try {
    switch (extension) {
      case 'xlsx':
      case 'xls': {
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        let content = `=== Excel File: ${filename} ===\n\n`

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName]
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]

          content += `--- Sheet: ${sheetName} ---\n`

          for (const row of json.slice(0, 100)) {
            if (Array.isArray(row) && row.length > 0) {
              content += row.map(cell => String(cell ?? '')).join('\t') + '\n'
            }
          }

          content += '\n'
        }

        return content
      }

      case 'csv':
        return `=== CSV File: ${filename} ===\n\n${buffer.toString('utf-8').slice(0, 50000)}`

      case 'txt':
        return `=== Text File: ${filename} ===\n\n${buffer.toString('utf-8').slice(0, 50000)}`

      case 'pdf': {
        // Dynamic import for pdf-parse (server-side only)
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse')
        const data = await pdfParse(buffer)
        return `=== PDF File: ${filename} ===\n\n${data.text.slice(0, 50000)}`
      }

      case 'docx': {
        // Dynamic import for mammoth (server-side only)
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        return `=== Word Document: ${filename} ===\n\n${result.value.slice(0, 50000)}`
      }

      default:
        return `Unsupported file type: ${extension}`
    }
  } catch (error) {
    console.error(`Error parsing ${filename}:`, error)
    return `Error parsing ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}
