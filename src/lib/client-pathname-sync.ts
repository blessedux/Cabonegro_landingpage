/**
 * Tracks pathname transitions from `PageTransitionWrapper` (layout shell).
 *
 * Must run during the **shell's render** (before child render), not in useLayoutEffect:
 * React runs child layout effects before parent layout effects, so a commit in the parent's
 * layout effect ran *after* `LocaleHomePage`'s layout effect — `pathnameBeforeLastCommit`
 * was still the previous navigation's value and broke SPA→home detection.
 */
let committedPathname: string | null = null
let pathnameBeforeLastCommit: string | null = null

export function commitClientPathname(pathname: string): void {
  if (committedPathname === pathname) return
  pathnameBeforeLastCommit = committedPathname
  committedPathname = pathname
}

export function getPathnameBeforeLastCommit(): string | null {
  return pathnameBeforeLastCommit
}
