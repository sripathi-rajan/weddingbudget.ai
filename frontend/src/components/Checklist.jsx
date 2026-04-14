import React from 'react'
import { motion } from 'framer-motion'

export default function Checklist({ tasks, setTasks, title, subtitle, weddingDate, colorPrimary = 'var(--c-rose)' }) {
  
  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const today = new Date()
  today.setHours(0,0,0,0)

  const calculateDateObj = (monthsBefore) => {
    if (!weddingDate) return null
    const date = new Date(weddingDate)
    const dueDate = new Date(date)
    if (monthsBefore >= 1) {
      dueDate.setMonth(dueDate.getMonth() - monthsBefore)
    } else {
      const daysToSubtract = Math.round(monthsBefore * 30.44)
      dueDate.setDate(dueDate.getDate() - daysToSubtract)
    }
    return dueDate
  }

  const calculateDueDate = (monthsBefore) => {
    const dueDate = calculateDateObj(monthsBefore)
    if (!dueDate) return 'Timeline TBD'
    return dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const completedCount = tasks.filter(t => t.done).length
  const progressPercent = Math.round((completedCount / tasks.length) * 100)

  const TIMELINE_CONFIG = [
    { label: '12 Months Before', months: 12 },
    { label: '10-11 Months Before', months: 10 },
    { label: '8-9 Months Before', months: 8 },
    { label: '6-7 Months Before', months: 6 },
    { label: '4-5 Months Before', months: 4 },
    { label: '3 Months Before', months: 3 },
    { label: '2 Months Before', months: 2 },
    { label: '1 Month Before', months: 1 },
    { label: '2 Weeks Before', months: 0.5 },
    { label: '1 Week Before', months: 0.25 },
  ]

  // Dynamic Grouping
  const getDynamicGroups = () => {
    if (!weddingDate) return TIMELINE_CONFIG.map(g => ({ ...g, tasks: tasks.filter(t => t.months_before === g.months) }))

    const groups = []
    const immediateTasks = []
    
    // Check which groups are already in the past
    TIMELINE_CONFIG.forEach(config => {
      const targetDate = calculateDateObj(config.months)
      const groupTasks = tasks.filter(t => {
        if (config.months === 10) return t.months_before >= 10 && t.months_before < 12
        if (config.months === 8) return t.months_before >= 8 && t.months_before < 10
        if (config.months === 6) return t.months_before >= 6 && t.months_before < 8
        if (config.months === 4) return t.months_before >= 4 && t.months_before < 6
        return t.months_before === config.months
      })

      if (targetDate && targetDate < today) {
        immediateTasks.push(...groupTasks)
      } else {
        if (groupTasks.length > 0) {
          groups.push({ ...config, tasks: groupTasks })
        }
      }
    })

    if (immediateTasks.length > 0) {
      groups.unshift({ label: 'Immediate Priority', months: null, tasks: immediateTasks, isImmediate: true })
    }

    return groups
  }

  const dynamicGroups = getDynamicGroups()

  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-sans)' }}>
      {/* Missing Date Reminder */}
      {!weddingDate && (
        <div style={{ 
          padding: '16px 20px', background: '#FFFBEB', border: '1.5px solid #FEF3C7', 
          borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 15 
        }}>
          <span style={{ fontSize: 24 }}>📅</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#92400E', fontSize: 14 }}>Wedding date not set</div>
            <div style={{ fontSize: 12, color: '#B45309', marginTop: 2 }}>
              Set your date in the <strong>Style</strong> tab to unlock your personalized planning timeline.
            </div>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('weddingGoToTab', { detail: 0 }))}
            style={{ 
              padding: '8px 16px', borderRadius: 10, background: '#92400E', color: 'white', 
              border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' 
            }}
          >
            Set Date →
          </button>
        </div>
      )}

      <div className="section-card" style={{ 
        marginBottom: 32, 
        background: `linear-gradient(135deg, ${colorPrimary}, ${colorPrimary}CC)`, 
        color: 'white',
        border: 'none',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontFamily: 'var(--font-serif)', color: 'white' }}>{title}</h2>
            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: 14 }}>{subtitle}</p>
          </div>
          <div style={{ textAlign: 'right', minWidth: 120 }}>
            <div style={{ fontSize: 32, fontWeight: 800 }}>{progressPercent}%</div>
            <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: 1 }}>{completedCount}/{tasks.length} DONE</div>
          </div>
        </div>
        <div style={{ 
          height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 10, marginTop: 24, overflow: 'hidden'
        }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: 'white' }} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {dynamicGroups.map(group => {
          if (group.tasks.length === 0) return null
          
          return (
            <div key={group.label}>
              <h3 className="section-title" style={{ 
                borderBottom: `2px solid ${group.isImmediate ? 'var(--c-rose-border)' : '#EBEBEB'}`, 
                paddingBottom: 10, marginBottom: 16, 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 18,
                color: group.isImmediate ? 'var(--c-rose)' : '#111'
              }}>
                {group.isImmediate ? '🚨 ' : ''}{group.label}
                <span style={{ 
                  fontSize: 11, fontWeight: 700, 
                  color: group.isImmediate ? 'white' : colorPrimary, 
                  background: group.isImmediate ? 'var(--c-rose)' : 'white', 
                  border: `1.5px solid ${group.isImmediate ? 'var(--c-rose)' : colorPrimary + '33'}`,
                  padding: '4px 12px', borderRadius: 20,
                }}>
                   {group.isImmediate ? 'ASAP / OVERDUE' : calculateDueDate(group.months)}
                </span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {group.tasks.map(t => (
                  <motion.div 
                    whileHover={{ scale: 1.005, x: 2 }}
                    whileTap={{ scale: 0.995 }}
                    key={t.id} 
                    onClick={() => toggleTask(t.id)}
                    style={{ 
                      padding: '14px 18px', borderRadius: 14, border: `1.5px solid ${group.isImmediate && !t.done ? 'var(--c-rose-border)' : '#EBEBEB'}`,
                      background: t.done ? 'rgba(0,0,0,0.02)' : 'white',
                      display: 'flex', alignItems: 'center', gap: 16,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ 
                      width: 22, height: 22, borderRadius: 6, 
                      border: `2px solid ${t.done ? '#059669' : group.isImmediate ? 'var(--c-rose)' : '#EBEBEB'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: t.done ? '#059669' : 'transparent',
                      color: 'white', fontSize: 13, flexShrink: 0
                    }}>
                      {t.done && '✓'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: 600, fontSize: 15, color: t.done ? '#888' : '#111',
                        textDecoration: t.done ? 'line-through' : 'none',
                      }}>
                        {t.task}
                      </div>
                      <div style={{ 
                        fontSize: 11, color: '#666', marginTop: 2, 
                        fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' 
                      }}>
                        {t.category}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
