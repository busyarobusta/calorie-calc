import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function QuickCalc({ session }) {
  const [rows, setRows] = useState([{ id: 1, ingredient: '', weight: '', kcal: '' }])
  const [total, setTotal] = useState(null)
  const [name, setName] = useState('')
  const [saveToDiary, setSaveToDiary] = useState(false)
  const [saving, setSaving] = useState(false)
  const [entries, setEntries] = useState([])

  useEffect(() => {
    loadEntries()
  }, [])

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
    setRows([...rows, { id: newId, ingredient: '', weight: '', kcal: '' }])
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
    if (!name.trim()) return
    setSaving(true)

    const items = rows
      .filter(row => row.weight && row.kcal)
      .map(row => ({
        ingredient: row.ingredient.trim(),
        weight: parseFloat(row.weight),
        kcal_per_100g: parseFloat(row.kcal),
        result: (parseFloat(row.kcal) / 100) * parseFloat(row.weight),
      }))

// const today = new Date().toISOString().split('T')[0]

const today = getLocalDate()

    const { error } = await supabase.from('entries').insert({
      user_id: session.user.id,
      name: name.trim(),
      result: total,
      items: items,
      in_diary: saveToDiary,
      diary_date: saveToDiary ? today : null,
    })

    if (!error) {
      setName('')
      setSaveToDiary(false)
      setRows([{ id: 1, ingredient: '', weight: '', kcal: '' }])
      setTotal(null)
      await loadEntries()
    }


    setSaving(false)
  }

  const deleteEntry = async (id) => {
    await supabase.from('entries').delete().eq('id', id)
    loadEntries()
  }

  const getLocalDate = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const toggleDiary = async (entry) => {
    const newValue = !entry.in_diary
    const { error } = await supabase
      .from('entries')
      .update({
        in_diary: newValue,
        diary_date: newValue ? getLocalDate() : null,
      })
      .eq('id', entry.id)

    if (error) {
      alert('Не удалось обновить дневник: ' + error.message)
    }
    loadEntries()
  }


  return (
    <div className="card">
      <h1>Быстрый расчёт</h1>


      <div id="rows">
        {rows.map((row, index) => (
          <div className="row" key={row.id}>

            <div className="field">
              <label>продукт</label>
              <input
                type="text"
                placeholder="Опционально"
                value={row.ingredient}
                onChange={(e) => updateRow(row.id, 'ingredient', e.target.value)}
              />
            </div>
            
            <div className="field">
              <label>вес, г</label>
              <input
                type="number"
                placeholder="0"
                inputMode="decimal"
                value={row.weight}
                onChange={(e) => updateRow(row.id, 'weight', e.target.value)}
              />
            </div>

            <div className="field">
              <label>ккал/100г</label>
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
                title="Удалить ингредиент"
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

      <button className="add-btn" onClick={addRow}>+ Добавить ингредиент</button>
      <button className="calc-btn" onClick={calculate}>Рассчитать</button>

      {total !== null && (
        <div className="result-box visible">
          <div className="result-label">Итого</div>
          <div className="result-value">
            {total.toFixed(1)} <span>ккал</span>
          </div>

          <div className="field" style={{ marginTop: '16px', textAlign: 'left' }}>
            <label>Название:</label>
            <input
              type="text"
            placeholder="Обязательно для сохранения"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

        <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={saveToDiary}
              onChange={(e) => setSaveToDiary(e.target.checked)}
              style={{ width: 'auto' }}
            />
            Сохранить в дневник
          </label>

          <button
            className="add-btn"
            onClick={saveEntry}
            disabled={saving || !name.trim()}
            style={{ marginTop: '12px', marginBottom: 0 }}
          >
            {saving ? 'Сохраняем...' : 'Сохранить значение'}
          </button>

        </div>
      )}

      {entries.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div className="result-label" style={{ marginBottom: '12px' }}>История:</div>
          {entries.map(entry => (
            <div
              key={entry.id}
              className="row"
              style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '6px', padding: '10px 14px', marginBottom: '8px', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >

              <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '0.85rem' }}>
  {new Date(entry.created_at).toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
  })}: 

  <strong> {entry.name}</strong> — <strong>{entry.result.toFixed(1)} ккал </strong>
  {entry.in_diary && <span title="В дневнике" style={{ color: 'var(--accent)' }}> ✓ в дневнике </span>}


  {entry.items && entry.items.length > 1 && (
    <div style={{ color: '#6b7268', fontSize: '0.78rem', marginTop: '8px' }}>
      {entry.items.map((item, i) => (
        <div key={i}>{item.ingredient ? item.ingredient + ': ' : ''}{item.weight} г × {item.kcal_per_100g} ккал/100г = {item.result.toFixed(1)} ккал</div>
        // <div key={i}>{item.weight} г × {item.kcal_per_100g} ккал/100г = {item.result.toFixed(1)} ккал</div>
      ))}
    </div>
  )}
</div>

              <div style={{ display: 'flex', gap: '4px' }}>
                {!entry.in_diary && (
                  <button
                    className="remove-btn"
                    title="Добавить запись в дневник"
                    onClick={() => toggleDiary(entry)}
                    style={{ color: '#a89f8f' }}
                  >
                    ✓
                  </button>
                )}
                <button className="remove-btn" onClick={() => deleteEntry(entry.id)} title="Удалить из истории" >✕</button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuickCalc

