import { memo, useMemo } from 'react'

interface NavbarContainerProps {
  isOverWhiteBackground: boolean
  children: React.ReactNode
  mobileMenuRef?: React.RefObject<HTMLDivElement>
}

function NavbarContainer({
  isOverWhiteBackground,
  children,
  mobileMenuRef,
}: NavbarContainerProps) {
  const containerStyle = useMemo(
    () => ({
      backdropFilter: 'blur(20px) saturate(200%)',
      WebkitBackdropFilter: 'blur(20px) saturate(200%)',
      backgroundColor: isOverWhiteBackground
        ? 'rgba(255, 255, 255, 0.75)'
        : 'rgba(0, 0, 0, 0.65)',
      borderColor: isOverWhiteBackground
        ? 'rgba(0, 0, 0, 0.2)'
        : 'rgba(255, 255, 255, 0.3)',
      isolation: 'isolate' as const,
    }),
    [isOverWhiteBackground]
  )

  return (
    <div
      ref={mobileMenuRef}
      className="rounded-2xl shadow-lg transition-all duration-300 border"
      style={containerStyle}
    >
      {children}
    </div>
  )
}

export default memo(NavbarContainer)
