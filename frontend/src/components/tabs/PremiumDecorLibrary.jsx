import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWedding, formatRupees } from '../../context/WeddingContext'
import { API_BASE as API } from '../../utils/config'

const CATEGORIES = [
  { id: 'stage', label: 'Stage Decor', icon: '', types: ['Stage', 'Mandap'] },
  { id: 'welcome', label: 'Welcome Decor', icon: '', types: ['Entrance', 'Aisle'] },
  { id: 'accent', label: 'Accent Decor', icon: '', types: ['Lighting', 'Ceiling', 'Pillars'] },
  { id: 'traditional', label: 'Traditional Decor', icon: '', types: ['Traditional'] },
  { id: 'essentials', label: 'Decor Essentials', icon: '', types: ['Table Decor', 'Pillars'] },
  { id: 'addons', label: 'Product Add-Ons', icon: '', types: ['Photo Booth'] },
  { id: 'meragi', label: 'Special', icon: '', types: ['Luxury'] },
]

const DECOR_LIBRARY = [
  // --- Mandap ---
  { id: 1, imageUrl: '/decor-images/mandap/000003.jpg', emoji: '🌸', name: 'Floral Arch Mandap', style: 'Romantic', complexity: 'High', base_cost: 200000, function_type: 'Mandap', is_popular: true },
  { id: 17, imageUrl: '/decor-images/mandap/000004.jpg', emoji: '🏛️', name: 'Grand Palace Mandap', style: 'Luxury', complexity: 'High', base_cost: 380000, function_type: 'Mandap' },
  { id: 18, imageUrl: '/decor-images/mandap/000007.jpg', emoji: '🪷', name: 'Lotus Dome Mandap', style: 'Traditional', complexity: 'High', base_cost: 275000, function_type: 'Mandap', is_popular: true },
  { id: 19, imageUrl: '/decor-images/mandap/000010.jpg', emoji: '🌿', name: 'Garden Canopy Mandap', style: 'Boho', complexity: 'Medium', base_cost: 160000, function_type: 'Mandap' },
  { id: 20, imageUrl: '/decor-images/mandap/000019.jpg', emoji: '✨', name: 'Crystal Glam Mandap', style: 'Modern', complexity: 'High', base_cost: 320000, function_type: 'Mandap' },
  { id: 21, imageUrl: '/decor-images/mandap/000028.jpg', emoji: '🌸', name: 'Pastel Blossom Mandap', style: 'Romantic', complexity: 'Medium', base_cost: 195000, function_type: 'Mandap' },

  // --- Entrance ---
  { id: 3, imageUrl: '/decor-images/entrance/000004.jpg', emoji: '🌼', name: 'Marigold Garland Entrance', style: 'Traditional', complexity: 'Medium', base_cost: 50000, function_type: 'Entrance', is_popular: true },
  { id: 15, imageUrl: '/decor-images/entrance/000011.jpg', emoji: '☀️', name: 'Haldi Theme Entrance', style: 'Playful', complexity: 'Low', base_cost: 35000, function_type: 'Entrance' },
  { id: 22, imageUrl: '/decor-images/entrance/000037.jpg', emoji: '🚪', name: 'Royal Gate Entrance', style: 'Luxury', complexity: 'High', base_cost: 95000, function_type: 'Entrance' },
  { id: 23, imageUrl: '/decor-images/entrance/000015.jpg', emoji: '🌺', name: 'Floral Cascade Entrance', style: 'Romantic', complexity: 'Medium', base_cost: 65000, function_type: 'Entrance', is_popular: true },
  { id: 24, imageUrl: '/decor-images/entrance/000043.jpg', emoji: '🍃', name: 'Greenery Arch Entrance', style: 'Boho', complexity: 'Low', base_cost: 40000, function_type: 'Entrance' },
  { id: 9, imageUrl: '/decor-images/entrance/000035.jpg', emoji: '🌹', name: 'Rose Petal Aisle', style: 'Romantic', complexity: 'Low', base_cost: 20000, function_type: 'Aisle' },

  // --- Stage ---
  { id: 6, imageUrl: '/decor-images/stage/000007.jpg', emoji: '🎭', name: 'Floral Stage Decor', style: 'Whimsical', complexity: 'High', base_cost: 250000, function_type: 'Stage', is_popular: true },
  { id: 16, imageUrl: '/decor-images/stage/000019.jpg', emoji: '🎵', name: 'Sangeet Stage Lights', style: 'Modern', complexity: 'High', base_cost: 180000, function_type: 'Stage' },
  { id: 25, imageUrl: '/decor-images/stage/000026.jpg', emoji: '👑', name: 'Royal Wedding Stage', style: 'Luxury', complexity: 'High', base_cost: 420000, function_type: 'Stage', is_popular: true },
  { id: 26, imageUrl: '/decor-images/stage/000041.jpg', emoji: '🌸', name: 'Blossom Dream Stage', style: 'Romantic', complexity: 'Medium', base_cost: 185000, function_type: 'Stage' },
  { id: 27, imageUrl: '/decor-images/stage/000050.jpg', emoji: '🪵', name: 'Rustic Charm Stage', style: 'Rustic', complexity: 'Medium', base_cost: 140000, function_type: 'Stage' },

  // --- Reception ---
  { id: 4, imageUrl: '/decor-images/reception/000001.jpg', emoji: '✨', name: 'LED Fairy Light Ceiling', style: 'Modern', complexity: 'High', base_cost: 130000, function_type: 'Ceiling' },
  { id: 12, imageUrl: '/decor-images/reception/000007.jpg', emoji: '🎈', name: 'Grand Reception Setup', style: 'Luxury', complexity: 'High', base_cost: 320000, function_type: 'Ceiling', is_popular: true },
  { id: 13, imageUrl: '/decor-images/reception/000014.jpg', emoji: '💎', name: 'Palace Chandelier Setup', style: 'Luxury', complexity: 'High', base_cost: 450000, function_type: 'Ceiling', is_popular: true },
  { id: 28, imageUrl: '/decor-images/reception/000024.jpg', emoji: '🎉', name: 'Glitter Ball Reception', style: 'Playful', complexity: 'Medium', base_cost: 95000, function_type: 'Ceiling' },
  { id: 10, imageUrl: '/decor-images/reception/000030.jpg', emoji: '🏛️', name: 'Royal Pillar Draping', style: 'Luxury', complexity: 'High', base_cost: 300000, function_type: 'Pillars' },

  // --- Floral ---
  { id: 5, imageUrl: '/decor-images/floral/000008.jpg', emoji: '🍃', name: 'Tropical Leaf Backdrop', style: 'Boho', complexity: 'Medium', base_cost: 70000, function_type: 'Backdrop' },
  { id: 14, imageUrl: '/decor-images/floral/000003.jpg', emoji: '🎨', name: 'Mehendi Floral Setup', style: 'Traditional', complexity: 'Medium', base_cost: 85000, function_type: 'Backdrop', is_popular: true },
  { id: 7, imageUrl: '/decor-images/floral/000006.jpg', emoji: '🪔', name: 'Diya Pathway Lighting', style: 'Traditional', complexity: 'Low', base_cost: 25000, function_type: 'Lighting' },
  { id: 29, imageUrl: '/decor-images/floral/000010.jpg', emoji: '🌷', name: 'Tulip Garden Setup', style: 'Romantic', complexity: 'Medium', base_cost: 72000, function_type: 'Backdrop' },
  { id: 30, imageUrl: '/decor-images/floral/000011.jpg', emoji: '💐', name: 'Orchid Luxury Arrangement', style: 'Luxury', complexity: 'High', base_cost: 110000, function_type: 'Backdrop' },
  { id: 8, imageUrl: '/decor-images/floral/000014.jpg', emoji: '📸', name: 'Floral Photo Booth', style: 'Modern', complexity: 'Medium', base_cost: 60000, function_type: 'Photo Booth' },

  // --- Table ---
  { id: 2, imageUrl: '/decor-images/table/000010.jpg', emoji: '🕯️', name: 'Candle Centerpieces', style: 'Minimalist', complexity: 'Low', base_cost: 40000, function_type: 'Table Decor' },
  { id: 11, imageUrl: '/decor-images/table/000017.jpg', emoji: '🪵', name: 'Rustic Farm Table', style: 'Rustic', complexity: 'Medium', base_cost: 52000, function_type: 'Table Decor', is_popular: true },
  { id: 31, imageUrl: '/decor-images/table/000024.jpg', emoji: '🌿', name: 'Botanical Table Runner', style: 'Boho', complexity: 'Low', base_cost: 28000, function_type: 'Table Decor' },
  { id: 32, imageUrl: '/decor-images/table/000030.jpg', emoji: '🥂', name: 'Crystal Glam Table', style: 'Luxury', complexity: 'High', base_cost: 78000, function_type: 'Table Decor' },
]

