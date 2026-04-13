import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWedding, formatRupees } from '../context/WeddingContext'
import { API_BASE as API } from '../utils/config'

// ─── Count-up animation hook ──────────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const from = prev.current
    prev.current = target
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + (target - from) * eased))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return val
}

// ─── Color palette per category ───────────────────────────────────────────────
const ITEM_COLORS = {
  'Wedding Type Base': '#023047',
  'Events & Ceremonies': '#219ebc',
  'Venue': '#04699b',
  'Accommodation': '#0D9488',
  'Food & Beverages': '#fb8500',
  'Decor & Design': '#b37f00',
  'Artists & Entertainment': '#1D4ED8',
  'Logistics & Transport': '#059669',
  'Sundries & Basics': '#C2410C',
  'Contingency Buffer (8%)': '#6B7280',
}

// ─── Interactive Pie Chart ────────────────────────────────────────────────────
function PieChart({ items }) {
  const canvasRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const arcsRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !items.length) return
    const ctx = canvas.getContext('2d')
    const total = items.reduce((s, i) => s + i.value, 0)
    if (!total) return
    const cx = 135, cy = 135, r = 115, rIn = 52
    ctx.clearRect(0, 0, 270, 270)
    let start = -Math.PI / 2
    const arcs = []
    items.forEach(item => {
      const angle = (item.value / total) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, start + angle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
      // Percentage label if slice > 6%
      const pct = (item.value / total) * 100
      if (pct > 6) {
        const mid = start + angle / 2
        const lx = cx + (r * 0.68) * Math.cos(mid)
        const ly = cy + (r * 0.68) * Math.sin(mid)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${Math.round(pct)}%`, lx, ly)
      }
      arcs.push({ start, end: start + angle, item })
      start += angle
    })
    arcsRef.current = arcs
    // Centre donut hole
    ctx.beginPath()
    ctx.arc(cx, cy, rIn, 0, Math.PI * 2)
    ctx.fillStyle = '#FAFAFF'
    ctx.fill()
  }, [items])

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left - 135
    const my = e.clientY - rect.top - 135
    const dist = Math.sqrt(mx * mx + my * my)
    if (dist < 52 || dist > 115) { setTooltip(null); return }
    let angle = Math.atan2(my, mx)
    if (angle < -Math.PI / 2) angle += Math.PI * 2
    const total = items.reduce((s, i) => s + i.value, 0)
    for (const arc of arcsRef.current) {
      let s = arc.start, en = arc.end
      if (s < -Math.PI / 2) { s += Math.PI * 2; en += Math.PI * 2 }
      if (angle >= s && angle <= en) {
        setTooltip({
          label: arc.item.label,
          value: formatRupees(arc.item.value),
          pct: Math.round((arc.item.value / total) * 100),
          color: arc.item.color,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
        return
      }
    }
    setTooltip(null)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas ref={canvasRef} width={270} height={270}
        style={{ borderRadius: '50%', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)} />
      {tooltip && (
        <div style={{
          position: 'absolute', left: tooltip.x + 12, top: tooltip.y - 30,
          background: '#023047', color: '#fff', padding: '6px 10px', borderRadius: 8,
          fontSize: 12, fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 99,
          borderLeft: `3px solid ${tooltip.color}`
        }}>
          {tooltip.label}<br />
          <span style={{ color: '#FDE68A' }}>{tooltip.value}</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}> · {tooltip.pct}%</span>
        </div>
      )}
    </div>
  )
}

// ─── Budget Bar Chart (Vertical) ──────────────────────────────────────────────
function BudgetBarChart({ budget }) {
  const canvasRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const barsRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !budget?.items) return
    const ctx = canvas.getContext('2d')

    const categories = [
      { label: 'Style', keys: ['Wedding Type Base', 'Events & Ceremonies'], color: '#023047' },
      { label: 'Venue', keys: ['Venue', 'Accommodation'], color: '#04699B' },
      { label: 'Decor', keys: ['Decor & Design'], color: '#FB8500' },
      { label: 'Food', keys: ['Food & Beverages'], color: '#0D9488' },
      { label: 'Artists', keys: ['Artists & Entertainment'], color: '#1D4ED8' },
      { label: 'Logistics', keys: ['Logistics & Transport'], color: '#059669' },
      { label: 'Sundries', keys: ['Sundries & Basics'], color: '#C2410C' },
    ].map(cat => ({
      label: cat.label,
      value: cat.keys.reduce((sum, key) => sum + ((budget.items[key]?.mid || 0)), 0),
      color: cat.color,
    })).filter(item => item.value > 0)

    if (!categories.length) return

    const maxVal = Math.max(...categories.map(d => d.value), 1) * 1.1
    const w = 460, h = 260
    const padL = 52, padR = 24, padT = 32, padB = 52
    const chartW = w - padL - padR
    const chartH = h - padT - padB

    ctx.clearRect(0, 0, w, h)

    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i
      const val = maxVal - (maxVal / 4) * i
      ctx.moveTo(padL, y)
      ctx.lineTo(w - padR, y)
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`₹${(val / 100000).toFixed(1)}L`, padL - 8, y + 3)
    }
    ctx.stroke()

    const barW = Math.min(40, (chartW / categories.length) * 0.7)
    const spacing = chartW / categories.length
    const bars = []

    categories.forEach((d, i) => {
      const bh = (d.value / maxVal) * chartH
      const bx = padL + spacing * i + (spacing - barW) / 2
      const by = padT + chartH - bh

      ctx.fillStyle = d.color
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(bx, by, barW, bh, [4, 4, 0, 0])
      } else {
        ctx.rect(bx, by, barW, bh)
      }
      ctx.fill()

      ctx.fillStyle = '#6B7280'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(d.label, bx + barW / 2, h - padB + 18)

      bars.push({ x: bx, y: by, w: barW, h: bh, item: d })
    })
    barsRef.current = bars
  }, [budget])

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    for (const bar of barsRef.current) {
      if (mx >= bar.x && mx <= bar.x + bar.w && my >= bar.y && my <= bar.y + bar.h) {
        setTooltip({
          label: bar.item.label,
          value: formatRupees(bar.item.value),
          color: bar.item.color,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
        return
      }
    }
    setTooltip(null)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#111', marginBottom: 12, marginTop: 20, textAlign: 'center' }}>
        7-Tab Budget Comparison
      </div>
      <canvas ref={canvasRef} width={460} height={260}
        style={{ width: '100%', height: 'auto', maxWidth: 460, display: 'block', margin: '0 auto', cursor: 'help' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)} />
      {tooltip && (
        <div style={{
          position: 'absolute', left: tooltip.x + 10, top: tooltip.y - 40,
          background: '#023047', color: '#fff', padding: '6px 12px', borderRadius: 8,
          fontSize: 11, fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 99, borderLeft: `4px solid ${tooltip.color}`
        }}>
          {tooltip.label}: <span style={{ color: '#FDE68A' }}>{tooltip.value}</span>
        </div>
      )}
    </div>
  )
}

// ─── Confidence Gauge ─────────────────────────────────────────────────────────
function ConfidenceBar({ score }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#059669' : pct >= 60 ? '#D97706' : '#DC2626'
  const label = pct >= 80 ? 'High — all major details filled in'
    : pct >= 60 ? 'Medium — complete Decor, Artists & Logistics tabs'
      : 'Low — please fill more sections for accuracy'
  const tips = []
  if (pct < 100) {
    if (!score || score < 0.25) tips.push('Add wedding type & events')
    if (pct < 65) tips.push('Select artists in Tab 5')
    if (pct < 75) tips.push('Configure logistics in Tab 7')
    if (pct < 85) tips.push('Pick decor items in Tab 3')
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary-dark)' }}>AI Confidence Score</span>
        <span style={{ fontSize: 22, fontWeight: 900, color, fontFamily: 'EB Garamond,serif' }}>{pct}%</span>
      </div>
      <div style={{ height: 12, borderRadius: 6, background: 'var(--border)', overflow: 'hidden', marginBottom: 6 }}>
        <div style={{
          height: '100%', width: `${pct}%`, background:
            `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: 6, transition: 'width 1s ease'
        }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</div>
      {tips.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {tips.map((t, i) => (
            <span key={i} style={{
              fontSize: 11, background: '#FEF3C7', color: '#92400E',
              padding: '3px 8px', borderRadius: 20, fontWeight: 600
            }}> {t}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── WhatsApp Text Generator ─────────────────────────────────────────────
const generateWhatsAppText = (budgetData) => {
  const text = `💍 *WeddingBudget.AI Estimate*

💰 *Total: ₹${budgetData.total}*
📊 Range: ₹${budgetData.rangeMin} – ₹${budgetData.rangeMax}
🎯 Confidence: ${budgetData.confidence}%

*Breakdown:*
• Wedding Type Base: ₹${budgetData.breakdown.base}
• Events & Ceremonies: ₹${budgetData.breakdown.events}
• Venue: ₹${budgetData.breakdown.venue}
• Accommodation: ₹${budgetData.breakdown.accommodation}
• Food & Beverages: ₹${budgetData.breakdown.food}
• Decor & Design: ₹${budgetData.breakdown.decor}
• Artists & Entertainment: ₹${budgetData.breakdown.artists}
• Logistics & Transport: ₹${budgetData.breakdown.logistics}
• Sundries & Basics: ₹${budgetData.breakdown.sundries}
• Contingency Buffer (8%): ₹${budgetData.breakdown.buffer}

_Generated by WeddingBudget.AI_
https://wedddingbudget-ai.vercel.app`;

  return encodeURIComponent(text);
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Tab8Budget() {
  const { wedding, update } = useWedding()

  const [budget, setBudget] = useState(null)
  const [scenarios, setScenarios] = useState(null)
  const [loading, setLoading] = useState(false)
  const [psoResults, setPsoResults] = useState([])
  const [optimizing, setOptimizing] = useState(false)
  const [optimResult, setOptimResult] = useState(null)
  const [targetBudget, setTargetBudget] = useState('')
  const [exporting, setExporting] = useState(false)
  const [expanded, setExpanded] = useState(new Set())
  const [activeScen, setActiveScen] = useState('Standard')
  const [submitted, setSubmitted] = useState(false)
  const [finalised, setFinalised] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const [rlStats, setRlStats] = useState(null)
  const [budget_tracker, setBudgetTracker] = useState([]) // [{ category, actual }]
  const [toast, setToast] = useState(null) // {msg, type}

  const handleApplyOptimization = (category, optimizedValue) => {
    const current = budget?.items?.[category]?.mid || 0
    if (current === 0) return
    const ratio = optimizedValue / current
    const newMultipliers = { ...wedding.cost_multipliers, [category]: (wedding.cost_multipliers[category] || 1) * ratio }
    update('cost_multipliers', newMultipliers)
    const TAB_MAPPING = {
      'Venue': 1,
      'Accommodation': 1,
      'Food & Beverages': 3,
      'Decor & Design': 2,
      'Artists & Entertainment': 4,
      'Logistics & Transport': 6,
      'Sundries & Basics': 5,
    }
    const targetTab = TAB_MAPPING[category] ?? 7
    window.dispatchEvent(new CustomEvent('weddingGoToTab', { detail: targetTab }))
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchRlStats = async () => {
    try {
      const res = await fetch(`${API}/budget/rl-stats`)
      if (res.ok) setRlStats(await res.json())
    } catch {
      /* non-fatal */
    }
  }

  useEffect(() => {
    fetchRlStats()
  }, [])

  const handleFinalize = useCallback(async () => {
    // 1. Validation
    if (!budget || !budget.total || (budget.total.mid || 0) <= 0) {
      showToast("Please generate your budget estimate first.", "error");
      return;
    }
    
    // Check if essential selections are made
    const errors = [];
    if (!wedding.wedding_type) errors.push("Wedding Type");
    if (!wedding.wedding_date) errors.push("Wedding Date");
    if (!wedding.total_guests || wedding.total_guests < 1) errors.push("Guest Count");
    if (!wedding.selected_decor?.length) errors.push("Decor Selections from AI Gallery");
    
    if (errors.length > 0) {
      showToast(`Missing details: ${errors.join(", ")}`, "error");
      return;
    }

    setIsFinalizing(true);
    try {
      const response = await fetch(`${API}/budget/finalise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          total: budget.total, 
          wedding_profile: wedding,
          finalized_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Success
      setFinalised(true);
      setSubmitted(true);
      showToast("Budget finalized and sent to admin successfully!");
      
      localStorage.setItem('wedding_finalized', 'true');
      localStorage.setItem('final_budget_total', budget.total.mid.toString());

    } catch (err) {
      console.error('Finalization failed:', err);
      showToast(err.message || "Failed to finalize budget. Please check your connection and try again.", "error");
    } finally {
      setIsFinalizing(false);
    }
  }, [budget, wedding, API])

  useEffect(() => {
    const finaliseListener = () => handleFinalize()
    window.addEventListener('weddingFinalize', finaliseListener)
    return () => window.removeEventListener('weddingFinalize', finaliseListener)
  }, [handleFinalize])

  const midTotal = budget?.total?.mid || 0
  const displayTotal = useCountUp(midTotal, 800)

  const toggleRow = (name) => setExpanded(prev => {
    const next = new Set(prev)
    next.has(name) ? next.delete(name) : next.add(name)
    return next
  })

  const calculateBudget = async () => {
    setLoading(true)
    try {
      // Fetch budget and scenarios in parallel
      const [calcRes, scenRes] = await Promise.all([
        fetch(`${API}/budget/calculate`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: wedding || {} })
        }),
        fetch(`${API}/budget/scenarios`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: wedding || {} })
        })
      ])
      const data = await calcRes.json()
      const scenData = await scenRes.json()
      if (data.items) {
        Object.keys(wedding.cost_multipliers || {}).forEach(cat => {
          const m = wedding.cost_multipliers[cat] || 1
          if (m !== 1 && data.items[cat]) {
            data.items[cat].mid *= m
            data.items[cat].low *= m
            data.items[cat].high *= m
          }
        })
      }
      setBudget(data)
      setScenarios(scenData)
    } catch (e) {
      console.error('Budget calculation failed', e)
      const total_guests = wedding.total_guests || 200
      const events = wedding.events || []
      const logisticsBase = (wedding.logistics_total || 0)
      const items = {
        'Wedding Type Base': { low: 800000, mid: 2500000, high: 8000000, note: wedding.wedding_type || 'Hindu', sub_items: [] },
        'Events & Ceremonies': { low: events.length * 50000, mid: events.length * 200000, high: events.length * 700000, note: events.join(', ') || '—', sub_items: events.map(e => ({ name: e, low: 50000, mid: 200000, high: 700000 })) },
        'Venue': { low: 100000, mid: 350000, high: 1500000, note: wedding.venue_type || '—', sub_items: [] },
        'Accommodation': { low: Math.ceil((wedding.outstation_guests || 0) / 2) * 8000 * 2, mid: Math.ceil((wedding.outstation_guests || 0) / 2) * 15000 * 2, high: Math.ceil((wedding.outstation_guests || 0) / 2) * 30000 * 2, note: wedding.hotel_tier || '—', sub_items: [] },
        'Food & Beverages': { low: total_guests * 500 * Math.max(1, events.length), mid: total_guests * 1100 * Math.max(1, events.length), high: total_guests * 3000 * Math.max(1, events.length), note: wedding.food_budget_tier || '—', sub_items: [] },
        'Decor & Design': { low: (wedding.decor_total || 0) * 0.8, mid: wedding.decor_total || 0, high: (wedding.decor_total || 0) * 1.25, note: 'Selected decor', sub_items: [] },
        'Artists & Entertainment': { low: (wedding.artists_total || 0) * 0.9, mid: wedding.artists_total || 0, high: (wedding.artists_total || 0) * 1.1, note: 'Selected artists', sub_items: [] },
        'Logistics & Transport': { low: Math.round(logisticsBase * 0.7), mid: logisticsBase, high: Math.round(logisticsBase * 1.4), note: 'Fleet + SFX', sub_items: [] },
        'Sundries & Basics': { low: total_guests * 800, mid: total_guests * 1200, high: total_guests * 2000, note: 'Hampers, stationery, rituals', sub_items: [] },
      }
      Object.keys(wedding.cost_multipliers || {}).forEach(cat => {
        const m = wedding.cost_multipliers[cat] || 1
        if (m !== 1 && items[cat]) {
          items[cat].mid *= m
          items[cat].low *= m
          items[cat].high *= m
        }
      })
      const rMid = Object.values(items).reduce((s, i) => s + i.mid, 0)
      items['Contingency Buffer (8%)'] = { low: rMid * 0.04, mid: rMid * 0.08, high: rMid * 0.12, note: '8% admin buffer', sub_items: [] }
      const totLow = Object.values(items).reduce((s, i) => s + i.low, 0)
      const totMid = Object.values(items).reduce((s, i) => s + i.mid, 0)
      const totHigh = Object.values(items).reduce((s, i) => s + i.high, 0)
      setBudget({ items, total: { low: totLow, mid: totMid, high: totHigh }, confidence_score: 0.72, total_guests, events })
      setScenarios(null)
    } finally {
      setLoading(false)
    }
  }

  const optimize = async () => {
    if (!targetBudget || targetBudget < 100000) return
    setOptimizing(true)
    try {
      const res = await fetch(`${API}/budget/optimize`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { ...wedding, target_budget: parseFloat(targetBudget) } })
      })
      const result = await res.json()
      setOptimResult(result)
      setPsoResults(Object.entries(result.category_results).map(([cat, v]) => ({
        category: cat,
        original: v.original,
        optimized: v.optimized
      })))
    } catch (err) {
      console.error(err)
    } finally {
      setOptimizing(false)
    }
  }

  const printPDF = () => {
    if (!budget) return
    const R = n => {
      if (!n) return '₹0'
      n = parseFloat(n)
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
      if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
      if (n >= 1000) return `₹${Math.round(n / 1000)}K`
      return `₹${Math.round(n).toLocaleString('en-IN')}`
    }

    const escapeHTML = str => {
      if (typeof str !== 'string') return str;
      return str.replace(/[&<>'"]/g, tag =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
      );
    }
    const safeType = escapeHTML(wedding.wedding_type || '—')
    const safeCity = escapeHTML(wedding.wedding_city || wedding.wedding_district || '—')
    const safeDate = escapeHTML(wedding.wedding_date || '—')

    const conf = Math.round(((budget?.confidence_score || 0) || 0.72) * 100)

    const mainRows = Object.entries((budget?.items || {})).map(([name, vals]) => {
      const pct = (budget?.total?.mid || 0) > 0 ? Math.round((vals.mid / (budget?.total?.mid || 0)) * 100) : 0
      const subRows = (vals.sub_items || []).filter(s => s.mid || s.low || s.high).map(s =>
        `<tr style="color:#555;font-size:11px">
           <td style="padding:4px 12px 4px 28px">· ${escapeHTML(s.name)}</td>
           <td style="text-align:right;padding:4px 8px">${R(s.low) || '—'}</td>
           <td style="text-align:right;padding:4px 8px">${R(s.mid) || '—'}</td>
           <td style="text-align:right;padding:4px 8px">${R(s.high) || '—'}</td>
           <td></td></tr>`
      ).join('')
      return `<tr style="background:${Object.keys((budget?.items || {})).indexOf(name) % 2 === 0 ? '#f8f4ed' : 'white'}">
        <td style="padding:8px 12px;font-weight:700;display:flex;align-items:center;gap:6px">
          <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${ITEM_COLORS[name] || '#888'}"></span>${escapeHTML(name)}
        </td>
        <td style="text-align:right;padding:8px">${R(vals.low)}</td>
        <td style="text-align:right;padding:8px;font-weight:800;color:#04699b">${R(vals.mid)}</td>
        <td style="text-align:right;padding:8px">${R(vals.high)}</td>
        <td style="padding:8px;font-size:11px;color:#888">${pct}% · ${escapeHTML(vals.note || '')}</td>
      </tr>${subRows}`
    }).join('')

    const html = `<!DOCTYPE html><html><head><title>WeddingBudget Report</title>
    <style>
      body{font-family:Georgia,serif;padding:32px;color:#023047;max-width:1100px;margin:0 auto}
      h1{font-size:30px;color:#023047;border-bottom:3px solid #C9A84C;padding-bottom:10px;margin-bottom:4px}
      h2{font-size:18px;color:#04699b;margin-top:30px;margin-bottom:10px;border-left:4px solid #C9A84C;padding-left:10px}
      .meta{color:#666;font-size:12px;margin-bottom:20px}
      .conf-bar{background:#e5e7eb;border-radius:6px;height:12px;overflow:hidden;margin:6px 0 4px}
      .conf-fill{height:100%;border-radius:6px;background:${conf >= 80 ? '#059669' : conf >= 60 ? '#D97706' : '#DC2626'};width:${conf}%}
      table{width:100%;border-collapse:collapse;margin-top:6px;font-size:13px}
      th{background:#023047;color:white;padding:10px 12px;text-align:left;font-size:12px}
      td{padding:6px 8px;border-bottom:1px solid #e5d8c0}
      tr:hover{background:#faf6ef!important}
      .total-row{background:#023047!important;color:white;font-size:16px;font-weight:bold}
      .total-row td{color:white;padding:12px}
      .summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0}
      .summary-card{text-align:center;padding:16px;border-radius:12px;border:2px solid #C9A84C}
      .summary-card .label{font-size:12px;color:#666;margin-bottom:6px}
      .summary-card .amount{font-size:22px;font-weight:800;color:#023047}
      @media print{body{padding:16px}.summary-grid{display:flex;gap:12px}}
    </style></head><body>
    <h1>🪷 weddingbudget.AI — Wedding Budget Report</h1>
    <div class="meta">
      Wedding Type: <b>${safeType}</b> ·
      City: <b>${safeCity}</b> ·
      Guests: <b>${escapeHTML(String(wedding.total_guests || '—'))}</b> ·
      Date: <b>${safeDate}</b> ·
      Generated: <b>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</b>
    </div>
    <div>AI Confidence: <b style="color:${conf >= 80 ? '#059669' : conf >= 60 ? '#D97706' : '#DC2626'}">${conf}%</b></div>
    <div class="conf-bar"><div class="conf-fill"></div></div>
    <div style="font-size:11px;color:#888;margin-bottom:20px">
      ${conf >= 80 ? 'High confidence — all major details filled in' : conf >= 60 ? 'Medium — complete Decor, Artists & Logistics for higher accuracy' : 'Low — please fill more sections'}
    </div>

    <div class="summary-grid">
      <div class="summary-card"><div class="label">Conservative (Low)</div><div class="amount">${R((budget?.total?.low || 0))}</div></div>
      <div class="summary-card" style="background:#FFF8E8"><div class="label">Most Likely (Mid)</div><div class="amount" style="color:#C9A84C;font-size:28px">${R((budget?.total?.mid || 0))}</div></div>
      <div class="summary-card"><div class="label">Premium (High)</div><div class="amount">${R((budget?.total?.high || 0))}</div></div>
    </div>

    <h2>Detailed Cost Breakdown</h2>
    <table>
      <thead><tr>
        <th>Cost Head / Sub-item</th>
        <th style="text-align:right">Low</th>
        <th style="text-align:right">Mid Estimate</th>
        <th style="text-align:right">High</th>
        <th>Notes · % of Total</th>
      </tr></thead>
      <tbody>${mainRows}
        <tr class="total-row">
          <td>TOTAL ESTIMATE</td>
          <td style="text-align:right">${R((budget?.total?.low || 0))}</td>
          <td style="text-align:right;color:#C9A84C;font-size:18px">${R((budget?.total?.mid || 0))}</td>
          <td style="text-align:right">${R((budget?.total?.high || 0))}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    </body></html>`

    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 600)
  }

  const exportServerPDF = async () => {
    if (!budget) return
    setExporting(true)
    try {
      const res = await fetch(`${API}/budget/export-pdf`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: wedding })
      })
      const blob = await res.blob()
      const isPDF = res.headers.get('content-type')?.includes('pdf')
      const ext = isPDF ? 'pdf' : 'txt'
      const date = new Date().toLocaleDateString('en-IN').replace(/\//g, '-')
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `WeddingBudget_${wedding.wedding_type || 'Wedding'}_${date}.${ext}`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch { alert('Export failed. Make sure backend is running on port 8000.') }
    setExporting(false)
  }



  const pieItems = budget ? Object.entries((budget?.items || {})).map(([name, vals]) => ({
    label: name, value: vals.mid || 0, color: ITEM_COLORS[name] || '#888'
  })).filter(i => i.value > 0) : []

  const C = { primary: '#023047', blue: '#04699b', amber: '#FB8500', light: '#f8f9fa' }

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#059669' : '#DC2626',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          maxWidth: 340, lineHeight: 1.4,
          animation: 'fadeInRight 0.25s ease'
        }}>
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}
      <style>{`@keyframes fadeInRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>

      <div className="section-card" style={{
        textAlign: 'center',
        background: '#ffffff', border: '1px solid #EBEBEB', borderRadius: 16, padding: 24
      }}>
        <div style={{ fontFamily: 'EB Garamond,serif', fontSize: 'clamp(1.4rem,5vw,1.8rem)', fontWeight: 800, marginBottom: 4, color: '#111' }}>
          Wedding Budget Estimator
        </div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>

        </div>
        <button className="btn-primary generate-btn" onClick={calculateBudget} disabled={loading}
          style={{ background: '#111', color: '#fff', border: 'none', fontSize: 'clamp(13px,3.5vw,16px)', whiteSpace: 'nowrap' }}>
          {loading ? ' Calculating...' : ' Generate My Budget'}
        </button>
        {budget && (
          <button
            onClick={handleFinalize}
            disabled={isFinalizing}
            style={{
              marginTop: 12, width: '100%', padding: '13px 0', borderRadius: 10,
              background: finalised ? '#16A34A' : '#111', color: '#fff', border: 'none',
              cursor: isFinalizing ? 'wait' : 'pointer',
              fontWeight: 700, fontSize: 15, transition: 'background 0.3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
            {isFinalizing ? 'Saving...' : finalised ? ' Finalised' : ' Finalise & Submit →'}
          </button>
        )}
      </div>

      {budget && (<>

        <div className="section-card">
          <ConfidenceBar score={(budget?.confidence_score || 0) || 0.72} />
        </div>

        <div className="section-card" style={{
          background: 'linear-gradient(135deg,#1a0828,#B83A64)',
          textAlign: 'center', marginBottom: 14, border: 'none',
          padding: '28px 24px'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 8 }}>
            MOST LIKELY BUDGET
          </div>
          <div style={{
            fontFamily: 'EB Garamond,serif',
            fontSize: 'clamp(2.8rem,6vw,4.5rem)',
            fontWeight: 800, color: '#fff',
            lineHeight: 1, letterSpacing: '-0.04em'
          }}>
            ₹{(displayTotal / 100000).toFixed(1)}L
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
            {formatRupees((budget?.total?.low || 0))} – {formatRupees((budget?.total?.high || 0))} range
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Conservative', sublabel: 'Low estimate', val: (budget?.total?.low || 0), color: '#0D9488', bg: '#F0FDF4' },
            { label: 'Premium', sublabel: 'High estimate', val: (budget?.total?.high || 0), color: '#C2410C', bg: '#FFF7ED' },
          ].map(s => (
            <div key={s.label} className="section-card" style={{
              background: s.bg, textAlign: 'center', margin: 0,
              border: `1px solid ${s.color}30`
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: 1, marginBottom: 4 }}>
                {s.label.toUpperCase()}
              </div>
              <div style={{
                fontFamily: 'EB Garamond,serif', fontSize: 26,
                fontWeight: 800, color: s.color, lineHeight: 1.1
              }}>
                {formatRupees(s.val)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                {s.sublabel}
              </div>
            </div>
          ))}
        </div>

        <div className="section-card" style={{ padding: '20px 16px' }}>
          <div className="section-title">Budget Breakdown</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <PieChart items={pieItems} />
            <div style={{ flex: 1, minWidth: 220, width: '100%' }}>
              {pieItems.map(item => {
                const pct = (budget?.total?.mid || 0) > 0 ? Math.round((item.value / (budget?.total?.mid || 0)) * 100) : 0
                return (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0', borderBottom: '1px solid var(--border)'
                  }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginRight: 6 }}>{pct}%</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: item.color }}>{formatRupees(item?.value || 0)}</div>
                  </div>
                )
              })}
              <div style={{
                display: 'flex', justifyContent: 'flex-end', marginTop: 8,
                fontSize: 13, fontWeight: 800, color: 'var(--primary-dark)', paddingTop: 6,
                borderTop: '2px solid var(--primary)'
              }}>
                TOTAL: {formatRupees((budget?.total?.mid || 0))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
            Hover over the chart for details · Values shown are Mid estimate
          </div>

          <div style={{ height: 1, background: '#F3F4F6', margin: '24px 0 0 0' }} />
          <BudgetBarChart budget={budget} wedding={wedding} tracker={budget_tracker} />
        </div>
        <div className="section-card" style={{ padding: '20px 16px' }}>
          <div className="section-title">Detailed Cost Breakdown</div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
            <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--primary-dark)', color: 'white' }}>
                  {['Cost Head', 'Details', 'Low', 'Mid Estimate', 'High', '% Total'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 10px', textAlign: i >= 2 ? 'right' : 'left',
                      fontWeight: 700, fontSize: 12
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries((budget?.items || {})).map(([name, vals], ri) => {
                  const pct = (budget?.total?.mid || 0) > 0 ? (vals.mid / (budget?.total?.mid || 0) * 100).toFixed(1) : '0'
                  const isOpen = expanded.has(name)
                  const hasSubs = (vals.sub_items || []).length > 0
                  return (<React.Fragment key={name}>
                    <tr style={{
                      background: ri % 2 === 0 ? 'white' : 'var(--ivory)',
                      cursor: hasSubs ? 'pointer' : 'default'
                    }}
                      onClick={() => hasSubs && toggleRow(name)}>
                      <td style={{ padding: '10px 10px', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            display: 'inline-block', width: 10, height: 10,
                            borderRadius: 2, background: ITEM_COLORS[name] || '#888', flexShrink: 0
                          }} />
                          {name}
                          {hasSubs && <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                            {isOpen ? ' ▲' : ' ▼'}
                          </span>}
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px', color: 'var(--muted)', fontSize: 11 }}>{vals.note}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0D9488', fontWeight: 600, fontSize: 12 }}>{formatRupees(vals?.low || 0)}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: 14 }}>{formatRupees(vals?.mid || 0)}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: '#C2410C', fontWeight: 600, fontSize: 12 }}>{formatRupees(vals?.high || 0)}</td>
                      <td style={{
                        padding: '10px 10px', textAlign: 'right', fontWeight: 700,
                        color: parseFloat(pct) > 25 ? '#DC2626' : parseFloat(pct) > 15 ? '#D97706' : 'var(--muted)'
                      }}>
                        {pct}%
                      </td>
                    </tr>
                    {isOpen && (vals.sub_items || []).map((sub, si) => (
                      <tr key={`${name}-sub-${si}`} style={{ background: '#F8F4FF' }}>
                        <td colSpan={1} style={{ padding: '5px 10px 5px 36px', color: '#4B5563', fontSize: 12 }}>
                          · {sub.name}
                        </td>
                        <td />
                        <td style={{ textAlign: 'right', padding: '5px 10px', fontSize: 11, color: '#0D9488' }}>
                          {sub.low ? formatRupees(sub?.low || 0) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#4B5563' }}>
                          {sub.mid ? formatRupees(sub?.mid || 0) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '5px 10px', fontSize: 11, color: '#C2410C' }}>
                          {sub.high ? formatRupees(sub?.high || 0) : '—'}
                        </td>
                        <td />
                      </tr>
                    ))}
                  </React.Fragment>)
                })}
                <tr style={{ background: 'var(--primary-dark)', color: 'white' }}>
                  <td colSpan={2} style={{
                    padding: '14px 12px', fontFamily: 'EB Garamond,serif',
                    fontWeight: 800, fontSize: 17
                  }}>TOTAL ESTIMATE</td>
                  <td style={{
                    textAlign: 'right', padding: '14px 10px', fontFamily: 'EB Garamond,serif',
                    fontWeight: 700, fontSize: 16, color: '#A7F3D0'
                  }}>{formatRupees((budget?.total?.low || 0))}</td>
                  <td style={{
                    textAlign: 'right', padding: '14px 10px', fontFamily: 'EB Garamond,serif',
                    fontWeight: 900, fontSize: 22, color: '#FDE68A'
                  }}>{formatRupees((budget?.total?.mid || 0))}</td>
                  <td style={{
                    textAlign: 'right', padding: '14px 10px', fontFamily: 'EB Garamond,serif',
                    fontWeight: 700, fontSize: 16, color: '#FCA5A5'
                  }}>{formatRupees((budget?.total?.high || 0))}</td>
                  <td style={{ textAlign: 'right', padding: '14px 10px', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card" style={{ border: '2px solid #ffb703' }}>
          <div className="section-title" style={{ color: '#023047' }}>
            AI Budget Optimizer
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Your Target Budget (₹)</label>
              <input className="form-input" type="number"
                min="100000" max="999999999"
                placeholder="e.g. 3000000 (₹30L)"
                value={targetBudget}
                onChange={e => setTargetBudget(Math.abs(parseInt(e.target.value) || 0))} />
            </div>
            <button onClick={optimize} disabled={optimizing || !targetBudget}
              style={{
                padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#ffb703,#fb8500)', color: '#023047',
                fontWeight: 800, fontSize: 15
              }}>
              {optimizing ? 'Running PSO...' : ' Optimize'}
            </button>
          </div>

          {psoResults.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: C.light }}>
                      {['Category', 'Current (₹)', 'Optimised (₹)', 'Savings', 'Action'].map(h => (
                        <th key={h} style={{ padding: '12px 14px', textAlign: h === 'Category' ? 'left' : 'right', fontWeight: 700, color: C.primary, fontSize: 13, borderBottom: `2.5px solid ${C.amber}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {psoResults.map((v, i) => {
                      const savingsAmt = v.original - v.optimized
                      const savingsPct = Math.round((savingsAmt / v.original) * 100)
                      return (
                        <tr key={v.category} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : 'rgba(255,183,3,0.03)' }}>
                          <td style={{ padding: '14px', fontWeight: 600, color: C.primary }}>{v.category}</td>
                          <td style={{ padding: '14px', textAlign: 'right', color: '#64748b' }}>{formatRupees(v.original)}</td>
                          <td style={{ padding: '14px', textAlign: 'right', color: C.blue, fontWeight: 700 }}>{formatRupees(v.optimized)}</td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, background: savingsAmt > 0 ? '#e8faf0' : '#fff1f2', color: savingsAmt > 0 ? '#059669' : '#e11d48', fontWeight: 700 }}>
                              {savingsAmt > 0 ? `-${savingsPct}%` : 'Optimal'}
                            </span>
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApplyOptimization(v.category, v.optimized)}
                              style={{
                                padding: '6px 12px',
                                background: 'linear-gradient(135deg, #FF9B05, #FB8500)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(251,133,0,0.2)'
                              }}
                            >
                              Apply & Edit
                            </motion.button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 24, padding: 18, background: '#f8fafc', borderRadius: 14, border: '1px dashed #cbd5e1' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, marginBottom: 8 }}>How it works</div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
                  The AI Optimizer uses <strong>Particle Swarm Optimization (PSO)</strong> to find the ideal budget allocation based on your wedding size and type.
                  Clicking <strong>'Apply & Edit'</strong> will calculate an optimization ratio for that category, update your global budget model, and take you directly to the relevant tab to review the itemized changes.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="section-card" style={{ borderLeft: '4px solid #4F46E5', background: '#FAFAFA' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#1E1B4B', marginBottom: 6 }}>
                Self-Learning Budget AI
              </div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 8 }}>
                Every time you log what you actually spent, WeddingBudget.AI learns.
              </div>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="section-card">
          <div className="section-title">Export Budget</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={exportServerPDF} disabled={exporting}
              style={{
                padding: '12px 24px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #023047, #04699b)',
                color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer'
              }}>
              {exporting ? 'Generating...' : ' Download Detailed PDF (Server)'}
            </button>
            <button onClick={printPDF}
              style={{
                padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: '#E8F4FA', color: '#023047',
                fontWeight: 700, fontSize: 14
              }}>
              Print / Save as PDF (Local)
            </button>
            <button onClick={() => {
              const budgetData = {
                total: (budget?.total?.mid || 0).toLocaleString('en-IN'),
                rangeMin: (budget?.total?.low || 0).toLocaleString('en-IN'),
                rangeMax: (budget?.total?.high || 0).toLocaleString('en-IN'),
                confidence: Math.round(((budget?.confidence_score || 0) || 0.72) * 100),
                breakdown: {
                  base: (budget?.items?.['Wedding Type Base']?.mid || 0).toLocaleString('en-IN'),
                  events: (budget?.items?.['Events & Ceremonies']?.mid || 0).toLocaleString('en-IN'),
                  venue: (budget?.items?.['Venue']?.mid || 0).toLocaleString('en-IN'),
                  accommodation: (budget?.items?.['Accommodation']?.mid || 0).toLocaleString('en-IN'),
                  food: (budget?.items?.['Food & Beverages']?.mid || 0).toLocaleString('en-IN'),
                  decor: (budget?.items?.['Decor & Design']?.mid || 0).toLocaleString('en-IN'),
                  artists: (budget?.items?.['Artists & Entertainment']?.mid || 0).toLocaleString('en-IN'),
                  logistics: (budget?.items?.['Logistics & Transport']?.mid || 0).toLocaleString('en-IN'),
                  sundries: (budget?.items?.['Sundries & Basics']?.mid || 0).toLocaleString('en-IN'),
                  buffer: (budget?.items?.['Contingency Buffer (8%)']?.mid || 0).toLocaleString('en-IN'),
                }
              };
              window.open(`https://wa.me/?text=${generateWhatsAppText(budgetData)}`, '_blank');
            }} style={{
              padding: '12px 24px', borderRadius: 12, border: 'none',
              cursor: 'pointer', background: '#25D366', color: 'white',
              fontWeight: 700, fontSize: 14
            }}>
              Share on WhatsApp
            </button>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#4a7a94' }}>
            "Print / Save as PDF" includes sub-items and PSO results — works offline.
          </div>
        </div>

        {/* Scenario Comparison */}
        {scenarios && Object.keys(scenarios).length > 0 && (
          <div className="section-card">
            <div className="section-title">Scenario Comparison</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#023047', color: 'white' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>Category</th>
                    {Object.keys(scenarios).map(name => (
                      <th key={name} style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(scenarios.Minimalist?.items || {}).map(cat => (
                    <tr key={cat} style={{ background: cat.indexOf('Contingency') !== -1 ? '#f0f7fc' : 'white' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{cat}</td>
                      {Object.keys(scenarios).map(name => (
                        <td key={name} style={{ padding: '8px 10px', textAlign: 'right' }}>
                          {formatRupees(scenarios[name]?.items?.[cat]?.mid || 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr style={{ background: '#e8f4fa', fontWeight: 800 }}>
                    <td style={{ padding: '12px 10px', fontSize: 15 }}>Total Budget</td>
                    {Object.keys(scenarios).map(name => (
                      <td key={name} style={{ padding: '12px 10px', textAlign: 'right', fontSize: 15, color: '#023047' }}>
                        {formatRupees(scenarios[name]?.total?.mid || 0)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#64748b' }}>
              Compare different wedding scales: Minimalist (60%), Modest (80%), Standard (100%), Luxury (140%)
            </div>
          </div>
        )}

      </>)}

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.4 }}
            style={{
              position: 'fixed', inset: 0, background: '#fff', zIndex: 500,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: 24
            }}>

            {/* Check circle */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: '#D4537E',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M10 20 L17 27 L30 13" stroke="#fff" strokeWidth="3.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ fontWeight: 700, color: '#111', fontSize: 22, marginBottom: 10, textAlign: 'center' }}>
              Info submitted to admin
            </h2>
            <p style={{
              color: '#555', fontSize: 14, textAlign: 'center', maxWidth: 340,
              lineHeight: 1.6, marginBottom: 28
            }}>
              Your wedding budget plan has been sent to your planner.
              They'll review and get back within 24 hours.
            </p>

            {/* Total stat card */}
            {budget && (
              <div style={{
                background: '#FFF0F5', border: '1.5px solid #F9A8C9',
                borderRadius: 14, padding: '18px 32px', textAlign: 'center', marginBottom: 28
              }}>
                <div style={{
                  fontSize: 11, color: '#888', fontWeight: 600,
                  letterSpacing: 1, marginBottom: 6
                }}>TOTAL BUDGET</div>
                <div style={{
                  fontFamily: 'EB Garamond,serif', fontSize: 36,
                  fontWeight: 900, color: '#D4537E', lineHeight: 1
                }}>
                  {formatRupees((budget?.total?.mid || 0))}
                </div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Mid estimate</div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={printPDF}
                style={{
                  padding: '12px 22px', borderRadius: 10, border: '2px solid #D4537E',
                  background: '#D4537E', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer'
                }}>
                Download PDF
              </button>
              <button onClick={() => setSubmitted(false)}
                style={{
                  padding: '12px 22px', borderRadius: 10, border: '2px solid #111',
                  background: 'transparent', color: '#111', fontWeight: 700, fontSize: 14, cursor: 'pointer'
                }}>
                Back to Budget
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
