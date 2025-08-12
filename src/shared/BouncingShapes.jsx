import React, { useEffect, useRef } from 'react'
import './bouncing.css'

// Simple canvas-based bouncing shapes with collisions and color logic
export function BouncingShapes({ specialSquares = ['red','red','red'] }) {
  const canvasRef = useRef(null)
  const reqRef = useRef(0)
  const shapesRef = useRef([])
  const specialRef = useRef(specialSquares)
  const colors = ['#e2e8f0', '#38bdf8', '#a78bfa', '#f59e0b', '#10b981']

  // Keep latest special square colors
  useEffect(() => { specialRef.current = specialSquares }, [specialSquares])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = (canvas.width = canvas.offsetWidth)
    let h = (canvas.height = canvas.offsetHeight)

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', onResize)

    // init shapes
    const shapes = []
    const count = 15
    const rand = (a, b) => a + Math.random() * (b - a)
    for (let i = 0; i < count; i++) {
      const isSquare = i < 3
      const size = isSquare ? 18 : rand(10, 16)
      shapes.push({
        id: i,
        type: isSquare ? 'square' : ['circle', 'triangle', 'diamond'][Math.floor(rand(0, 3))],
        x: rand(size, w - size),
        y: rand(size, h - size),
        vx: rand(-0.7, 0.7) || 0.4,
        vy: rand(-0.7, 0.7) || -0.4,
        size,
        color: isSquare ? 'red' : colors[Math.floor(rand(0, colors.length))],
      })
    }
    shapesRef.current = shapes

    const collide = (a, b) => {
      const dx = a.x - b.x,
        dy = a.y - b.y
      const dist = Math.hypot(dx, dy)
      const minDist = (a.size + b.size) * 0.9
      if (dist < minDist) {
        // simple elastic swap
        const tVx = a.vx
        a.vx = b.vx
        b.vx = tVx
        const tVy = a.vy
        a.vy = b.vy
        b.vy = tVy
        // separate
        const overlap = (minDist - dist) / 2
        const nx = dx / (dist || 1)
        const ny = dy / (dist || 1)
        a.x += nx * overlap
        a.y += ny * overlap
        b.x -= nx * overlap
        b.y -= ny * overlap
        // color change for non-squares
        if (a.type !== 'square') a.color = colors[Math.floor(Math.random() * colors.length)]
        if (b.type !== 'square') b.color = colors[Math.floor(Math.random() * colors.length)]
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const shapes = shapesRef.current
      // walls and movement
      for (const s of shapes) {
        s.x += s.vx
        s.y += s.vy
        if (s.x < s.size || s.x > w - s.size) {
          s.vx *= -1
          s.x = Math.min(Math.max(s.x, s.size), w - s.size)
        }
        if (s.y < s.size || s.y > h - s.size) {
          s.vy *= -1
          s.y = Math.min(Math.max(s.y, s.size), h - s.size)
        }
      }
      // collisions
      for (let i = 0; i < shapes.length; i++) for (let j = i + 1; j < shapes.length; j++) collide(shapes[i], shapes[j])

      // sync special square colors (first 3)
      for (let i = 0; i < 3 && i < shapes.length; i++) {
        if (shapes[i].type === 'square') {
          shapes[i].color = specialRef.current[i] || 'red'
        }
      }

      // render
      for (const s of shapes) {
        ctx.save()
        if (s.type === 'square') {
          ctx.fillStyle = s.color
          const r = 4
          const x = s.x - s.size / 1.2,
            y = s.y - s.size / 1.2,
            wq = s.size * 1.8,
            hq = s.size * 1.8
          roundRect(ctx, x, y, wq, hq, r)
          ctx.fill()
        } else if (s.type === 'circle') {
          ctx.fillStyle = s.color
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
          ctx.fill()
        } else if (s.type === 'triangle') {
          ctx.fillStyle = s.color
          ctx.beginPath()
          ctx.moveTo(s.x, s.y - s.size)
          ctx.lineTo(s.x - s.size, s.y + s.size)
          ctx.lineTo(s.x + s.size, s.y + s.size)
          ctx.closePath()
          ctx.fill()
        } else if (s.type === 'diamond') {
          ctx.fillStyle = s.color
          ctx.beginPath()
          ctx.moveTo(s.x, s.y - s.size)
          ctx.lineTo(s.x - s.size, s.y)
          ctx.lineTo(s.x, s.y + s.size)
          ctx.lineTo(s.x + s.size, s.y)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()
      }

      reqRef.current = requestAnimationFrame(draw)
    }

    reqRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(reqRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas className="bouncing-canvas" ref={canvasRef} />
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