function localPredict(item) {
  const baseRates = {
    'Mandap': 250000, 'Entrance': 60000, 'Table Decor': 45000, 'Ceiling': 120000,
    'Backdrop': 85000, 'Stage': 300000, 'Lighting': 40000, 'Photo Booth': 65000,
    'Aisle': 30000, 'Pillars': 350000
  }
  const base = baseRates[item.function_type] || item.base_cost || 75000
  const mult = { Low: 0.7, Medium: 1.0, High: 1.6 }[item.complexity] || 1
  const sm = { Luxury: 1.5, Traditional: 1.1, Modern: 1.2, Romantic: 1.1, Boho: 0.9, Minimalist: 0.75, Whimsical: 1.1, Rustic: 0.85, Playful: 0.8 }[item.style] || 1
  const p = Math.round(base * mult * sm)
  return { predicted: p, low: Math.round(p * 0.85), high: Math.round(p * 1.2) }
}

function CatalogCard({ item, isSel, onToggle }) {
  const p = localPredict(item)
  return (
    <motion.div
      layout
      className={`premium-decor-card ${isSel ? 'selected' : ''}`}
      onClick={() => onToggle(item)}
      style={{
        background: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        cursor: 'pointer',
        border: isSel ? '2.5px solid #F77C83' : '1px solid #F3F4F6',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isSel ? '0 12px 30px rgba(247,124,131,0.15)' : '0 10px 30px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        padding: '12px'
      }}
    >
      <div style={{
        position: 'relative',
        height: 180,
        overflow: 'hidden',
        borderRadius: '16px',
        marginBottom: '16px'
      }}>
        <img
          src={item.imageUrl}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
          className="card-zoom-img"
        />
        {item.is_popular && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: '#000', color: '#fff', padding: '4px 14px', borderRadius: 20,
            fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px'
          }}>Popular choice</div>
        )}
        {isSel && (
          <div style={{
            position: 'absolute', top: 12, right: 12, width: 32, height: 32,
            borderRadius: '50%', background: '#F77C83', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(247,124,131,0.3)', fontWeight: 800
          }}>✓</div>
        )}
      </div>
      <div style={{ padding: '0 4px 8px' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1E293B', marginBottom: 12, lineHeight: 1.2 }}>{item.name}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#F77C83' }}>
              {formatRupees(p.predicted)}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>ESTIMATED COST</div>
          </div>
          <button style={{
            padding: '10px 18px', borderRadius: 30, border: 'none',
            background: '#F8FAFC', fontSize: 12, fontWeight: 700, color: '#475569',
            transition: 'all 0.2s'
          }}>View Details</button>
        </div>
      </div>
    </motion.div>
  )
}

