import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useSettings() {
  const [settings, setSettings] = useState({ primary_color: '#f97316', accent_color: '#111827', hero_heading: 'Discover vibrant homes', hero_subheading: 'Browse, make offers, and manage listings seamlessly.', announcement: 'Welcome! This site uses demo data for preview.' })
  useEffect(() => {
    fetch(`${API_URL}/admin/settings`).then(r => r.json()).then(setSettings).catch(() => {})
  }, [])
  return settings
}

function formatPrice(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function Hero({ settings }) {
  return (
    <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/95Gu7tsx2K-0F3oi/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-white/90 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-gray-200 text-sm mb-4">
            <span className="w-2 h-2 rounded-full" style={{ background: settings.primary_color }} />
            <span className="text-gray-700">{settings.announcement}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{ color: settings.accent_color }}>
            {settings.hero_heading}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl">{settings.hero_subheading}</p>
          <div className="mt-8 flex gap-3">
            <a href="#listings" className="px-5 py-3 rounded-lg text-white font-semibold shadow-sm hover:shadow-md transition"
               style={{ background: settings.primary_color }}>Browse Listings</a>
            <a href="#admin" className="px-5 py-3 rounded-lg font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Admin Panel</a>
          </div>
        </div>
      </div>
    </section>
  )
}

function PropertyCard({ item, onOffer }) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden border border-gray-100">
      <div className="aspect-[16/10] w-full overflow-hidden">
        <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
          <span className="text-orange-600 font-semibold">{formatPrice(item.price)}</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mt-1">{item.description}</p>
        <div className="flex gap-3 text-sm text-gray-600 mt-3">
          <span>{item.bedrooms} bd</span>
          <span>{item.bathrooms} ba</span>
          <span>{item.area_sqft} sqft</span>
        </div>
        <button onClick={() => onOffer(item)} className="mt-4 w-full py-2 rounded-lg text-white font-semibold" style={{ background: '#f97316' }}>Submit Offer</button>
      </div>
    </div>
  )
}

function OfferModal({ open, onClose, property }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', amount: '', message: '' })
  useEffect(() => {
    if (open) setForm({ full_name: '', email: '', phone: '', amount: '', message: '' })
  }, [open])
  if (!open) return null
  const submit = async (e) => {
    e.preventDefault()
    await fetch(`${API_URL}/offers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Number(form.amount), property_id: property._id })
    })
    onClose(true)
  }
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900">Submit Offer for {property.title}</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Full name" value={form.full_name} onChange={e=>setForm(f=>({...f, full_name:e.target.value}))} required />
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} required />
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Phone" value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} />
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Offer amount" type="number" value={form.amount} onChange={e=>setForm(f=>({...f, amount:e.target.value}))} required />
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Message" value={form.message} onChange={e=>setForm(f=>({...f, message:e.target.value}))} />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={()=>onClose(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button className="px-4 py-2 rounded-lg text-white" style={{ background:'#f97316' }}>Send Offer</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AdminPanel() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(()=>{ fetch(`${API_URL}/admin/settings`).then(r=>r.json()).then(setSettings) },[])
  if (!settings) return null
  const update = async () => {
    setSaving(true)
    const res = await fetch(`${API_URL}/admin/settings`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(settings) })
    const data = await res.json(); setSettings(data); setSaving(false)
  }
  return (
    <section id="admin" className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
      <p className="text-gray-600">Update site-wide settings.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm text-gray-700">Primary color</label>
          <input type="color" value={settings.primary_color} onChange={e=>setSettings(s=>({...s, primary_color:e.target.value}))} />
          <label className="block text-sm text-gray-700">Accent color</label>
          <input type="color" value={settings.accent_color} onChange={e=>setSettings(s=>({...s, accent_color:e.target.value}))} />
          <label className="block text-sm text-gray-700">Hero heading</label>
          <input className="w-full border rounded px-3 py-2" value={settings.hero_heading} onChange={e=>setSettings(s=>({...s, hero_heading:e.target.value}))} />
          <label className="block text-sm text-gray-700">Hero subheading</label>
          <input className="w-full border rounded px-3 py-2" value={settings.hero_subheading} onChange={e=>setSettings(s=>({...s, hero_subheading:e.target.value}))} />
          <label className="block text-sm text-gray-700">Announcement</label>
          <input className="w-full border rounded px-3 py-2" value={settings.announcement||''} onChange={e=>setSettings(s=>({...s, announcement:e.target.value}))} />
          <button onClick={update} className="px-4 py-2 rounded-lg text-white" style={{ background: settings.primary_color }}>{saving? 'Saving...' : 'Save changes'}</button>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-600">Preview</p>
          <h3 className="text-3xl font-extrabold" style={{ color: settings.accent_color }}>{settings.hero_heading}</h3>
          <p className="text-gray-600">{settings.hero_subheading}</p>
          <div className="mt-4 h-2 w-40 rounded-full" style={{ background: settings.primary_color }} />
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const settings = useSettings()
  const [properties, setProperties] = useState([])
  const [selected, setSelected] = useState(null)
  const [seeded, setSeeded] = useState(false)

  const load = async () => {
    const res = await fetch(`${API_URL}/properties`) ;
    const data = await res.json();
    setProperties(data)
  }

  useEffect(() => {
    load().then(v=>{
      if (Array.isArray(v) && v.length===0) setSeeded(false)
    }).catch(()=>{})
  }, [])

  const seedNow = async () => {
    await fetch(`${API_URL}/seed`, { method:'POST' })
    await load()
    setSeeded(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: settings.primary_color }} />
            <span className="font-bold">OrangeBrick</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-700">
            <a href="#listings" className="hover:text-gray-900">Listings</a>
            <a href="#admin" className="hover:text-gray-900">Admin</a>
            <a href="#offers" className="hover:text-gray-900">Offers</a>
          </nav>
        </div>
      </header>

      <Hero settings={settings} />

      <section id="listings" className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Featured Listings</h2>
            <p className="text-gray-600">Browse properties and submit offers instantly.</p>
          </div>
          <button onClick={seedNow} className="px-4 py-2 rounded-lg text-white" style={{ background: settings.primary_color }}>Seed Demo Data</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <PropertyCard key={p._id} item={p} onOffer={setSelected} />
          ))}
        </div>
      </section>

      <OffersSection />
      <AdminPanel />

      <footer className="border-t border-gray-200 py-10 mt-10 text-center text-sm text-gray-600">© {new Date().getFullYear()} OrangeBrick. All rights reserved.</footer>

      <OfferModal open={!!selected} onClose={(reload)=>{ setSelected(null); if (reload) load() }} property={selected||{}} />
    </div>
  )
}

function OffersSection() {
  const [offers, setOffers] = useState([])
  useEffect(()=>{ fetch(`${API_URL}/offers`).then(r=>r.json()).then(setOffers).catch(()=>{}) },[])
  return (
    <section id="offers" className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold">Recent Offers</h2>
      <p className="text-gray-600">Track incoming offers in real-time.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {offers.map(o => (
          <div key={o._id} className="rounded-xl border p-4 bg-white">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">{o.full_name}</h4>
              <span className="text-orange-600 font-semibold">{formatPrice(o.amount)}</span>
            </div>
            <p className="text-sm text-gray-600">For property {o.property_id}</p>
            {o.message && <p className="mt-2 text-gray-700">“{o.message}”</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
