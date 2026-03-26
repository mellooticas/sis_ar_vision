import { type SVGProps } from "react"

interface DigiaiLogoProps extends SVGProps<SVGSVGElement> {
  size?: number
  color?: string
}

export function DigiaiLogo({
  size = 20,
  color = "#64748B",
  ...props
}: DigiaiLogoProps) {
  return (
    <svg
      viewBox="0 0 120 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size * 5}
      height={size}
      role="img"
      aria-label="DIGIAI"
      {...props}
    >
      <text
        x="0"
        y="18"
        fontFamily="system-ui, sans-serif"
        fontSize="18"
        fontWeight="700"
        letterSpacing="2"
        fill={color}
      >
        DIGIAI
      </text>
    </svg>
  )
}

export function PoweredByDigiai({
  className,
  color = "#94A3B8",
}: {
  className?: string
  color?: string
}) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${className ?? ""}`}>
      <span style={{ color }}>por</span>
      <DigiaiLogo size={12} color={color} />
    </div>
  )
}
