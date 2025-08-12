import React, { useCallback, useEffect, useRef, useState } from 'react'
import './fakeLogin.css'

export function FakeLoginForm({ onSuccess, onFail, auth }) {
  const [username, setUsername] = useState('') // fake username
  const [password, setPassword] = useState('') // real username
  const [waitingMorse, setWaitingMorse] = useState(false)
  const morseRef = useRef('')
  const pressStartRef = useRef(0)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Fake: we "validate" immediate fields but secretly enter morse mode
    setWaitingMorse(true)
    morseRef.current = ''
    pressStartRef.current = 0
  }

  const keydown = useCallback((e) => {
    if (!waitingMorse) return
    if (e.code === 'Space') {
      if (pressStartRef.current === 0) pressStartRef.current = performance.now()
      e.preventDefault()
    }
  }, [waitingMorse])

  const keyup = useCallback((e) => {
    if (!waitingMorse) return
    if (e.code === 'Space') {
      const duration = performance.now() - (pressStartRef.current || performance.now())
      const symbol = duration < 200 ? '.' : '-'
      morseRef.current += symbol
      pressStartRef.current = 0
      if (morseRef.current.length >= auth.morsePin.length) {
        const ok = morseRef.current === auth.morsePin && password === auth.realUsername
        if (ok) onSuccess()
        else onFail()
        setWaitingMorse(false)
      }
      e.preventDefault()
    }
  }, [auth.morsePin, auth.realUsername, onFail, onSuccess, waitingMorse, password])

  useEffect(() => {
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
    }
  }, [keydown, keyup])

  return (
    <form className="fake-form" onSubmit={handleSubmit} autoComplete="off">
      <div className="row">
        <label>Username</label>
        <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Enter username" />
      </div>
      <div className="row">
        <label>Password</label>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter password" type="password" />
      </div>
      <button type="submit" className="btn">Submit</button>
    </form>
  )
}
