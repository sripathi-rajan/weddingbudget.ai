import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWedding } from '../context/WeddingContext'

const INITIAL_TASKS = [
  // PHASE 1 (12+ months before)
  { id: 1, phase: 1, months_before: 12, task: "Set wedding date and budget", done: false },
  { id: 2, phase: 1, months_before: 12, task: "Book wedding venue", done: false },
  { id: 3, phase: 1, months_before: 12, task: "Shortlist and book photographer", done: false },
  { id: 4, phase: 1, months_before: 12, task: "Create initial guest list", done: false },
  { id: 5, phase: 1, months_before: 12, task: "Book destination if applicable", done: false },
  { id: 6, phase: 1, months_before: 12, task: "Research wedding themes", done: false },
  { id: 7, phase: 1, months_before: 12, task: "Finalize wedding planner", done: false },
  { id: 8, phase: 1, months_before: 12, task: "Choose wedding party (Maid of Honor, Best Man, etc.)", done: false },

  // PHASE 2 (9-12 months)
  { id: 9, phase: 2, months_before: 10, task: "Book catering company", done: false },
  { id: 10, phase: 2, months_before: 10, task: "Book decorator", done: false },
  { id: 11, phase: 2, months_before: 10, task: "Book main artist/entertainer", done: false },
  { id: 12, phase: 2, months_before: 9, task: "Send save the dates", done: false },
  { id: 13, phase: 2, months_before: 9, task: "Book accommodation for outstation guests", done: false },
  { id: 14, phase: 2, months_before: 9, task: "Start wedding dress/outfit shopping", done: false },
  { id: 15, phase: 2, months_before: 9, task: "Hire videographer", done: false },
  { id: 16, phase: 2, months_before: 9, task: "Research wedding insurance", done: false },

  // PHASE 3 (6-9 months)
  { id: 17, phase: 3, months_before: 8, task: "Finalize guest list", done: false },
  { id: 18, phase: 3, months_before: 7, task: "Book DJ/band", done: false },
  { id: 19, phase: 3, months_before: 7, task: "Order wedding outfits", done: false },
  { id: 20, phase: 3, months_before: 7, task: "Plan honeymoon", done: false },
  { id: 21, phase: 3, months_before: 6, task: "Book hair and makeup artist", done: false },
  { id: 22, phase: 3, months_before: 6, task: "Book wedding cake", done: false },
  { id: 23, phase: 3, months_before: 6, task: "Buy wedding rings", done: false },
  { id: 24, phase: 3, months_before: 6, task: "Determine rental needs (chairs, linens, etc.)", done: false },

  // PHASE 4 (3-6 months)
  { id: 25, phase: 4, months_before: 5, task: "Send formal invitations", done: false },
  { id: 26, phase: 4, months_before: 4, task: "Confirm all vendor bookings", done: false },
  { id: 27, phase: 4, months_before: 4, task: "Plan wedding menu", done: false },
  { id: 28, phase: 4, months_before: 3, task: "Book florist", done: false },
  { id: 29, phase: 4, months_before: 3, task: "Arrange logistics (cars, horses, dhol)", done: false },
  { id: 30, phase: 4, months_before: 3, task: "Purchase wedding party gifts", done: false },
  { id: 31, phase: 4, months_before: 3, task: "Finalize religious/ceremony details", done: false },
  { id: 32, phase: 4, months_before: 3, task: "Write wedding vows", done: false },

  // PHASE 5 (1-3 months)
  { id: 33, phase: 5, months_before: 2, task: "Final outfit fittings", done: false },
  { id: 34, phase: 5, months_before: 2, task: "Confirm guest RSVPs", done: false },
  { id: 35, phase: 5, months_before: 2, task: "Create seating plan", done: false },
  { id: 36, phase: 5, months_before: 1, task: "Confirm ceremony schedule", done: false },
  { id: 37, phase: 5, months_before: 1, task: "Prepare vendor payment schedule", done: false },
  { id: 38, phase: 5, months_before: 1, task: "Apply for marriage license", done: false },
  { id: 39, phase: 5, months_before: 1, task: "Schedule rehearsal", done: false },
  { id: 40, phase: 5, months_before: 1, task: "Finalize 'shot list' with photographer", done: false },
  { id: 41, phase: 5, months_before: 1, task: "Arrange trial for hair and makeup", done: false },
  { id: 42, phase: 5, months_before: 1, task: "Pick up wedding rings", done: false },

  // PHASE 6 (Final week)
  { id: 43, phase: 6, months_before: 0.25, task: "Confirm all vendors one last time", done: false },
  { id: 44, phase: 6, months_before: 0.25, task: "Prepare vendor payments", done: false },
  { id: 45, phase: 6, months_before: 0.25, task: "Pack for honeymoon", done: false },
  { id: 46, phase: 6, months_before: 0.1, task: "Delegate day-of responsibilities", done: false },
  { id: 47, phase: 6, months_before: 0.1, task: "Hand over day-of details to coordinator", done: false },
  { id: 48, phase: 6, months_before: 0.1, task: "Final head count to caterer", done: false },
  { id: 49, phase: 6, months_before: 0.05, task: "Relax and enjoy!", done: false },
  { id: 50, phase: 6, months_before: 0, task: "GET MARRIED!", done: false },
];

