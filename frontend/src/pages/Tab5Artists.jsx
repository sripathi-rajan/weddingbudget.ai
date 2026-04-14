import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWedding, ARTIST_TYPES, NAMED_ARTISTS, ALL_EVENTS, formatRupees } from '../context/WeddingContext'
import { scrollToNextSection } from '../utils/scrollToNext'
import { API_BASE } from '../utils/config'
import { ImageCard } from '../components/ImageCard'

const C = { primary: '#023047', amber: '#ffb703', blue: '#219ebc', light: '#e8f4fa', sky: '#8ecae6', orange: '#fb8500' }

const ARTIST_COST_MAP = {
  'Local DJ':              [60000,   200000],
  'Professional DJ':       [250000,  600000],
  'Celebrity DJ':          [800000,  2500000],
  'Bollywood Singer A':    [1000000, 1500000],
  'Bollywood Singer B':    [600000,  1000000],
  'Bollywood Singer C':    [300000,  600000],
  'Live Band (Local)':     [150000,  400000],
  'Live Band (National)':  [600000,  1800000],
  'Folk Artist':           [40000,   150000],
  'Sufi Singer':           [80000,   300000],
  'Myra Entertainment':    [250000,  700000],
  'Choreographer':         [60000,   250000],
  'Anchor / Emcee':        [40000,   200000],
  'Stand-up Comedian':     [100000,  500000],
  'Nadaswaram Artist':     [25000,   80000],
  'Fireworks Display':     [50000,   300000],
}

function ArtistCard({ artist, isSelected, onToggle, hasAnySelected }) {
  const [lo, hi] = ARTIST_COST_MAP[artist.id] || [0, 0]
  return (
    <ImageCard
      item={artist}
      selected={isSelected}
      onClick={() => onToggle(artist)}
      hasAnySelected={hasAnySelected}
      badge="ARTIST"
      location="Professional"
      budget={`${formatRupees(lo)} – ${formatRupees(hi)}`}
      actionLabel="Book Artist"
    />
  )
}

function ArtistEventForm({ artist, wedding, onUpdate }) {
  const events = wedding.events || []
  const details = wedding.artist_events?.[artist.id] || {}

  const set = (key, val) => {
    const cur = { ...(wedding.artist_events || {}) }
    cur[artist.id] = { ...details, [key]: val }
    onUpdate('artist_events', cur)
  }

  const [lo, hi] = ARTIST_COST_MAP[artist.id] || [0, 0]
  const negotiated = details.negotiated_cost || ''

  return (
    <div style={{ background: C.light, borderRadius: 14, padding: 16, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 24 }}>{artist.emoji}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.primary }}>{artist.label}</div>
          <div style={{ fontSize: 12, color: C.blue }}>Budget range: {formatRupees(lo)} – {formatRupees(hi)}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: 'block', marginBottom: 4 }}>
            Assigned Event
          </label>
          <select value={details.event_id || ''}
            onChange={e => set('event_id', e.target.value)}
            style={{ width: '100%', padding: '7px 10px', border: `1.5px solid ${C.sky}`,
              borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif', background: 'white', color: C.primary }}>
            <option value="">-- Select Event --</option>
            {events.map(ev => {
              const evObj = ALL_EVENTS.find(e => e.id === ev)
              return <option key={ev} value={ev}>{evObj?.emoji} {ev}</option>
            })}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: 'block', marginBottom: 4 }}>
            Performance Date
          </label>
          <input type="date"
            value={details.event_date || ''}
            min={wedding.wedding_date || undefined}
            onChange={e => set('event_date', e.target.value)}
            style={{ width: '100%', padding: '7px 10px', border: `1.5px solid ${C.sky}`,
              borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: 'block', marginBottom: 4 }}>
            Start Time
          </label>
          <input type="time"
            value={details.start_time || ''}
            onChange={e => set('start_time', e.target.value)}
            style={{ width: '100%', padding: '7px 10px', border: `1.5px solid ${C.sky}`,
              borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: 'block', marginBottom: 4 }}>
            Duration (hours)
          </label>
          <input type="number" min={0.5} max={8} step={0.5}
            value={details.duration_hrs || ''}
            placeholder="e.g. 2"
            onChange={e => set('duration_hrs', parseFloat(e.target.value) || 0)}
            style={{ width: '100%', padding: '7px 10px', border: `1.5px solid ${C.sky}`,
              borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: 'block', marginBottom: 4 }}>
            Venue / Stage
          </label>
          <input type="text"
            value={details.venue_name || ''}
            placeholder="e.g. Main Stage, Lawn A"
            onChange={e => set('venue_name', e.target.value)}
            style={{ width: '100%', padding: '7px 10px', border: `1.5px solid ${C.sky}`,
              borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: 'block', marginBottom: 4 }}>
            Expected Audience
          </label>
          <input type="number" min={0}
            value={details.audience_count || ''}
            placeholder={`${wedding.total_guests || 0}`}
            onChange={e => set('audience_count', parseInt(e.target.value) || 0)}
            style={{ width: '100%', padding: '7px 10px', border: `1.5px solid ${C.sky}`,
              borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: 'block', marginBottom: 4 }}>
            Negotiated Fee (₹)
          </label>
          <input type="number" min={0}
            value={negotiated}
            placeholder={`${Math.round((lo+hi)/2)}`}
            onChange={e => set('negotiated_cost', parseInt(e.target.value) || 0)}
            style={{ width: '100%', padding: '7px 10px', border: `1.5px solid ${C.amber}`,
              borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 700 }} />
        </div>
      </div>
    </div>
  )
}

