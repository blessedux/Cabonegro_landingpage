// Global Google Maps loader to prevent multiple script loads

// Type declarations for Google Maps API
declare global {
  interface Window {
    google: {
      maps: any;
    };
  }
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader
  private scriptPromise: Promise<void> | null = null
  private isLoaded = false
  private isLoading = false
  private loadTimeout: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader()
    }
    return GoogleMapsLoader.instance
  }

  async loadGoogleMaps(): Promise<void> {
    // If already loaded, return immediately
    if (this.isLoaded && window.google && window.google.maps) {
      return Promise.resolve()
    }

    // If currently loading, return the existing promise
    if (this.isLoading && this.scriptPromise) {
      return this.scriptPromise
    }

    // If script already exists in DOM, wait for it
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      this.isLoading = true
      this.scriptPromise = new Promise((resolve, reject) => {
        let attempts = 0
        const maxAttempts = 50 // 5 seconds max wait
        
        const checkGoogle = () => {
          attempts++
          if (window.google && window.google.maps) {
            this.isLoaded = true
            this.isLoading = false
            resolve()
          } else if (attempts >= maxAttempts) {
            this.isLoading = false
            reject(new Error('Google Maps API failed to load within timeout'))
          } else {
            setTimeout(checkGoogle, 100)
          }
        }
        checkGoogle()
      })
      return this.scriptPromise
    }

    // Load the script
    this.isLoading = true
    this.scriptPromise = new Promise((resolve, reject) => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        const error = new Error('Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.')
        this.isLoading = false
        reject(error)
        return
      }

      // Set a timeout for script loading
      this.loadTimeout = setTimeout(() => {
        this.isLoading = false
        reject(new Error('Google Maps API loading timeout'))
      }, 10000) // 10 second timeout

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=geometry&loading=async`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout)
          this.loadTimeout = null
        }
        console.log('📦 Google Maps script loaded successfully')
        console.log('🔍 Google Maps API version:', (window as unknown as { google?: any }).google?.maps?.version || 'unknown')
        this.isLoaded = true
        this.isLoading = false
        resolve()
      }
      
      script.onerror = (error) => {
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout)
          this.loadTimeout = null
        }
        console.error('❌ Google Maps script failed to load:', error)
        this.isLoading = false
        reject(new Error('Failed to load Google Maps API'))
      }

      document.head.appendChild(script)
    })

    return this.scriptPromise
  }

  isGoogleMapsLoaded(): boolean {
    return this.isLoaded && window.google && window.google.maps
  }

  // Cleanup method
  cleanup(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout)
      this.loadTimeout = null
    }
  }
}

export default GoogleMapsLoader.getInstance()
