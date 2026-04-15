interface Props {
  size?: number
  className?: string
}

export function BikeWheelSpinner({ size = 48, className = '' }: Props) {
  const cx = size / 2
  const r = size / 2 - 2          // outer rim radius
  const spokeCount = 12
  const hubR = size * 0.07

  const spokes = Array.from({ length: spokeCount }, (_, i) => {
    const angle = (i * 360) / spokeCount
    const rad = (angle * Math.PI) / 180
    return {
      x2: cx + (r - 2) * Math.sin(rad),
      y2: cx - (r - 2) * Math.cos(rad),
    }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`animate-spin ${className}`}
      style={{ animationDuration: '1s', animationTimingFunction: 'linear' }}
      aria-label="Loading…"
    >
      {/* Rim */}
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={size * 0.055}
        opacity={0.8}
      />

      {/* Spokes */}
      {spokes.map((s, i) => (
        <line
          key={i}
          x1={cx} y1={cx}
          x2={s.x2} y2={s.y2}
          stroke="currentColor"
          strokeWidth={size * 0.025}
          opacity={0.5}
        />
      ))}

      {/* Hub */}
      <circle
        cx={cx} cy={cx} r={hubR}
        fill="currentColor"
        opacity={0.9}
      />
    </svg>
  )
}
