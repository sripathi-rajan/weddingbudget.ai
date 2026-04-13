import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useWedding } from '../context/WeddingContext'
import { scrollToNextSection } from '../utils/scrollToNext'

// ─── Option definitions ────────────────────────────────────────────────────────

const WEDDING_TYPE_OPTIONS = [
  { id: 'Hindu',     icon: '', label: 'Hindu', imageUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#7C3AED' },
  { id: 'Islam',     icon: '', label: 'Islamic', imageUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#0F766E' },
  { id: 'Sikh',      icon: '', label: 'Sikh', imageUrl: '/sikh-wedding.png', fallbackColor: '#1D4ED8' },
  { id: 'Christian', icon: '', label: 'Christian', imageUrl: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#1E40AF' },
  { id: 'Buddhist',  icon: '', label: 'Buddhist', imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#B45309' },
  { id: 'Jain',      icon: '', label: 'Jain', imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#065F46' },
  { id: 'Generic',   icon: '', label: 'Mixed / Generic', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#334155' },
]

const BUDGET_STYLE_OPTIONS = [
  { id: 'Minimalist', icon: '', label: 'Minimalist', desc: 'Under ₹15L · Essential elegance', imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#475569' },
  { id: 'Modest',     icon: '', label: 'Modest',     desc: '₹15L – ₹40L · Beautiful balance', imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#0F766E' },
  { id: 'Luxury',     icon: '', label: 'Luxury',     desc: '₹1Cr+ · No compromises', imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#92400E' },
]

const EVENT_OPTIONS = [
  { id: 'Haldi',                icon: '', label: 'Haldi', imageUrl: 'https://images.unsplash.com/photo-1595407753234-0882f1e77954?w=1200&q=80', fallbackColor: '#B45309' },
  { id: 'Mehendi',              icon: '', label: 'Mehendi', imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80', fallbackColor: '#166534' },
  { id: 'Sangeet',              icon: '', label: 'Sangeet', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#1D4ED8' },
  { id: 'Wedding Day Ceremony', icon: '', label: 'Ceremony', imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80', fallbackColor: '#7C2D12' },
  { id: 'Reception',            icon: '', label: 'Reception', imageUrl: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#9D174D' },
  { id: 'Engagement',           icon: '', label: 'Engagement', imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#0F766E' },
  { id: 'Pre Wedding Cocktail', icon: '', label: 'Cocktail', imageUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#312E81' },
  { id: 'Tilak',                icon: '', label: 'Tilak', isCustom: true, imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#92400E' },
  { id: 'Grihapravesh',         icon: '', label: 'Grihapravesh', isCustom: true, imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80', fallbackColor: '#334155' },
]

const EVENT_EMOJIS = ['🎉','🎊','🕯️','🎵','💃','🥂','🌸','🌺','🎭','🪔','🎇','🥁','👑','🌙','⭐','🎆']

const FONT = { fontFamily: "'DM Sans', 'Inter', sans-serif" }

// ─── Premium selection card ────────────────────────────────────────────────────

function SelCard({ item, isSelected, onToggle, hasAnySelected, wide = false }) {
  const [imgErr, setImgErr] = useState(false)
  const cardBg = item.fallbackColor || '#334155'
  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`sel-card${wide ? ' budget-style-card' : ''}${isSelected ? ' selected' : ''}${hasAnySelected && !isSelected ? ' dimmed' : ''}`}
      style={{
        border: isSelected ? '2px solid #C9A84C' : '2px solid #e5e7eb',
        borderRadius: 12,
        background: '#fff',
        overflow: 'hidden',
        textAlign: 'center',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        boxShadow: isSelected ? '0 0 0 3px rgba(201,168,76,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden', background: cardBg, lineHeight: 0 }}>
        {!imgErr && item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            style={{ width: '100%', height: wide ? 100 : 110, objectFit: 'cover', display: 'block' }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div style={{ height: wide ? 100 : 110, background: cardBg }} />
        )}
        <div className="check-badge-rose" style={{
          position: 'absolute', top: 8, right: 8,
          width: 22, height: 22, borderRadius: '50%',
          background: '#C9A84C', color: '#111',
          fontSize: 12, fontWeight: 800,
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          display: isSelected ? 'flex' : 'none',
          animation: isSelected ? 'checkSpring 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
          zIndex: 2
        }}>✓</div>
      </div>
      <div style={{ padding: wide ? '14px 16px 16px' : '12px 12px 14px', ...FONT }}>
        {item.icon ? (
          <span className="sel-card-icon card-icon" style={{ fontSize: wide ? 22 : 24, display: 'block', marginBottom: 6 }}>{item.icon}</span>
        ) : null}
        <div className="card-label" style={{ fontWeight: 700, fontSize: wide ? 15 : 15, color: '#111' }}>
          {item.label}
        </div>
        {item.desc && (
          <div className="card-desc" style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            {item.desc}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section wrapper with staggered mount animation ───────────────────────────

function Section({ delay, children, style = {}, sectionId }) {
  return (
    <motion.div
      data-section={sectionId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'white', borderRadius: 18,
        border: '1.5px solid #EBEBEB',
        padding: '24px 26px', marginBottom: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        ...style
      }}
    >
      {children}
    </motion.div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 15, fontWeight: 700, color: '#111',
      marginBottom: 16, ...FONT,
      display: 'flex', alignItems: 'center', gap: 8
    }}>
      {children}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Tab1Style() {
  const { wedding, update } = useWedding()
  const [newEventName, setNewEventName] = useState('')
  const [newEventEmoji, setNewEventEmoji] = useState(EVENT_EMOJIS[0])

  // ── Date handler ─────────────────────────────────────────────────────────────
  const handleDateChange = (e) => {
    const date = e.target.value
    const d = new Date(date)
    const dow = d.getDay()
    update('wedding_date', date)
    update('is_weekend', dow === 0 || dow === 6)
    scrollToNextSection('wedding-date', 420)
  }

  // ── Wedding type ─────────────────────────────────────────────────────────────
  const handleTypeToggle = (id) => {
    const newVal = wedding.wedding_type === id ? '' : id
    update('wedding_type', newVal)
    if (newVal) scrollToNextSection('wedding-type', 420)
  }

  // ── Budget style ─────────────────────────────────────────────────────────────
  const handleBudgetToggle = (id) => {
    const newVal = wedding.budget_tier === id ? '' : id
    update('budget_tier', newVal)
    if (newVal) scrollToNextSection('budget-style', 420)
  }

  // ── Events ──────────────────────────────────────────────────────────────────
  const handleEventToggle = (id) => {
    const opt = EVENT_OPTIONS.find(e => e.id === id)
    if (opt?.isCustom) {
      const custEvs = wedding.custom_events || []
      if (!custEvs.find(e => e.id === id)) {
        update('custom_events', [...custEvs, { id, label: opt.label, emoji: opt.icon }])
      }
    }
    const cur = wedding.events || []
    update('events', cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id])
  }

  const addCustomEvent = () => {
    const name = newEventName.trim()
    if (!name) return
    const emoji = newEventEmoji || EVENT_EMOJIS[0]
    const id = 'custom_' + Date.now()
    const cur = wedding.custom_events || []
    if (cur.find(e => e.label.toLowerCase() === name.toLowerCase())) return
    update('custom_events', [...cur, { id, label: name, emoji }])
    update('events', [...(wedding.events || []), id])
    setNewEventName('')
    setNewEventEmoji(EVENT_EMOJIS[0])
  }

  const removeCustomEvent = (id) => {
    update('custom_events', (wedding.custom_events || []).filter(e => e.id !== id))
    update('events', (wedding.events || []).filter(ev => ev !== id))
  }

  const allEventOptions = [
    ...EVENT_OPTIONS,
    ...(wedding.custom_events || [])
      .filter(ev => !EVENT_OPTIONS.find(o => o.id === ev.id))
      .map(ev => ({
        id: ev.id,
        icon: ev.emoji,
        label: ev.label,
        imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
        fallbackColor: '#334155',
        isUserCustom: true,
      }))
  ]

  const today = new Date().toISOString().split('T')[0]
  const selectedEvents = wedding.events || []

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', ...FONT }}>

      {/* ── Section 1: Date ── */}
      <Section delay={0} sectionId="wedding-date">
        <SectionTitle> Wedding Date <span style={{color: '#E01A22'}}>*</span></SectionTitle>
        <input
          type="date"
          value={wedding.wedding_date || ''}
          min={today}
          onChange={handleDateChange}
          style={{
            padding: '10px 16px', border: '1.5px solid #EBEBEB',
            borderRadius: 10, fontSize: 15, color: '#111',
            background: '#fff', cursor: 'pointer', ...FONT,
            fontWeight: 600
          }}
        />
        {wedding.wedding_date && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 14px', borderRadius: 8,
              background: wedding.is_weekend ? '#FEF3C7' : '#DCFCE7',
              color: wedding.is_weekend ? '#92400E' : '#166534',
              fontSize: 12, fontWeight: 700, ...FONT
            }}
          >
            {wedding.is_weekend ? ' Weekend — +15% surcharge applies' : ' Weekday — Regular pricing'}
          </motion.div>
        )}
      </Section>

      {/* ── Section 2: Wedding Type ── */}
      <Section delay={0.08} sectionId="wedding-type" style={{ background: '#ffffff' }}>
        <SectionTitle> Wedding Type <span style={{color: '#E01A22'}}>*</span></SectionTitle>
        <div className="selection-grid wedding-type-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10
        }}>
          {WEDDING_TYPE_OPTIONS.map(opt => (
            <SelCard
              key={opt.id}
              item={opt}
              isSelected={wedding.wedding_type === opt.id}
              onToggle={handleTypeToggle}
              hasAnySelected={!!wedding.wedding_type && wedding.wedding_type !== opt.id}
            />
          ))}
        </div>
      </Section>

      {/* ── Section 3: Budget Style ── */}
      <Section delay={0.16} sectionId="budget-style">
        <SectionTitle> Budget Style <span style={{color: '#E01A22'}}>*</span></SectionTitle>
        <div className="budget-style-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12
        }}>
          {BUDGET_STYLE_OPTIONS.map(opt => (
            <SelCard
              key={opt.id}
              item={opt}
              isSelected={wedding.budget_tier === opt.id}
              onToggle={handleBudgetToggle}
              hasAnySelected={!!wedding.budget_tier && wedding.budget_tier !== opt.id}
              wide
            />
          ))}
        </div>
      </Section>

      {/* ── Section 4: Events ── */}
      <Section delay={0.24} sectionId="events">
        <SectionTitle> Events &amp; Ceremonies <span style={{color: '#E01A22'}}>*</span></SectionTitle>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 14, ...FONT }}>
          Select all events you'll celebrate — multi-select
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10, marginBottom: 16
        }}>
          {allEventOptions.map(opt => {
            const isSel = selectedEvents.includes(opt.id)
            const isUserCustom = opt.isUserCustom
            return (
              <div key={opt.id} style={{ position: 'relative' }}>
                <SelCard
                  item={opt}
                  isSelected={isSel}
                  onToggle={handleEventToggle}
                  hasAnySelected={false}
                />
                {isUserCustom && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCustomEvent(opt.id) }}
                    style={{
                      position: 'absolute', top: -6, left: -6,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#fee2e2', border: 'none', color: '#dc2626',
                      fontSize: 10, fontWeight: 800, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1, zIndex: 3
                    }}
                  >×</button>
                )}
              </div>
            )
          })}
        </div>

        {/* Selected summary */}
        {selectedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '10px 16px', borderRadius: 10,
              background: '#FBE8EF', border: '1px solid #F2C4D4',
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 16, fontSize: 12, fontWeight: 700, color: '#B83A64'
            }}
          >
             {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected —{' '}
            {allEventOptions.filter(o => selectedEvents.includes(o.id)).slice(0, 4).map(o => o.icon).join(' ')}
            {selectedEvents.length > 4 && ` +${selectedEvents.length - 4} more`}
          </motion.div>
        )}

        {/* Add custom event */}
        <div style={{
          padding: '18px 20px', border: '1.5px dashed #EBEBEB',
          borderRadius: 14, background: '#fff',
          boxShadow: '0 1px 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 10, ...FONT }}>
            + Add your own event
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#5B5B5B', ...FONT }}>Choose an icon</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {EVENT_EMOJIS.map((em, index) => (
                  <button key={index} onClick={() => setNewEventEmoji(em)}
                    style={{
                      width: 30, height: 30,
                      border: `1.5px solid ${newEventEmoji === em ? '#D4537E' : '#EBEBEB'}`,
                      borderRadius: 7, background: newEventEmoji === em ? '#FBE8EF' : 'white',
                      cursor: 'pointer', fontSize: 15
                    }}>{em}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={newEventName}
                onChange={e => setNewEventName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomEvent()}
                placeholder="e.g. Ring Ceremony, Tilak, Griha Pravesh…"
                style={{
                  flex: 1, minWidth: 180, padding: '10px 14px',
                  border: '1.5px solid #EBEBEB', borderRadius: 10,
                  fontSize: 14, outline: 'none', background: '#fff', color: '#111', ...FONT
                }}
              />
              <button
                onClick={addCustomEvent}
                style={{
                  padding: '10px 20px', borderRadius: 10, background: '#111',
                  color: 'white', border: 'none', fontWeight: 700,
                  fontSize: 13, cursor: 'pointer', ...FONT
                }}
              >Add</button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Sticky Next button ── */}
      {selectedEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'sticky', bottom: '1.5rem',
            display: 'flex', justifyContent: 'center',
            zIndex: 50, marginTop: '2rem'
          }}
        >
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('weddingNextTab'))}
            style={{
              background: '#111', color: '#fff',
              border: 'none', borderRadius: '10px',
              padding: '14px 40px', fontSize: '15px',
              fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}
          >
            Next: Venue &amp; Guests →
          </button>
        </motion.div>
      )}

      {/* ── Summary bar ── */}
      {(wedding.wedding_type || wedding.budget_tier || selectedEvents.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 22px', borderRadius: 14,
            background: 'linear-gradient(135deg, #FBE8EF, #fff)',
            border: '1.5px solid #F2C4D4',
            display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
          }}
        >
          {wedding.wedding_type && (
            <span style={{
              padding: '5px 12px', borderRadius: 20,
              background: '#D4537E', color: 'white',
              fontSize: 12, fontWeight: 700
            }}> {wedding.wedding_type}</span>
          )}
          {wedding.budget_tier && (
            <span style={{
              padding: '5px 12px', borderRadius: 20,
              background: '#111', color: 'white',
              fontSize: 12, fontWeight: 700
            }}>
              {BUDGET_STYLE_OPTIONS.find(b => b.id === wedding.budget_tier)?.icon} {wedding.budget_tier}
            </span>
          )}
          {selectedEvents.length > 0 && (
            <span style={{
              padding: '5px 12px', borderRadius: 20,
              background: '#FDE8F0', color: '#B83A64',
              border: '1px solid #F2C4D4',
              fontSize: 12, fontWeight: 700
            }}> {selectedEvents.length} events</span>
          )}
          <span style={{ fontSize: 12, color: '#888', marginLeft: 'auto', ...FONT }}>
            {[wedding.wedding_type, wedding.budget_tier, selectedEvents.length > 0].filter(Boolean).length}/3 sections complete
          </span>
        </motion.div>
      )}
    </div>
  )
}
