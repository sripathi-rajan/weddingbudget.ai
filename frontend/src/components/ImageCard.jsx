import { useState } from 'react'
import { formatRupees } from '../context/WeddingContext'

export function ImageCard({
  item,
  selected,
  onClick,
  showCost = false,
  hasAnySelected = false,
  badge = '',
  location = '',
  capacity = '',
  capacityLabel = 'Capacity',
  budget = '',
  actionLabel = 'View Price & Details'
}) {
  const [imgError, setImgError] = useState(false)
  const fallbackBg = item.fallbackColor || '#f8f9fa'

  // Determine display values
  const displayLabel = item.label || item.name || item.business || ''
  const displayLocation = location || item.area || item.city || ''
  const displayBadge = badge || item.category || (item.id && !item.label ? 'OPTION' : '')
  const displayCapacity = capacity || (item.capacity ? `${item.capacity} pax` : '')
  const displayBudget = budget || item.cost || item.price_range || (item.cost_per_day ? `From ${formatRupees(item.cost_per_day)}` : '')
  const displayImg = item.imageUrl || item.image_url || ''

  return (
    <div
      className={`premium-image-card ${selected ? 'selected' : ''} ${hasAnySelected && !selected ? 'dimmed' : ''}`}
      onClick={() => onClick(item.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        border: selected ? '2px solid #F77C83' : '1px solid #F3F4F6',
        boxShadow: selected ? '0 12px 30px rgba(247,124,131,0.15)' : '0 10px 30px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        height: '100%',
        padding: '12px'
      }}
    >
      {/* Image Section */}
      <div style={{ 
        position: 'relative', 
        height: '180px', 
        overflow: 'hidden', 
        background: fallbackBg,
        borderRadius: '16px',
        marginBottom: '16px'
      }}>
        {!displayImg || imgError ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              background: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)'
            }}
          >
            {item.emoji || '✨'}
          </div>
        ) : (
          <img
            src={displayImg}
            alt={displayLabel}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s ease'
            }}
            className="card-main-img"
          />
        )}

        {/* Selection Checkmark */}
        {selected && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#F77C83',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 800,
              boxShadow: '0 4px 15px rgba(247,124,131,0.4)',
              zIndex: 3,
              animation: 'checkSpring 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards'
            }}
          >
            ✓
          </div>
        )}
      </div>

      {/* Content Section */}
      <div style={{ padding: '0 4px 8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title & Badge Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#1E293B',
            margin: 0,
            lineHeight: 1.2,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            minHeight: '66px', // Space for exactly 3 lines to keep all cards aligned
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {displayLabel}
          </h3>
          {displayBadge && (
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              background: '#0F172A',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              flexShrink: 0
            }}>
              {displayBadge}
            </span>
          )}
        </div>

        {/* Location/Style Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
            {displayLocation || 'India'}
          </span>
        </div>

        {/* Info Boxes */}
        {(displayCapacity || displayBudget) && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', minHeight: '64px' }}>
            {displayCapacity && (
              <div style={{
                flex: 1,
                background: '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '14px',
                border: '1px solid #F1F5F9',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{capacityLabel}</div>
                <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700, lineHeight: 1.2 }}>{displayCapacity}</div>
              </div>
            )}
            {displayBudget && (
              <div style={{
                flex: 1,
                background: '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '14px',
                border: '1px solid #F1F5F9',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Budget</div>
                <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700, lineHeight: 1.2 }}>{displayBudget}</div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            border: 'none',
            background: selected ? '#F77C83' : '#F77C83',
            opacity: selected ? 0.9 : 1,
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 20px rgba(247,124,131,0.25)',
            marginTop: 'auto'
          }}
        >
          {selected ? 'Selected' : actionLabel}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      <style>{`
        .premium-image-card:hover .card-main-img {
          transform: scale(1.08);
        }
        .premium-image-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
        }
        .premium-image-card.dimmed {
          opacity: 0.6;
          filter: grayscale(30%);
        }
      `}</style>
    </div>
  )
}

export function MultiImageSelector({ items, selected = [], onChange, showCost = false }) {
  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id))
    else onChange([...selected, id])
  }
  const hasAny = selected.length > 0
  return (
    <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
      {items.map((item) => (
        <ImageCard
          key={item.id}
          item={item}
          selected={selected.includes(item.id)}
          hasAnySelected={hasAny && !selected.includes(item.id)}
          onClick={toggle}
          showCost={showCost}
        />
      ))}
    </div>
  )
}

export function SingleImageSelector({ items, selected, onChange, showCost = false }) {
  const hasAny = !!selected
  return (
    <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
      {items.map((item) => (
        <ImageCard
          key={item.id}
          item={item}
          selected={selected === item.id}
          hasAnySelected={hasAny && selected !== item.id}
          onClick={(id) => onChange(id === selected ? '' : id)}
          showCost={showCost}
        />
      ))}
    </div>
  )
}

