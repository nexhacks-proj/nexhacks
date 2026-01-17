// File conversion utilities for resume uploads

const ALLOWED_EXTENSIONS = ['.txt', '.pdf', '.docx', '.doc']

export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase()

  // Plain text files can be read directly in browser
  if (file.type === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text()
  }

  // PDF and DOCX need server-side processing
  if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return await convertFileOnServer(file)
  }

  throw new Error('Unsupported file type. Please upload .txt, .pdf, or .docx files.')
}

async function convertFileOnServer(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/files/convert', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to convert file')
  }

  const data = await response.json()
  return data.text
}

export function validateFileType(file: File): { valid: boolean; error?: string } {
  const fileName = file.name.toLowerCase()

  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Unsupported file type. Please upload ${ALLOWED_EXTENSIONS.join(', ')} files.`
    }
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.'
    }
  }

  return { valid: true }
}

export function getFileTypeLabel(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.pdf')) return 'PDF'
  if (lower.endsWith('.docx')) return 'Word'
  if (lower.endsWith('.doc')) return 'Word'
  if (lower.endsWith('.txt')) return 'Text'
  return 'File'
}
