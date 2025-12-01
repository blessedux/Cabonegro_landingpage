'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals'

interface WebVitalsProps {
  analyticsId?: string
  debug?: boolean
}

export function WebVitals({ analyticsId, debug = false }: WebVitalsProps) {
  useEffect(() => {
    // Performance budget thresholds (in milliseconds or score)
    const budgets = {
      LCP: 2500, // Largest Contentful Paint - should be < 2.5s
      CLS: 0.1,  // Cumulative Layout Shift - should be < 0.1
      FCP: 1800, // First Contentful Paint - should be < 1.8s
      TTFB: 800, // Time to First Byte - should be < 800ms
      INP: 200,  // Interaction to Next Paint - should be < 200ms (replaces FID)
    }

    function sendToAnalytics(metric: Metric) {
      const { name, value, rating, delta, id } = metric
      
      // Check against performance budget
      const budget = budgets[name as keyof typeof budgets]
      const meetsBudget = budget ? (name === 'CLS' ? value < budget : value < budget) : true
      
      // Log in development or if debug is enabled
      if (debug || process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${name}:`, {
          value: `${value.toFixed(2)}${name === 'CLS' ? '' : 'ms'}`,
          rating,
          budget: budget ? `${budget}${name === 'CLS' ? '' : 'ms'}` : 'N/A',
          meetsBudget: meetsBudget ? '✅' : '❌',
          delta: `${delta.toFixed(2)}ms`,
        })
      }

      // In production, you can send to your analytics service
      if (analyticsId && process.env.NODE_ENV === 'production') {
        // Example: Send to Google Analytics, Vercel Analytics, or custom endpoint
        // gtag('event', name, {
        //   event_category: 'Web Vitals',
        //   value: Math.round(name === 'CLS' ? value * 1000 : value),
        //   event_label: id,
        //   non_interaction: true,
        // })
        
        // Or send to custom analytics endpoint
        // fetch('/api/analytics', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ name, value, rating, delta, id }),
        // })
      }
    }

    // Track all Core Web Vitals
    // Note: FID is deprecated and replaced by INP (Interaction to Next Paint)
    onCLS(sendToAnalytics)
    onFCP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
    onINP(sendToAnalytics) // Replaces FID as the responsiveness metric
  }, [analyticsId, debug])

  return null
}

