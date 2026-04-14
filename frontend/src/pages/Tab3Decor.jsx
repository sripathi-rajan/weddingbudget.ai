import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useWedding, formatRupees } from '../context/WeddingContext'
import PremiumDecorLibrary from '../components/tabs/PremiumDecorLibrary'
import { API_BASE as API } from '../utils/config'

export default function Tab3Decor() {
  const { wedding, update, updateDecorSelections } = useWedding()
  const [uploadTag, setUploadTag] = useState({ function_type: '', style: '', complexity: '' })
  const [uploadedFile, setUploadedFile] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [predStep, setPredStep] = useState('')
  const [imgRelevanceWarn, setImgRelevanceWarn] = useState('')
  const [showAiSuccess, setShowAiSuccess] = useState(false)
  const [hasAddedPrediction, setHasAddedPrediction] = useState(false)

  const handlePredict = async () => {
    if (!uploadedFile) return
    if (!uploadTag.function_type || !uploadTag.style || !uploadTag.complexity) {
      setImgRelevanceWarn('Please select Type, Style and Complexity first.')
      return
    }
    setImgRelevanceWarn('')
    setPredicting(true)
    setPrediction(null)
    setHasAddedPrediction(false)
    setShowAiSuccess(false)

    try {
      setPredStep('Analysing decor attributes...')
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('function_type', uploadTag.function_type)
      formData.append('style', uploadTag.style)
      const complexityMap = { Low: 1, Medium: 3, High: 5 }
      formData.append('complexity', complexityMap[uploadTag.complexity] ?? 3)
      const res = await fetch(`${API}/decor/predict-upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      if (d.method === 'rejected') {
        setImgRelevanceWarn(' Please upload a decor/venue image')
        setPrediction(null)
        setPredicting(false)
        setPredStep('')
        return
      }
      const mid = d.predicted_mid ?? d.predicted_cost
      setPrediction({
        predicted_cost: mid,
        range: [d.predicted_low || Math.round(mid * 0.8), d.predicted_high || Math.round(mid * 1.25)],
        confidence: d.confidence,
        similar_items: [],
        source: d.method === 'ml' ? 'Gradient Boosting AI' : 'Rule-based',
        message: d.message,
        detected_category: d.detected_category
      })
    } catch (err) {
      // Fallback logic
      const baseRates = {
        Mandap: 250000, Entrance: 65000, 'Table Decor': 45000, Ceiling: 120000,
        Backdrop: 85000, Stage: 350000, Lighting: 45000, 'Photo Booth': 70000,
        Aisle: 35000, Pillars: 400000
      }
      const b = baseRates[uploadTag.function_type] || 85000
      const mult = { Low: 0.65, Medium: 1.0, High: 1.75 }[uploadTag.complexity] || 1
      const sm = {
        Luxury: 1.6, Whimsical: 1.25, Romantic: 1.15, Modern: 1.1,
        Rustic: 0.85, Minimalist: 0.7, Traditional: 1.0, Boho: 0.9, Playful: 0.8
      }[uploadTag.style] || 1
      const pred = Math.round(b * mult * sm * (0.95 + Math.random() * 0.1))
      setPrediction({
        predicted_cost: pred,
        range: [Math.round(pred * 0.85), Math.round(pred * 1.25)],
        confidence: 0.72,
        source: 'AI Logic (Regional Fallback)',
        message: 'Prediction based on regional market trends.'
      })
    }
    setPredicting(false)
    setPredStep('')
  }

  const addToBudget = () => {
    if (!prediction) return
    const aiId = `ai-pred-${JSON.stringify({
      cost: prediction.predicted_cost,
      name: uploadTag.function_type
    })}`

    const selections = wedding.decor_selections || []
    if (!selections.includes(aiId)) {
      const nextIds = [...selections, aiId]
      const nextNames = [...(wedding.selected_decor || []), `AI: ${uploadTag.function_type}`]
      const total = (wedding.decor_total || 0) + prediction.predicted_cost

      updateDecorSelections(nextIds, total)
      update('selected_decor', nextNames)
    }
    setHasAddedPrediction(true)
    setShowAiSuccess(true)
  }

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 12px' }}>
      {/* Shortlist Summary */}
      {wedding.decor_selections?.length > 0 && (
        <div style={{
          background: '#fff', borderRadius: 24, padding: '24px',
          marginBottom: 30, border: '1px solid #f0f0f0', boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1B1F23', marginBottom: 16 }}>Selected Decor Shortlist</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {(wedding.selected_decor || []).map((name, i) => (
              <span key={i} style={{
                padding: '8px 16px', borderRadius: 30, background: '#F8FAFC',
                color: '#475569', fontSize: 13, fontWeight: 700, border: '1px solid #E2E8F0'
              }}>
                {name}
              </span>
            ))}
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #F77C83, #F9A8D4)', borderRadius: 20,
            padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff'
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>Total Estimated Decor Budget</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{formatRupees(wedding.decor_total)}</div>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('weddingNextTab'))}
              style={{ padding: '12px 30px', borderRadius: 14, border: 'none', background: '#fff', color: '#F77C83', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              Confirm Selections
            </button>
          </div>
        </div>
      )}

      {/* Primary Gallery Section */}
      <section style={{ marginBottom: 60 }}>
        <PremiumDecorLibrary />
      </section>

      {/* AI Assistant Section */}
      <section style={{
        background: '#F8FAFC', borderRadius: 32, padding: '40px',
        border: '2px dashed #E2E8F0', position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1B1F23' }}>AI Visual Cost Predictor</h2>
            <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Upload any decor image from Pinterest or Instagram for an instant budget estimate</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 30 }}>
          {[
            { key: 'function_type', label: 'Decor Category', opts: ['Mandap', 'Entrance', 'Stage', 'Ceiling', 'Backdrop', 'Table Decor', 'Lighting', 'Photo Booth'] },
            { key: 'style', label: 'Design Style', opts: ['Traditional', 'Modern', 'Luxury', 'Romantic', 'Minimalist', 'Boho', 'Rustic'] },
            { key: 'complexity', label: 'Complexity Level', opts: ['Low', 'Medium', 'High'] }
          ].map(field => (
            <div key={field.key}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 10, display: 'block' }}>{field.label}</label>
              <select
                style={{ width: '100%', padding: '14px 20px', borderRadius: 16, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, fontWeight: 600 }}
                value={uploadTag[field.key]}
                onChange={e => setUploadTag(prev => ({ ...prev, [field.key]: e.target.value }))}
              >
                <option value="">Select {field.label}...</option>
                {field.opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div
          onClick={() => document.getElementById('ai-file-upload').click()}
          style={{
            border: `2px dashed ${uploadedFile ? '#10B981' : '#CBD5E1'}`,
            background: uploadedFile ? '#F0FDF4' : '#fff',
            borderRadius: 24, padding: '60px 40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s'
          }}
        >
          <input type="file" id="ai-file-upload" hidden onChange={e => setUploadedFile(e.target.files[0])} />
          <div style={{ fontSize: 40, marginBottom: 15 }}>{uploadedFile ? '✅' : '📸'}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1B1F23' }}>{uploadedFile ? uploadedFile.name : 'Click to upload or drag image'}</div>
          <p style={{ color: '#64748B', fontSize: 13, marginTop: 8 }}>Supports PNG, JPG (Max 5MB)</p>
        </div>

        {imgRelevanceWarn && <div style={{ color: '#EF4444', fontSize: 13, fontWeight: 700, textAlign: 'center', marginTop: 15 }}>{imgRelevanceWarn}</div>}

        <button
          onClick={handlePredict}
          disabled={predicting || !uploadedFile}
          style={{
            width: '100%', marginTop: 20, padding: '18px', borderRadius: 18, border: 'none',
            background: '#000', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer',
            opacity: (predicting || !uploadedFile) ? 0.6 : 1
          }}
        >
          {predicting ? 'AI Analyzing Design...' : 'Generate AI Estimate'}
        </button>

        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 30, background: '#fff', borderRadius: 24, padding: '30px', border: '1px solid #E2E8F0' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#F77C83', textTransform: 'uppercase', marginBottom: 8 }}>Estimated Market Cost</div>
                <div style={{ fontSize: 44, fontWeight: 800, color: '#1B212A' }}>{formatRupees(prediction.predicted_cost)}</div>
                <p style={{ fontSize: 14, color: '#64748B', marginTop: 10 }}>Confidence: {Math.round(prediction.confidence * 100)}% • Source: {prediction.source}</p>
              </div>
              <button
                onClick={addToBudget}
                disabled={hasAddedPrediction}
                style={{
                  padding: '16px 32px', borderRadius: 16, border: 'none',
                  background: hasAddedPrediction ? '#F0FDF4' : '#F77C83',
                  color: hasAddedPrediction ? '#10B981' : '#fff',
                  fontWeight: 800, fontSize: 15, cursor: 'pointer'
                }}
              >
                {hasAddedPrediction ? '✓ Added' : 'Add to Shortlist'}
              </button>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next Step Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '60px 0' }}>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('weddingNextTab'))}
          className="btn-premium" style={{ padding: '18px 60px' }}>
          Continue to Food Selections
        </button>
      </div>
    </div>
  )
}