const PHASES = [
  { id: 1, title: "PHASE 1", subtitle: "12+ months before" },
  { id: 2, title: "PHASE 2", subtitle: "9-12 months" },
  { id: 3, title: "PHASE 3", subtitle: "6-9 months" },
  { id: 4, title: "PHASE 4", subtitle: "3-6 months" },
  { id: 5, title: "PHASE 5", subtitle: "1-3 months" },
  { id: 6, title: "PHASE 6", subtitle: "Final week" },
];

export default function TabChecklist() {
  const { wedding } = useWedding()
  const [filter, setFilter] = useState('All') // All, Pending, Done, Overdue

  // Local Storage Key based on wedding date
  const storageKey = `checklist_${wedding.wedding_date || 'default'}`
  
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : INITIAL_TASKS
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks))
  }, [tasks, storageKey])

  const today = new Date()
  today.setHours(0,0,0,0)

  const calculateDueDate = (monthsBefore) => {
    if (!wedding.wedding_date) return null
    const date = new Date(wedding.wedding_date)
    const dueDate = new Date(date)
    if (monthsBefore >= 1) {
      dueDate.setMonth(dueDate.getMonth() - monthsBefore)
    } else {
      const daysToSubtract = Math.round(monthsBefore * 30.44)
      dueDate.setDate(dueDate.getDate() - daysToSubtract)
    }
    return dueDate
  }

  const getTaskStatus = (task) => {
    const dueDate = calculateDueDate(task.months_before)
    if (!dueDate) return { overdue: false, daysRemaining: null }
    
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return {
      overdue: diffDays < 0 && !task.done,
      daysRemaining: diffDays
    }
  }

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filter === 'All') return true
      if (filter === 'Pending') return !t.done
      if (filter === 'Done') return t.done
      if (filter === 'Overdue') {
        const { overdue } = getTaskStatus(t)
        return overdue
      }
      return true
    })
  }, [tasks, filter, wedding.wedding_date])

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter(t => t.done).length
    const overdue = tasks.filter(t => getTaskStatus(t).overdue).length
    const percent = Math.round((done / total) * 100)
    return { total, done, overdue, percent }
  }, [tasks, wedding.wedding_date])

  const getPhaseStats = (phaseId) => {
    const phaseTasks = tasks.filter(t => t.phase === phaseId)
    const completed = phaseTasks.filter(t => t.done).length
    return { total: phaseTasks.length, completed }
  }

  return (
    <div className="tab-container" style={{ maxWidth: 1300, margin: '0 auto', padding: '12px' }}>
      
      {/* Header & Progress */}
      <div style={{ 
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', 
        borderRadius: 24, padding: 32, color: 'white', marginBottom: 32,
        boxShadow: '0 20px 40px rgba(79, 70, 229, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontFamily: 'var(--font-serif)' }}>Wedding Checklist</h1>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>{stats.done} of {stats.total} tasks complete</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{stats.percent}%</div>
            <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: 1, marginTop: 4 }}>PLANNING PROGRESS</div>
          </div>
        </div>
        <div style={{ height: 10, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ height: '100%', background: 'white', borderRadius: 10 }} 
          />
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', gap: 12, marginBottom: 32, overflowX: 'auto', paddingBottom: 8,
        scrollbarWidth: 'none'
      }}>
        {['All', 'Pending', 'Done', 'Overdue'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '10px 20px', borderRadius: 12, border: 'none',
              background: filter === f ? '#4F46E5' : 'white',
              color: filter === f ? 'white' : '#64748b',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              boxShadow: filter === f ? '0 4px 12px rgba(79, 70, 229, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            {f} {f === 'Overdue' && stats.overdue > 0 && `(${stats.overdue})`}
          </button>
        ))}
      </div>

      {/* Phases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {PHASES.map(phase => {
          const pTasks = filteredTasks.filter(t => t.phase === phase.id)
          if (pTasks.length === 0 && filter !== 'All') return null
          
          const pStats = getPhaseStats(phase.id)
          const isPhaseDone = pStats.completed === pStats.total

          return (
            <div key={phase.id}>
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                marginBottom: 20, borderBottom: '2px solid #f1f5f9', paddingBottom: 12
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, color: '#1e293b', fontWeight: 800 }}>{phase.title}</h2>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{phase.subtitle}</p>
                </div>
                <div style={{ 
                  background: isPhaseDone ? '#ecfdf5' : '#f1f5f9', 
                  color: isPhaseDone ? '#059669' : '#64748b',
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700
                }}>
                  {pStats.completed} / {pStats.total} DONE
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {pTasks.length > 0 ? pTasks.map(task => {
                  const { overdue, daysRemaining } = getTaskStatus(task)
                  
                  return (
                    <motion.div
                      layout
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      whileHover={{ x: 4 }}
                      style={{
                        padding: '16px 20px', borderRadius: 16, border: '1.5px solid',
                        borderColor: overdue ? '#fee2e2' : task.done ? '#f1f5f9' : '#f1f5f9',
                        background: overdue ? '#fffafb' : task.done ? '#f8fafc' : 'white',
                        display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: 8,
                        border: '2px solid',
                        borderColor: task.done ? '#059669' : overdue ? '#ef4444' : '#cbd5e1',
                        background: task.done ? '#059669' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', flexShrink: 0
                      }}>
                        {task.done && '✓'}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: 15, fontWeight: 600, 
                          color: task.done ? '#94a3b8' : '#1e293b',
                          textDecoration: task.done ? 'line-through' : 'none'
                        }}>
                          {task.task}
                        </div>
                        {wedding.wedding_date && !task.done && (
                          <div style={{ 
                            fontSize: 11, marginTop: 4, fontWeight: 700,
                            color: overdue ? '#ef4444' : '#64748b',
                            textTransform: 'uppercase', letterSpacing: '0.4px'
                          }}>
                            {overdue ? '⚠ Overdue' : daysRemaining === 0 ? 'Due Today' : `${daysRemaining} days remaining`}
                          </div>
                        )}
                      </div>

                      {wedding.wedding_date && (
                        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
                          {calculateDueDate(task.months_before).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </motion.div>
                  )
                }) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                    No tasks found in this filter.
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!wedding.wedding_date && (
        <div style={{ 
          marginTop: 40, padding: 24, background: '#fef2f2', borderRadius: 20, 
          textAlign: 'center', border: '1px solid #fee2e2' 
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📅</div>
          <div style={{ fontWeight: 700, color: '#991b1b' }}>Wedding Date Not Set</div>
          <p style={{ fontSize: 13, color: '#b91c1c', margin: '4px 0 16px' }}>
            Set your wedding date in the first tab to see personalized due dates and countdowns.
          </p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('weddingGoToTab', { detail: 0 }))}
            style={{ 
              padding: '10px 20px', background: '#991b1b', color: 'white', border: 'none',
              borderRadius: 10, fontWeight: 700, cursor: 'pointer'
            }}
          >
            Set Date Now
          </button>
        </div>
      )}

      <div style={{ marginTop: 60, textAlign: 'center', opacity: 0.5, fontSize: 12 }}>
        Your progress is saved automatically to this browser.
      </div>

    </div>
  )
}
