import { useState } from 'react'
import { supabase } from '../supabaseClient'

function getLocalDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// item: { name, kcalPer100g, composition (опционально, для блюд), source }
function AddToDiaryModal({ item, session, onClose, onSaved }) {
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)

  const result = weight ? (item.kcalPer100g / 100) * parseFloat(weight) : null

  const handleSave = async (e) => {
    e.preventDefault()
    if (!weight) return
    setSaving(true)

    const { error } = await supabase.from('diary_entries').insert({
      user_id: session.user.id,
      name: item.name,
      result: result,
      weight: parseFloat(weight),
      items: item.composition || null,
      diary_date: getLocalDate(),
      source: item.source,
    })

    setSaving(false)

    if (error) {
      alert('Не удалось добавить в дневник: ' + error.message)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div
      onClick={onClose}
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
        <h1 style={{ fontSize: '1.3rem' }}>Добавить в дневник</h1>
        <p className="sub">{item.name}</p>

        <form onSubmit={handleSave}>
          <div className="field" style={{ marginBottom: '16px' }}>
            <label>Вес, г</label>
            <input
              type="number"
              placeholder="0"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              autoFocus
            />
          </div>

          {result !== null && (
            <div className="result-box visible" style={{ marginBottom: '16px' }}>
              <div className="result-label">Получится</div>
              <div className="result-value">
                {result.toFixed(1)} <span>ккал</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Отмена
            </button>
            <button className="calc-btn" type="submit" disabled={saving || !weight} style={{ flex: 1 }}>
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
            
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddToDiaryModal