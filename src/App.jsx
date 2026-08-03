import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Nav from './Nav'
import QuickCalc from './pages/QuickCalc.jsx'
import Dishes from './pages/Dishes'
import Diary from './pages/Diary'
import Profile from './pages/Profile'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setCheckingSession(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (checkingSession) {
    return <div className="card"><p>Загрузка...</p></div>
  }

  if (!session) {
    return <Auth />
  }

  return (
    <HashRouter>
      <div className="card">
        <Nav />

        <Routes>
          <Route path="/" element={<QuickCalc session={session} />} />
          <Route path="/dishes" element={<Dishes session={session} />} />
          <Route path="/diary" element={<Diary session={session} />} />
          <Route path="/profile" element={<Profile session={session} onLogout={handleLogout} />} />
        </Routes>
      </div>
      {/* <div className="card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button className="remove-btn" onClick={handleLogout} style={{ fontSize: '0.8rem' }}>
            Выйти
          </button>
        </div>

        <Nav />

        <Routes>
          <Route path="/" element={<QuickCalc session={session} />} />
          <Route path="/dishes" element={<Dishes session={session} />} />
          <Route path="/diary" element={<Diary session={session} />} />
          <Route path="/profile" element={<Profile session={session} />} />
        </Routes>
      </div> */}
    </HashRouter>
  )
}

export default App
