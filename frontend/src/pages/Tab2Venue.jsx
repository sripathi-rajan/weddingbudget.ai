import { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useWedding, VENUE_TYPES, HOTEL_TIERS, ALL_EVENTS, INDIA_STATES_DISTRICTS, getMandapams, formatRupees } from '../context/WeddingContext'
import { MultiImageSelector, SingleImageSelector } from '../components/ImageCard'
import VibeSelector from '../components/VibeSelector'
import { scrollToNextSection } from '../utils/scrollToNext'
import { API_BASE } from '../utils/config'

// Staggered section reveal
const sectionStyle = (i) => ({
  animation: `sectionReveal 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both`
})

const C = { primary: '#023047', amber: '#ffb703', blue: '#219ebc', light: '#e8f4fa', sky: '#8ecae6' }

const COASTAL_LOCATIONS = {
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Tamil Nadu": ["Chennai", "Thoothukudi", "Pondicherry"],
  "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Alappuzha", "Kannur"],
  "Maharashtra": ["Mumbai", "Thane"],
  "Andhra Pradesh": ["Visakhapatnam", "Kakinada", "Nellore"],
  "Odisha": ["Puri"],
  "Gujarat": ["Surat", "Bharuch"],
  "Puducherry": ["Puducherry", "Karaikal"],
  "Lakshadweep": ["Kavaratti", "Agatti"],
  "Andaman & Nicobar": ["Port Blair", "Havelock Island", "Neil Island"]
}

const HERITAGE_LOCATIONS = {
  "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Bikaner", "Jaisalmer", "Pushkar"],
  "Madhya Pradesh": ["Gwalior", "Bhopal", "Indore"],
  "Uttar Pradesh": ["Agra", "Lucknow", "Varanasi"],
  "Gujarat": ["Ahmedabad", "Vadodara"]
}

const HILL_LOCATIONS = {
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Kullu"],
  "Uttarakhand": ["Dehradun", "Mussoorie", "Nainital", "Rishikesh"],
  "Karnataka": ["Coorg"],
  "Maharashtra": ["Lonavala", "Mahabaleshwar"],
  "Tamil Nadu": ["Ooty", "Kodaikanal"],
  "Kerala": ["Munnar"]
}

function StateCitySelector({ stateKey, districtKey, label, wedding, update, onDistrictSelect, filterType }) {
  let states = Object.keys(INDIA_STATES_DISTRICTS).sort()

  const filterMap = {
    'Beach': COASTAL_LOCATIONS,
    'Heritage': HERITAGE_LOCATIONS,
    'Hill': HILL_LOCATIONS
  }

  const selectedFilter = filterMap[filterType]

  if (selectedFilter) {
    states = states.filter(s => selectedFilter[s])
  }

  const districts = wedding[stateKey]
    ? (selectedFilter && selectedFilter[wedding[stateKey]]
      ? selectedFilter[wedding[stateKey]]
      : (INDIA_STATES_DISTRICTS[wedding[stateKey]] || []))
    : []

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
      <div>
        <label className="form-label">{label} — State</label>
        <select className="form-select" value={wedding[stateKey] || ''}
          onChange={e => { update(stateKey, e.target.value); update(districtKey, '') }}>
          <option value="">-- Select State --</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label">{label} — District / City</label>
        <select className="form-select" value={wedding[districtKey] || ''}
          disabled={!wedding[stateKey]}
          onChange={e => {
            update(districtKey, e.target.value)
            if (districtKey === 'wedding_district') update('wedding_city', e.target.value)
            if (districtKey === 'bride_district') update('bride_hometown', e.target.value)
            if (districtKey === 'groom_district') update('groom_hometown', e.target.value)
            if (e.target.value) onDistrictSelect?.()
          }}>
          <option value="">-- Select {filterType ? `${filterType} Spot` : 'District'} --</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </div>
  )
}

