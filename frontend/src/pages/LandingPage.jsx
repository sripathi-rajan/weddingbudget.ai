import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const FEATURES = [
  {
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    title: 'Set Your Date & Style',
    description: 'Choose your wedding date, type, and cultural preferences. We tailor everything for Hindu, Muslim, Sikh, Christian, Jain, Buddhist & more.',
    large: false
  },
  {
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80',
    title: 'Find the Perfect Venue',
    description: 'Browse curated venues with live pricing for your city and guest count.',
    large: false
  },
  {
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
    title: 'AI Decor Suggestions',
    description: 'Get AI-powered decor recommendations with cost estimates.',
    large: false
  },
  {
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    title: 'Smart Budget Tracking',
    description: 'Real-time budget breakdown across all categories. Never go over budget again.',
    large: true
  },
  {
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    title: 'Artists & Entertainment',
    description: 'Discover performers, DJs, and photographers for your big day.',
    large: false
  }
]

const STATS = [
  { target: 50000, suffix: '+', label: 'Weddings Planned' },
  { target: 98, suffix: '%', label: 'Satisfaction Rate' },
  { target: 500, suffix: 'Cr+', label: 'Budget Managed (₹)', isCrore: true },
  { target: 6, suffix: '+', label: 'Wedding Cultures' }
]

