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
    <nav style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
      <NavLink to="/" end style={linkStyle}>Калькулятор</NavLink>
      <NavLink to="/dishes" style={linkStyle}>Библиотека еды</NavLink>
      <NavLink to="/diary" style={linkStyle}>Дневник</NavLink>
      <NavLink to="/profile" style={linkStyle}>Кабинет</NavLink>
    </nav>
  )
}

export default Nav
