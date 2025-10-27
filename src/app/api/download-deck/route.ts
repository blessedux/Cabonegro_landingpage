import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Create a new JSZip instance
    const zip = new JSZip()
    
    // Define the PDF file path (you'll need to place your PDF here)
    const pdfPath = path.join(process.cwd(), 'public', 'downloads', 'investors-deck.pdf')
    
    // Check if the PDF file exists
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { error: 'PDF file not found' },
        { status: 404 }
      )
    }
    
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath)
    
    // Add the PDF to the zip file
    zip.file('Cabo_Negro_Investors_Deck.pdf', pdfBuffer)
    
    // Add a README file with additional information
    const readmeContent = `Cabo Negro - Strategic Investment in Green Hydrogen & Global Trade

This investor deck contains comprehensive information about:
- Strategic Gateway Location
- H2V Opportunity Analysis
- Industrial Park Specifications
- Maritime Terminal Development
- Regulatory Advantages
- Wind Power Potential

For more information, visit: https://cabonegro.com

© 2024 Cabo Negro. All rights reserved.`

    zip.file('README.txt', readmeContent)
    
    // Generate the zip file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    
    // Set response headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'application/zip')
    headers.set('Content-Disposition', 'attachment; filename="Cabo_Negro_Investors_Deck.zip"')
    headers.set('Content-Length', zipBuffer.length.toString())
    
    return new NextResponse(zipBuffer, {
      status: 200,
      headers,
    })
    
  } catch (error) {
    console.error('Error creating zip file:', error)
    return NextResponse.json(
      { error: 'Failed to create download file' },
      { status: 500 }
    )
  }
}
