import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../utils/config'

const API = API_BASE
console.log(API_BASE)
const C = { navy: '#023047', amber: '#ffb703', blue: '#219ebc', sky: '#8ecae6', orange: '#fb8500', green: '#059669', red: '#DC2626' }

// ── JWT helpers ────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'admin_jwt'
const TOKEN_TS_KEY = 'admin_jwt_ts'
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000  // 24 hours

function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(TOKEN_TS_KEY, Date.now().toString())
}

function getToken() {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const ts = parseInt(sessionStorage.getItem(TOKEN_TS_KEY) || '0', 10)
  if (!token || Date.now() - ts > TOKEN_TTL_MS) {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_TS_KEY)
    return null
  }
  return token
}

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_TS_KEY)
}

async function apiFetch(path, opts = {}) {
  const token = getToken()
  const res = await fetch(`${API}/admin${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

async function apiFetchBudget(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return await res.json().catch(() => ({}))
}

function formatRupees(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

// ── Shared UI ──────────────────────────────────────────────────────────────────
function Toast({ msg, ok = true }) {
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      background: ok ? C.green : C.red, color: 'white',
      padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontFamily: "'DM Sans', sans-serif"
    }}>{msg}</div>
  )
}

function useToast() {
  const [toast, setToast] = useState(null)
  const show = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }
  return [toast, show]
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '24px 28px',
      boxShadow: '0 2px 16px rgba(2,48,71,0.07)', marginBottom: 20, ...style
    }}>{children}</div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontWeight: 800, fontSize: 16, color: C.navy, marginBottom: 16,
      borderBottom: `2px solid ${C.amber}`, paddingBottom: 8, fontFamily: "'DM Sans', sans-serif"
    }}>
      {children}
    </div>
  )
}

const inputStyle = {
  padding: '8px 12px', border: `1.5px solid ${C.sky}`, borderRadius: 8,
  fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box'
}

function Btn({ children, onClick, color = C.navy, textColor = 'white', small = false, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: small ? '5px 14px' : '9px 20px',
      borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#ccc' : color, color: textColor,
      fontWeight: 700, fontSize: small ? 12 : 13, fontFamily: "'DM Sans', sans-serif"
    }}>{children}</button>
  )
}

// ── Login Page ─────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onBack }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const attempt = async (e) => {
    if (e) e.preventDefault()
    if (username.trim() === '' || password.trim() === '') {
      setError('Both username and password are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      saveToken(data.access_token)
      onLogin()
    } catch (e) {
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e1a 0%, #023047 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '44px 48px', width: 380,
        boxShadow: '0 12px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{
          background: '#f8f9fa',
          border: `1.5px solid ${C.sky}`,
          borderRadius: 10,
          padding: '12px',
          marginBottom: 24,
          fontSize: 12,
          color: C.navy,
          textAlign: 'left',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontWeight: 800, color: C.blue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔑</span> Demo Credentials
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#666' }}>Username:</span>
            <strong style={{ fontFamily: 'monospace', fontSize: 13 }}>admin</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Password:</span>
            <strong style={{ fontFamily: 'monospace', fontSize: 13 }}>shaadi@admin2026</strong>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.navy }}>Admin Panel</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Please sign in to manage the system</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Username</label>
          <input required value={username} onChange={e => { setUsername(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            placeholder="admin" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Password</label>
          <input required type="password" value={password} onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            placeholder="Enter password" style={{ ...inputStyle, borderColor: error ? C.red : C.sky }} />
        </div>

        {error && <div style={{ color: C.red, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>⚠ {error}</div>}

        <button onClick={attempt} disabled={loading} style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: loading ? '#888' : C.navy, color: 'white',
          fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: "'DM Sans', sans-serif", marginTop: 4
        }}>
          {loading ? 'Verifying…' : 'Login →'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', color: '#888',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto'
          }}
            onMouseEnter={e => e.target.style.color = C.navy}
            onMouseLeave={e => e.target.style.color = '#888'}
          >
            <span style={{ fontSize: 16 }}>←</span> Back
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Artists ───────────────────────────────────────────────────────────────
function ArtistsTab() {
  const [artists, setArtists] = useState([])
  const [editing, setEditing] = useState(null)  // {id, name, type, min_fee, max_fee}
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ name: '', type: '', min_fee: '', max_fee: '' })
  const [toast, showToast] = useToast()

  const load = useCallback(() => apiFetch('/artists').then(setArtists).catch(e => showToast(e.message, false)), [])
  useEffect(() => { load() }, [load])

  const save = async () => {
    try {
      if (editing) {
        const updated = await apiFetch(`/artists/${editing.id}`, {
          method: 'PUT', body: JSON.stringify({ ...draft, id: editing.id }),
        })
        setArtists(a => a.map(x => x.id === editing.id ? updated : x))
        setEditing(null)
      } else {
        const created = await apiFetch('/artists', { method: 'POST', body: JSON.stringify(draft) })
        setArtists(a => [...a, created])
        setAdding(false)
      }
      showToast(editing ? 'Artist updated' : 'Artist added')
      setDraft({ name: '', type: '', min_fee: '', max_fee: '' })
    } catch (e) { showToast(e.message, false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this artist?')) return
    try {
      await apiFetch(`/artists/${id}`, { method: 'DELETE' })
      setArtists(a => a.filter(x => x.id !== id))
      showToast('Artist deleted')
    } catch (e) { showToast(e.message, false) }
  }

  const startEdit = (a) => { setEditing(a); setDraft({ name: a.name, type: a.type, min_fee: a.min_fee, max_fee: a.max_fee }); setAdding(false) }

  const DraftRow = () => (
    <tr style={{ background: '#fffbea' }}>
      <td style={{ padding: '8px 10px' }}><input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} style={{ ...inputStyle, width: 160 }} placeholder="Name" /></td>
      <td style={{ padding: '8px 10px' }}><input value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value }))} style={{ ...inputStyle, width: 100 }} placeholder="Type" /></td>
      <td style={{ padding: '8px 10px' }}><input type="number" value={draft.min_fee} onChange={e => setDraft(d => ({ ...d, min_fee: e.target.value }))} style={{ ...inputStyle, width: 110 }} placeholder="Min ₹" /></td>
      <td style={{ padding: '8px 10px' }}><input type="number" value={draft.max_fee} onChange={e => setDraft(d => ({ ...d, max_fee: e.target.value }))} style={{ ...inputStyle, width: 110 }} placeholder="Max ₹" /></td>
      <td style={{ padding: '8px 10px', display: 'flex', gap: 6 }}>
        <Btn small onClick={save} color={C.green}>Save</Btn>
        <Btn small onClick={() => { setEditing(null); setAdding(false); setDraft({ name: '', type: '', min_fee: '', max_fee: '' }) }} color="#888">Cancel</Btn>
      </td>
    </tr>
  )

  return (
    <Card>
      {toast && <Toast {...toast} />}
      <SectionTitle> Artist Cost Database</SectionTitle>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
        <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f0f7fc' }}>
              {['Name', 'Type', 'Min Fee (₹)', 'Max Fee (₹)', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: C.navy, borderBottom: `2px solid ${C.amber}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {artists.map((a, i) => (
              editing?.id === a.id ? <DraftRow key={a.id} /> :
                <tr key={a.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fbfd' }}>
                  <td style={{ padding: '10px 10px', fontWeight: 600, color: C.navy }}>{a.name}</td>
                  <td style={{ padding: '10px 10px', color: C.blue }}>{a.type}</td>
                  <td style={{ padding: '10px 10px' }}>₹{Number(a.min_fee).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px 10px' }}>₹{Number(a.max_fee).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '8px 10px', display: 'flex', gap: 6 }}>
                    <Btn small onClick={() => startEdit(a)} color={C.blue}>Edit</Btn>
                    <Btn small onClick={() => del(a.id)} color={C.red}>Del</Btn>
                  </td>
                </tr>
            ))}
            {adding && !editing && <DraftRow key="new" />}
          </tbody>
        </table>
      </div>
      {!adding && !editing && (
        <div style={{ marginTop: 14 }}>
          <Btn onClick={() => { setAdding(true); setDraft({ name: '', type: '', min_fee: '', max_fee: '' }) }} color={C.amber} textColor={C.navy}>+ Add Artist</Btn>
        </div>
      )}
    </Card>
  )
}

// ── Tab: F&B Rates ─────────────────────────────────────────────────────────────
function FBRatesTab() {
  const [rates, setRates] = useState(null)
  const [toast, showToast] = useToast()

  useEffect(() => {
    apiFetch('/fb-rates').then(setRates).catch(e => showToast(e.message, false))
  }, [])

  const save = async () => {
    try {
      await apiFetch('/fb-rates', { method: 'PUT', body: JSON.stringify(rates) })
      showToast('F&B rates saved')
    } catch (e) { showToast(e.message, false) }
  }

  const update = (category, tier, meal, value) => {
    setRates(r => ({ ...r, [category]: { ...r[category], [tier]: { ...r[category][tier], [meal]: Number(value) } } }))
  }

  if (!rates) return <Card><div style={{ color: '#888', fontSize: 13 }}>Loading…</div></Card>

  const meals = ['breakfast', 'lunch', 'dinner', 'snacks']
  const tiers = ['basic', 'standard', 'premium']

  return (
    <Card>
      {toast && <Toast {...toast} />}
      <SectionTitle> F&amp;B Per-Head Rates (₹)</SectionTitle>
      {['veg', 'non_veg', 'jain'].map(cat => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.blue, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{cat.replace('_', '-')}</div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
            <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f0f7fc' }}>
                  <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, color: C.navy, borderBottom: `2px solid ${C.amber}` }}>Tier</th>
                  {meals.map(m => (
                    <th key={m} style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, color: C.navy, borderBottom: `2px solid ${C.amber}`, textTransform: 'capitalize' }}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, i) => (
                  <tr key={tier} style={{ background: i % 2 === 0 ? 'white' : '#f9fbfd' }}>
                    <td style={{ padding: '8px 14px', fontWeight: 700, color: C.navy, textTransform: 'capitalize' }}>{tier}</td>
                    {meals.map(meal => (
                      <td key={meal} style={{ padding: '6px 14px' }}>
                        <input type="number" value={rates[cat]?.[tier]?.[meal] ?? ''} style={{ ...inputStyle, width: '100%', minWidth: 80 }}
                          onChange={e => update(cat, tier, meal, e.target.value)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <Btn onClick={save} color={C.green}>Save All F&amp;B Rates</Btn>
    </Card>
  )
}

// ── Tab: Logistics ─────────────────────────────────────────────────────────────
function LogisticsTab() {
  const [data, setData] = useState({})
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({ city: '', ghodi: '', dholi: '', transfer_per_trip: '' })
  const [adding, setAdding] = useState(false)
  const [toast, showToast] = useToast()

  useEffect(() => {
    apiFetch('/logistics').then(setData).catch(e => showToast(e.message, false))
  }, [])

  const saveCity = async () => {
    try {
      if (editing) {
        await apiFetch(`/logistics/${editing}`, { method: 'PUT', body: JSON.stringify(draft) })
        setData(d => ({ ...d, [editing]: { ghodi: +draft.ghodi, dholi: +draft.dholi, transfer_per_trip: +draft.transfer_per_trip } }))
        setEditing(null)
      } else {
        await apiFetch('/logistics', { method: 'POST', body: JSON.stringify(draft) })
        setData(d => ({ ...d, [draft.city]: { ghodi: +draft.ghodi, dholi: +draft.dholi, transfer_per_trip: +draft.transfer_per_trip } }))
        setAdding(false)
      }
      showToast('Logistics saved')
      setDraft({ city: '', ghodi: '', dholi: '', transfer_per_trip: '' })
    } catch (e) { showToast(e.message, false) }
  }

  const startEdit = (city) => { setEditing(city); setDraft({ city, ...data[city] }); setAdding(false) }

  return (
    <Card>
      {toast && <Toast {...toast} />}
      <SectionTitle> City-wise Logistics Costs</SectionTitle>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
        <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f0f7fc' }}>
              {['City', 'Ghodi (₹)', 'Dholi (₹)', 'Transfer/Trip (₹)', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: C.navy, borderBottom: `2px solid ${C.amber}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([city, vals], i) => (
              editing === city ? (
                <tr key={city} style={{ background: '#fffbea' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 700 }}>{city}</td>
                  {['ghodi', 'dholi', 'transfer_per_trip'].map(f => (
                    <td key={f} style={{ padding: '8px 10px' }}>
                      <input type="number" value={draft[f]} onChange={e => setDraft(d => ({ ...d, [f]: e.target.value }))} style={{ ...inputStyle, width: '100%', minWidth: 80 }} />
                    </td>
                  ))}
                  <td style={{ padding: '8px 10px', display: 'flex', gap: 6 }}>
                    <Btn small onClick={saveCity} color={C.green}>Save</Btn>
                    <Btn small onClick={() => setEditing(null)} color="#888">Cancel</Btn>
                  </td>
                </tr>
              ) : (
                <tr key={city} style={{ background: i % 2 === 0 ? 'white' : '#f9fbfd' }}>
                  <td style={{ padding: '10px 10px', fontWeight: 600, color: C.navy }}>{city}</td>
                  <td style={{ padding: '10px 10px' }}>₹{Number(vals.ghodi).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px 10px' }}>₹{Number(vals.dholi).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px 10px' }}>₹{Number(vals.transfer_per_trip).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '8px 10px' }}><Btn small onClick={() => startEdit(city)} color={C.blue}>Edit</Btn></td>
                </tr>
              )
            ))}
            {adding && (
              <tr style={{ background: '#fffbea' }}>
                <td style={{ padding: '8px 10px' }}><input value={draft.city} onChange={e => setDraft(d => ({ ...d, city: e.target.value }))} style={{ ...inputStyle, width: '100%', minWidth: 90 }} placeholder="City name" /></td>
                {['ghodi', 'dholi', 'transfer_per_trip'].map(f => (
                  <td key={f} style={{ padding: '8px 10px' }}><input type="number" value={draft[f]} onChange={e => setDraft(d => ({ ...d, [f]: e.target.value }))} style={{ ...inputStyle, width: '100%', minWidth: 80 }} placeholder="₹" /></td>
                ))}
                <td style={{ padding: '8px 10px', display: 'flex', gap: 6 }}>
                  <Btn small onClick={saveCity} color={C.green}>Save</Btn>
                  <Btn small onClick={() => setAdding(false)} color="#888">Cancel</Btn>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!adding && !editing && (
        <div style={{ marginTop: 14 }}>
          <Btn onClick={() => { setAdding(true); setDraft({ city: '', ghodi: '', dholi: '', transfer_per_trip: '' }) }} color={C.amber} textColor={C.navy}>+ Add City</Btn>
        </div>
      )}
    </Card>
  )
}

// ── Tab: Decor Labels ──────────────────────────────────────────────────────────
function DecorLabelsTab() {
  const [images, setImages] = useState([])
  const [drafts, setDrafts] = useState({})   // filename → {function_type, style, complexity, seed_cost}
  const [toast, showToast] = useToast()

  useEffect(() => {
    apiFetch('/decor-images').then(r => {
      setImages(r.images || [])
      const init = {}
      r.images?.forEach(img => {
        init[img.filename] = {
          function_type: img.function_type || '',
          style: img.style || '',
          complexity: img.complexity ?? 3,
          seed_cost: img.seed_cost ?? '',
        }
      })
      setDrafts(init)
    }).catch(e => showToast(e.message, false))
  }, [])

  const saveLabel = async (filename) => {
    const d = drafts[filename]
    try {
      await apiFetch('/decor-images/label', {
        method: 'POST',
        body: JSON.stringify({ filename, ...d, complexity: Number(d.complexity), seed_cost: Number(d.seed_cost) }),
      })
      showToast(`Saved: ${filename}`)
    } catch (e) { showToast(e.message, false) }
  }

  const update = (filename, field, value) => {
    setDrafts(d => ({ ...d, [filename]: { ...d[filename], [field]: value } }))
  }

  const FUNCTION_TYPES = ['Mandap', 'Stage', 'Ceiling', 'Entrance', 'Backdrop', 'Aisle', 'Table', 'Photo Booth', 'Lighting', 'Pillars', 'Other']
  const STYLES = ['Luxury', 'Romantic', 'Traditional', 'Modern', 'Rustic', 'Boho', 'Minimalist', 'Whimsical', 'Playful']

  if (images.length === 0) {
    return <Card><div style={{ color: '#888', fontSize: 13 }}>No decor images found in backend/decor_dataset/data/images/</div></Card>
  }

  return (
    <Card>
      {toast && <Toast {...toast} />}
      <SectionTitle> Decor Image Labeller ({images.length} images)</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {images.map(img => {
          const d = drafts[img.filename] || {}
          return (
            <div key={img.filename} style={{
              border: `1.5px solid ${C.sky}`, borderRadius: 12, overflow: 'hidden',
              background: 'white', boxShadow: '0 2px 8px rgba(2,48,71,0.06)'
            }}>
              <div style={{ background: '#f0f7fc', padding: '8px 12px', fontSize: 11, color: '#4a7a94', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {img.filename}
              </div>
              <img
                src={`${API_BASE.replace('/api', '')}/decor_images/${img.filename}`}
                alt={img.filename}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found' }}
                style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>Function Type</label>
                  <select value={d.function_type || ''} onChange={e => update(img.filename, 'function_type', e.target.value)}
                    style={{ ...inputStyle, marginTop: 3 }}>
                    <option value="">— select —</option>
                    {FUNCTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>Style</label>
                  <select value={d.style || ''} onChange={e => update(img.filename, 'style', e.target.value)}
                    style={{ ...inputStyle, marginTop: 3 }}>
                    <option value="">— select —</option>
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>Complexity (1–5): <strong>{d.complexity}</strong></label>
                  <input type="range" min={1} max={5} value={d.complexity || 3}
                    onChange={e => update(img.filename, 'complexity', e.target.value)}
                    style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>Seed Cost (₹)</label>
                  <input type="number" value={d.seed_cost || ''} onChange={e => update(img.filename, 'seed_cost', e.target.value)}
                    placeholder="e.g. 150000" style={{ ...inputStyle, marginTop: 3 }} />
                </div>
                <Btn small onClick={() => saveLabel(img.filename)} color={C.navy}>Save Label</Btn>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── Tab: Budget Rules ──────────────────────────────────────────────────────────
function BudgetTrackerTab() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actuals, setActuals] = useState({})
  const [newEntry, setNewEntry] = useState({ category: '', estimated: '', actual: '' })
  const [status, setStatus] = useState(null)
  const [saveState, setSaveState] = useState({})
  const [message, setMessage] = useState(null)

  const BUDGET_CATEGORIES = [
    'Wedding Type Base',
    'Events & Ceremonies',
    'Venue',
    'Accommodation',
    'Food & Beverages',
    'Decor & Design',
    'Artists & Entertainment',
    'Logistics & Transport',
    'Sundries & Basics',
    'Contingency Buffer (8%)'
  ]

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setStatus(null)
    setMessage(null)
    try {
      const data = await apiFetchBudget('/budget/tracker-summary') || {}
      setSummary(data)
      const actuals = {};
      (data.summary || []).forEach(row => {
        actuals[row.category] = row.actual != null ? row.actual : 0
      })
      setActuals(actuals)
    } catch (e) {
      setStatus({ error: e.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSummary() }, [loadSummary])

  const submitActual = async (category, estimated, actual) => {
    const trimmed = String(category || '').trim()
    if (!trimmed) { setStatus({ error: 'Enter a category name' }); return }
    const est = parseFloat(String(estimated).replace(/[^\d.-]/g, '')) || 0
    const act = parseFloat(String(actual).replace(/[^\d.-]/g, '')) || 0
    if (!est || est <= 0) { setStatus({ error: 'Enter a valid AI estimate' }); return }
    if (!act || act <= 0) { setStatus({ error: 'Enter a valid actual cost' }); return }

    setStatus(null)
    setMessage(null)
    setLoading(true)
    setSaveState(prev => ({ ...prev, [trimmed]: 'saving' }))
    try {
      const result = (await apiFetchBudget('/budget/log-actual', {
        method: 'POST',
        body: JSON.stringify({
          session_id: 'admin-panel',
          category: trimmed,
          estimated: est,
          actual: act,
        }),
      })) || {}

      const improvement = Number(result.accuracy_improvement || 0)
      setMessage(`${trimmed} updated. Accuracy improvement: ${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}%`)

      // Reset form
      setNewEntry({ category: BUDGET_CATEGORIES[0], estimated: '', actual: '' })

      // Refresh summary
      await loadSummary()
    } catch (e) {
      setStatus({ error: e.message })
    } finally {
      setSaveState(prev => ({ ...prev, [trimmed]: null }))
      setLoading(false)
    }
  }

  const totalEstimated = (summary?.summary || []).reduce((sum, row) => sum + (row.estimated || 0), 0)
  const totalActual = (summary?.summary || []).reduce((sum, row) => sum + (row.actual || 0), 0)
  const totalDifference = totalActual - totalEstimated

  return (
    <Card>
      {status?.error && (
        <div style={{ marginBottom: 16, color: C.red, fontWeight: 700 }}>{status.error}</div>
      )}
      {message && (
        <div style={{ marginBottom: 16, color: C.green, fontWeight: 700 }}>{message}</div>
      )}
      <SectionTitle>Budget Tracker</SectionTitle>
      <div style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>
        Track actual vendor invoice amounts and compare them against the AI estimate.
      </div>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
        <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f0f7fc', color: C.navy, textAlign: 'left' }}>
              {['Category', 'AI Estimate', 'Actual Cost', 'Difference', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 10px', fontWeight: 700, borderBottom: `2px solid ${C.amber}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(summary?.summary || []).length > 0 ? (summary?.summary || []).map((row, index) => (
              <tr key={row.category} style={{ background: index % 2 === 0 ? 'white' : '#f8fbff' }}>
                <td style={{ padding: '10px 10px', fontWeight: 700 }}>{row.category}</td>
                <td style={{ padding: '10px 10px', color: '#0f766e', fontWeight: 700 }}>{formatRupees(row.estimated)}</td>
                <td style={{ padding: '10px 10px' }}>
                  <input
                    type="number"
                    min="0"
                    value={actuals[row.category] || 0}
                    onChange={e => setActuals(prev => ({ ...prev, [row.category]: parseFloat(e.target.value) || 0 }))}
                    style={{ ...inputStyle, width: '100%', minWidth: 90 }}
                  />
                </td>
                <td style={{ padding: '10px 10px', color: row.difference > 0 ? C.red : C.green, fontWeight: 700 }}>
                  {formatRupees(row.difference)}
                </td>
                <td style={{ padding: '10px 10px' }}>
                  <Btn
                    small
                    disabled={saveState[row.category] === 'saving'}
                    onClick={() => submitActual(row.category, row.estimated, actuals[row.category] || row.actual)}
                    color={C.blue}
                  >
                    {saveState[row.category] === 'saving' ? 'Saving…' : 'Save'}
                  </Btn>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '18px 10px', color: '#666' }}>
                  No logged budget actuals yet. Use the form below to add vendor invoices.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 24 }}>
        <div style={{ background: '#f9fafb', padding: 16, borderRadius: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Estimated total</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>{formatRupees(totalEstimated)}</div>
        </div>
        <div style={{ background: '#f9fafb', padding: 16, borderRadius: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Actual total</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>{formatRupees(totalActual)}</div>
        </div>
        <div style={{ background: '#f9fafb', padding: 16, borderRadius: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Savings / Overspend</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: totalDifference >= 0 ? C.green : C.red }}>
            {formatRupees(totalDifference)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Add or update vendor invoice</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Category</label>
            <select
              value={newEntry.category}
              onChange={e => setNewEntry(prev => ({ ...prev, category: e.target.value }))}
              style={inputStyle}
            >
              {BUDGET_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>AI Estimate (₹)</label>
            <input
              type="number"
              value={newEntry.estimated}
              onChange={e => setNewEntry(prev => ({ ...prev, estimated: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Actual Cost (₹)</label>
            <input
              type="number"
              value={newEntry.actual}
              onChange={e => setNewEntry(prev => ({ ...prev, actual: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Btn onClick={() => submitActual(newEntry.category, newEntry.estimated, newEntry.actual)} color={C.green}>
            Submit Actual
          </Btn>
        </div>
      </div>
    </Card>
  )
}

function BudgetRulesTab() {
  const [rules, setRules] = useState(null)
  const [toast, showToast] = useToast()

  useEffect(() => {
    apiFetch('/budget-rules').then(setRules).catch(e => showToast(e.message, false))
  }, [])

  const save = async () => {
    try {
      await apiFetch('/budget-rules', { method: 'PUT', body: JSON.stringify(rules) })
      showToast('Budget rules saved')
    } catch (e) { showToast(e.message, false) }
  }

  const update = (section, key, val) => {
    setRules(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: section === 'wedding_type_base' ? parseInt(val || 0) : parseFloat(val || 0) }
    }))
  }

  if (!rules) return <Card><div style={{ color: '#888', fontSize: 13 }}>Loading…</div></Card>

  return (
    <Card>
      {toast && <Toast {...toast} />}
      <SectionTitle> Budget Multipliers & Base Costs</SectionTitle>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.blue, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Wedding Type Base Costs (₹)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {Object.entries(rules.wedding_type_base).map(([k, v]) => (
            <div key={k}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>{k}</label>
              <input type="number" value={v} onChange={e => update('wedding_type_base', k, e.target.value)} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.blue, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hotel Tier Multipliers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {Object.entries(rules.hotel_tier_multiplier).map(([k, v]) => (
            <div key={k}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>{k}</label>
              <input type="number" step="0.1" value={v} onChange={e => update('hotel_tier_multiplier', k, e.target.value)} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.blue, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Venue Type Multipliers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {Object.entries(rules.venue_type_multiplier).map(([k, v]) => (
            <div key={k}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>{k}</label>
              <input type="number" step="0.1" value={v} onChange={e => update('venue_type_multiplier', k, e.target.value)} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      <Btn onClick={save} color={C.green} style={{ marginTop: 8 }}>Save All Budget Rules</Btn>
    </Card>
  )
}

// ── Tab: Settings ──────────────────────────────────────────────────────────────
function SettingsTab({ onLogout }) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState(null)
  const [training, setTraining] = useState(false)
  const [toast, showToast] = useToast()

  const loadStatus = useCallback(() => {
    apiFetch('/model-status').then(setStatus).catch(() => { })
  }, [])

  useEffect(() => {
    apiFetch('/contingency').then(setData).catch(e => showToast(e.message, false))
    loadStatus()
  }, [loadStatus])

  const save = async () => {
    try {
      const updated = await apiFetch('/contingency', {
        method: 'PUT',
        body: JSON.stringify({
          contingency_pct: Number(data.contingency_pct),
          weekend_surcharge_pct: Number(data.weekend_surcharge_pct),
        }),
      })
      setData(updated)
      showToast('Settings saved')
    } catch (e) { showToast(e.message, false) }
  }

  const retrain = async () => {
    setTraining(true)
    try {
      const res = await apiFetch('/decor/retrain', { method: 'POST' })
      showToast(`Model retrained successfully! Accuracy: ${res.accuracy || 'N/A'}`)
      loadStatus()
    } catch (e) {
      showToast(e.message || 'Retraining failed', false)
    } finally {
      setTraining(false)
    }
  }

  return (
    <>
      {toast && <Toast {...toast} />}
      <Card>
        <SectionTitle> Budget Settings</SectionTitle>
        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 360 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 6 }}>
                Contingency Buffer % (e.g. 0.08 = 8%)
              </label>
              <input type="number" step="0.01" min="0" max="1"
                value={data.contingency_pct}
                onChange={e => setData(d => ({ ...d, contingency_pct: e.target.value }))}
                style={{ ...inputStyle, maxWidth: 200 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 6 }}>
                Weekend Surcharge % (e.g. 0.15 = 15%)
              </label>
              <input type="number" step="0.01" min="0" max="1"
                value={data.weekend_surcharge_pct}
                onChange={e => setData(d => ({ ...d, weekend_surcharge_pct: e.target.value }))}
                style={{ ...inputStyle, maxWidth: 200 }} />
            </div>
            {data.updated_at && (
              <div style={{ fontSize: 12, color: '#888' }}>Last updated: {new Date(data.updated_at).toLocaleString('en-IN')}</div>
            )}
            <Btn onClick={save} color={C.green}>Save Settings</Btn>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle> Model Status</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
            <span style={{ color: '#666', fontWeight: 500 }}>Last Trained</span>
            <span style={{ fontWeight: 700, color: C.navy }}>
              {status?.last_trained ? new Date(status.last_trained).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
            <span style={{ color: '#666', fontWeight: 500 }}>Training Samples</span>
            <span style={{ fontWeight: 700, color: C.navy }}>{status?.samples || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
            <span style={{ color: '#666', fontWeight: 500 }}>CV Accuracy (R²)</span>
            <span style={{ fontWeight: 700, color: status?.accuracy > 0.7 ? C.green : C.orange }}>
              {status?.accuracy != null ? status.accuracy : 'N/A'}
            </span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Btn onClick={retrain} disabled={training} color={C.amber} textColor={C.navy}>
            {training ? 'Training Model…' : '↺ Retrain Model'}
          </Btn>
          {training && (
            <div style={{ marginTop: 8, fontSize: 11, color: C.blue, fontWeight: 600 }}>
              Live progress: Extracting features & fitting regressor...
            </div>
          )}
        </div>
      </Card>

      <Card>
        <SectionTitle> Session</SectionTitle>
        <div style={{ fontSize: 13, color: '#555', marginBottom: 14 }}>JWT token expires 24 hours after login. Logging out clears the session token.</div>
        <Btn onClick={onLogout} color={C.red}>Logout</Btn>
      </Card>
    </>
  )
}

// ── Main AdminPage ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'artists', label: ' Artists' },
  { id: 'fb', label: ' F&B Rates' },
  { id: 'logistics', label: ' Logistics' },
  { id: 'decor', label: ' Decor Labels' },
  { id: 'rules', label: ' Budget Rules' },
  { id: 'tracker', label: ' Budget Tracker' },
  { id: 'settings', label: ' Settings' },
]

export default function AdminPage({ onClose }) {
  const [authed, setAuthed] = useState(!!getToken())
  const [activeTab, setActiveTab] = useState('artists')

  const logout = () => { clearToken(); setAuthed(false) }

  // Auto-logout on token expiry (poll every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!getToken()) setAuthed(false)
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} onBack={onClose} />

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fb', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: C.navy, color: 'white', padding: '0 28px',
        display: 'flex', alignItems: 'center', gap: 16, height: 56,
        boxShadow: '0 2px 12px rgba(2,48,71,0.18)'
      }}>
        <span style={{ fontSize: 20 }}></span>
        <span style={{ fontWeight: 800, fontSize: 16 }}>WeddingBudget.AI</span>
        <span style={{ opacity: 0.4, fontSize: 18 }}>|</span>
        <span style={{ fontWeight: 600, fontSize: 14, opacity: 0.85 }}>Admin Panel</span>
        <div style={{ flex: 1 }} />
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white',
          borderRadius: 8, padding: '6px 16px', cursor: 'pointer',
          fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif"
        }}>← Back to App</button>
      </div>

      {/* Tab bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #EBEBEB', padding: '0 28px', display: 'flex', gap: 2 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '14px 18px', border: 'none', cursor: 'pointer', background: 'transparent',
            fontWeight: activeTab === tab.id ? 700 : 500,
            fontSize: 13,
            color: activeTab === tab.id ? C.navy : '#888',
            borderBottom: activeTab === tab.id ? `3px solid ${C.amber}` : '3px solid transparent',
            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        {activeTab === 'artists' && <ArtistsTab />}
        {activeTab === 'fb' && <FBRatesTab />}
        {activeTab === 'logistics' && <LogisticsTab />}
        {activeTab === 'decor' && <DecorLabelsTab />}
        {activeTab === 'rules' && <BudgetRulesTab />}
        {activeTab === 'tracker' && <BudgetTrackerTab />}
        {activeTab === 'settings' && <SettingsTab onLogout={logout} />}
      </div>
    </div>
  )
}
