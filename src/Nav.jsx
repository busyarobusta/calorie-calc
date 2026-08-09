import { NavLink } from 'react-router-dom'

function Nav() {
  const linkStyle = ({ isActive }) => ({
    padding: '8px 14px',
    borderRadius: '6px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: '0.85rem',
    textDecoration: 'none',
    color: isActive ? '#fff' : 'var(--accent)',
    background: isActive ? 'var(--accent)' : 'transparent',
  })

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
      <NavLink to="/" end style={linkStyle}>Калькулятор</NavLink>

      <NavLink to="/dishes" style={linkStyle}>Библиотека</NavLink>

      <NavLink to="/diary" style={linkStyle}>Дневник</NavLink>
</div>
      <NavLink
        to="/profile"
        style={({ isActive }) => ({
          ...linkStyle({ isActive }),
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
        title="Кабинет"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </NavLink>
    </nav>
  )
}

export default Nav