export default function Tab5Artists() {
  const { wedding, update } = useWedding()
  const [selected, setSelected] = useState([])
  const [namedArtistBookings, setNamedArtistBookings] = useState([])  // [{namedId, negotiated}]
  const [dbArtists, setDbArtists] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/vendors/approved?category=Artist`)
      .then(res => res.json())
      .then(data => setDbArtists(data))
      .catch(err => console.error("Error fetching db artists:", err))
  }, [])

  const toggle = (artist) => {
    const exists = selected.find(s => s.id === artist.id)
    let next
    if (exists) next = selected.filter(s => s.id !== artist.id)
    else next = [...selected, artist]
    setSelected(next)
    // if (!exists) scrollToNextSection('artist-tier', 420) // Removed auto-scroll

    const costs = next.map(a => {
      const det = wedding.artist_events?.[a.id]
      if (det?.negotiated_cost) return det.negotiated_cost
      const [lo, hi] = ARTIST_COST_MAP[a.id] || [0, 0]
      return (lo + hi) / 2
    })
    update('artists_total', costs.reduce((a, b) => a + b, 0))
    update('selected_artists', next.map(a => a.id))
  }

  const toggleNamedArtist = (artist) => {
    const exists = namedArtistBookings.find(b => b.namedId === artist.id)
    if (exists) setNamedArtistBookings(nb => nb.filter(b => b.namedId !== artist.id))
    else {
      setNamedArtistBookings(nb => [...nb, { namedId: artist.id, negotiated: 0 }])
      scrollToNextSection('artist-select', 420)
    }
  }

  const setNamedFee = (namedId, fee) => {
    setNamedArtistBookings(nb => nb.map(b => b.namedId === namedId ? {...b, negotiated: fee} : b))
  }

  // Recalculate total considering negotiated costs and multipliers
  const baseTotal = selected.reduce((sum, a) => {
    const det = wedding.artist_events?.[a.id]
    if (det?.negotiated_cost) return sum + det.negotiated_cost
    const [lo, hi] = ARTIST_COST_MAP[a.id] || [0, 0]
    return sum + (lo + hi) / 2
  }, 0) + namedArtistBookings.reduce((s, b) => {
    if (b.negotiated) return s + b.negotiated
    
    // Check if it's a database vendor
    if (b.namedId.startsWith('db_')) {
      const vendorId = parseInt(b.namedId.split('_')[1])
      const v = dbArtists.find(x => x.id === vendorId)
      if (v) {
        // Simple heuristic: extract first number from price_range
        const matches = (v.price_range || '').match(/(\d+)/g)
        if (matches && matches.length > 0) return s + parseInt(matches[0])
      }
      return s + 50000 // default fallback
    }

    const na = NAMED_ARTISTS.find(a => a.id === b.namedId)
    return s + (na ? (na.fee_low + na.fee_high) / 2 : 0)
  }, 0)
  const multiplier = wedding?.cost_multipliers?.['Artists & Entertainment'] ?? 1
  const total = Math.round(baseTotal * multiplier)

  return (
    <div>
      {/* Named/Celebrity Artists */}
      <div className="section-card" data-section="artist-select">
        <div className="section-title"> Named / Celebrity Artists <span style={{fontSize: 13, color: '#888', fontWeight: 500, marginLeft: 8}}>(Optional)</span></div>
        <div style={{ fontSize: 13, color: '#4a7a94', marginBottom: 14 }}>
          Book specific artists by name. Fee ranges are admin-maintained and reflect current market rates.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {NAMED_ARTISTS.map(na => {
            const isBooked = !!namedArtistBookings.find(b => b.namedId === na.id)
            return (
              <ImageCard
                key={na.id}
                item={{
                  ...na,
                  label: na.name,
                  imageUrl: na.imageUrl || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80`
                }}
                selected={isBooked}
                onClick={() => toggleNamedArtist(na)}
                badge="CELEBRITY"
                location={na.genre}
                budget={`${formatRupees(na.fee_low)} – ${formatRupees(na.fee_high)}`}
                actionLabel="Book Celebrity"
              />
            )
          })}
        </div>
      </div>

      {/* Database Vendors (Approved) */}
      {dbArtists.length > 0 && (
        <div className="section-card">
          <div className="section-title"> Professional Vendors <span style={{fontSize: 13, color: '#888', fontWeight: 500, marginLeft: 8}}>(Registered)</span></div>
          <div style={{ fontSize: 13, color: '#4a7a94', marginBottom: 14 }}>
            Directly book registered professionals. Verified contact details and portfolios included.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {dbArtists.map(v => {
              const booking = namedArtistBookings.find(b => b.namedId === `db_${v.id}`)
              const isBooked = !!booking
              return (
                <ImageCard
                  key={v.id}
                  item={{
                    id: `db_${v.id}`,
                    label: v.business,
                    imageUrl: v.imageUrl || v.image_url || `https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=250&fit=crop`,
                    emoji: '🎸'
                  }}
                  selected={isBooked}
                  onClick={() => toggleNamedArtist({ id: `db_${v.id}` })}
                  badge="VERIFIED"
                  location={v.city}
                  budget={v.price_range}
                  actionLabel="Book Service"
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Generic Artist Types */}
      <div className="section-card" data-section="artist-tier">
        <div className="section-title"> Artists & Entertainment <span style={{color: '#E01A22'}}>*</span></div>
        <div style={{ fontSize: 13, color: '#4a7a94', marginBottom: 14 }}>
          Select artist types for unnamed/generic bookings. Set negotiated fees in the schedule below.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 14 }}>
          {ARTIST_TYPES.map(artist => (
            <ArtistCard key={artist.id} artist={artist}
              isSelected={!!selected.find(s => s.id === artist.id)}
              hasAnySelected={selected.length > 0 && !selected.find(s => s.id === artist.id)}
              onToggle={toggle} />
          ))}
        </div>
      </div>

      {(selected.length > 0 || namedArtistBookings.length > 0) && (
        <>
          {/* Artist Event Details */}
          <div className="section-card">
            <div className="section-title"> Artist Schedule & Details <span style={{fontSize: 13, color: '#888', fontWeight: 500, marginLeft: 8}}>(Optional)</span></div>
            <div style={{ fontSize: 13, color: '#4a7a94', marginBottom: 16 }}>
              Assign each artist to an event, set the date, timing, venue, and expected audience.
            </div>
            {selected.map(a => (
              <ArtistEventForm key={a.id} artist={a} wedding={wedding} onUpdate={update} />
            ))}
          </div>

          {/* Entertainment Budget Summary */}
          <div className="section-card" style={{
            background: 'linear-gradient(135deg, #fffbea, #e8f4fa)',
            border: `2px solid ${C.amber}` }}>
            <div className="section-title" style={{ color: C.primary }}> Entertainment Budget</div>
            {namedArtistBookings.map(b => {
              let name, genre, fee, typeLabel
              
              if (b.namedId.startsWith('db_')) {
                const vendorId = parseInt(b.namedId.split('_')[1])
                const v = dbArtists.find(x => x.id === vendorId)
                if (!v) return null
                name = v.business
                genre = `${v.category} · ${v.city}`
                typeLabel = 'Professional Vendor'
                const matches = (v.price_range || '').match(/(\d+)/g)
                fee = b.negotiated || (matches ? parseInt(matches[0]) : 50000)
              } else {
                const na = NAMED_ARTISTS.find(a => a.id === b.namedId)
                if (!na) return null
                name = na.name
                genre = na.genre
                typeLabel = 'Named Artist'
                fee = b.negotiated || Math.round((na.fee_low + na.fee_high) / 2)
              }

              return (
                <div key={b.namedId} style={{ display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: `1px solid ${C.sky}`, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 22 }}></span>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14, color: C.primary }}>{name}</span>
                      <div style={{ fontSize: 11, color: C.blue }}>{genre} • {typeLabel}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, color: b.negotiated ? '#047857' : C.blue, fontWeight: 800 }}>
                    {formatRupees(fee)} {b.negotiated && <span style={{ fontSize: 11, fontWeight: 400 }}>negotiated</span>}
                  </div>
                </div>
              )
            })}
            {selected.map(a => {
              const det = wedding.artist_events?.[a.id]
              const fee = det?.negotiated_cost
              const [lo, hi] = ARTIST_COST_MAP[a.id] || [0, 0]
              return (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: `1px solid ${C.sky}`, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 22 }}>{a.emoji}</span>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14, color: C.primary }}>{a.label}</span>
                      {det?.event_id && (
                        <div style={{ fontSize: 11, color: C.blue }}>
                          {ALL_EVENTS.find(e => e.id === det.event_id)?.emoji} {det.event_id}
                          {det.start_time ? ` · ${det.start_time}` : ''}
                          {det.duration_hrs ? ` · ${det.duration_hrs}hrs` : ''}
                          {det.audience_count ? ` · ${det.audience_count} audience` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {fee ? (
                      <div style={{ fontSize: 15, color: '#047857', fontWeight: 800 }}>
                        {formatRupees(fee)} <span style={{ fontSize: 11, fontWeight: 400 }}>negotiated</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: C.blue, fontWeight: 700 }}>
                        {formatRupees(lo)} – {formatRupees(hi)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 14,
              borderTop: `2px solid ${C.amber}` }}>
              <span style={{ fontFamily: 'EB Garamond, serif', fontSize: 20, fontWeight: 700, color: C.primary }}>
                Total Entertainment
              </span>
              <span style={{ fontFamily: 'EB Garamond, serif', fontSize: 28, fontWeight: 800, color: '#7a5900' }}>
                {formatRupees(total)}
                {multiplier !== 1 && (
                  <span style={{ fontSize: 10, display: 'block', textAlign: 'right', fontWeight: 400, opacity: 0.8 }}>
                    (AI Optimised ×{Number(multiplier).toFixed(2)})
                  </span>
                )}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Sticky Next button */}
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
          Next: Sundries →
        </button>
      </motion.div>
    </div>
  )
}
