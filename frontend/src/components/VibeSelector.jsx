import React from 'react'
import { motion } from 'framer-motion'

const VIBE_OPTIONS = [
  {
    id: 'beach',
    tag: 'Beach Weddings',
    tagColor: '#FDF2F2',
    tagTextColor: '#EF4444',
    tagIcon: '☀️',
    imageUrl: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=800&q=80',
    description: 'Sunset pheras, ocean breeze, and an intimate vibe.',
    destinations: ['Goa', 'Gokarna', 'Kerala', 'Andamans'],
  },
  {
    id: 'heritage',
    tag: 'Heritage & Palace',
    tagColor: '#FFFBE6',
    tagTextColor: '#B45309',
    tagIcon: '🏰',
    imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    description: 'Royal venues, grand decor, ceremonies built for scale.',
    destinations: ['Jaipur', 'Udaipur', 'Jodhpur', 'Bikaner'],
  },
  {
    id: 'hill',
    tag: 'Hill Station',
    tagColor: '#ECFDF5',
    tagTextColor: '#059669',
    tagIcon: '⛰️',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description: 'Scenic views, pleasant weather, multi-day celebrations.',
    destinations: ['Coorg', 'Mussoorie', 'Shimla', 'Lonavala'],
  }
]

export default function VibeSelector({ selectedVibe, onSelect }) {
  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 800,
          color: '#111',
          marginBottom: '8px',
          fontFamily: "'DM Sans', sans-serif"
        }}>
          Pick a wedding style, then we shortlist destinations
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#666',
          fontFamily: "'DM Sans', sans-serif"
        }}>
          People choose the vibe first. Destinations come next.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {VIBE_OPTIONS.map((vibe) => (
          <motion.div
            key={vibe.id}
            whileHover={{ y: -8 }}
            onClick={() => onSelect(vibe.id)}
            style={{
              background: '#fff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: selectedVibe === vibe.id ? '2px solid #D4537E' : '1px solid #EBEBEB',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Image Section */}
            <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={vibe.imageUrl}
                alt={vibe.tag}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Content Section */}
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Tag/Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '100px',
                background: vibe.tagColor,
                color: vibe.tagTextColor,
                fontSize: '13px',
                fontWeight: 600,
                width: 'fit-content',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '14px' }}>{vibe.tagIcon}</span>
                {vibe.tag}
              </div>

              {/* Description */}
              <p style={{
                fontSize: '15px',
                color: '#444',
                lineHeight: '1.6',
                marginBottom: '24px',
                fontWeight: 500
              }}>
                {vibe.description}
              </p>

              {/* Popular Destinations */}
              <div style={{
                background: '#F9FAFB',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px'
                }}>
                  Popular destinations
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {vibe.destinations.map((dest) => (
                    <div key={dest} style={{
                      padding: '6px 12px',
                      background: '#fff',
                      borderRadius: '100px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#4B5563',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>📍</span>
                      {dest}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explore Button */}
              <div
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '100px',
                  border: '1px solid #E5E7EB',
                  width: 'fit-content',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#111',
                  transition: 'all 0.2s ease',
                  background: selectedVibe === vibe.id ? '#111' : 'transparent',
                  color: selectedVibe === vibe.id ? '#fff' : '#111',
                  borderColor: selectedVibe === vibe.id ? '#111' : '#E5E7EB'
                }}
              >
                Explore
                <span style={{
                  fontSize: '16px',
                  transition: 'transform 0.2s ease',
                  transform: selectedVibe === vibe.id ? 'translateX(4px)' : 'none'
                }}>→</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
