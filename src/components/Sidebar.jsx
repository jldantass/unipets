import { supabase } from '../supabaseClient'
import Icon from './Icon'

const ITEMS = [
  { id: 'dashboard', label: 'Painel' },
  { id: 'cadastro', label: 'Cadastro' },
  { id: 'planos', label: 'Planos' },
  { id: 'busca', label: 'Buscar' },
  { id: 'precos', label: 'Preços' },
]

export default function Sidebar({ view, setView, userEmail }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brand-logo" src="/unipets.svg" alt="" width="42" height="42" />
        <div className="brand-text"><b>UniPets</b><span>Gestão de serviços</span></div>
      </div>
      <nav className="nav-menu" aria-label="Navegação principal">
        {ITEMS.map(({ id, label }) => (
          <button type="button" key={id} className={`nav-item ${view === id ? 'active' : ''}`}
            aria-current={view === id ? 'page' : undefined} onClick={() => setView(id)}>
            <Icon name={id} />{label}
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="user-chip"><Icon name="user" /><span title={userEmail}>{userEmail}</span></div>
        <button className="nav-item" type="button" onClick={() => supabase.auth.signOut()}>
          <Icon name="exit" /> Sair
        </button>
      </div>
    </aside>
  )
}
