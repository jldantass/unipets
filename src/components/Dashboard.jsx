import { useEffect, useState } from 'react'
import Avatar from './Avatar'
import Icon from './Icon'
import { planoStatus } from '../lib/helpers'
import BathHistory, { BathHistoryList } from './BathHistory'
import ServiceDialog from './ServiceDialog'
import { formatarReais, nomesDoServico } from '../lib/servicePricing'

export default function Dashboard({
  animais, banhos, precos, catalogo, clienteById, animalById, refreshAll, refreshCatalogo,
  finalizarServico, showToast, openAnimalDetail,
}) {
  const [, setTick] = useState(0)
  const [mostrandoInicio, setMostrandoInicio] = useState(false)
  const [mostrandoHistorico, setMostrandoHistorico] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const ativos = banhos.filter(b => b.status === 'em_andamento')
  const hoje = new Date().toDateString()
  const servicosHoje = banhos.filter(b => new Date(b.hora_inicio).toDateString() === hoje).length
  const expirando = animais.filter(a => planoStatus(a) === 'expirando').length
  const disponiveis = animais.filter(a => !ativos.some(b => b.animal_id === a.id))

  const historico = banhos.filter(b => b.status === 'finalizado')
    .sort((a, b) => new Date(b.hora_fim || b.hora_inicio) - new Date(a.hora_fim || a.hora_inicio))
    .slice(0, 5)

  return (
    <>
      <dl className="stats-row" aria-label="Resumo do painel">
        <div className="stat-card"><dt className="l">Serviços em andamento</dt><dd className="n">{ativos.length}</dd></div>
        <div className="stat-card"><dt className="l">Serviços hoje</dt><dd className="n">{servicosHoje}</dd></div>
        <div className="stat-card"><dt className="l">Animais cadastrados</dt><dd className="n">{animais.length}</dd></div>
        <div className="stat-card"><dt className="l">Planos expirando</dt><dd className="n">{expirando}</dd></div>
      </dl>

      <div className="section-title bath-heading">
        <h2>Serviços em andamento</h2>
        <button type="button" className="btn btn-primary" aria-haspopup="dialog" onClick={() => setMostrandoInicio(true)}>
          <Icon name="bath" /> Iniciar serviço
        </button>
      </div>
      {ativos.length === 0 ? (
        <div className="empty-state bath-empty"><Icon name="bath" /><div><h3>Nenhum serviço em andamento</h3><p>Use o botão Iniciar serviço para escolher um cachorro.</p></div></div>
      ) : (
        <div className="card-grid">
          {ativos.map(b => {
            const a = animalById(b.animal_id)
            if (!a) return null
            const c = clienteById(a.cliente_id)
            const mins = Math.max(0, Math.round((Date.now() - new Date(b.hora_inicio)) / 60000))
            return (
              <div className="bath-card" key={b.id}>
                <div className="top">
                  <Avatar animal={a} />
                  <div><div className="name">{a.nome}</div><div className="meta">{a.raca} · {c?.nome || '—'}</div></div>
                </div>
                <div className="service-card-items">{nomesDoServico(b)}</div>
                {b.valor_total != null && <strong>{formatarReais(b.valor_total)}</strong>}
                <div className="timer"><Icon name="clock" /> {mins} min</div>
                {a.restricoes && <div className="restr-badge"><Icon name="alert" /> {a.restricoes}</div>}
                {b.observacoes && <div className="bath-note meta"><Icon name="note" /> {b.observacoes}</div>}
                <div className="actions">
                  <button className="btn btn-primary btn-sm" onClick={() => finalizarServico(b)}>Finalizar serviço</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openAnimalDetail(a.id)}>Ver ficha</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <section className="list-panel workflow-list bath-history" aria-labelledby="bath-history-title">
        <div className="lp-head">
          <h2 id="bath-history-title">Últimos 5 serviços</h2>
          <button type="button" className="btn btn-ghost" aria-haspopup="dialog" onClick={() => setMostrandoHistorico(true)}>
            Ver histórico completo
          </button>
        </div>
        <BathHistoryList banhos={historico} animalById={animalById} clienteById={clienteById} openAnimalDetail={openAnimalDetail} />
      </section>

      {mostrandoInicio && (
        <ServiceDialog
          animais={disponiveis} precos={precos} catalogo={catalogo || []} clienteById={clienteById}
          refreshAll={refreshAll} refreshCatalogo={refreshCatalogo} showToast={showToast}
          onClose={() => setMostrandoInicio(false)}
        />
      )}
      {mostrandoHistorico && (
        <BathHistory
          animalById={animalById}
          clienteById={clienteById}
          openAnimalDetail={openAnimalDetail}
          onClose={() => setMostrandoHistorico(false)}
        />
      )}
    </>
  )
}
