function Profile({ session }) {
  return (
    <div className="card">
      <h1>Личный кабинет</h1>
      <p className="sub">Здесь будет информация о профиле</p>

      <div className="result-box visible">
        <div className="result-label">Email</div>
        <p style={{ margin: 0 }}>{session.user.email}</p>
      </div>
    </div>

    )

  
}

export default Profile
