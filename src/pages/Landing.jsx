import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './landing.css'
import { BouncingShapes } from '../shared/BouncingShapes'
import { FakeLoginForm } from '../shared/FakeLoginForm'
import { PatternLock } from '../shared/PatternLock'

// Hardcoded auth data
const AUTH = {
  realUsername: 'admin',
  morsePin: '....', // e.g., 4-letter Morse like H (....)
  patterns: [ [0,1,2,5,8] ], // first pattern required
  hiddenPasswords: ['123', '456', '789'],
}

export default function Landing({ onUnlock }) {
  const [step, setStep] = useState('login')
  const [status, setStatus] = useState('')
  const [squareColors, setSquareColors] = useState(['red','red','red'])

  const handleLoginSuccess = useCallback(() => {
    setStep('pattern')
    setStatus('')
  }, [])

  const handlePatternResult = useCallback((ok) => {
    if (!ok) {
      setStatus('Incorrect username or password')
      setStep('login')
      setSquareColors(['red','red','red'])
      return
    }
    // first red square turns yellow
    setSquareColors((prev) => ['yellow', prev[1], prev[2]])
    setStep('hidden-typing')
  }, [])

  const handleHiddenTypingProgress = useCallback((idx, ok) => {
    if (!ok) {
      setStatus('Incorrect username or password')
      setStep('login')
      setSquareColors(['red','red','red'])
      return
    }
    setSquareColors((prev) => {
      const next = [...prev]
      // current becomes green
      next[idx] = 'green'
      // next red becomes yellow
      if (idx + 1 < next.length) next[idx+1] = 'yellow'
      return next
    })
    if (idx === 2) {
      // all green
      onUnlock()
    }
  }, [onUnlock])

  return (
    <div className="landing-root">
      <header className="hero">
        <h1>Real Company</h1>
        <p>Empowering the Future</p>
      </header>
      <div className="outer-box">
        <BouncingShapes specialSquares={squareColors} />
        <div className="inner-box">
          {step === 'login' && (
            <FakeLoginForm
              onSuccess={handleLoginSuccess}
              onFail={() => {
                setStatus('Incorrect username or password')
                setStep('login')
              }}
              auth={AUTH}
            />
          )}
          {step === 'pattern' && (
            <PatternLock
              size={3}
              onSubmit={(pattern) => {
                const ok = JSON.stringify(pattern) === JSON.stringify(AUTH.patterns[0])
                handlePatternResult(ok)
              }}
              onCancel={() => setStep('login')}
            />
          )}
          {step === 'hidden-typing' && (
            <HiddenTyping passwords={AUTH.hiddenPasswords} onProgress={handleHiddenTypingProgress} />
          )}
          {status && <div className="status">{status}</div>}
        </div>
      </div>
    </div>
  )
}

function HiddenTyping({ passwords, onProgress }) {
  const idxRef = useRef(0)
  const bufferRef = useRef('')
  const handler = useCallback((e) => {
    if (e.key === 'Alt' || e.key === 'AltGraph') return
    if (e.altKey && (e.key === 'n' || e.key === 'N')) {
      const ok = bufferRef.current === passwords[idxRef.current]
      onProgress(idxRef.current, ok)
      bufferRef.current = ''
      if (ok && idxRef.current < passwords.length - 1) {
        idxRef.current += 1
      }
      e.preventDefault()
      return
    }
    if (e.key.length === 1) {
      bufferRef.current += e.key
    } else if (e.key === 'Backspace') {
      bufferRef.current = bufferRef.current.slice(0, -1)
    }
  }, [onProgress, passwords])

  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handler])

  return (
    <div className="hidden-typing">
      <p>Welcome back.</p>
    </div>
  )
}