function PremiumHotelCard({ tier, isSelected, onSelect }) {
  return (
    <div
      className={`premium-venue-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(tier.id)}
      style={{ minHeight: 'auto', padding: 16 }}
    >
      <div className="premium-image-wrapper" style={{ height: 160, borderRadius: 16, marginBottom: 14 }}>
        <img src={tier.imageUrl} alt={tier.label} />
      </div>
      <div className="premium-card-body">
        <div className="premium-card-top" style={{ marginBottom: 4 }}>
          <div className="premium-venue-name" style={{ fontSize: 18 }}>{tier.label}</div>
          {isSelected && <div className="badge-venue" style={{ background: 'var(--c-premium-btn)' }}>SELECTED</div>}
        </div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>{tier.desc}</div>

        <div className="premium-info-box" style={{ background: '#fffafa', border: '1px solid #fce8ef', padding: '8px 12px' }}>
          <div className="info-box-label" style={{ color: '#d4537e' }}>Avg Capacity</div>
          <div className="info-box-val" style={{ fontSize: 14 }}>{tier.ppr} persons / room</div>
        </div>
      </div>
    </div>
  )
}

function PremiumVenueCard({ venue, isSelected, onSelect }) {
  const imageUrl = venue.imageUrl || `https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80`

  return (
    <div
      className={`premium-venue-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(venue)}
    >
      <div className="premium-image-wrapper">
        <img src={imageUrl} alt={venue.name} />
      </div>
      <div className="premium-card-body">
        <div className="premium-card-top">
          <div className="premium-venue-name">{venue.name}</div>
          <div className="badge-venue">VENUE</div>
        </div>
        <div className="premium-venue-loc">
          <span style={{ fontSize: 16 }}>📍</span> {venue.area}, {venue.city || 'Bangalore'}
        </div>

        <div className="premium-info-row">
          <div className="premium-info-box">
            <div className="info-box-label">Capacity</div>
            <div className="info-box-val">{venue.capacity || '500'} pax</div>
          </div>
          <div className="premium-info-box">
            <div className="info-box-label">Budget</div>
            <div className="info-box-val">From {formatRupees(venue.cost_per_day || venue.price || 200000)}</div>
          </div>
        </div>

        <button className="premium-action-btn">
          View Price & Details <span>→</span>
        </button>
      </div>
    </div>
  )
}

function MandapamCard({ venue, isSelected, onSelect, hasAnySelected }) {
  return (
    <div
      onClick={() => onSelect(venue)}
      className={`sel-card${isSelected ? ' selected' : ''}${hasAnySelected && !isSelected ? ' dimmed' : ''}`}
      style={{
        border: `2px solid ${isSelected ? '#D4537E' : C.sky}`,
        borderRadius: 14, padding: '16px 18px',
        background: isSelected ? '#FDF2F8' : 'white',
        boxShadow: isSelected ? '0 4px 20px rgba(212,83,126,0.12)' : 'none',
      }}
    >
      {/* Rose checkmark badge */}
      <div style={{
        position: 'absolute', top: 10, right: 12,
        background: '#D4537E', color: 'white', borderRadius: '50%',
        width: 22, height: 22, alignItems: 'center',
        justifyContent: 'center', fontWeight: 800, fontSize: 13,
        display: isSelected ? 'flex' : 'none',
        animation: isSelected ? 'checkSpring 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
        boxShadow: '0 2px 8px rgba(212,83,126,0.4)'
      }}>✓</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: isSelected ? '#B83A64' : C.primary, marginBottom: 4 }}>{venue.name}</div>
      <div style={{ fontSize: 12, color: C.blue, fontWeight: 500, marginBottom: 6 }}> {venue.area}</div>
      <div style={{ display: 'flex', gap: 10, fontSize: 12, flexWrap: 'wrap' }}>
        <span style={{ background: isSelected ? '#FBE8EF' : '#fff8e1', padding: '2px 8px', borderRadius: 6, color: isSelected ? '#B83A64' : '#7a5900', fontWeight: 700 }}>
          {formatRupees(venue.cost_per_day)}/day
        </span>
      </div>
    </div>
  )
}

