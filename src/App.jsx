import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  const [rows, setRows] = useState([{ id: 1, weight: '', kcal: '' }])
  const [total, setTotal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [entries, setEntries] = useState([])

  // Проверяем, вошёл ли пользователь, и подписываемся на изменения
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

  // Загружаем сохранённые записи после входа
  useEffect(() => {
    if (session) {
      loadEntries()
    }
  }, [session])

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setEntries(data)
    }
  }

  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1
    setRows([...rows, { id: newId, weight: '', kcal: '' }])
  }

  const removeRow = (id) => {
    setRows(rows.filter(row => row.id !== id))
    setTotal(null)
  }

  const updateRow = (id, field, value) => {
    setRows(rows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ))
  }

  const calculate = () => {
    const sum = rows.reduce((acc, row) => {
      const weight = parseFloat(row.weight) || 0
      const kcal = parseFloat(row.kcal) || 0
      return acc + (kcal / 100) * weight
    }, 0)
    setTotal(sum)
  }

  const saveEntry = async () => {
    if (total === null) return
    setSaving(true)

    // Сохраняем каждую строку отдельной записью
    const rowsToSave = rows
      .filter(row => row.weight && row.kcal)
      .map(row => ({
        user_id: session.user.id,
        weight: parseFloat(row.weight),
        kcal_per_100g: parseFloat(row.kcal),
        result: (parseFloat(row.kcal) / 100) * parseFloat(row.weight),
      }))

    const { error } = await supabase.from('entries').insert(rowsToSave)

    if (!error) {
      await loadEntries()
    }

    setSaving(false)
  }

  const deleteEntry = async (id) => {
    await supabase.from('entries').delete().eq('id', id)
    loadEntries()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setEntries([])
    setTotal(null)
  }

  if (checkingSession) {
    return <div className="card"><p>Загрузка...</p></div>
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h1>Калькулятор калорий</h1>
        <button className="remove-btn" onClick={handleLogout} style={{ fontSize: '0.8rem' }}>
          Выйти
        </button>
      </div>
      <p className="sub">Вес × (ккал / 100 г) — для каждой строки, затем сумма</p>

      <div id="rows">
        {rows.map((row, index) => (
          <div className="row" key={row.id}>
            <div className="field">
              <label>Введите вес (г)</label>
              <input
                type="number"
                placeholder="0"
                inputMode="decimal"
                value={row.weight}
                onChange={(e) => updateRow(row.id, 'weight', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Введите ккал/100г</label>
              <input
                type="number"
                placeholder="0"
                inputMode="decimal"
                value={row.kcal}
                onChange={(e) => updateRow(row.id, 'kcal', e.target.value)}
              />
            </div>
            {index > 0 ? (
              <button
                className="remove-btn"
                title="Удалить строку"
                onClick={() => removeRow(row.id)}
              >
                ✕
              </button>
            ) : (
              <span style={{ width: '24px' }}></span>
            )}
          </div>
        ))}
      </div>

      <button className="add-btn" onClick={addRow}>+ Добавить строку</button>
      <button className="calc-btn" onClick={calculate}>Рассчитать</button>

      {total !== null && (
        <div className="result-box visible">
          <div className="result-label">Итого</div>
          <div className="result-value">
            {total.toFixed(1)} <span>ккал</span>
          </div>
          <button
            className="add-btn"
            onClick={saveEntry}
            disabled={saving}
            style={{ marginTop: '12px', marginBottom: 0 }}
          >
            {saving ? 'Сохраняем...' : 'Сохранить расчёт'}
          </button>
        </div>
      )}

      {entries.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div className="result-label" style={{ marginBottom: '12px' }}>История расчётов</div>
          {entries.map(entry => (
            <div
              key={entry.id}
              className="row"
              style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '6px', padding: '10px 14px', marginBottom: '8px' }}
            >
              <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '0.85rem' }}>
                {entry.weight} г × {entry.kcal_per_100g} ккал/100г = <strong>{entry.result.toFixed(1)} ккал</strong>
              </span>
              <button className="remove-btn" onClick={() => deleteEntry(entry.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
