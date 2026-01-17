import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const fileName = file.name.toLowerCase()
    let text = ''

    // Handle different file types
    if (fileName.endsWith('.txt')) {
      text = await file.text()
    } else if (fileName.endsWith('.pdf')) {
      text = await extractTextFromPDF(file)
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      text = await extractTextFromDocx(file)
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload .txt, .pdf, or .docx files.' },
        { status: 400 }
      )
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from file. The file may be empty or corrupted.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    console.error('File conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Dynamic import to avoid issues with Next.js bundling
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()

    // Dynamic import to avoid issues with Next.js bundling
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  } catch (error) {
    console.error('DOCX extraction error:', error)
    throw new Error('Failed to extract text from Word document')
  }
}