const S = {
  page: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: "'Inter', sans-serif",
    color: '#1f1f1f',
    overflowX: 'hidden',
    position: 'relative'
  },
  canvas: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.5
  },
  floatingEmojis: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1
  },
  floatEmoji: {
    position: 'absolute',
    fontSize: '2rem',
    userSelect: 'none',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))',
    transition: 'transform 0.1s ease'
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    background: 'rgba(255,255,255,0.88)',
    borderBottom: '1px solid rgba(233, 30, 140, 0.08)',
    transition: 'all 0.3s ease'
  },
  headerScrolled: {
    background: 'rgba(255,255,255,0.96)',
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    gap: 16
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0
  },
  logoIcon: {
    fontSize: '1.4rem'
  },
  logoText: {
    fontSize: '1.05rem',
    fontWeight: 700,
    letterSpacing: '-0.02em'
  },
  logoAI: {
    color: '#e91e8c'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'nowrap'
  },
  navLink: {
    textDecoration: 'none',
    fontSize: '0.82rem',
    fontWeight: 500,
    color: '#6b7280',
    padding: '6px 10px',
    borderRadius: 8,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  navLinkActive: {
    background: '#fce4ec',
    color: '#e91e8c'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0
  },
  btnGhost: {
    background: 'none',
    color: '#1f1f1f',
    textDecoration: 'none',
    padding: '10px 16px',
    fontSize: '0.88rem',
    fontWeight: 500,
    borderRadius: 50,
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer'
  },
  btnPrimary: {
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    padding: '10px 22px',
    borderRadius: 50,
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif"
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: 5,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8
  },
  hamburgerSpan: {
    display: 'block',
    width: 22,
    height: 2,
    background: '#1f1f1f',
    borderRadius: 2,
    transition: 'all 0.3s'
  },
  hero: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '160px 24px 100px',
    minHeight: '100vh',
    justifyContent: 'center',
    background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('/hero-bg.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.73rem',
    fontWeight: 600,
    color: '#ffc1e3',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 28,
    background: 'rgba(255, 255, 255, 0.15)',
    padding: '6px 16px',
    borderRadius: 50,
    backdropFilter: 'blur(4px)'
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
    fontWeight: 900,
    color: '#ffffff',
    lineHeight: 1.08,
    letterSpacing: '-0.03em',
    marginBottom: 12,
    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  heroHighlight: {
    color: '#ff66b2',
    fontStyle: 'italic'
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: 480,
    lineHeight: 1.7,
    marginBottom: 44,
    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  btnLarge: {
    padding: '16px 32px',
    fontSize: '1rem',
    fontWeight: 700
  },
  btnOutline: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    border: '1.5px solid rgba(255, 255, 255, 0.4)',
    padding: '12px 28px',
    borderRadius: 50,
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif",
    backdropFilter: 'blur(4px)'
  },
  features: {
    position: 'relative',
    zIndex: 2,
    padding: '100px 24px',
    maxWidth: 1100,
    margin: '0 auto'
  },
  featuresLabel: {
    textAlign: 'center',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#e91e8c',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: 20
  },
  featuresTitle: {
    textAlign: 'center',
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
    fontWeight: 700,
    marginBottom: 60,
    lineHeight: 1.25
  },
  featuresTitleEm: {
    color: '#e91e8c',
    fontStyle: 'italic'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20
  },
  featureCard: {
    background: '#fff',
    border: '1px solid #f0f0f0',
    borderRadius: 16,
    padding: 32,
    transition: 'all 0.3s ease',
    cursor: 'default'
  },
  cardLarge: {
    gridColumn: 'auto' // Removed gridColumn: span 2 to avoid mobile overflow
  },
  featureImageWrap: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    background: '#f6f6f6'
  },
  featureImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  featureTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: 10
  },
  featureDesc: {
    fontSize: '0.9rem',
    color: '#6b7280',
    lineHeight: 1.65
  },
  stats: {
    position: 'relative',
    zIndex: 2,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b3d 100%)',
    padding: '80px 24px',
    margin: '40px 0'
  },
  statsInner: {
    maxWidth: 1000,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    flexWrap: 'wrap'
  },
  statItem: {
    flex: '1 1 200px',
    textAlign: 'center',
    padding: 20
  },
  statNumber: {
    display: 'inline',
    fontFamily: "'Playfair Display', serif",
    fontSize: '3rem',
    fontWeight: 900,
    color: '#fff',
    lineHeight: 1
  },
  statUnit: {
    display: 'inline',
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#e91e8c'
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  },
  statDivider: {
    width: 1,
    height: 60,
    background: 'rgba(255,255,255,0.15)'
  },
  ctaSection: {
    position: 'relative',
    zIndex: 2,
    padding: '100px 24px',
    textAlign: 'center'
  },
  ctaInner: {
    maxWidth: 600,
    margin: '0 auto'
  },
  ctaEmojis: {
    fontSize: '2rem',
    letterSpacing: 8,
    marginBottom: 24
  },
  ctaH2: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
    fontWeight: 800,
    marginBottom: 16,
    lineHeight: 1.2
  },
  ctaP: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: 40
  },
  footer: {
    position: 'relative',
    zIndex: 2,
    background: '#fafafa',
    borderTop: '1px solid #f0f0f0',
    padding: '60px 24px 30px'
  },
  footerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 40,
    paddingBottom: 40
  },
  footerBrandP: {
    marginTop: 12,
    fontSize: '0.88rem',
    color: '#6b7280',
    lineHeight: 1.6,
    maxWidth: 280
  },
  footerColH4: {
    fontSize: '0.82rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 16
  },
  footerColA: {
    display: 'block',
    fontSize: '0.88rem',
    color: '#6b7280',
    textDecoration: 'none',
    marginBottom: 10,
    transition: 'color 0.2s'
  },
  footerBottom: {
    maxWidth: 1100,
    margin: '0 auto',
    paddingTop: 24,
    borderTop: '1px solid #f0f0f0',
    fontSize: '0.82rem',
    color: '#6b7280',
    textAlign: 'center'
  }
}

const FLOATING_EMOJIS = [
  { emoji: '', x: 8, y: 22, speed: 0.3 },
  { emoji: '', x: 85, y: 12, speed: 0.4 },
  { emoji: '', x: 6, y: 42, speed: 0.25 },
  { emoji: '', x: 90, y: 38, speed: 0.35 },
  { emoji: '', x: 12, y: 62, speed: 0.2 },
  { emoji: '', x: 88, y: 58, speed: 0.45 },
  { emoji: '', x: 5, y: 78, speed: 0.3 },
  { emoji: '', x: 92, y: 75, speed: 0.25 },
  { emoji: '', x: 15, y: 88, speed: 0.4 },
  { emoji: '', x: 80, y: 88, speed: 0.35 }
]

