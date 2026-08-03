import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function Profile({ session, onLogout }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const [nameInput, setNameInput] = useState('')
  const [goalInput, setGoalInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()

    if (!error && data) {
      setProfile(data)
    }
    setLoading(false)
  }

  const openEdit = () => {
    setNameInput(profile?.name || '')
    setGoalInput(profile?.calorie_goal || '')
    setEditing(true)
  }

  const closeEdit = () => {
    setEditing(false)
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      name: nameInput.trim(),
      calorie_goal: goalInput ? parseFloat(goalInput) : null,
    })

    if (!error) {
      await loadProfile()
      setEditing(false)
    } else {
      alert('Не удалось сохранить: ' + error.message)
    }

    setSaving(false)
  }

  return (
    <div className="card">
      <h1>Личный кабинет</h1>
      <p className="sub">Данные профиля</p>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="result-box visible" style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '12px' }}>
            <div className="result-label">Почта</div>
            <p style={{ margin: 0 }}>{session.user.email}</p>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div className="result-label">Имя</div>
            <p style={{ margin: 0 }}>{profile?.name || '—'}</p>
          </div>

          <div>
            <div className="result-label">Цель, ккал/день</div>
            <p style={{ margin: 0 }}>{profile?.calorie_goal || '—'}</p>
          </div>

          <button className="add-btn" onClick={openEdit} style={{ marginTop: '16px', marginBottom: 0 }}>
            Редактировать
          </button>
        </div>
      )}

      <button className="logout-btn" onClick={onLogout}>
        Выйти
      </button>

      {editing && (
        <div
          onClick={closeEdit}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(31, 42, 36, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '28px', maxWidth: '400px', width: '100%' }}
          >
            <h1 style={{ fontSize: '1.3rem' }}>Редактировать профиль</h1>

            <form onSubmit={saveProfile}>
              <div className="field" style={{ marginBottom: '12px' }}>
                <label>Имя</label>
                <input
                  type="text"
                  placeholder="Например, Анастасия"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>

              <div className="field" style={{ marginBottom: '16px' }}>
                <label>Цель</label>
                <input
                  type="number"
                  placeholder="Например, 1800"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="add-btn"
                  onClick={closeEdit}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  Отмена
                </button>
                <button className="calc-btn" type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Сохраняем...' : 'Сохранить'}
                </button>
                
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
