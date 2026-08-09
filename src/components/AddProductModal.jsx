import { useState } from 'react'
import { supabase } from '../supabaseClient'

function AddProductModal({ session, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [kcal, setKcal] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim() || !kcal) return
    setSaving(true)

    const { error } = await supabase.from('products').insert({
      user_id: session.user.id,
      name: name.trim(),
      kcal_per_100g: parseFloat(kcal),
    })

    setSaving(false)

    if (error) {
      alert('Не удалось сохранить: ' + error.message)
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
        <h1 style={{ fontSize: '1.3rem' }}>Добавить еду</h1>

        <form onSubmit={handleSave}>
          <div className="field" style={{ marginBottom: '12px' }}>
            <label>Наименование</label>
            <input
              type="text"
              placeholder="Например, куриная грудка"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field" style={{ marginBottom: '16px' }}>
            <label>Ккал / 100 г</label>
            <input
              type="number"
              placeholder="0"
              inputMode="decimal"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Отмена
            </button>
            <button className="calc-btn" type="submit" disabled={saving || !name.trim() || !kcal} style={{ flex: 1 }}>
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProductModal
