import React, { useEffect, useRef, useState } from 'react'
import './pattern.css'

export function PatternLock({ size = 3, onSubmit, onCancel }) {
  const [active, setActive] = useState(false)
  const [path, setPath] = useState([])
  const gridRef = useRef(null)

  const start = (idx) => { setActive(true); setPath([idx]) }
  const enter = (idx) => { if (active && !path.includes(idx)) setPath(p=>[...p, idx]) }
  const end = () => { if (active) onSubmit(path); setActive(false); setPath([]) }

  useEffect(() => {
    const up = () => end()
    window.addEventListener('mouseup', up)
    window.addEventListener('touchend', up)
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up) }
  })

  const N = size*size
  return (
    <div className="pattern-wrap">
      <div className="pattern-grid" ref={gridRef}
        onMouseLeave={()=> active && end()}>
        {Array.from({length: N}).map((_,i)=>{
          const hit = path.includes(i)
          return (
            <div key={i}
              className={`dot ${hit? 'hit':''}`}
              onMouseDown={()=>start(i)}
              onMouseEnter={()=>enter(i)}
              onTouchStart={()=>start(i)}
              onTouchMove={(e)=>{
                const touch = e.touches[0]
                const el = document.elementFromPoint(touch.clientX, touch.clientY)
                const idxAttr = el && el.getAttribute('data-idx')
                if (idxAttr) enter(parseInt(idxAttr,10))
              }}
              data-idx={i}
            />
          )
        })}
      </div>
      <div className="pattern-actions">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn" onClick={()=>onSubmit(path)}>Submit</button>
      </div>
    </div>
  )
}
