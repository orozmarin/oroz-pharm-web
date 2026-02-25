'use client'

export default function LogoutButton() {
  return (
    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--theme-border-color)' }}>
      <a
        href="/admin/logout"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 0',
          color: 'var(--theme-elevation-400)',
          textDecoration: 'none',
          fontSize: '0.8125rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Odjava
      </a>
    </div>
  )
}
