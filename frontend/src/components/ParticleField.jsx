import { useEffect, useRef } from 'react'

const EMOJIS = [
  { icon: '💍', x: 7, y: 14, speed: 0.28 },
  { icon: '🌸', x: 92, y: 18, speed: 0.34 },
  { icon: '✨', x: 8, y: 42, speed: 0.24 },
  { icon: '🎊', x: 91, y: 44, speed: 0.31 },
  { icon: '💐', x: 10, y: 71, speed: 0.22 },
  { icon: '🎉', x: 89, y: 73, speed: 0.27 },
]

const BUBBLE_COLORS = ['#D4537E', '#C93F6C', '#E67FA2', '#F3AFC6']

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const createBubbles = (width, height) => {
  const bubbles = []
  const exclusionWidth = Math.min(1080, width - 120)
  const exclusionX = (width - exclusionWidth) / 2

  for (let i = 0; i < 56; i += 1) {
    const side = Math.random() < 0.5 ? 'left' : 'right'
    const sideWidth = Math.max(0, exclusionX - 18)
    let homeX = side === 'left'
      ? Math.random() * sideWidth + 8
      : exclusionX + exclusionWidth + Math.random() * sideWidth

    if (homeX < 6 || homeX > width - 6) {
      homeX = Math.random() * width
    }

    bubbles.push({
      homeX,
      homeY: Math.random() * height,
      x: homeX,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: 2.1 + Math.random() * 2.8,
      opacity: 0.26 + Math.random() * 0.2,
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    })
  }

  return bubbles
}

export default function ParticleField() {
  const canvasRef = useRef(null)
  const bubblesRef = useRef([])
  const frameRef = useRef(null)
  const sizeRef = useRef({ width: window.innerWidth, height: window.innerHeight })
  const pointerRef = useRef({ x: 0, y: 0, active: false })
  const emojiRefs = useRef([])
  const emojiStateRef = useRef(EMOJIS.map(() => ({ driftX: 0, driftY: 0 })))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let t = 0
    const dpr = window.devicePixelRatio || 1
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resizeCanvas = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      sizeRef.current = { width, height }
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bubblesRef.current = createBubbles(width, height)
    }

    const onPointerMove = (event) => {
      pointerRef.current = { x: event.clientX, y: event.clientY, active: true }
    }

    const onPointerLeave = () => {
      pointerRef.current.active = false
    }

    const drawBubbles = () => {
      const { width, height } = sizeRef.current
      ctx.clearRect(0, 0, width, height)

      const exclusionWidth = Math.min(1080, width - 120)
      const exclusionX = (width - exclusionWidth) / 2
      const pointer = pointerRef.current

      bubblesRef.current.forEach((bubble) => {
        const pullX = (bubble.homeX - bubble.x) * 0.02
        const pullY = (bubble.homeY - bubble.y) * 0.02

        let repelX = 0
        let repelY = 0
        if (pointer.active && !reduceMotion) {
          const dx = bubble.x - pointer.x
          const dy = bubble.y - pointer.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance > 0 && distance < 120) {
            const power = ((120 - distance) / 120) * 0.5
            repelX = (dx / distance) * power
            repelY = (dy / distance) * power
          }
        }

        if (bubble.x > exclusionX && bubble.x < exclusionX + exclusionWidth) {
          repelX += bubble.x < width / 2 ? -0.15 : 0.15
        }

        bubble.vx = (bubble.vx + pullX + repelX + (Math.random() - 0.5) * 0.014) * 0.93
        bubble.vy = (bubble.vy + pullY + repelY + (Math.random() - 0.5) * 0.014) * 0.93
        bubble.x = clamp(bubble.x + bubble.vx, 0, width)
        bubble.y = clamp(bubble.y + bubble.vy, 0, height)

        ctx.beginPath()
        ctx.globalAlpha = bubble.opacity
        ctx.fillStyle = bubble.color
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1
    }

    const animateEmojis = () => {
      t += 0.012
      const { width, height } = sizeRef.current
      const pointerX = pointerRef.current.x / Math.max(width, 1)
      const pointerY = pointerRef.current.y / Math.max(height, 1)

      EMOJIS.forEach((emoji, index) => {
        const node = emojiRefs.current[index]
        if (!node) return

        if (reduceMotion) {
          node.style.left = `${emoji.x}%`
          node.style.top = `${emoji.y}%`
          node.style.transform = 'translate(-50%, -50%)'
          return
        }

        const bobY = Math.sin(t * emoji.speed * 6 + index) * 10
        const bobX = Math.cos(t * emoji.speed * 4 + index) * 5

        const baseX = emoji.x / 100
        const baseY = emoji.y / 100
        const dx = pointerX - baseX
        const dy = pointerY - baseY
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001
        const radius = 0.19
        const state = emojiStateRef.current[index]

        if (pointerRef.current.active && dist < radius) {
          const force = ((radius - dist) / radius) * 7
          const targetX = -(dx / dist) * force
          const targetY = -(dy / dist) * force
          state.driftX += (targetX - state.driftX) * 0.08
          state.driftY += (targetY - state.driftY) * 0.08
        } else {
          state.driftX += (0 - state.driftX) * 0.05
          state.driftY += (0 - state.driftY) * 0.05
        }

        node.style.left = `${emoji.x + bobX + state.driftX}%`
        node.style.top = `${emoji.y + bobY + state.driftY}%`
        node.style.transform = 'translate(-50%, -50%)'
      })
    }

    const animate = () => {
      drawBubbles()
      animateEmojis()
      frameRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    frameRef.current = requestAnimationFrame(animate)
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <div className="ambient-effects" aria-hidden="true">
      <canvas ref={canvasRef} className="ambient-bubble-canvas" />
      <div className="ambient-emoji-layer">
        {EMOJIS.map((emoji, index) => (
          <span
            key={`${emoji.icon}-${index}`}
            ref={(node) => { emojiRefs.current[index] = node }}
            className="ambient-float-emoji"
          >
            {emoji.icon}
          </span>
        ))}
      </div>
    </div>
  )
}
