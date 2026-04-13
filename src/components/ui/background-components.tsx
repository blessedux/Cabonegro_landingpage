import { cn } from "@/lib/utils"

export interface FooterBackgroundProps {
  className?: string
}

/**
 * Same layout as the original indigo radial (top-anchored wash) + grid/dot texture.
 * Outer color uses brand bronze instead of purple.
 */
export function FooterBackground({ className }: FooterBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, #fff 40%, #C09866 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px),
            radial-gradient(circle, rgba(51,65,85,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px, 20px 20px, 20px 20px",
          backgroundPosition: "0 0, 0 0, 0 0",
        }}
      />
      {/* Linear gradient blur: strongest at top, fades by 40% footer height */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          WebkitBackdropFilter: "blur(14px)",
          backdropFilter: "blur(14px)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, transparent 40%)",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 40%)",
        }}
      />
    </div>
  )
}
