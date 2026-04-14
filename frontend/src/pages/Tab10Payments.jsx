import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWedding, formatRupees } from '../context/WeddingContext'
import { API_BASE as API } from '../utils/config'

export default function Tab10Payments() {
  const { wedding } = useWedding()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const [payModal, setPayModal] = useState(null) // vendor object
  const [successAnim, setSuccessAnim] = useState(false)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${API}/payments/`)
        if (res.ok) {
          const data = await res.json()
          setPayments(data)
        }
      } catch (err) {
        console.error("Failed to fetch payments", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  const handleMockPay = (vendor) => {
    setSuccessAnim(true)
    setTimeout(() => {
      setSuccessAnim(false)
      setPayModal(null)
      // In a real app, we'd call the backend here. For now, we just show success.
      alert(`Payment of ${formatRupees(vendor.total_cost - vendor.paid)} to ${vendor.vendor} initiated successfully!`)
    }, 2400)
  }

  const totalBudget = wedding.budget_result?.total?.mid || 0
  const totalCommitted = payments.reduce((sum, p) => sum + p.total_cost, 0)
  const totalPaid = payments.reduce((sum, p) => sum + p.paid, 0)
  const remaining = totalBudget - totalPaid

  const stats = [
    { label: 'Total Budget', val: totalBudget, color: '#023047', bg: '#f0f4f8' },
    { label: 'Total Committed', val: totalCommitted, color: '#219ebc', bg: '#e8f7fa' },
    { label: 'Total Paid', val: totalPaid, color: '#059669', bg: '#f0fdf4' },
    { label: 'Remaining', val: remaining, color: '#fb8500', bg: '#fff7ed' },
  ]

  return (
    <div className="tab-container" style={{ maxWidth: 1300, margin: '0 auto', position: 'relative' }}>

      {/* Payment Modal */}
      <AnimatePresence>
        {payModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(2, 48, 71, 0.7)',
            backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 20
          }} onClick={() => !successAnim && setPayModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                background: 'white', borderRadius: 32, width: '100%', maxWidth: 440,
                padding: 40, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                position: 'relative', overflow: 'hidden'
              }}
              onClick={e => e.stopPropagation()}
            >
              {successAnim ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ fontSize: 80, marginBottom: 20 }}
                  >

                  </motion.div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: '#023047' }}>Processing Payment...</h3>
                  <p style={{ color: '#64748b', marginTop: 8 }}>Secure transmission to {payModal.vendor}</p>
                  <div style={{ marginTop: 30, height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                      style={{ height: '100%', background: '#059669' }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div>
                      <h3 style={{ fontSize: 22, fontWeight: 800, color: '#023047' }}>Settle Balance</h3>
                      <p style={{ color: '#64748b', fontSize: 14 }}>Paying {payModal.vendor}</p>
                    </div>
                    <button
                      onClick={() => setPayModal(null)}
                      style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 16, cursor: 'pointer', fontWeight: 800 }}
                    >×</button>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 20, borderRadius: 20, marginBottom: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Amount Due</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#023047' }}>{formatRupees(payModal.total_cost - payModal.paid)}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { id: 'upi', name: 'UPI (GPay / PhonePe / Paytm)', icon: '📱' },
                      { id: 'bank', name: 'Net Banking / NEFT', icon: '🏛️' },
                      { id: 'card', name: 'Credit / Debit Card', icon: '💳' },
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => handleMockPay(payModal)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                          borderRadius: 16, border: '1.5px solid #e2e8f0', background: 'white',
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#219ebc'; e.currentTarget.style.background = '#f0f9ff' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white' }}
                      >
                        <span style={{ fontSize: 24 }}>{method.icon}</span>
                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{method.name}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                    🔒 Secured by 256-bit SSL Encryption
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="section-card" style={{
        textAlign: 'center',
        padding: '40px 24px',
        background: 'linear-gradient(135deg, #023047 0%, #04699b 100%)',
        color: 'white',
        border: 'none',
        borderRadius: 24,
        marginBottom: 32,
        boxShadow: '0 10px 25px rgba(2, 48, 71, 0.15)'
      }}>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: 'EB Garamond, serif', fontSize: '2.5rem', marginBottom: 8, fontWeight: 800 }}
        >
          Vendor Payment Tracker
        </motion.h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
          Real-time status of your wedding contracts and settlements
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20,
        marginBottom: 32
      }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            className="section-card"
            style={{
              background: '#fff',
              border: `1px solid #edf2f7`,
              textAlign: 'center',
              margin: 0,
              padding: 24,
              borderRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 4,
              height: '100%',
              background: s.color
            }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'EB Garamond, serif', fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>
              {formatRupees(s.val)}
            </div>
            {s.label === 'Remaining' && totalBudget > 0 && (
              <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
                {Math.round((remaining / totalBudget) * 100)}% of budget left
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="section-card" style={{
        padding: 0,
        overflow: 'hidden',
        borderRadius: 24,
        border: '1px solid #edf2f7',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          padding: '24px 32px',
          background: '#fff',
          borderBottom: '1px solid #edf2f7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#1e293b' }}>Settlement Summary</span>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{payments.length} Contracts</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                {['Vendor & Service', 'Due Date', 'Total Cost', 'Paid', 'Action'].map(h => (
                  <th key={h} style={{ padding: '16px 32px', fontWeight: 700, color: '#475569', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                  <div className="loader" style={{ marginBottom: 12 }}>⌛</div>
                  Loading your payment data...
                </td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: 80, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📑</div>
                  <div style={{ color: '#1e293b', fontWeight: 700, fontSize: 16 }}>No payments logged yet</div>
                  <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Once your administrator logs vendor contracts, they will appear here.</div>
                </td></tr>
              ) : (
                payments.map((p, i) => {
                  const pending = p.total_cost - p.paid
                  const isFullyPaid = pending <= 0
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        background: i % 2 === 0 ? 'white' : '#fcfdfe',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <td style={{ padding: '20px 32px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>{p.vendor}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{p.service}</div>
                      </td>
                      <td style={{ padding: '20px 32px', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14 }}>📅</span> {p.due_date || 'TBD'}
                        </div>
                      </td>
                      <td style={{ padding: '20px 32px', fontWeight: 600, color: '#1e293b' }}>{formatRupees(p.total_cost)}</td>
                      <td style={{ padding: '20px 32px' }}>
                        <div style={{ color: '#059669', fontWeight: 700, fontSize: 13 }}>Paid: {formatRupees(p.paid)}</div>
                        <div style={{ color: isFullyPaid ? '#059669' : '#dc2626', fontSize: 11, marginTop: 2 }}>
                          {isFullyPaid ? 'Settled ✓' : `Due: ${formatRupees(pending)}`}
                        </div>
                      </td>
                      <td style={{ padding: '20px 32px' }}>
                        {!isFullyPaid ? (
                          <button
                            onClick={() => setPayModal(p)}
                            style={{
                              padding: '8px 16px', borderRadius: 10, background: '#023047', color: 'white',
                              border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                              boxShadow: '0 4px 10px rgba(2, 48, 71, 0.2)'
                            }}
                          >
                            Pay Now →
                          </button>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 700, fontSize: 12 }}>Settled ✓</span>
                        )}
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{
        marginTop: 40,
        padding: 24,
        background: '#f8fafc',
        borderRadius: 20,
        textAlign: 'center',
        border: '1px dashed #e2e8f0'
      }}>
        <div style={{ fontSize: 14, color: '#64748b' }}>
          <strong>Payment Method Support:</strong> We currently support UPI, Bank Transfer, and all major Credit/Debit Cards for vendor settlements.
        </div>
      </div>
    </div>
  )
}
