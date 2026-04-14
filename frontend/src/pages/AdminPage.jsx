import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../utils/config'
import Checklist from '../components/Checklist'
import { useWedding } from '../context/WeddingContext'

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
  const isFormData = opts.body instanceof FormData
  const res = await fetch(`${API}/admin${path}`, {
    ...opts,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
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
  const show = useCallback((msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }, [])
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

// ── Tab: Finalized Budgets ────────────────────────────────────────────────────
function FinalizedBudgetsTab() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [toast, showToast] = useToast()
  
  const [editingDate, setEditingDate] = useState(false)
  const [newDate, setNewDate] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetchBudget('/budget/finalized')
      setBudgets(Array.isArray(data) ? data : [])
    } catch (e) {
      showToast(e.message, false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const saveNewDate = async () => {
    if (!selected) return
    try {
      // Optimistic update of local state
      const updatedProfile = { ...selected.wedding_profile, wedding_date: newDate }
      const updatedBudget = { ...selected, wedding_profile: updatedProfile }
      
      // Update in the main list
      setBudgets(list => list.map(b => b.id === selected.id ? updatedBudget : b))
      setSelected(updatedBudget)
      setEditingDate(false)
      showToast('Wedding date updated locally')
      
      // In a real app, you would also call an API here:
      // await apiFetchBudget(`/budget/update-date/${selected.id}`, { method: 'PATCH', body: JSON.stringify({ wedding_date: newDate }) })
    } catch (e) {
      showToast(e.message, false)
    }
  }

  return (
    <Card>
      {toast && <Toast {...toast} />}
      <SectionTitle> Finalized Wedding Budgets</SectionTitle>
      
      {loading ? (
        <div style={{ color: '#888', fontSize: 13 }}>Loading...</div>
      ) : budgets.length === 0 ? (
        <div style={{ color: '#888', fontSize: 13 }}>No finalized budgets submitted yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f0f7fc' }}>
                {['User Name', 'Date Submitted', 'Total (Mid)', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px', textAlign: 'left', fontWeight: 700, color: C.navy, borderBottom: `2px solid ${C.amber}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {budgets.map((b, i) => (
                <tr key={b.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fbfd' }}>
                  <td style={{ padding: '10px', fontWeight: 600, color: C.navy }}>{b.user_name}</td>
                  <td style={{ padding: '10px' }}>{new Date(b.created_at).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px', fontWeight: 700, color: C.green }}>{formatRupees(b.total_mid)}</td>
                  <td style={{ padding: '10px' }}>
                    <Btn small onClick={() => setSelected(b)} color={C.blue}>View Profile</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(2, 48, 71, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20
        }} onClick={() => setSelected(null)}>
          <div style={{
            background: 'white', borderRadius: 24, width: '100%', maxWidth: 850,
            maxHeight: '90vh', overflowY: 'auto', padding: 0, boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>Wedding Profile: {selected.user_name}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#888' }}>×</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: 14, background: '#f8fafc', padding: 20, borderRadius: 16, marginBottom: 24 }}>
                <div><span style={{color: '#64748b'}}>Wedding Type:</span> <strong style={{color: C.navy}}>{selected.wedding_profile.wedding_type}</strong></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{color: '#64748b'}}>Date:</span> 
                  {editingDate ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input 
                        type="date" 
                        value={newDate} 
                        onChange={e => setNewDate(e.target.value)} 
                        style={{ ...inputStyle, padding: '4px 8px', width: 'auto' }}
                      />
                      <Btn small onClick={saveNewDate} color={C.green}>Save</Btn>
                      <Btn small onClick={() => setEditingDate(false)} color="#888">×</Btn>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong style={{color: C.navy}}>{selected.wedding_profile.wedding_date || 'Not Set'}</strong>
                      <button 
                        onClick={() => { setEditingDate(true); setNewDate(selected.wedding_profile.wedding_date || '') }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.blue, padding: 0 }}
                      >✎ Edit</button>
                    </div>
                  )}
                </div>
                <div><span style={{color: '#64748b'}}>Guests:</span> <strong style={{color: C.navy}}>{selected.wedding_profile.total_guests}</strong></div>
                <div><span style={{color: '#64748b'}}>Budget Tier:</span> <strong style={{color: C.navy}}>{selected.wedding_profile.budget_tier}</strong></div>
              </div>

              {/* Checklist Section for this specific event */}
              <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: 24 }}>
                <AdminChecklistForEvent weddingDate={selected.wedding_profile.wedding_date} bookingId={selected.id} />
              </div>

              <div style={{ marginTop: 24 }}>
                <div style={{ fontWeight: 700, marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 6 }}>Full Raw Profile (JSON)</div>
                <pre style={{
                  background: '#f8f9fa', padding: 12, borderRadius: 10, fontSize: 11,
                  overflowX: 'auto', maxHeight: 200, color: '#444'
                }}>
                  {JSON.stringify(selected.wedding_profile, null, 2)}
                </pre>
              </div>
            </div>

            <div style={{ padding: '20px 32px', borderTop: '1px solid #eee', textAlign: 'right', background: '#fcfcfc', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
              <Btn onClick={() => setSelected(null)} color={C.navy}>Close Profile</Btn>
            </div>
          </div>
        </div>
      )}
    </Card>
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
  
  const [filterType, setFilterType] = useState('')
  const [filterStyle, setFilterStyle] = useState('')
  const [uploading, setUploading] = useState(false)

  const load = useCallback(() => {
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
  }, [showToast])

  useEffect(() => { load() }, [load])

  const saveLabel = async (filename) => {
    const d = drafts[filename]
    try {
      await apiFetch('/admin-decor/label', {
        method: 'POST',
        body: JSON.stringify({ filename, ...d, complexity: Number(d.complexity), seed_cost: Number(d.seed_cost) }),
      })
      showToast(`Saved: ${filename}`)
    } catch (e) { showToast(e.message, false) }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await apiFetch('/admin-decor/upload', { method: 'POST', body: formData })
      showToast('Image uploaded successfully')
      load()
    } catch (e) {
      showToast(e.message, false)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const update = (filename, field, value) => {
    setDrafts(d => ({ ...d, [filename]: { ...d[filename], [field]: value } }))
  }

  const FUNCTION_TYPES = ['Mandap', 'Stage', 'Ceiling', 'Entrance', 'Backdrop', 'Aisle', 'Table', 'Photo Booth', 'Lighting', 'Pillars', 'Other']
  const STYLES = ['Luxury', 'Romantic', 'Traditional', 'Modern', 'Rustic', 'Boho', 'Minimalist', 'Whimsical', 'Playful']

  const filteredImages = images.filter(img => {
    const d = drafts[img.filename] || {}
    const matchesType = !filterType || d.function_type === filterType
    const matchesStyle = !filterStyle || d.style === filterStyle
    return matchesType && matchesStyle
  })

  return (
    <Card>
      {toast && <Toast {...toast} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <SectionTitle> Decor Image Labeller ({images.length} images)</SectionTitle>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Btn color={C.amber} textColor={C.navy} disabled={uploading}>
              {uploading ? 'Uploading...' : '+ Upload Image'}
            </Btn>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleUpload} 
              disabled={uploading}
              style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.navy, display: 'block', marginBottom: 6 }}>Filter by Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inputStyle}>
            <option value="">All Types</option>
            {FUNCTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.navy, display: 'block', marginBottom: 6 }}>Filter by Style</label>
          <select value={filterStyle} onChange={e => setFilterStyle(e.target.value)} style={inputStyle}>
            <option value="">All Styles</option>
            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Btn onClick={() => { setFilterType(''); setFilterStyle('') }} color="#eee" textColor={C.navy}>Reset Filters</Btn>
      </div>

      {filteredImages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
          No images match your filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filteredImages.map(img => {
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
      )}
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

// ── Tab: CRM ───────────────────────────────────────────────────────────────────
function CRMTab() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, showToast] = useToast()
  const [editing, setEditing] = useState(null) 

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/crm/leads')
      setLeads(Array.isArray(data) ? data : [])
    } catch (e) {
      showToast(e.message, false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const updateLead = async (id, patch) => {
    try {
      await apiFetch(`/crm/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      })
      setLeads(list => list.map(l => l.id === id ? { ...l, ...patch } : l))
      showToast('Lead updated')
      setEditing(null)
    } catch (e) {
      showToast(e.message, false)
    }
  }

  const deleteLead = async (id) => {
    if (!confirm('Delete this lead?')) return
    try {
      await apiFetch(`/crm/leads/${id}`, { method: 'DELETE' })
      setLeads(list => list.filter(l => l.id !== id))
      showToast('Lead deleted')
    } catch (e) {
      showToast(e.message, false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return C.blue
      case 'Contacted': return C.amber
      case 'In-Progress': return C.orange
      case 'Converted': return C.green
      case 'Lost': return C.red
      default: return '#666'
    }
  }

  return (
    <Card>
      {toast && <Toast {...toast} />}
      <SectionTitle>Customer Relationship Management (CRM)</SectionTitle>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 12, border: '1px solid #bae6fd' }}>
          <div style={{ fontSize: 12, color: '#0369a1', fontWeight: 600 }}>Total Leads</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.navy }}>{leads.length}</div>
        </div>
        <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 12, border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>Converted</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.green }}>{leads.filter(l => l.status === 'Converted').length}</div>
        </div>
        <div style={{ background: '#fff7ed', padding: 16, borderRadius: 12, border: '1px solid #fed7aa' }}>
          <div style={{ fontSize: 12, color: '#c2410c', fontWeight: 600 }}>Pending Follow-up</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.orange }}>{leads.filter(l => l.status === 'New').length}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#888', fontSize: 13 }}>Loading Leads...</div>
      ) : leads.length === 0 ? (
        <div style={{ color: '#888', fontSize: 13 }}>No leads found. Capture more leads from the wizard!</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f0f7fc' }}>
                {['Source/Date', 'Client Details', 'Wedding Info', 'Status/Priority', 'Notes', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 700, color: C.navy, borderBottom: `2px solid ${C.amber}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((l, i) => (
                <tr key={l.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fbfd', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontSize: 11, color: '#666' }}>{l.source}</div>
                    <div style={{ fontWeight: 600 }}>{new Date(l.created_at).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 700, color: C.navy }}>{l.name}</div>
                    <div style={{ fontSize: 12 }}>{l.email}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{l.phone}</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontSize: 12 }}>📅 {l.wedding_date || 'TBD'}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>{formatRupees(l.budget)}</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ marginBottom: 6 }}>
                      <select 
                        value={l.status} 
                        onChange={(e) => updateLead(l.id, { status: e.target.value })}
                        style={{ ...inputStyle, padding: '2px 4px', fontSize: 11, border: `1px solid ${getStatusColor(l.status)}`, color: getStatusColor(l.status), fontWeight: 700, width: 'auto' }}
                      >
                        {['New', 'Contacted', 'In-Progress', 'Converted', 'Lost'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <select 
                        value={l.priority} 
                        onChange={(e) => updateLead(l.id, { priority: e.target.value })}
                        style={{ ...inputStyle, padding: '2px 4px', fontSize: 11, width: 'auto' }}
                      >
                        {['Low', 'Medium', 'High'].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    {editing === l.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <textarea 
                          defaultValue={l.notes} 
                          onBlur={(e) => updateLead(l.id, { notes: e.target.value })}
                          style={{ ...inputStyle, fontSize: 11, minHeight: 60 }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div 
                        onClick={() => setEditing(l.id)}
                        style={{ fontSize: 12, color: l.notes ? '#444' : '#aaa', fontStyle: l.notes ? 'normal' : 'italic', cursor: 'pointer', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {l.notes || 'Click to add notes...'}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <Btn small onClick={() => deleteLead(l.id)} color={C.red}>Delete</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

const INITIAL_ADMIN_TASKS = [
  { id: 101, task: "Verify user's initial budget feasibility", months_before: 12, category: "Account", done: false },
  { id: 102, task: "Assign lead wedding coordinator", months_before: 12, category: "Management", done: false },
  { id: 103, task: "Create master project timeline", months_before: 12, category: "Planning", done: false },
  { id: 104, task: "Initial venue scouting and feasibility", months_before: 11, category: "Venue", done: false },
  { id: 105, task: "Negotiate partner base rates", months_before: 11, category: "Finance", done: false },
  { id: 106, task: "Finalize vendor contract templates", months_before: 10, category: "Legal", done: false },
  { id: 107, task: "Conduct venue site visits", months_before: 10, category: "Venue", done: false },
  { id: 108, task: "Vet new catering partners", months_before: 9, category: "Food", done: false },
  { id: 109, task: "Review photography portfolios", months_before: 9, category: "Vendors", done: false },
  { id: 110, task: "Confirm floral season availability", months_before: 8, category: "Decor", done: false },
  { id: 111, task: "Update artist availability calendar", months_before: 8, category: "Artists", done: false },
  { id: 112, task: "Set up payment reminders for client", months_before: 7, category: "Finance", done: false },
  { id: 113, task: "Finalize catering menu options", months_before: 7, category: "Food", done: false },
  { id: 114, task: "Design floor plans and seating layouts", months_before: 6, category: "Design", done: false },
  { id: 115, task: "Secure bulk accommodation blocks", months_before: 6, category: "Logistics", done: false },
  { id: 116, task: "Send print proofs to user", months_before: 5, category: "Graphics", done: false },
  { id: 117, task: "Coordinate transportation route planning", months_before: 5, category: "Logistics", done: false },
  { id: 118, task: "Finalize decoration technical drawings", months_before: 4, category: "Decor", done: false },
  { id: 119, task: "Process vendor deposits", months_before: 4, category: "Finance", done: false },
  { id: 120, task: "Review entertainment rider requirements", months_before: 4, category: "Artists", done: false },
  { id: 121, task: "Generate invitation mailing list", months_before: 3, category: "Guests", done: false },
  { id: 122, task: "Audit food safety certifications", months_before: 3, category: "Food", done: false },
  { id: 123, task: "Source specialized decor elements", months_before: 3, category: "Decor", done: false },
  { id: 124, task: "Confirm hair and makeup timing", months_before: 2, category: "Management", done: false },
  { id: 125, task: "Final transport fleet check", months_before: 2, category: "Logistics", done: false },
  { id: 126, task: "Assemble wedding day itinerary", months_before: 2, category: "Planning", done: false },
  { id: 127, task: "Distribute vendor contact sheets", months_before: 1, category: "Management", done: false },
  { id: 128, task: "Generate final budget actuals report", months_before: 1, category: "Finance", done: false },
  { id: 129, task: "Lock in all vendor bookings", months_before: 1, category: "Legal", done: false },
  { id: 130, task: "Review sound and lighting specs", months_before: 1, category: "Technical", done: false },
  { id: 131, task: "Print place cards and seating charts", months_before: 0.5, category: "Graphics", done: false },
  { id: 132, task: "Conduct final venue walk-through", months_before: 0.5, category: "Venue", done: false },
  { id: 133, task: "Brief on-site coordination team", months_before: 0.5, category: "Management", done: false },
  { id: 134, task: "Prepare vendor final payments", months_before: 0.5, category: "Finance", done: false },
  { id: 135, task: "Send final itinerary to couple", months_before: 0.5, category: "Planning", done: false },
  { id: 136, task: "Verify license readiness", months_before: 0.25, category: "Legal", done: false },
  { id: 137, task: "Conduct dry run for specialty events", months_before: 0.25, category: "Management", done: false },
  { id: 138, task: "Supervise early venue setup", months_before: 0.25, category: "Venue", done: false },
  { id: 139, task: "Final briefing with client", months_before: 0.25, category: "Planning", done: false },
  { id: 140, task: "On-site management: Delivery checks", months_before: 0, category: "Execution", done: false },
  { id: 141, task: "Review bar stock inventory", months_before: 0.5, category: "Food", done: false },
  { id: 142, task: "Coordinate gift hampers vendors", months_before: 2, category: "Logistics", done: false },
  { id: 143, task: "Assign ushers and guest managers", months_before: 1, category: "Management", done: false },
  { id: 144, task: "Verify power backup status", months_before: 0.25, category: "Technical", done: false },
  { id: 145, task: "Final check on couple entry SFX", months_before: 0.25, category: "Technical", done: false },
  { id: 146, task: "Coordinate valet team", months_before: 0.5, category: "Logistics", done: false },
  { id: 147, task: "Post-wedding cleanup plan", months_before: 1, category: "Management", done: false },
  { id: 148, task: "Re-verify honeymoon travel docs", months_before: 1, category: "Account", done: false },
  { id: 149, task: "Secure safe for wedding assets", months_before: 0.25, category: "Execution", done: false },
  { id: 150, task: "Prepare post-wedding feedback form", months_before: 0.5, category: "Management", done: false },
];

function AdminChecklistForEvent({ weddingDate, bookingId }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(`admin_checklist_${bookingId}`)
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_TASKS
  })

  useEffect(() => {
    localStorage.setItem(`admin_checklist_${bookingId}`, JSON.stringify(tasks))
  }, [tasks, bookingId])

  return (
    <div style={{ marginBottom: 30 }}>
      <Checklist 
        tasks={tasks} 
        setTasks={setTasks} 
        title="Event Execution Checklist" 
        subtitle="Manage end-to-end execution for this specific booking"
        weddingDate={weddingDate}
        colorPrimary="#023047"
      />
    </div>
  )
}

function VendorPaymentsTab() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({ vendor_name: '', category: '', total_amount: '', paid_amount: '', due_date: '', payment_mode: 'UPI', notes: '' })
  const [adding, setAdding] = useState(false)
  const [toast, showToast] = useToast()

  const load = useCallback(() => {
    setLoading(true)
    apiFetchBudget('/payments/')
      .then(setPayments)
      .catch(e => showToast(e.message, false))
      .finally(() => setLoading(false))
  }, [showToast])

  useEffect(() => { load() }, [load])

  const save = async () => {
    try {
      await apiFetchBudget('/payments/', {
        method: 'POST',
        body: JSON.stringify({
          ...draft,
          id: editing?.id,
          total_amount: parseFloat(draft.total_amount || 0),
          paid_amount: parseFloat(draft.paid_amount || 0)
        }),
      })
      showToast(editing ? 'Payment updated' : 'Payment added')
      setEditing(null)
      setAdding(false)
      setDraft({ vendor_name: '', category: '', total_amount: '', paid_amount: '', due_date: '', payment_mode: 'UPI', notes: '' })
      load()
    } catch (e) { showToast(e.message, false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this record?')) return
    try {
      await apiFetchBudget(`/payments/${id}`, { method: 'DELETE' })
      showToast('Record deleted')
      load()
    } catch (e) { showToast(e.message, false) }
  }

  const startEdit = (p) => {
    setEditing(p)
    setDraft({ 
      vendor_name: p.vendor_name, 
      category: p.category, 
      total_amount: p.total_amount, 
      paid_amount: p.paid_amount, 
      due_date: p.due_date,
      payment_mode: p.payment_mode || 'UPI',
      notes: p.notes || ''
    })
    setAdding(false)
  }

  const DraftRow = () => (
    <tr style={{ background: '#fffbea' }}>
      <td style={{ padding: '8px 10px' }}>
        <input value={draft.vendor_name} onChange={e => setDraft(d => ({ ...d, vendor_name: e.target.value }))} style={inputStyle} placeholder="Vendor" />
      </td>
      <td style={{ padding: '8px 10px' }}>
        <input value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} style={inputStyle} placeholder="Service/Category" />
      </td>
      <td style={{ padding: '8px 10px' }}>
        <input type="number" value={draft.total_amount} onChange={e => setDraft(d => ({ ...d, total_amount: e.target.value }))} style={inputStyle} placeholder="Total ₹" />
      </td>
      <td style={{ padding: '8px 10px' }}>
        <input type="number" value={draft.paid_amount} onChange={e => setDraft(d => ({ ...d, paid_amount: e.target.value }))} style={inputStyle} placeholder="Paid ₹" />
      </td>
      <td style={{ padding: '8px 10px' }}>
        <input value={draft.due_date} onChange={e => setDraft(d => ({ ...d, due_date: e.target.value }))} style={inputStyle} placeholder="Due Date" />
      </td>
      <td style={{ padding: '8px 10px', display: 'flex', gap: 6 }}>
        <Btn small onClick={save} color={C.green}>Save</Btn>
        <Btn small onClick={() => { setEditing(null); setAdding(false) }} color="#888">Cancel</Btn>
      </td>
    </tr>
  )

  return (
    <Card>
      {toast && <Toast {...toast} />}
      <SectionTitle> Vendor Payment Tracker</SectionTitle>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f0f7fc' }}>
              {['Vendor', 'Category/Service', 'Total Cost', 'Paid', 'Due Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px', textAlign: 'left', fontWeight: 700, color: C.navy, borderBottom: `2px solid ${C.amber}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: 20, textAlign: 'center' }}>Loading...</td></tr>
            ) : (
              payments.map((p, i) => (
                editing?.id === p.id ? <DraftRow key={p.id} /> :
                <tr key={p.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fbfd' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{p.vendor_name}</td>
                  <td style={{ padding: '10px' }}>{p.category}</td>
                  <td style={{ padding: '10px' }}>{formatRupees(p.total_amount)}</td>
                  <td style={{ padding: '10px', color: C.green, fontWeight: 700 }}>{formatRupees(p.paid_amount)}</td>
                  <td style={{ padding: '10px' }}>{p.due_date || '—'}</td>
                  <td style={{ padding: '8px 10px', display: 'flex', gap: 6 }}>
                    <Btn small onClick={() => startEdit(p)} color={C.blue}>Edit</Btn>
                    <Btn small onClick={() => del(p.id)} color={C.red}>Del</Btn>
                  </td>
                </tr>
              ))
            )}
            {adding && !editing && <DraftRow key="new" />}
          </tbody>
        </table>
      </div>
      {!adding && !editing && (
        <div style={{ marginTop: 14 }}>
          <Btn onClick={() => { setAdding(true); setDraft({ vendor_name: '', category: '', total_amount: '', paid_amount: '', due_date: '', payment_mode: 'UPI', notes: '' }) }} color={C.amber} textColor={C.navy}>+ Add Payment Entry</Btn>
        </div>
      )}
    </Card>
  )
}

// ── Tab: Vendor Management ─────────────────────────────────────────────────────
function VendorsTab() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, showToast] = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetchBudget('/vendors/admin/all', {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setVendors(Array.isArray(data) ? data : [])
    } catch (e) {
      showToast(e.message, false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const approve = async (id) => {
    try {
      await apiFetchBudget(`/vendors/admin/approve/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      showToast('Vendor approved')
      load()
    } catch (e) { showToast(e.message, false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this vendor?')) return
    try {
      await apiFetchBudget(`/vendors/admin/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      showToast('Vendor deleted')
      load()
    } catch (e) { showToast(e.message, false) }
  }

  return (
    <Card>
      {toast && <Toast {...toast} />}
      <SectionTitle> Vendor Management</SectionTitle>
      {loading ? (
        <div style={{ color: '#888', fontSize: 13 }}>Loading...</div>
      ) : vendors.length === 0 ? (
        <div style={{ color: '#888', fontSize: 13 }}>No vendors registered yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f0f7fc' }}>
                {['Business', 'Category', 'City', 'Contact', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px', textAlign: 'left', fontWeight: 700, color: C.navy, borderBottom: `2px solid ${C.amber}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, i) => (
                <tr key={v.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fbfd' }}>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 700 }}>{v.business}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{v.name}</div>
                  </td>
                  <td style={{ padding: '10px' }}>{v.category}</td>
                  <td style={{ padding: '10px' }}>{v.city}</td>
                  <td style={{ padding: '10px' }}>{v.contact}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: v.is_approved ? '#f0fdf4' : '#fff7ed',
                      color: v.is_approved ? C.green : '#c2410c'
                    }}>
                      {v.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', display: 'flex', gap: 6 }}>
                    {!v.is_approved && (
                      <Btn small onClick={() => approve(v.id)} color={C.green}>Approve</Btn>
                    )}
                    <Btn small onClick={() => del(v.id)} color={C.red}>Delete</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

// ── Main AdminPage ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'finalized', label: ' Finalized Budgets' },
  { id: 'vendors', label: ' Vendor Approval' },
  { id: 'artists', label: ' Artists' },
  { id: 'fb', label: ' F&B Rates' },
  { id: 'logistics', label: ' Logistics' },
  { id: 'decor', label: ' Decor Labels' },
  { id: 'rules', label: ' Budget Rules' },
  { id: 'tracker', label: ' Budget Tracker' },
  { id: 'payments', label: ' Vendor Payments' },
  { id: 'crm', label: ' CRM / Leads' },
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
      <div style={{ background: 'white', borderBottom: '1px solid #EBEBEB', padding: '0 28px', display: 'flex', gap: 2, overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '14px 18px', border: 'none', cursor: 'pointer', background: 'transparent',
            fontWeight: activeTab === tab.id ? 700 : 500,
            fontSize: 13,
            color: activeTab === tab.id ? C.navy : '#888',
            borderBottom: activeTab === tab.id ? `3px solid ${C.amber}` : '3px solid transparent',
            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
            whiteSpace: 'nowrap'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        {activeTab === 'finalized' && <FinalizedBudgetsTab />}
        {activeTab === 'vendors' && <VendorsTab />}
        {activeTab === 'artists' && <ArtistsTab />}
        {activeTab === 'fb' && <FBRatesTab />}
        {activeTab === 'logistics' && <LogisticsTab />}
        {activeTab === 'decor' && <DecorLabelsTab />}
        {activeTab === 'rules' && <BudgetRulesTab />}
        {activeTab === 'tracker' && <BudgetTrackerTab />}
        {activeTab === 'payments' && <VendorPaymentsTab />}
        {activeTab === 'crm' && <CRMTab />}
        {activeTab === 'settings' && <SettingsTab onLogout={logout} />}
      </div>
    </div>
  )
}
