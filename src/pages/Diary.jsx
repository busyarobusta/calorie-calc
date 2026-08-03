import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// function formatDate(date) {
//   return date.toISOString().split('T')[0]
// }

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

  useEffect(() => {
    loadDiaryEntries()
  }, [selectedDate])

  const loadDiaryEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('in_diary', true)
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
    await supabase.from('entries').update({ in_diary: false, diary_date: null }).eq('id', id)
    loadDiaryEntries()
  }

  const total = entries.reduce((sum, entry) => sum + entry.result, 0)
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
        <div className="result-label">Итого за день</div>
        <div className="result-value">
          {total.toFixed(1)} <span>ккал</span>
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
                {/* {new Date(entry.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}{' '} */}
                <strong>{entry.name}</strong> — <strong>{entry.result.toFixed(1)} ккал</strong>
                {entry.items && entry.items.length > 1 && (
                  <div style={{ color: '#6b7268', fontSize: '0.78rem', marginTop: '8px' }}>
                    {entry.items.map((item, i) => (
                      <div key={i}>
                        {item.ingredient ? item.ingredient + ': ' : ''}
                        {item.weight} г × {item.kcal_per_100g} ккал/100г = {item.result.toFixed(1)} ккал
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="remove-btn" title="Запись удалится из дневника, но сохранится в истории" onClick={() => removeFromDiary(entry.id)}> удалить </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Diary
