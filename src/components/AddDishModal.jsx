import { useState } from 'react'
import { supabase } from '../supabaseClient'

function AddDishModal({ session, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [outputWeight, setOutputWeight] = useState('')
  const [items, setItems] = useState([{ id: 1, ingredient: '', weight: '', kcal: '' }])
  const [saving, setSaving] = useState(false)

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1
    setItems([...items, { id: newId, ingredient: '', weight: '', kcal: '' }])
  }

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id))
  }

  const updateItem = (id, field, value) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const totalKcal = items.reduce((sum, i) => {
    const weight = parseFloat(i.weight) || 0
    const kcalPer100 = parseFloat(i.kcal) || 0
    return sum + (kcalPer100 / 100) * weight
  }, 0)
  const kcalPer100g = outputWeight ? (totalKcal / parseFloat(outputWeight)) * 100 : 0

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim() || !outputWeight) return
    setSaving(true)

    const composition = items
      .filter(i => i.ingredient && i.weight && i.kcal)
      .map(i => ({
        ingredient: i.ingredient.trim(),
        weight: parseFloat(i.weight),
        kcal: parseFloat(i.kcal),
      }))

    const { error } = await supabase.from('dishes').insert({
      user_id: session.user.id,
      name: name.trim(),
      output_weight: parseFloat(outputWeight),
      kcal_per_100g: kcalPer100g,
      composition: composition,
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
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '28px', maxWidth: '480px', width: '100%', margin: '20px 0' }}
      >
        <h1 style={{ fontSize: '1.3rem' }}>Добавить блюдо</h1>

        <form onSubmit={handleSave}>
          <div className="field" style={{ marginBottom: '12px' }}>
            <label>Название блюда</label>
            <input
              type="text"
              placeholder="Например, плов"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="result-label" style={{ marginBottom: '8px', marginTop: '16px' }}>Состав</div>

          {items.map((item, index) => (
            <div className="row" key={item.id} style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="field" style={{ minWidth: '120px' }}>
                <label>ингредиент</label>
                <input
                  type="text"
                  placeholder="Название"
                  value={item.ingredient}
                  onChange={(e) => updateItem(item.id, 'ingredient', e.target.value)}
                />
              </div>
              <div className="field" style={{ minWidth: '80px' }}>
                <label>вес, г</label>
                <input
                  type="number"
                  placeholder="0"
                  inputMode="decimal"
                  value={item.weight}
                  onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
                />
              </div>
              <div className="field" style={{ minWidth: '80px' }}>
                <label>ккал/100гр</label>
                <input
                  type="number"
                  placeholder="0"
                  inputMode="decimal"
                  value={item.kcal}
                  onChange={(e) => updateItem(item.id, 'kcal', e.target.value)}
                />
              </div>
              {index > 0 ? (
                <button
                  type="button"
                  className="remove-btn"
                  title="Удалить ингредиент"
                  onClick={() => removeItem(item.id)}
                >
                  ✕
                </button>
              ) : (
                <span style={{ width: '24px' }}></span>
              )}
            </div>
          ))}

          <button type="button" className="add-btn" onClick={addItem} style={{ marginTop: '8px' }}>
            + Добавить ингредиент
          </button>

          <div className="field" style={{ marginTop: '8px', marginBottom: '16px' }}>
            <label>Вес блюда на выходе, г</label>
            <input
              type="number"
              placeholder="0"
              inputMode="decimal"
              value={outputWeight}
              onChange={(e) => setOutputWeight(e.target.value)}
            />
          </div>

          {outputWeight && totalKcal > 0 && (
            <div className="result-box visible" style={{ marginBottom: '16px' }}>
              <div className="result-label">Ккал / 100 г готового блюда</div>
              <div className="result-value">
                {kcalPer100g.toFixed(1)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Отмена
            </button>
            <button className="calc-btn" type="submit" disabled={saving || !name.trim() || !outputWeight} style={{ flex: 1 }}>
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
            
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDishModal