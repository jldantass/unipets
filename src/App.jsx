import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Dashboard from './components/Dashboard'
import Cadastro from './components/Cadastro'
import Planos from './components/Planos'
import Busca from './components/Busca'
import Precos from './components/Precos'
import AnimalModal from './components/AnimalModal'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = carregando, null = deslogado
  const [view, setView] = useState('dashboard')
  const [clientes, setClientes] = useState([])
  const [animais, setAnimais] = useState([])
  const [banhos, setBanhos] = useState([])
  const [precos, setPrecos] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [toastMsg, setToastMsg] = useState('')
  const [detailAnimalId, setDetailAnimalId] = useState(null)

  // ---------- autenticação ----------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2600)
  }

  // ---------- carregar dados ----------
  const refreshAll = useCallback(async () => {
    setLoadingData(true)
    const [{ data: c }, { data: a }, { data: b }, { data: p }] = await Promise.all([
      supabase.from('clientes').select('*').order('nome'),
      supabase.from('animais').select('*').order('nome'),
      supabase.from('banhos').select('*').order('hora_inicio', { ascending: false }),
      supabase.from('precos').select('*').order('ordem'),
    ])
    setClientes(c || [])
    setAnimais(a || [])
    setBanhos(b || [])
    setPrecos(p || [])
    setLoadingData(false)
  }, [])

  useEffect(() => {
    if (!session) return
    refreshAll()
    // Atualiza sozinho quando qualquer funcionário mexe em banhos/animais
    const channel = supabase
      .channel('hb-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banhos' }, refreshAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animais' }, refreshAll)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [session, refreshAll])

  if (session === undefined) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando…</div>
  }
  if (!session) return <Login />

  const clienteById = id => clientes.find(c => c.id === id)
  const animalById = id => animais.find(a => a.id === id)

  const titles = {
    dashboard: ['Painel de Banhos', 'Acompanhe em tempo real quem está no banho agora'],
    cadastro: ['Cadastro', 'Clientes, animais e restrições de banho'],
    planos: ['Planos de Banho', 'Assinaturas, uso e vencimento'],
    busca: ['Busca', 'Encontre por animal, dono, CPF, raça ou telefone'],
    precos: ['Tabela de Preços', 'Valores de consulta e edição para a equipe'],
  }

  const viewProps = {
    clientes, animais, banhos, precos,
    clienteById, animalById, refreshAll, showToast,
    openAnimalDetail: setDetailAnimalId,
  }

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} userEmail={session.user.email} />
      <div className="main">
        <div className="topbar">
          <div>
            <h1>{titles[view][0]}</h1>
            <div className="sub">{titles[view][1]}</div>
          </div>
        </div>

        {loadingData ? (
          <div className="empty-state"><div className="ic">⏳</div><h3>Carregando dados…</h3><p></p></div>
        ) : (
          <>
            {view === 'dashboard' && <Dashboard {...viewProps} />}
            {view === 'cadastro' && <Cadastro {...viewProps} />}
            {view === 'planos' && <Planos {...viewProps} />}
            {view === 'busca' && <Busca {...viewProps} />}
            {view === 'precos' && <Precos {...viewProps} />}
          </>
        )}
      </div>

      {detailAnimalId && (
        <AnimalModal
          animal={animalById(detailAnimalId)}
          cliente={clienteById(animalById(detailAnimalId)?.cliente_id)}
          banhos={banhos.filter(b => b.animal_id === detailAnimalId)}
          onClose={() => setDetailAnimalId(null)}
          refreshAll={refreshAll}
          showToast={showToast}
        />
      )}

      <Toast message={toastMsg} />
    </div>
  )
}
