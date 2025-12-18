'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('3D Scene Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-white mb-4">3D Scene Error</h2>
              <p className="text-gray-400 mb-6">
                {this.state.error?.message || 'An error occurred while loading the 3D scene.'}
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined })
                  window.location.reload()
                }}
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reload Scene
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
