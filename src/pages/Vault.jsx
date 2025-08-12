import React, { useEffect, useMemo, useState } from 'react'
import './vault.css'

const initialNotes = [
  { id: 1, text: 'email: mymail@example.com\npass: alpha123!', color: '#fde68a' },
  { id: 2, text: 'bank: acct-4729\npass: beta$ecure', color: '#bfdbfe' },
  { id: 3, text: 'vpn: office-vpn\npass: charlie#7', color: '#c7d2fe' },
]

export default function Vault({ onLogout }) {
  const [notes, setNotes] = useState(() => {
    try {
      const cached = localStorage.getItem('vault-notes')
      return cached ? JSON.parse(cached) : initialNotes
    } catch { return initialNotes }
  })

  useEffect(() => {
    localStorage.setItem('vault-notes', JSON.stringify(notes))
  }, [notes])

  const updateNote = (id, patch) => setNotes(ns => ns.map(n => n.id === id ? { ...n, ...patch } : n))
  const addNote = () => setNotes(ns => [...ns, { id: Date.now(), text: 'new note', color: '#fde68a' }])
  const removeNote = (id) => setNotes(ns => ns.filter(n => n.id !== id))

  const colors = ['#fde68a', '#bfdbfe', '#c7d2fe', '#fca5a5', '#86efac']

  return (
    <div className="vault-root">
      <header className="vault-header">
        <h2>Password Vault</h2>
        <div className="spacer" />
        <button className="btn" onClick={addNote}>Add Note</button>
        <button className="btn" onClick={onLogout}>Logout</button>
      </header>
      <div className="grid">
        {notes.map(n => (
          <div key={n.id} className="note" style={{ background: n.color }}>
            <div className="note-actions">
              <button className="small" onClick={()=>removeNote(n.id)}>Delete</button>
              <div className="colors">
                {colors.map(c => (
                  <button key={c} className="swatch" style={{ background: c }} onClick={()=>updateNote(n.id, { color: c })} />
                ))}
              </div>
            </div>
            <div
              className="note-text"
              contentEditable
              suppressContentEditableWarning
              onInput={(e)=>updateNote(n.id, { text: e.currentTarget.textContent })}
            >{n.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
