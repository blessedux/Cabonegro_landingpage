'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

interface DownloadDeckButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  language?: 'en' | 'es' | 'zh'
}

export function DownloadDeckButton({ 
  className = '', 
  variant = 'outline',
  size = 'default',
  language = 'en'
}: DownloadDeckButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      
      // Call the API route to download the zip file with language parameter
      const response = await fetch(`/api/download-deck?lang=${language}`)
      
      if (!response.ok) {
        throw new Error('Failed to download file')
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create a download link with language-specific naming
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Set language-specific download filename
      const downloadFileName = language === 'en' ? 'Cabo_Negro_Investors_Deck.zip' : 
                              language === 'es' ? 'Cabo_Negro_Deck_Inversionistas.zip' :
                              'Cabo_Negro_Investors_Deck_CN.zip'
      link.download = downloadFileName
      
      // Trigger the download
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download the investor deck. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant={variant}
      size={size}
      className={`uppercase ${className}`}
    >
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preparing Download...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download Investors Deck
        </>
      )}
    </Button>
  )
}
