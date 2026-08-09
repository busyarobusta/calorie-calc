import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = formatDate(new Date())
  const yesterday = formatDate(new Date(Date.now() - 86400000))

  if (dateStr === today) return 'Сегодня'
  if (dateStr === yesterday) return 'Вчера'

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    weekday: 'long',
  })
}

function Diary({ session }) {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [calorieGoal, setCalorieGoal] = useState(null)

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    loadDiaryEntries()
  }, [selectedDate])

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('calorie_goal')
      .eq('id', session.user.id)
      .maybeSingle()

    if (!error && data) {
      setCalorieGoal(data.calorie_goal)
    }
  }

  const loadDiaryEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('diary_date', selectedDate)
      .order('created_at', { ascending: true })

    if (!error) {
      setEntries(data)
    }
    setLoading(false)
  }

  const goToPreviousDay = () => {
    const date = new Date(selectedDate + 'T00:00:00')
    date.setDate(date.getDate() - 1)
    setSelectedDate(formatDate(date))
  }

  const goToNextDay = () => {
    const date = new Date(selectedDate + 'T00:00:00')
    date.setDate(date.getDate() + 1)
    setSelectedDate(formatDate(date))
  }

  const removeFromDiary = async (id) => {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id)
    if (error) {
      alert('Не удалось убрать запись из дневника: ' + error.message)
    }
    loadDiaryEntries()
  }

  const total = entries.reduce((sum, entry) => sum + entry.result, 0)
  const remaining = calorieGoal !== null ? calorieGoal - total : null
  const isToday = selectedDate === formatDate(new Date())

  return (
    <div className="card">
      <h1>Дневник калорий</h1>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0' }}>
        <button className="remove-btn" onClick={goToPreviousDay} style={{ fontSize: '1rem' }}>
          ←
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>
            {formatDisplayDate(selectedDate)}
          </div>
        </div>
        <button
          className="remove-btn"
          onClick={goToNextDay}
          disabled={isToday}
          style={{ fontSize: '1rem', opacity: isToday ? 0.3 : 1 }}
        >
          →
        </button>
      </div>

      <div className="result-box visible">
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div className="result-label">Цель</div>
            <div style={{ fontSize: '1.3rem', color: 'var(--accent)' }}>
              {calorieGoal !== null ? calorieGoal : '—'}
            </div>
          </div>
          <div>
            <div className="result-label">Употреблено</div>
            <div style={{ fontSize: '1.3rem', color: 'var(--accent)' }}>
              {total.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="result-label">Остаток</div>
            <div style={{ fontSize: '1.3rem', color: remaining !== null && remaining < 0 ? '#b0503f' : 'var(--accent)' }}>
              {remaining !== null ? remaining.toFixed(0) : '—'}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="sub" style={{ marginTop: '24px' }}>Загрузка...</p>
      ) : entries.length === 0 ? (
        <p className="sub" style={{ marginTop: '24px' }}>
          Записей за этот день нет. Добавь расчёт на странице «Быстрый расчёт» с галочкой «Сохранить в дневник».
        </p>
      ) : (
        <div style={{ marginTop: '24px' }}>
          {entries.map(entry => (
            <div
              key={entry.id}
              className="row"
              style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '6px', padding: '10px 14px', marginBottom: '8px', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '0.85rem' }}>
                <strong>{entry.name}</strong>
                {entry.weight && <> — {entry.weight} г</>} — <strong>{entry.result.toFixed(1)} ккал</strong>
                {entry.items && entry.items.length > 0 && (
                  <div style={{ color: '#6b7268', fontSize: '0.78rem', marginTop: '8px' }}>
                    {entry.items.map((item, i) => (
                      <div key={i}>
                        {item.ingredient ? item.ingredient + ': ' : ''}
                        {item.weight} г
                        {item.kcal_per_100g !== undefined
                          ? <> × {item.kcal_per_100g} ккал/100г = {item.result.toFixed(1)} ккал</>
                          : <> — {item.kcal} ккал</>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="remove-btn"
                title="Запись удалится из дневника, но сохранится в истории"
                onClick={() => removeFromDiary(entry.id)}
              >
                удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Diary
