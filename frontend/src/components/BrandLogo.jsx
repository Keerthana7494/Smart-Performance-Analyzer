import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BrandLogo({
  to = '/',
  showLink = true,
  compact = false,
  dark = false
}) {
  const logo = (
    <div
      className={`brand-logo ${
        compact ? 'compact' : ''
      } ${dark ? 'dark' : ''}`}
    >

      <div
        className="brand-logo-icon"
        aria-hidden="true"
      >
        <GraduationCap
          size={22}
          strokeWidth={2.2}
        />
      </div>

      <div className="brand-logo-text">

        <strong>
          Smart Performance
        </strong>

        <span>
          Analyzer
        </span>

      </div>

    </div>
  )

  if (!showLink) {
    return logo
  }

  return (
    <Link
      to={to}
      className="brand-logo-link"
      aria-label="Smart Performance Analyzer home"
    >
      {logo}
    </Link>
  )
}