export default function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b8def" />
          <stop offset="1" stopColor="#7c5cf5" />
        </linearGradient>
      </defs>
      <path
        d="M24 3C24 3 40 18 40 30a16 16 0 1 1-32 0C8 18 24 3 24 3Z"
        fill="url(#logo-gradient)"
      />
      <path d="M26.5 9 15 27h7.5L21 39l12-19h-7.5l1-11Z" fill="#ffc531" />
    </svg>
  )
}