function SidebarItem({ cat, active, onClick }) {
  return (
    <div
      onClick={() => onClick(cat.id)}
      style={{
        padding: '14px 20px',
        borderRadius: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: active ? '#fff' : 'transparent',
        color: active ? '#F77C83' : '#666',
        transition: 'all 0.2s',
        borderLeft: active ? '4px solid #F77C83' : '4px solid transparent',
        fontWeight: active ? 800 : 500,
        fontSize: 15
      }}
    >
      <span style={{ fontSize: 20 }}>{active ? '•' : cat.icon}</span>
      <span>{cat.label}</span>
    </div>
  )
}

export default function PremiumDecorLibrary() {
  const { wedding, update, updateDecorSelections } = useWedding()
  const [activeCat, setActiveCat] = useState('stage')
  const [dbItems, setDbItems] = useState([])
  const scrollRef = useRef(null)

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API}/decor/library?limit=100`)
      if (res.ok) {
        const data = await res.json()
        setDbItems(data.items || [])
      }
    } catch (e) { }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const combined = useMemo(() => {
    return [
      ...DECOR_LIBRARY.map(d => ({ ...d, ...localPredict(d) })),
      ...dbItems.map(d => ({
        id: d.id,
        imageUrl: `${API.replace('/api', '')}/decor-images/${d.filename}`,
        name: d.filename?.replace(/\.[^.]+$/, '').replace(/_/g, ' ') || 'Custom Decor',
        function_type: d.function_type,
        style: d.style,
        complexity: d.complexity,
        predicted: d.predicted_mid || 75000,
        base_cost: d.predicted_mid || 75000,
        is_popular: d.is_popular
      }))
    ]
  }, [dbItems])

  const selectedItems = useMemo(() => {
    if (!wedding.decor_selections) return []
    const libAndDb = combined.filter(d => wedding.decor_selections.includes(d.id))
    
    // Also include AI items
    const aiItems = wedding.decor_selections
      .filter(id => typeof id === 'string' && id.startsWith('ai-pred-'))
      .map(id => {
        try {
          const data = JSON.parse(id.replace('ai-pred-', ''))
          return {
            id,
            name: `AI: ${data.name || 'Custom Decor'}`,
            predicted: data.cost || 0,
            imageUrl: '', // AI items don't have gallery images yet
            isAi: true
          }
        } catch (e) { return null }
      }).filter(Boolean)

    return [...libAndDb, ...aiItems]
  }, [combined, wedding.decor_selections])

  const filteredItems = useMemo(() => {
    const cat = CATEGORIES.find(c => c.id === activeCat)
    if (!cat) return []
    return combined.filter(item => 
      (cat.types && cat.types.includes(item.function_type)) || 
      (cat.id === 'meragi' && item.style === 'Luxury')
    )
  }, [activeCat, combined])

  const toggleItem = (item) => {
    const selections = wedding.decor_selections || []
    const exists = selections.includes(item.id)
    const nextIds = exists ? selections.filter(id => id !== item.id) : [...selections, item.id]
    
    // Calculate new total from the combined list based on selected IDs
    const nextItems = combined.filter(d => nextIds.includes(d.id))
    const total = nextItems.reduce((s, i) => s + (i.predicted || 0), 0)
    
    updateDecorSelections(nextIds, total)
    update('selected_decor', nextItems.map(s => s.name || 'Custom Decor'))
  }

  const libTotal = selectedItems.reduce((s, i) => s + (i.predicted || 0), 0)

  return (
    <div style={{ position: 'relative', background: '#fff', borderRadius: 32, overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', height: 750 }}>
        {/* Sidebar */}
        <div style={{ width: 260, background: '#fcfcfc', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '30px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F77C83' }}></div>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#111', textTransform: 'uppercase', letterSpacing: '1px' }}>Reception</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {CATEGORIES.map(cat => (
              <SidebarItem key={cat.id} cat={cat} active={activeCat === cat.id} onClick={setActiveCat} />
            ))}
          </div>

          <div style={{ padding: '24px', borderTop: '1px solid #f0f0f0' }}>
            <button style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #EBEBEB', background: '#fff', fontSize: 13, fontWeight: 700, color: '#666' }}>Collections</button>
            <button style={{ width: '100%', marginTop: 8, padding: '12px', borderRadius: 12, border: 'none', background: '#000', fontSize: 13, fontWeight: 700, color: '#fff' }}>Products</button>
          </div>
        </div>

        {/* Main Content (Autoscrolling) */}
        <div
          ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', padding: '40px', scrollBehavior: 'smooth' }}
          onMouseEnter={() => { }} // Could pause on hover if desired
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#1d212a' }}>{CATEGORIES.find(c => c.id === activeCat)?.label}</h2>
            <div style={{ display: 'flex', gap: 15 }}>
              <select style={{ border: '1px solid #EBEBEB', padding: '10px 24px', borderRadius: 30, fontSize: 13, fontWeight: 700 }}>
                <option>Woodward</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 30
          }}>
            {filteredItems.map(item => (
              <CatalogCard key={item.id} item={item} isSel={!!selectedItems.find(s => s.id === item.id)} onToggle={toggleItem} />
            ))}
          </div>
        </div>
      </div>

      {/* Cart Tray (Style) */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            style={{
              position: 'absolute', bottom: 30, left: 300, right: 40,
              background: '#000', borderRadius: 24, padding: '16px 32px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)', zIndex: 100
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F77C83', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                {selectedItems.length}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Designs shortlisted</div>
                <div style={{ color: '#888', fontSize: 12 }}>Est {formatRupees(libTotal)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginRight: 10 }}>{formatRupees(libTotal)}</div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('weddingNextTab'))}
                style={{
                  padding: '14px 40px', borderRadius: 16, border: 'none',
                  background: '#F77C83', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer'
                }}>
                Confirm & Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .card-zoom-img:hover { transform: scale(1.08); }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  )
}
