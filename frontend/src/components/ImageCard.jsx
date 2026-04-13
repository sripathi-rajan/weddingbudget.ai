import { useState } from 'react'

export function ImageCard({ item, selected, onClick, showCost = false, hasAnySelected = false }) {
  const [imgError, setImgError] = useState(false)
  const fallbackBg = item.fallbackColor || '#4A5568'

  return (
    <div
      className={`image-card sel-card ${selected ? 'selected' : ''} ${hasAnySelected && !selected ? 'dimmed' : ''}`}
      onClick={() => onClick(item.id)}
      title={item.label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden', background: fallbackBg, lineHeight: 0 }}>
        {!item.imageUrl || imgError ? (
          <div
            className="card-emoji sel-card-icon"
            style={{
              height: 115,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
            }}
          >
            {item.emoji || '•'}
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt=""
            onError={() => setImgError(true)}
            style={{ width: '100%', height: 120, objectFit: 'cover', objectPosition: 'center' }}
          />
        )}
        <span
          className="check-badge-rose"
          style={{
            position: 'absolute',
            top: 7,
            right: 7,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#C9A84C',
            color: '#111',
            fontSize: 12,
            fontWeight: 800,
            alignItems: 'center',
            justifyContent: 'center',
            display: selected ? 'flex' : 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            animation: selected ? 'checkSpring 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
            zIndex: 2,
          }}
        >
          ✓
        </span>
      </div>
      <div className="card-label" style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>
        {item.label}
      </div>
      {showCost && item.cost && (
        <div
          style={{
            fontSize: 12,
            color: '#555',
            fontWeight: 600,
            textAlign: 'center',
            padding: '0 10px 10px',
            marginTop: -4,
          }}
        >
          {item.cost}
        </div>
      )}
      {showCost && item.desc && !item.cost && (
        <div
          style={{
            fontSize: 12,
            color: '#555',
            fontWeight: 600,
            textAlign: 'center',
            padding: '0 10px 10px',
            marginTop: -4,
          }}
        >
          {item.desc}
        </div>
      )}
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
    <div className="image-grid">
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
    <div className="image-grid">
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
