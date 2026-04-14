import { useState } from 'react'
import { motion } from 'framer-motion'
import { API_BASE } from '../utils/config'

const C = {
  primary: '#023047',
  amber: '#ffb703',
  blue: '#219ebc',
  light: '#e8f4fa',
  sky: '#8ecae6',
  orange: '#fb8500',
  green: '#059669'
}

export default function VendorRegister({ onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    business: '',
    city: '',
    category: 'Artist',
    price_range: '',
    contact: ''
  })
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const categories = ['Artist', 'Venue', 'Decorator', 'Caterer', 'Photographer', 'Other']

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    files.forEach(file => data.append('portfolio', file))

    try {
      const res = await fetch(`${API_BASE}/vendors/register`, {
        method: 'POST',
        body: data
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Registration failed' }))
        throw new Error(errorData.detail || 'Registration failed')
      }
      const result = await res.json()
      setMessage({ type: 'success', text: result.message })
      setFormData({ name: '', business: '', city: '', category: 'Artist', price_range: '', contact: '' })
      setFiles([])
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f4fa 100%)',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: 600,
          margin: '0 auto',
          background: 'white',
          borderRadius: 24,
          padding: '40px',
          boxShadow: '0 20px 50px rgba(2, 48, 71, 0.1)'
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: C.blue,
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
            marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          ← Back to Landing
        </button>

        <h1 style={{ color: C.primary, fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Vendor Registration 💍
        </h1>
        <p style={{ color: '#666', marginBottom: 32 }}>
          Showcase your services to couples planning their dream wedding.
        </p>

        {message && (
          <div style={{
            padding: '16px',
            borderRadius: 12,
            marginBottom: 24,
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? C.green : '#dc2626',
            fontWeight: 600,
            fontSize: 14,
            border: `1px solid ${message.type === 'success' ? C.green : '#dc2626'}40`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                required name="name" value={formData.name} onChange={handleChange}
                placeholder="Your Name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Business Name</label>
              <input
                required name="business" value={formData.business} onChange={handleChange}
                placeholder="e.g. Royal Decorators" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>City</label>
              <input
                required name="city" value={formData.city} onChange={handleChange}
                placeholder="e.g. Mumbai" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                name="category" value={formData.category} onChange={handleChange}
                style={inputStyle}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Price Range (e.g. ₹50k - ₹2L)</label>
            <input
              required name="price_range" value={formData.price_range} onChange={handleChange}
              placeholder="e.g. ₹50,000 - ₹2,00,000" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Contact Info (Phone/Email)</label>
            <input
              required name="contact" value={formData.contact} onChange={handleChange}
              placeholder="e.g. +91 9876543210" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Portfolio Photos (Max 5)</label>
            <input
              type="file" multiple accept="image/*" onChange={handleFileChange}
              style={{
                ...inputStyle,
                padding: '8px'
              }} />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: `linear-gradient(135deg, ${C.primary}, ${C.blue})`,
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 12,
              boxShadow: '0 8px 20px rgba(33, 158, 188, 0.3)'
            }}
          >
            {loading ? 'Submitting...' : 'Register as Vendor'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: C.primary,
  marginBottom: 6
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 10,
  border: `1.5px solid ${C.sky}`,
  fontSize: 14,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  outline: 'none'
}
