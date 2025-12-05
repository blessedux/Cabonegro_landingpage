#!/usr/bin/env node

/**
 * Comprehensive Performance Testing Script
 * Tests all pages, measures load times, bandwidth, and identifies optimization opportunities
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LOCALES = ['en', 'es', 'zh', 'fr'];
const PAGES = [
  '', // home
  'contact',
  'deck',
  'explore',
  'gallery',
  'parque-logistico',
  'parque-tecnologico',
  'terminal-maritimo',
  'partners',
];

// Performance thresholds
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FCP: 1800, // First Contentful Paint (ms)
  TTFB: 800, // Time to First Byte (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  INP: 200,  // Interaction to Next Paint (ms)
  TOTAL_SIZE: 3 * 1024 * 1024, // 3MB total page size
  JS_SIZE: 1.5 * 1024 * 1024, // 1.5MB JS size
};

class PerformanceTester {
  constructor() {
    this.results = [];
    this.browser = null;
  }

  async init() {
    console.log('🚀 Starting performance testing...\n');
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async testPage(locale, pagePath) {
    const fullPath = pagePath ? `/${pagePath}` : '';
    const url = `${BASE_URL}/${locale}${fullPath}`;
    const page = await this.browser.newPage();

    try {
      console.log(`📊 Testing: ${url}`);

      // Enable performance monitoring
      await page.setCacheEnabled(false); // Disable cache for accurate measurements
      
      // Track network requests
      const networkRequests = [];
      const resources = {
        images: [],
        scripts: [],
        stylesheets: [],
        fonts: [],
        videos: [],
        other: [],
        totalSize: 0,
      };

      page.on('request', (request) => {
        networkRequests.push({
          url: request.url(),
          type: request.resourceType(),
          method: request.method(),
        });
      });

      page.on('response', async (response) => {
        const url = response.url();
        const type = response.request().resourceType();
        const headers = response.headers();
        const contentLength = parseInt(headers['content-length'] || '0', 10);

        // Try to get actual transferred size if available
        let size = contentLength;
        try {
          const buffer = await response.buffer().catch(() => null);
          if (buffer) {
            size = buffer.length;
          }
        } catch (e) {
          // Fallback to content-length header
        }

        if (size > 0) {
          resources.totalSize += size;

          // Determine resource type more accurately
          let resourceType = type;
          const contentType = headers['content-type'] || '';
          
          // Better detection for videos
          if (type === 'media' || contentType.includes('video/') || url.match(/\.(mp4|webm|mov|avi)(\?|$)/i)) {
            resourceType = 'video';
          }
          // Better detection for JavaScript
          else if (type === 'script' || contentType.includes('javascript') || url.match(/\.(js|mjs)(\?|$)/i) || url.includes('/_next/static/')) {
            resourceType = 'script';
          }
          // Better detection for CSS
          else if (type === 'stylesheet' || contentType.includes('css') || url.match(/\.css(\?|$)/i)) {
            resourceType = 'stylesheet';
          }

          const resource = {
            url,
            type: resourceType,
            size: size,
            status: response.status(),
            headers: {
              'content-type': contentType,
              'cache-control': headers['cache-control'],
            },
          };

          switch (resourceType) {
            case 'image':
              resources.images.push(resource);
              break;
            case 'script':
              resources.scripts.push(resource);
              break;
            case 'stylesheet':
              resources.stylesheets.push(resource);
              break;
            case 'font':
              resources.fonts.push(resource);
              break;
            case 'video':
              resources.videos.push(resource);
              break;
            default:
              resources.other.push(resource);
          }
        }
      });

      // Navigate and wait for network to be idle
      const navigationStart = Date.now();
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded', // Changed from networkidle0 to be more lenient
          timeout: 60000, // Increased timeout to 60 seconds
        });
      } catch (error) {
        // If navigation times out, try with a more lenient wait strategy
        if (error.message.includes('timeout')) {
          console.log(`  ⚠️  Navigation timeout, trying with 'load' strategy...`);
          await page.goto(url, {
            waitUntil: 'load',
            timeout: 60000,
          });
        } else {
          throw error;
        }
      }
      const navigationEnd = Date.now();
      const navigationTime = navigationEnd - navigationStart;

      // Wait a bit for any lazy-loaded content (using Promise-based delay)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get Web Vitals metrics
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = {};
          const requiredMetrics = ['LCP', 'FCP', 'TTFB', 'CLS', 'DOM'];
          const collectedMetrics = new Set();
          let resolved = false;

          // Timeout after 8 seconds to prevent hanging
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve(metrics);
            }
          }, 8000);

          function checkComplete() {
            // Check if we have at least the critical metrics (LCP, FCP, TTFB)
            const hasCritical = collectedMetrics.has('LCP') && 
                               collectedMetrics.has('FCP') && 
                               collectedMetrics.has('TTFB');
            
            // Resolve if we have critical metrics (CLS is optional and will be collected over time)
            // We'll resolve early if we have critical metrics, CLS will be included if available
            if (hasCritical && !resolved) {
              // Give CLS a moment to collect, then resolve
              setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  clearTimeout(timeout);
                  resolve(metrics);
                }
              }, 500);
            }
          }

          // LCP - Largest Contentful Paint
          new PerformanceObserver((list) => {
            if (!collectedMetrics.has('LCP')) {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              if (lastEntry) {
                metrics.LCP = Math.round(lastEntry.renderTime || lastEntry.loadTime);
                collectedMetrics.add('LCP');
                checkComplete();
              }
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // FCP - First Contentful Paint
          new PerformanceObserver((list) => {
            if (!collectedMetrics.has('FCP')) {
              const entries = list.getEntries();
              const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
              if (fcpEntry) {
                metrics.FCP = Math.round(fcpEntry.renderTime || fcpEntry.startTime);
                collectedMetrics.add('FCP');
                checkComplete();
              }
            }
          }).observe({ entryTypes: ['paint'] });

          // TTFB - Time to First Byte
          const navigation = performance.getEntriesByType('navigation')[0];
          if (navigation && !collectedMetrics.has('TTFB')) {
            metrics.TTFB = Math.round(navigation.responseStart - navigation.requestStart);
            collectedMetrics.add('TTFB');
            checkComplete();
          }

          // CLS - Cumulative Layout Shift (collect over time, then mark as complete)
          let clsValue = 0;
          let clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            metrics.CLS = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          
          // Mark CLS as collected after a short delay
          setTimeout(() => {
            if (!collectedMetrics.has('CLS')) {
              collectedMetrics.add('CLS');
              checkComplete();
            }
          }, 1000);

          // DOM Content Loaded
          const checkDOMComplete = () => {
            if (!collectedMetrics.has('DOM')) {
              const nav = performance.getEntriesByType('navigation')[0];
              if (nav) {
                metrics.DOMContentLoaded = Math.round(nav.domContentLoadedEventEnd - nav.navigationStart);
                metrics.LoadComplete = Math.round(nav.loadEventEnd - nav.navigationStart);
                collectedMetrics.add('DOM');
                checkComplete();
              }
            }
          };

          if (document.readyState === 'complete') {
            checkDOMComplete();
          } else {
            window.addEventListener('load', checkDOMComplete, { once: true });
          }
        });
      });

      // Get additional performance data
      const performanceData = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        
        return {
          domSize: document.querySelectorAll('*').length,
          scriptCount: document.querySelectorAll('script').length,
          imageCount: document.querySelectorAll('img').length,
          resourceCount: resources.length,
          transferSize: navigation ? navigation.transferSize : 0,
          decodedBodySize: navigation ? navigation.decodedBodySize : 0,
        };
      });

      // Check for lazy loading opportunities
      const lazyLoadingOpportunities = this.identifyLazyLoadingOpportunities(resources, performanceData);

      // Calculate bandwidth (total transfer size)
      const bandwidth = resources.totalSize;

      const result = {
        url,
        locale,
        page: pagePath || 'home',
        timestamp: new Date().toISOString(),
        metrics: {
          ...metrics,
          navigationTime,
        },
        performance: performanceData,
        resources: {
          totalSize: bandwidth,
          totalSizeMB: (bandwidth / (1024 * 1024)).toFixed(2),
          breakdown: {
            images: {
              count: resources.images.length,
              totalSize: resources.images.reduce((sum, r) => sum + r.size, 0),
              totalSizeMB: (resources.images.reduce((sum, r) => sum + r.size, 0) / (1024 * 1024)).toFixed(2),
            },
            scripts: {
              count: resources.scripts.length,
              totalSize: resources.scripts.reduce((sum, r) => sum + r.size, 0),
              totalSizeMB: (resources.scripts.reduce((sum, r) => sum + r.size, 0) / (1024 * 1024)).toFixed(2),
            },
            stylesheets: {
              count: resources.stylesheets.length,
              totalSize: resources.stylesheets.reduce((sum, r) => sum + r.size, 0),
              totalSizeMB: (resources.stylesheets.reduce((sum, r) => sum + r.size, 0) / (1024 * 1024)).toFixed(2),
            },
            fonts: {
              count: resources.fonts.length,
              totalSize: resources.fonts.reduce((sum, r) => sum + r.size, 0),
              totalSizeMB: (resources.fonts.reduce((sum, r) => sum + r.size, 0) / (1024 * 1024)).toFixed(2),
            },
            videos: {
              count: resources.videos.length,
              totalSize: resources.videos.reduce((sum, r) => sum + r.size, 0),
              totalSizeMB: (resources.videos.reduce((sum, r) => sum + r.size, 0) / (1024 * 1024)).toFixed(2),
            },
          },
        },
        thresholds: {
          LCP: metrics.LCP ? (metrics.LCP < THRESHOLDS.LCP ? '✅' : '❌') : '⚠️',
          FCP: metrics.FCP ? (metrics.FCP < THRESHOLDS.FCP ? '✅' : '❌') : '⚠️',
          TTFB: metrics.TTFB ? (metrics.TTFB < THRESHOLDS.TTFB ? '✅' : '❌') : '⚠️',
          CLS: metrics.CLS !== undefined ? (metrics.CLS < THRESHOLDS.CLS ? '✅' : '❌') : '⚠️',
          totalSize: bandwidth < THRESHOLDS.TOTAL_SIZE ? '✅' : '❌',
        },
        lazyLoadingOpportunities,
        networkRequests: networkRequests.length,
      };

      this.results.push(result);

      // Log summary
      console.log(`  ⏱️  Navigation: ${navigationTime}ms`);
      console.log(`  📦 Bandwidth: ${result.resources.totalSizeMB}MB`);
      console.log(`  🎯 LCP: ${metrics.LCP || 'N/A'}ms ${result.thresholds.LCP}`);
      console.log(`  🎨 FCP: ${metrics.FCP || 'N/A'}ms ${result.thresholds.FCP}`);
      console.log(`  ⚡ TTFB: ${metrics.TTFB || 'N/A'}ms ${result.thresholds.TTFB}`);
      console.log(`  📐 CLS: ${metrics.CLS !== undefined ? metrics.CLS.toFixed(3) : 'N/A'} ${result.thresholds.CLS}`);
      console.log('');

      await page.close();
      return result;
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
      await page.close();
      return {
        url,
        locale,
        page: pagePath || 'home',
        error: error.message,
      };
    }
  }

  identifyLazyLoadingOpportunities(resources, performanceData) {
    const opportunities = [];

    // Check for large images that could be lazy loaded
    const largeImages = resources.images
      .filter(img => img.size > 100 * 1024) // Images larger than 100KB
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);

    if (largeImages.length > 0) {
      opportunities.push({
        type: 'images',
        priority: 'high',
        description: `${largeImages.length} large images (>100KB) could be lazy loaded`,
        examples: largeImages.map(img => ({
          url: img.url.split('/').pop(),
          size: `${(img.size / 1024).toFixed(2)}KB`,
        })),
      });
    }

    // Check for scripts that could be code-split or lazy loaded
    const largeScripts = resources.scripts
      .filter(script => script.size > 200 * 1024) // Scripts larger than 200KB
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);

    if (largeScripts.length > 0) {
      opportunities.push({
        type: 'scripts',
        priority: 'high',
        description: `${largeScripts.length} large scripts (>200KB) could be code-split or lazy loaded`,
        examples: largeScripts.map(script => ({
          url: script.url.split('/').pop(),
          size: `${(script.size / 1024).toFixed(2)}KB`,
        })),
      });
    }

    // Check for images below the fold
    if (performanceData.imageCount > 10) {
      opportunities.push({
        type: 'below-fold-images',
        priority: 'medium',
        description: `${performanceData.imageCount} images detected - consider lazy loading images below the fold`,
      });
    }

    // Check for third-party scripts
    const thirdPartyScripts = resources.scripts.filter(script => {
      const url = script.url;
      return !url.includes(BASE_URL) && !url.startsWith('/');
    });

    if (thirdPartyScripts.length > 0) {
      opportunities.push({
        type: 'third-party',
        priority: 'medium',
        description: `${thirdPartyScripts.length} third-party scripts detected - consider deferring or async loading`,
      });
    }

    return opportunities;
  }

  async runAllTests() {
    for (const locale of LOCALES) {
      for (const pagePath of PAGES) {
        await this.testPage(locale, pagePath);
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async generateReport() {
    const reportPath = path.join(__dirname, '..', 'docs', 'PERFORMANCE_TEST_REPORT.md');
    const reportDir = path.dirname(reportPath);
    await fs.mkdir(reportDir, { recursive: true });

    // Calculate averages and statistics
    const successfulResults = this.results.filter(r => !r.error);
    const count = successfulResults.length || 1; // Prevent division by zero
    const avgMetrics = {
      LCP: successfulResults.reduce((sum, r) => sum + (r.metrics?.LCP || 0), 0) / count,
      FCP: successfulResults.reduce((sum, r) => sum + (r.metrics?.FCP || 0), 0) / count,
      TTFB: successfulResults.reduce((sum, r) => sum + (r.metrics?.TTFB || 0), 0) / count,
      CLS: successfulResults.reduce((sum, r) => sum + (r.metrics?.CLS || 0), 0) / count,
      bandwidth: successfulResults.reduce((sum, r) => sum + (r.resources?.totalSize || 0), 0) / count,
      navigationTime: successfulResults.reduce((sum, r) => sum + (r.metrics?.navigationTime || 0), 0) / count,
    };

    // Collect all lazy loading opportunities
    const allOpportunities = successfulResults
      .flatMap(r => r.lazyLoadingOpportunities || [])
      .reduce((acc, opp) => {
        const key = `${opp.type}-${opp.priority}`;
        if (!acc[key]) {
          acc[key] = { ...opp, count: 0, pages: [] };
        }
        acc[key].count++;
        return acc;
      }, {});

    // Generate markdown report
    const report = this.generateMarkdownReport(avgMetrics, allOpportunities);

    await fs.writeFile(reportPath, report, 'utf-8');
    console.log(`\n✅ Performance report generated: ${reportPath}`);
  }

  generateMarkdownReport(avgMetrics, allOpportunities) {
    const timestamp = new Date().toISOString();
    const successfulResults = this.results.filter(r => !r.error);
    const failedResults = this.results.filter(r => r.error);

    let report = `# 🚀 Performance Test Report - Cabo Negro Landing Page\n\n`;
    report += `**Generated:** ${new Date(timestamp).toLocaleString()}\n\n`;
    report += `**Base URL:** ${BASE_URL}\n\n`;
    report += `---\n\n`;

    // Executive Summary
    report += `## 📊 Executive Summary\n\n`;
    report += `- **Total Pages Tested:** ${this.results.length}\n`;
    report += `- **Successful Tests:** ${successfulResults.length} ✅\n`;
    report += `- **Failed Tests:** ${failedResults.length} ${failedResults.length > 0 ? '❌' : ''}\n\n`;

    report += `### Average Performance Metrics\n\n`;
    
    if (successfulResults.length === 0) {
      report += `⚠️ **No test results available.** Please run the performance test with the development server running.\n\n`;
      report += `To run the test:\n`;
      report += `1. Start the dev server: \`npm run dev\`\n`;
      report += `2. Run the test: \`npm run perf:test\`\n\n`;
    } else {
      report += `| Metric | Average | Threshold | Status |\n`;
      report += `|--------|---------|-----------|--------|\n`;
      report += `| **LCP** (Largest Contentful Paint) | ${isNaN(avgMetrics.LCP) ? 'N/A' : avgMetrics.LCP.toFixed(0)}ms | < 2500ms | ${!isNaN(avgMetrics.LCP) && avgMetrics.LCP < THRESHOLDS.LCP ? '✅' : '❌'} |\n`;
      report += `| **FCP** (First Contentful Paint) | ${isNaN(avgMetrics.FCP) ? 'N/A' : avgMetrics.FCP.toFixed(0)}ms | < 1800ms | ${!isNaN(avgMetrics.FCP) && avgMetrics.FCP < THRESHOLDS.FCP ? '✅' : '❌'} |\n`;
      report += `| **TTFB** (Time to First Byte) | ${isNaN(avgMetrics.TTFB) ? 'N/A' : avgMetrics.TTFB.toFixed(0)}ms | < 800ms | ${!isNaN(avgMetrics.TTFB) && avgMetrics.TTFB < THRESHOLDS.TTFB ? '✅' : '❌'} |\n`;
      report += `| **CLS** (Cumulative Layout Shift) | ${isNaN(avgMetrics.CLS) ? 'N/A' : avgMetrics.CLS.toFixed(3)} | < 0.1 | ${!isNaN(avgMetrics.CLS) && avgMetrics.CLS < THRESHOLDS.CLS ? '✅' : '❌'} |\n`;
      report += `| **Average Bandwidth** | ${isNaN(avgMetrics.bandwidth) ? 'N/A' : (avgMetrics.bandwidth / (1024 * 1024)).toFixed(2)}MB | < 3MB | ${!isNaN(avgMetrics.bandwidth) && avgMetrics.bandwidth < THRESHOLDS.TOTAL_SIZE ? '✅' : '❌'} |\n`;
      report += `| **Average Navigation Time** | ${isNaN(avgMetrics.navigationTime) ? 'N/A' : avgMetrics.navigationTime.toFixed(0)}ms | - | - |\n\n`;
    }

    // Detailed Results by Page
    report += `## 📄 Detailed Results by Page\n\n`;

    if (successfulResults.length === 0) {
      report += `No test results available. Run the performance test to see detailed results.\n\n`;
    } else {
      // Group results by page
      const resultsByPage = successfulResults.reduce((acc, result) => {
        const key = result.page;
        if (!acc[key]) acc[key] = [];
        acc[key].push(result);
        return acc;
      }, {});

    for (const [pageName, pageResults] of Object.entries(resultsByPage)) {
      const avgResult = {
        LCP: pageResults.reduce((sum, r) => sum + (r.metrics?.LCP || 0), 0) / pageResults.length,
        FCP: pageResults.reduce((sum, r) => sum + (r.metrics?.FCP || 0), 0) / pageResults.length,
        TTFB: pageResults.reduce((sum, r) => sum + (r.metrics?.TTFB || 0), 0) / pageResults.length,
        CLS: pageResults.reduce((sum, r) => sum + (r.metrics?.CLS || 0), 0) / pageResults.length,
        bandwidth: pageResults.reduce((sum, r) => sum + (r.resources?.totalSize || 0), 0) / pageResults.length,
        navigationTime: pageResults.reduce((sum, r) => sum + (r.metrics?.navigationTime || 0), 0) / pageResults.length,
      };

      report += `### ${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page\n\n`;
      report += `| Locale | LCP | FCP | TTFB | CLS | Bandwidth | Nav Time |\n`;
      report += `|--------|-----|-----|------|-----|-----------|----------|\n`;

      for (const result of pageResults) {
        report += `| ${result.locale} | `;
        report += `${result.metrics?.LCP || 'N/A'}ms ${result.thresholds?.LCP || ''} | `;
        report += `${result.metrics?.FCP || 'N/A'}ms ${result.thresholds?.FCP || ''} | `;
        report += `${result.metrics?.TTFB || 'N/A'}ms ${result.thresholds?.TTFB || ''} | `;
        report += `${result.metrics?.CLS !== undefined ? result.metrics.CLS.toFixed(3) : 'N/A'} ${result.thresholds?.CLS || ''} | `;
        report += `${result.resources?.totalSizeMB || 'N/A'}MB ${result.thresholds?.totalSize || ''} | `;
        report += `${result.metrics?.navigationTime || 'N/A'}ms |\n`;
      }

      report += `\n**Averages:**\n`;
      report += `- LCP: ${avgResult.LCP.toFixed(0)}ms\n`;
      report += `- FCP: ${avgResult.FCP.toFixed(0)}ms\n`;
      report += `- TTFB: ${avgResult.TTFB.toFixed(0)}ms\n`;
      report += `- CLS: ${avgResult.CLS.toFixed(3)}\n`;
      report += `- Bandwidth: ${(avgResult.bandwidth / (1024 * 1024)).toFixed(2)}MB\n`;
      report += `- Navigation Time: ${avgResult.navigationTime.toFixed(0)}ms\n\n`;

      // Resource breakdown for first locale of each page
      const firstResult = pageResults[0];
      if (firstResult.resources) {
        report += `**Resource Breakdown:**\n`;
        report += `- Images: ${firstResult.resources.breakdown.images.count} files, ${firstResult.resources.breakdown.images.totalSizeMB}MB\n`;
        report += `- Scripts: ${firstResult.resources.breakdown.scripts.count} files, ${firstResult.resources.breakdown.scripts.totalSizeMB}MB\n`;
        report += `- Stylesheets: ${firstResult.resources.breakdown.stylesheets.count} files, ${firstResult.resources.breakdown.stylesheets.totalSizeMB}MB\n`;
        report += `- Fonts: ${firstResult.resources.breakdown.fonts.count} files, ${firstResult.resources.breakdown.fonts.totalSizeMB}MB\n`;
        report += `- Videos: ${firstResult.resources.breakdown.videos.count} files, ${firstResult.resources.breakdown.videos.totalSizeMB}MB\n\n`;
      }
    }
    }

    // Optimization Opportunities
    report += `## 🎯 Optimization Opportunities\n\n`;

    if (Object.keys(allOpportunities).length === 0) {
      report += `✅ No major optimization opportunities identified. Great job!\n\n`;
    } else {
      const highPriority = Object.values(allOpportunities).filter(opp => opp.priority === 'high');
      const mediumPriority = Object.values(allOpportunities).filter(opp => opp.priority === 'medium');

      if (highPriority.length > 0) {
        report += `### 🔴 High Priority\n\n`;
        for (const opp of highPriority) {
          report += `#### ${opp.type}\n\n`;
          report += `${opp.description}\n\n`;
          if (opp.examples && opp.examples.length > 0) {
            report += `**Examples:**\n`;
            for (const example of opp.examples.slice(0, 3)) {
              report += `- ${example.url}: ${example.size}\n`;
            }
            report += `\n`;
          }
        }
      }

      if (mediumPriority.length > 0) {
        report += `### 🟡 Medium Priority\n\n`;
        for (const opp of mediumPriority) {
          report += `#### ${opp.type}\n\n`;
          report += `${opp.description}\n\n`;
        }
      }
    }

    // Recommendations
    report += `## 💡 Recommendations for Performance Improvement\n\n`;

    const recommendations = [];

    if (avgMetrics.LCP > THRESHOLDS.LCP) {
      recommendations.push({
        priority: 'High',
        issue: 'LCP exceeds threshold',
        solution: 'Optimize largest contentful element (usually hero image). Use next/image with priority, preload critical resources, and consider using WebP/AVIF formats.',
      });
    }

    if (avgMetrics.FCP > THRESHOLDS.FCP) {
      recommendations.push({
        priority: 'High',
        issue: 'FCP exceeds threshold',
        solution: 'Reduce render-blocking resources. Inline critical CSS, defer non-critical JavaScript, and optimize font loading.',
      });
    }

    if (avgMetrics.TTFB > THRESHOLDS.TTFB) {
      recommendations.push({
        priority: 'High',
        issue: 'TTFB exceeds threshold',
        solution: 'Improve server response time. Consider using edge caching, CDN, or optimizing API routes. For static pages, ensure proper static generation.',
      });
    }

    if (avgMetrics.bandwidth > THRESHOLDS.TOTAL_SIZE) {
      recommendations.push({
        priority: 'High',
        issue: 'Total page size exceeds 3MB',
        solution: 'Implement code splitting, lazy load images and components, remove unused dependencies, and compress assets.',
      });
    }

    // Add lazy loading recommendations
    if (Object.keys(allOpportunities).length > 0) {
      recommendations.push({
        priority: 'Medium',
        issue: 'Lazy loading opportunities identified',
        solution: 'Implement lazy loading for images below the fold, code-split large JavaScript bundles, and defer third-party scripts.',
      });
    }

    if (recommendations.length === 0) {
      report += `✅ All metrics are within acceptable thresholds. Continue monitoring performance.\n\n`;
    } else {
      for (const rec of recommendations) {
        report += `### ${rec.priority === 'High' ? '🔴' : '🟡'} ${rec.priority} Priority\n\n`;
        report += `**Issue:** ${rec.issue}\n\n`;
        report += `**Solution:** ${rec.solution}\n\n`;
      }
    }

    // Next Steps
    report += `## 🚀 Next Steps\n\n`;
    report += `1. **Implement High Priority Optimizations**: Address LCP, FCP, TTFB, and bandwidth issues first.\n`;
    report += `2. **Lazy Loading Implementation**: Add lazy loading to images and components that are below the fold.\n`;
    report += `3. **Code Splitting**: Review and implement dynamic imports for heavy components (3D scenes, maps, charts).\n`;
    report += `4. **Image Optimization**: Convert all images to WebP/AVIF format, implement responsive images, and use next/image component.\n`;
    report += `5. **Bundle Analysis**: Run \`npm run build\` and analyze bundle size. Remove unused dependencies.\n`;
    report += `6. **CDN Configuration**: Ensure static assets are served from a CDN with proper caching headers.\n`;
    report += `7. **Monitoring**: Set up continuous performance monitoring in production.\n\n`;

    // Failed Tests
    if (failedResults.length > 0) {
      report += `## ❌ Failed Tests\n\n`;
      for (const result of failedResults) {
        report += `- **${result.url}**: ${result.error}\n`;
      }
      report += `\n`;
    }

    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const tester = new PerformanceTester();
  
  try {
    await tester.init();
    await tester.runAllTests();
    await tester.generateReport();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = PerformanceTester;

