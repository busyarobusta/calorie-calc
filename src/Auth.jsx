import { useState } from 'react'
import { supabase } from './supabaseClient'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage('Ошибка: ' + error.message)
      } else {
        setMessage('Проверьте почту — мы отправили письмо для подтверждения регистрации.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage('Ошибка: ' + error.message)
      }
    }

    setLoading(false)
  }

  return (
    <div className="card">
      <h1>{isSignUp ? 'Регистрация' : 'Вход'}</h1>
      <p className="sub">
        {isSignUp
          ? 'Создайте аккаунт, чтобы сохранять расчёты'
          : 'Войдите, чтобы увидеть свои сохранённые расчёты'}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="field">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
        </div>

        <button className="calc-btn" type="submit" disabled={loading}>
          {loading ? 'Подождите...' : isSignUp ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>

      {message && (
        <div className="result-box visible">
          <p style={{ margin: 0, fontSize: '0.85rem' }}>{message}</p>
        </div>
      )}

      <button
        className="add-btn"
        onClick={() => {
          setIsSignUp(!isSignUp)
          setMessage('')
        }}
        style={{ marginTop: '16px' }}
      >
        {isSignUp ? 'У меня уже есть аккаунт' : 'Создать новый аккаунт'}
      </button>
    </div>
  )
}

export default Auth