export default function Tab2Venue() {
  const { wedding, update, updateMany } = useWedding()
  const [dbVenues, setDbVenues] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/vendors/approved?category=Venue`)
      .then(res => res.json())
      .then(data => setDbVenues(data))
      .catch(err => console.error("Error fetching db venues:", err))
  }, [])

  const [activeCityFilter, setActiveCityFilter] = useState('All')
  const [showMaps, setShowMaps] = useState(false)
  const [customVenue, setCustomVenue] = useState({ name: '', area: '', capacity: '', cost_per_day: '' })
  const [showCustomForm, setShowCustomForm] = useState(false)

  const tier = HOTEL_TIERS.find(t => t.id === wedding.hotel_tier)
  const ppr = tier ? tier.ppr : 2
  const autoRooms = Math.ceil((wedding.outstation_guests || 0) / ppr)

  // Auto-set rooms when outstation_guests or hotel_tier changes, unless user has overridden
  useEffect(() => {
    if (!wedding.num_rooms_override) {
      update('num_rooms', autoRooms)
    }
  }, [autoRooms, wedding.num_rooms_override])

  const mandapams = useMemo(() => getMandapams(wedding.wedding_district), [wedding.wedding_district])

  const handleMandapamSelect = (venue) => {
    updateMany({
      mandapam_id: venue.id,
      mandapam_name: venue.name,
      mandapam_cost_per_day: venue.cost_per_day,
    })
  }

  const mapsUrl = wedding.wedding_district
    ? `https://www.google.com/maps/search/mandapam+wedding+venue+${encodeURIComponent(wedding.wedding_district)}`
    : null

  return (
    <div>
      {/* Vibe / Style Selection (Replica) */}
      <div className="section-card" style={{ ...sectionStyle(0), background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }} data-section="vibe-selection">
        <VibeSelector
          selectedVibe={wedding.vibe}
          onSelect={(vibeId) => {
            update('vibe', vibeId)
            // Map vibe to venue_type
            let vType = ''
            if (vibeId === 'beach') vType = 'Beach Venue'
            if (vibeId === 'heritage') vType = 'Heritage Palace'
            if (vibeId === 'hill') vType = 'Hill Station'
            update('venue_type', vType)
            scrollToNextSection('vibe-selection', 420)
          }}
        />
      </div>

      {/* Other Venue Types (Dropdown/Grid if needed, but keeping it minimal) */}
      {(!wedding.vibe || wedding.vibe === '') && (
        <div className="section-card" style={sectionStyle(0.5)} data-section="venue-type">
          <div className="section-title"> Or choose another Venue Type <span style={{ color: '#E01A22' }}>*</span></div>
          <SingleImageSelector items={VENUE_TYPES.filter(v => !['Beach Venue', 'Heritage Palace', 'Hill Station'].includes(v.id))} selected={wedding.venue_type}
            onChange={(v) => { update('venue_type', v); scrollToNextSection('venue-type', 420) }} />
        </div>
      )}

      {/* Wedding City */}
      <div className="section-card" style={sectionStyle(1)} data-section="wedding-city">
        <div className="section-title"> Wedding City <span style={{ color: '#E01A22' }}>*</span></div>
        <StateCitySelector stateKey="wedding_state" districtKey="wedding_district"
          label="Wedding Location" wedding={wedding} update={update}
          filterType={
            wedding.vibe === 'beach' ? 'Beach' :
              wedding.vibe === 'heritage' ? 'Heritage' :
                wedding.vibe === 'hill' ? 'Hill' : null
          }
          onDistrictSelect={() => scrollToNextSection('wedding-city', 420)} />
        {wedding.wedding_district && (
          <div style={{
            marginTop: 12, padding: '8px 14px', background: C.light,
            borderRadius: 10, fontSize: 13, color: C.primary, fontWeight: 600, display: 'inline-flex', gap: 8
          }}>
            {wedding.wedding_district}, {wedding.wedding_state}
          </div>
        )}
      </div>

      {/* Venue Selection & Catalog */}
      {wedding.wedding_district && wedding.venue_type && wedding.venue_type !== 'Home Intimate' && (
        <div className="section-card" data-section="venue-details-picker">
          {/* 1. Purpose-Driven Title */}
          <div className="section-title">
            {
              (wedding.venue_type === 'Banquet Hall' || wedding.venue_type === 'Hotel 3-5 Star')
                ? `Select ${wedding.venue_type === 'Banquet Hall' ? 'Mandapam / Hall' : 'Hotel Venue'}`
                : `${wedding.venue_type} Details`
            } <span style={{ fontSize: 13, color: '#888', fontWeight: 500, marginLeft: 8 }}>(Optional)</span>
          </div>

          {/* 2. Catalog: Only shown for Hall/Hotel types */}
          {(wedding.venue_type === 'Banquet Hall' || wedding.venue_type === 'Hotel 3-5 Star') ? (
            <div className="premium-catalog">
              <div className="catalog-header">
                <div className="catalog-title">venues</div>
                <div className="city-filters">
                  {['Bangalore', 'Hyderabad', 'Chennai', 'Mumbai', 'View all'].map(city => (
                    <button
                      key={city}
                      className={`city-filter-btn ${activeCityFilter === city || (city === 'View all' && activeCityFilter === 'All') ? 'active' : ''}`}
                      onClick={() => setActiveCityFilter(city === 'View all' ? 'All' : city)}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: 16, color: '#666', marginBottom: 32, maxWidth: 600, lineHeight: 1.5 }}>
                Curated venues with standardized service, clear inclusions, and a team that knows the space end-to-end.
              </div>

              <div className="premium-card-grid">
                {/* Combine local mandapams and DB venues for a rich catalog */}
                {[
                  // Specific high-quality mock venues for Bangalore as seen in image
                  { id: 'tridalam', name: 'Tridalam', area: 'Kanakapura Road', capacity: '1000', cost_per_day: 650000, city: 'Bangalore', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80' },
                  { id: 'ananda_farms', name: 'Ananda Farms', area: 'Hesaraghatta', capacity: '400', cost_per_day: 300000, city: 'Bangalore', imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80' },
                  ...mandapams.map(m => ({ ...m, city: wedding.wedding_district })),
                  ...dbVenues.map(v => ({ id: `db_${v.id}`, name: v.business, area: v.city, capacity: '500+', cost_per_day: 150000, city: v.city }))
                ]
                  .filter(v => activeCityFilter === 'All' || v.city?.toLowerCase().includes(activeCityFilter.toLowerCase()))
                  .slice(0, 6) // Show top 6
                  .map(v => (
                    <PremiumVenueCard
                      key={v.id}
                      venue={v}
                      isSelected={wedding.mandapam_id === v.id}
                      onSelect={handleMandapamSelect}
                    />
                  ))}
              </div>

              <div style={{ marginTop: 40, textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 15, color: '#111', fontWeight: 700, textDecoration: 'none', borderBottom: `2.5px solid var(--c-premium-btn)`, paddingBottom: 4 }}>
                    Explore More Options on Google Maps
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#4a7a94', marginBottom: 16 }}>
              Enter the details for your chosen {wedding.venue_type.toLowerCase()} below. Use Google Maps to find local spots if needed.
            </div>
          )}

          {/* 3. Input Form: Always visible for Unique types, or on-demand for Halls */}
          {((wedding.venue_type !== 'Banquet Hall' && wedding.venue_type !== 'Hotel 3-5 Star') || showCustomForm) && (
            <div style={{
              padding: '20px', background: '#fffbea', borderRadius: 14, border: `1.5px solid ${C.amber}`,
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20
            }}>
              <div>
                <label className="form-label" style={{ marginBottom: 6 }}>Venue Name</label>
                <input className="form-input" placeholder={wedding.venue_type === 'Beach Venue' ? 'e.g. Blue Lagoon' : 'e.g. Green Meadows'}
                  value={customVenue.name || (wedding.mandapam_id?.startsWith('custom_') ? wedding.mandapam_name : '')}
                  onChange={e => {
                    const val = e.target.value;
                    setCustomVenue(cv => ({ ...cv, name: val }));
                    if (!(wedding.venue_type === 'Banquet Hall' || wedding.venue_type === 'Hotel 3-5 Star')) {
                      updateMany({ mandapam_name: val, mandapam_id: 'custom_auto' });
                    }
                  }} />
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: 6 }}>Est. Cost per Day (₹)</label>
                <input className="form-input" type="number" placeholder="100000"
                  value={customVenue.cost_per_day || (wedding.mandapam_id?.startsWith('custom_') ? wedding.mandapam_cost_per_day : '')}
                  onChange={e => {
                    const cpd = parseInt(e.target.value) || 0;
                    setCustomVenue(cv => ({ ...cv, cost_per_day: cpd }));
                    if (!(wedding.venue_type === 'Banquet Hall' || wedding.venue_type === 'Hotel 3-5 Star')) {
                      update('mandapam_cost_per_day', cpd);
                    }
                  }} />
              </div>
              {(wedding.venue_type === 'Banquet Hall' || wedding.venue_type === 'Hotel 3-5 Star') && (
                <div style={{ display: 'flex', alignItems: 'end' }}>
                  <button onClick={() => {
                    updateMany({ mandapam_id: 'custom_' + Date.now(), mandapam_name: customVenue.name, mandapam_cost_per_day: customVenue.cost_per_day });
                    setShowCustomForm(false);
                  }} style={{ background: C.primary, color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                    Add Custom Venue
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Calculator Summary (Only if cost/venue is known) */}
          {(wedding.mandapam_cost_per_day > 0 || wedding.mandapam_id) && (
            <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: 12, border: '1.5px solid #6ee7b7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: 14 }}>{wedding.mandapam_name || wedding.venue_type} — Cost Est.</div>
                  <div style={{ fontSize: 13, color: '#047857' }}>
                    Days of Event:
                    <input type="number" min={1} value={wedding.num_days}
                      onChange={e => update('num_days', parseInt(e.target.value) || 1)}
                      style={{ width: 45, border: 'none', background: 'white', borderRadius: 4, marginLeft: 8, textAlign: 'center', fontWeight: 700 }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#065f46', fontFamily: 'EB Garamond, serif' }}>
                    {formatRupees((wedding.mandapam_cost_per_day || 0) * (wedding.num_days || 1))}
                  </div>
                  <div style={{ fontSize: 11, color: '#059669' }}>Total for {wedding.num_days || 1} day(s)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guests & Capacity */}
      <div className="section-card" data-section="guest-count">
        <div className="section-title"> Guests & Capacity <span style={{ color: '#E01A22' }}>*</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 20 }}>
          <div style={{ background: C.light, borderRadius: 12, padding: 16 }}>
            <label className="form-label" style={{ color: C.primary }}>Total Guests</label>
            <div style={{ fontSize: 11, color: C.blue, marginBottom: 10, fontWeight: 500 }}>Across all events combined</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <input type="range" min={50} max={2000} step={50}
                value={wedding.total_guests || 50}
                onChange={e => update('total_guests', parseInt(e.target.value))}
                style={{ flex: 1, accentColor: '#D4537E', cursor: 'pointer' }} />
              <input type="number" value={wedding.total_guests || ''}
                onChange={e => update('total_guests', parseInt(e.target.value) || 0)}
                style={{
                  width: 80, textAlign: 'center', padding: '6px 8px',
                  border: '1.5px solid #EBEBEB', borderRadius: 8, fontSize: 14,
                  fontFamily: 'inherit'
                }} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {[100, 200, 300, 500, 750, 1000].map(n => {
                const sel = wedding.total_guests === n
                return (
                  <button key={n} onClick={() => update('total_guests', n)}
                    style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', border: `1.5px solid ${sel ? '#D4537E' : '#EBEBEB'}`,
                      background: sel ? '#FDF2F8' : 'white', color: sel ? '#D4537E' : '#555',
                      transition: 'all 0.15s'
                    }}>
                    {n}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: 12, color: '#D4537E', fontWeight: 600 }}>
              {(wedding.total_guests || 0) < 150 ? ' Intimate gathering'
                : (wedding.total_guests || 0) < 400 ? ' Mid-size wedding'
                  : (wedding.total_guests || 0) < 700 ? ' Large wedding'
                    : ' Grand wedding'}
            </div>
          </div>
          <div style={{ background: '#f0fdfa', borderRadius: 12, padding: 16 }}>
            <label className="form-label" style={{ color: '#065F46' }}>Seating Capacity Required</label>
            <div style={{ fontSize: 11, color: '#059669', marginBottom: 8, fontWeight: 500 }}>Maximum at any single event</div>
            <input type="number" className="form-input" value={wedding.seating_capacity || ''}
              min={1} max={10000} placeholder="e.g. 300"
              onChange={e => update('seating_capacity', parseInt(e.target.value) || 0)} />
          </div>
          <div style={{ background: '#fffbea', borderRadius: 12, padding: 16 }}>
            <label className="form-label" style={{ color: '#7a5900' }}>Outstation Guests</label>
            <div style={{ fontSize: 11, color: '#b37f00', marginBottom: 8, fontWeight: 500 }}>Guests needing accommodation</div>
            <input type="number" className="form-input" value={wedding.outstation_guests || ''}
              min={0} max={wedding.total_guests || 10000} placeholder="e.g. 80"
              onChange={e => update('outstation_guests', parseInt(e.target.value) || 0)} />
          </div>
        </div>

        {/* Per-event breakdown */}
        {wedding.events.length > 0 && (
          <div>
            <div className="form-label" style={{ marginBottom: 12, fontSize: 14 }}>
              Guests Per Event (optional)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12 }}>
              {wedding.events.map(ev => {
                const evObj = ALL_EVENTS.find(e => e.id === ev)
                return (
                  <div key={ev} style={{
                    background: 'white', borderRadius: 12, padding: '12px 14px',
                    border: `1.5px solid ${C.sky}`
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{evObj?.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: C.primary }}>{ev}</div>
                    <input type="number" className="form-input" style={{ padding: '7px 10px', fontSize: 13 }}
                      placeholder={`~${wedding.total_guests || 0}`}
                      value={wedding.guest_counts_by_event?.[ev] || ''}
                      onChange={e => update('guest_counts_by_event', {
                        ...wedding.guest_counts_by_event, [ev]: parseInt(e.target.value) || 0
                      })} />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Accommodation */}
      <div className="section-card" data-section="accommodation">
        <div className="section-title"> Accommodation — Select Stay Tier <span style={{ fontSize: 13, color: '#888', fontWeight: 500, marginLeft: 8 }}>(Optional)</span></div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
          Choose the stay experience for your outstation guests. Prices are estimated per night.
        </div>

        <div className="premium-card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {HOTEL_TIERS.map(tier => (
            <PremiumHotelCard
              key={tier.id}
              tier={tier}
              isSelected={wedding.hotel_tier === tier.id}
              onSelect={(val) => { update('hotel_tier', val); scrollToNextSection('accommodation', 420) }}
            />
          ))}
        </div>

        {wedding.hotel_tier && (wedding.outstation_guests || 0) > 0 && (
          <div style={{
            marginTop: 16, padding: '14px 18px', background: '#e8f8f5',
            borderRadius: 12, border: `1.5px solid #6EE7B7`
          }}>
            <div style={{ fontWeight: 700, color: '#065F46', fontSize: 14, marginBottom: 10 }}>
              Rooms Calculation
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
              <div>
                <div style={{ fontSize: 12, color: '#047857', marginBottom: 6 }}>
                  Auto: {wedding.outstation_guests} guests ÷ {ppr}/room = {autoRooms} rooms
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>Rooms Needed:</label>
                  <input type="number" min={1}
                    value={wedding.num_rooms || autoRooms}
                    onChange={e => {
                      update('num_rooms', parseInt(e.target.value) || autoRooms)
                      update('num_rooms_override', true)
                    }}
                    style={{
                      width: 80, padding: '6px 10px', border: `2px solid ${C.amber}`,
                      borderRadius: 8, fontSize: 14, fontWeight: 700, textAlign: 'center',
                      fontFamily: 'Inter, sans-serif'
                    }} />
                  {wedding.num_rooms_override && (
                    <button onClick={() => { update('num_rooms_override', false); update('num_rooms', autoRooms) }}
                      style={{ fontSize: 11, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Reset to auto
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#047857', fontStyle: 'italic' }}>
                {wedding.num_rooms_override ? ' Manually set' : ' Auto-calculated'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bride & Groom Hometowns */}
      <div className="section-card" data-section="hometowns">
        <div className="section-title"> Bride &amp; Groom Hometowns <span style={{ fontSize: 13, color: '#888', fontWeight: 500, marginLeft: 8 }}>(Optional)</span></div>
        <div style={{ fontSize: 12, color: '#4a7a94', marginBottom: 16 }}>
          Used to calculate logistics & travel distance for transfers.
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#b03060', marginBottom: 12 }}>
            Bride's Hometown
          </div>
          <StateCitySelector stateKey="bride_state" districtKey="bride_district"
            label="Bride" wedding={wedding} update={update} />
        </div>
        <div style={{ borderTop: `1.5px dashed ${C.sky}`, paddingTop: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.primary, marginBottom: 12 }}>
            Groom's Hometown
          </div>
          <StateCitySelector stateKey="groom_state" districtKey="groom_district"
            label="Groom" wedding={wedding} update={update} />
        </div>
      </div>

      {/* Sticky Next button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'sticky', bottom: '1.5rem',
          display: 'flex', justifyContent: 'center',
          zIndex: 50, marginTop: '2rem'
        }}
      >
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('weddingNextTab'))}
          style={{
            background: '#111', color: '#fff',
            border: 'none', borderRadius: '10px',
            padding: '14px 40px', fontSize: '15px',
            fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}
        >
          Next: Decor AI →
        </button>
      </motion.div>
    </div>
  )
}
