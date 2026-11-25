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
  const [session, setSession] = useState(undefined)
  const [view, setView] = useState('dashboard')
  const [clientes, setClientes] = useState([])
  const [animais, setAnimais] = useState([])
  const [banhos, setBanhos] = useState([])
  const [precos, setPrecos] = useState([])
  const [catalogo, setCatalogo] = useState(null)
  const [erroCatalogo, setErroCatalogo] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [toastMsg, setToastMsg] = useState('')
  const [detailAnimalId, setDetailAnimalId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2600)
  }

  const refreshAll = useCallback(async () => {
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

  const refreshCatalogo = useCallback(async () => {
    const { data, error } = await supabase.from('planos_banho').select('id, nome, total_banhos, validade_dias, preco, porte').order('preco').order('nome')
    setCatalogo(data || [])
    setErroCatalogo(['PGRST205', '42P01', '42703'].includes(error?.code)
      ? 'O catálogo precisa ser atualizado no Supabase. Siga os passos do banco no README.'
      : error ? 'Não foi possível carregar os planos: ' + error.message : '')
  }, [])

  useEffect(() => {
    if (!session) return
    refreshCatalogo()
  }, [session, refreshCatalogo])

  useEffect(() => {
    if (!session) { setLoadingData(true); return }
    refreshAll()
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

  async function finalizarServico(registro) {
    const { error } = await supabase.rpc('finalizar_servico', { p_id: registro.id })
    if (error) {
      showToast(error.code === 'PGRST202' ? 'Atualize o banco do Supabase seguindo o README.' : 'Erro ao finalizar serviço: ' + error.message)
      return
    }
    await refreshAll()
    showToast('Serviço finalizado.')
  }

  const titles = {
    dashboard: ['Painel de Serviços', 'Acompanhe os atendimentos em tempo real'],
    cadastro: ['Cadastro', 'Clientes, animais e cuidados especiais'],
    planos: ['Planos de Banho', 'Cadastre e gerencie os planos oferecidos pelo pet shop'],
    busca: ['Busca', 'Encontre por animal, dono, CPF, raça ou telefone'],
    precos: ['Tabela de Preços', 'Valores de consulta e edição para a equipe'],
  }

  const viewProps = {
    animais, banhos, precos, catalogo, erroCatalogo, refreshCatalogo,
    clienteById, animalById, refreshAll, showToast, finalizarServico,
    openAnimalDetail: setDetailAnimalId,
  }

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} userEmail={session.user.email} />
      <main className="main">
        <header className="topbar">
          <div>
            <h1>{titles[view][0]}</h1>
            <div className="sub">{titles[view][1]}</div>
          </div>
        </header>

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
      </main>

      {detailAnimalId && (
        <AnimalModal
          animal={animalById(detailAnimalId)}
          cliente={clienteById(animalById(detailAnimalId)?.cliente_id)}
          catalogo={catalogo || []}
          clienteById={clienteById}
          precos={precos}
          refreshCatalogo={refreshCatalogo}
          finalizarServico={finalizarServico}
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
