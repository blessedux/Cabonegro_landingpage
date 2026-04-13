/**
 * Warms webpack chunks for the home page for a given UI locale.
 * Mirrors dynamic imports in `LocaleHomePage` so locale switches avoid cold chunk fetches.
 */
export function prefetchHomeChunksForLocale(locale: string): Promise<unknown>[] {
  const shared = [
    import('@/components/sections/AboutUs'),
    import('@/components/sections/Stats'),
    import('@/components/sections/Press'),
    import('@/components/sections/Footer'),
  ]

  switch (locale) {
    case 'es':
      return [
        ...shared,
        import('@/components/sections/Partners-es'),
        import('@/components/sections/Hero-es'),
        import('@/components/sections/Navbar-es'),
        import('@/components/sections/FAQ-es'),
        import('@/components/ui/world-map-demo-es'),
      ]
    case 'zh':
      return [
        ...shared,
        import('@/components/sections/Partners'),
        import('@/components/sections/Hero-zh'),
        import('@/components/sections/Navbar-zh'),
        import('@/components/sections/FAQ-zh'),
        import('@/components/ui/world-map-demo-zh'),
      ]
    case 'fr':
      return [
        ...shared,
        import('@/components/sections/Partners'),
        import('@/components/sections/Hero-fr'),
        import('@/components/sections/Navbar'),
        import('@/components/sections/FAQ'),
        import('@/components/ui/world-map-demo-fr'),
      ]
    default:
      return [
        ...shared,
        import('@/components/sections/Partners'),
        import('@/components/sections/Hero'),
        import('@/components/sections/Navbar'),
        import('@/components/sections/FAQ'),
        import('@/components/ui/world-map-demo'),
      ]
  }
}
