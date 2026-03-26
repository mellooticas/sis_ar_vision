import { type SVGProps } from "react"

interface ClearixLogoProps extends SVGProps<SVGSVGElement> {
  size?: number
  primary?: string
  accent?: string
}

export function ClearixIcon({
  size = 32,
  primary = "#1A3A5C",
  accent = "#06B6D4",
  ...props
}: ClearixLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      {...props}
    >
      <circle cx="85" cy="50" r="7" fill={accent} />
      <path
        d="M 74.75 25.25 A 35 35 0 1 0 74.75 74.75"
        stroke={primary}
        strokeWidth="14"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ClearixLogoHorizontal({
  size = 32,
  primary = "#1A3A5C",
  accent = "#06B6D4",
  moduleName = "Hub",
  className,
}: ClearixLogoProps & { moduleName?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <ClearixIcon size={size} primary={primary} accent={accent} />
      <div className="flex flex-col leading-tight">
        <span
          className="font-heading font-semibold text-sm tracking-tight"
          style={{ color: primary }}
        >
          Clearix <span className="font-normal">{moduleName}</span>
        </span>
      </div>
    </div>
  )
}

export function ClearixLogoStacked({
  size = 48,
  primary = "#1A3A5C",
  accent = "#06B6D4",
  moduleName = "Hub",
  className,
}: ClearixLogoProps & { moduleName?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className ?? ""}`}>
      <ClearixIcon size={size} primary={primary} accent={accent} />
      <span
        className="font-heading font-semibold text-base tracking-tight"
        style={{ color: primary }}
      >
        Clearix <span className="font-normal">{moduleName}</span>
      </span>
    </div>
  )
}

export function ClearixArVisionLogo(
  props: Omit<ClearixLogoProps, "accent"> & { moduleName?: string }
) {
  return <ClearixLogoHorizontal accent="#D946EF" moduleName="AR & Vision" {...props} />
}
