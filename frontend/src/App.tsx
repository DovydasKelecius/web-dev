import React, { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => setMessage('Error connecting to backend'))
  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>React + Go Monorepo</h1>
      <p>Backend says: <strong>{message}</strong></p>
    </div>
  )
}

export default App
