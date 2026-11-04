import { supabase } from '../supabaseClient'

const ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Painel' },
  { id: 'cadastro', icon: '📝', label: 'Cadastro' },
  { id: 'planos', icon: '🎟️', label: 'Planos' },
  { id: 'busca', icon: '🔍', label: 'Buscar' },
  { id: 'precos', icon: '💲', label: 'Preços' },
]

export default function Sidebar({ view, setView, userEmail }) {
  return (
    <div className="sidebar">
      <div className="brand">
        <img className="brand-logo" src="/logo.png" alt="Logo Hobby Biches" />
        <div className="brand-text"><b>Hobby Biches</b><span>Seu Pet, nossa paixão!</span></div>
      </div>
      {ITEMS.map(it => (
        <button key={it.id} className={`nav-item ${view === it.id ? 'active' : ''}`} onClick={() => setView(it.id)}>
          <span className="ic">{it.icon}</span> {it.label}
        </button>
      ))}
      <div className="sidebar-foot">
        <div className="user-chip">👤 {userEmail}</div>
        <button className="nav-item" onClick={() => supabase.auth.signOut()}>
          <span className="ic">🚪</span> Sair
        </button>
      </div>
    </div>
  )
}