export default function LandingPage({ onEnter, onOpenGuide }) {
  const [fading, setFading] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [statsAnimated, setStatsAnimated] = useState(false)
  const [stats, setStats] = useState({ 0: 0, 1: 0, 2: 0, 3: 0 })
  const canvasRef = useRef(null)
  const statsRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.2
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(233, 30, 140, ${this.opacity})`
        ctx.fill()
      }
    }

    for (let i = 0; i < 80; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.update()
        p.draw()
      })
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsAnimated) {
          setStatsAnimated(true)
          STATS.forEach((stat, i) => {
            let current = 0
            const increment = stat.target / 60
            const timer = setInterval(() => {
              current += increment
              if (current >= stat.target) {
                current = stat.target
                clearInterval(timer)
              }
              setStats(prev => ({ ...prev, [i]: Math.floor(current) }))
            }, 30)
          })
        }
      },
      { threshold: 0.5 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [statsAnimated])

  const enter = (role) => {
    setFading(true)
    setTimeout(() => onEnter(role), 450)
  }

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.div
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.45 }}
      style={S.page}
    >
      <canvas ref={canvasRef} style={S.canvas} id="particle-canvas" />

      <div style={S.floatingEmojis} id="floating-emojis">
        {FLOATING_EMOJIS.map((item, i) => (
          <span
            key={i}
            style={{
              ...S.floatEmoji,
              left: `${item.x}%`,
              top: `${item.y}%`,
              animation: `floatY 6s ease-in-out infinite`,
              animationDelay: `${-i * 0.5}s`,
              animationDuration: `${5 + item.speed * 5}s`
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-18px) rotate(3deg); }
          50% { transform: translateY(-8px) rotate(-2deg); }
          75% { transform: translateY(-22px) rotate(2deg); }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .cta-emoji-anim { animation: sparkle 2s ease-in-out infinite; }
        @media (max-width: 800px) {
          #main-nav { display: none !important; }
        }
        @media (max-width: 480px) {
          .nav-logo-text { font-size: 0.9rem !important; }
          .btn-ghost { padding: 8px 6px !important; font-size: 0.8rem !important; }
          .btn-primary { padding: 8px 14px !important; font-size: 0.8rem !important; white-space: nowrap !important; }
          .header-inner { padding: 0 12px !important; gap: 8px !important; }
        }
      `}</style>

      <header
        style={{
          ...S.header,
          ...(scrolled ? S.headerScrolled : {})
        }}
        id="header"
      >
        <div className="header-inner" style={S.headerInner}>
          <a href="https://wedddingbudget-ai.vercel.app/" style={{ ...S.logo, textDecoration: 'none', cursor: 'pointer' }}>
            <span style={S.logoIcon}></span>
            <span className="nav-logo-text" style={S.logoText}>
              WeddingBudget<span style={S.logoAI}>.AI</span>
            </span>
          </a>

          <nav className="nav" id="main-nav" style={S.nav}>
            <a
              href="#"
              className="nav-link active"
              onClick={(e) => { e.preventDefault(); onEnter('client') }}
              style={S.navLink}
            >
              Style
            </a>
            <a href="#" style={S.navLink}> Venue</a>
            <a href="#" style={S.navLink}> Decor AI</a>
            <a href="#" style={S.navLink}> Food</a>
            <a href="#" style={S.navLink}> Artists</a>
            <a href="#" style={S.navLink}> Sundries</a>
            <a href="#" style={S.navLink}> Logistics</a>
            <a href="#" style={S.navLink}> Budget</a>
          </nav>

          <div style={S.headerActions}>
            <button
              style={{ ...S.btnGhost, color: '#e91e8c', fontWeight: 600, fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={(e) => { e.preventDefault(); onOpenGuide(); }}
              className="btn-ghost"
            >
              📖 Guide
            </button>
            <button
              style={S.btnGhost}
              onClick={(e) => { e.preventDefault(); enter('admin'); }}
              className="btn-ghost"
            >
              Admin
            </button>
            <button
              style={S.btnPrimary}
              onClick={(e) => { e.preventDefault(); enter('client'); }}
              className="btn-primary"
            >
              Start Planning
            </button>
          </div>

          <button className="hamburger" style={S.hamburger} id="hamburger">
            <span style={S.hamburgerSpan}></span>
            <span style={S.hamburgerSpan}></span>
            <span style={S.hamburgerSpan}></span>
          </button>
        </div>
      </header>

      <section className="hero" style={S.hero}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div style={S.heroBadge}>
            <span>✦</span> NEXT-GEN WEDDING PLANNING
          </div>
        </motion.div>

        <motion.h1
          style={S.heroTitle}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          Plan your wedding.<br />
          <span style={S.heroHighlight}>Brilliantly.</span>
        </motion.h1>

        <motion.p
          style={S.heroSubtitle}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          The world's most intuitive AI budget tool for Indian weddings.<br />
          Hindu, Muslim, Christian — we've got you covered.
        </motion.p>

        <motion.div
          style={S.heroActions}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
        >
          <button
            style={{ ...S.btnPrimary, ...S.btnLarge }}
            onClick={() => enter('client')}
          >
            Start Planning — It's Free →
          </button>

          <button
            style={{ ...S.btnOutline, ...S.btnLarge }}
            onClick={scrollToFeatures}
          >
            See how it works
          </button>
        </motion.div>
      </section>

      <section className="features" id="features" style={S.features}>
        <div style={S.featuresLabel}>HOW IT WORKS</div>
        <h2 style={S.featuresTitle}>
          Everything you need to plan the <em style={S.featuresTitleEm}>perfect</em> wedding
        </h2>

        <div style={S.featuresGrid}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              style={{
                ...S.featureCard,
                ...(f.large ? S.cardLarge : {})
              }}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', borderColor: '#fce4ec' }}
            >
              <div style={S.featureImageWrap}>
                <img
                  src={f.image}
                  alt={f.title}
                  style={S.featureImage}
                  loading="lazy"
                />
              </div>
              <div style={S.featureTitle}>{f.title}</div>
              <div style={S.featureDesc}>{f.description}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="stats" ref={statsRef} style={S.stats}>
        <div style={S.statsInner}>
          {STATS.map((stat, i) => (
            <div key={i} style={S.statItem}>
              <div style={S.statNumber}>
                {stats[i].toLocaleString()}
              </div>
              <div style={S.statUnit}>{stat.suffix}</div>
              <div style={S.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section" style={S.ctaSection}>
        <div style={S.ctaInner}>
          <div style={S.ctaEmojis} className="cta-emoji-anim">   </div>
          <h2 style={S.ctaH2}>Ready to plan your dream wedding?</h2>
          <p style={S.ctaP}>
            Join thousands of couples who planned their perfect day with WeddingBudget.AI
          </p>
          <button
            style={{ ...S.btnPrimary, ...S.btnLarge, background: '#e91e8c' }}
            onClick={() => enter('client')}
          >
            Start Planning — It's Free →
          </button>
        </div>
      </section>

      <footer className="footer" style={S.footer}>
        <div style={S.footerInner}>
          <div>
            <a href="https://wedddingbudget-ai.vercel.app/" style={{ ...S.logo, textDecoration: 'none', cursor: 'pointer' }}>
              <span style={S.logoIcon}></span>
              <span style={S.logoText}>
                WeddingBudget<span style={S.logoAI}>.AI</span>
              </span>
            </a>
            <p style={S.footerBrandP}>
              The world's most intuitive AI budget tool for Indian weddings.
            </p>
          </div>

          <div>
            <h4 style={S.footerColH4}>Planning</h4>
            <a href="#" style={S.footerColA}>Style</a>
            <a href="#" style={S.footerColA}>Venue</a>
            <a href="#" style={S.footerColA}>Decor</a>
            <a href="#" style={S.footerColA}>Food</a>
          </div>

          <div>
            <h4 style={S.footerColH4}>Resources</h4>
            <a href="#" style={S.footerColA}>Blog</a>

            <a href="#" style={S.footerColA}>Pricing</a>
            <a href="#" style={S.footerColA}>FAQ</a>
          </div>

          <div>
            <h4 style={S.footerColH4}>Company</h4>
            <a href="#" style={S.footerColA}>About</a>
            <a href="#" style={S.footerColA}>Contact</a>
            <a href="#" style={S.footerColA}>Privacy</a>
            <a href="#" style={S.footerColA}>Terms</a>
          </div>
        </div>

        <div style={S.footerBottom}>
          <span> 2026 WeddingBudget.AI. Made with  in India.</span>
        </div>
      </footer>
    </motion.div>
  )
}
