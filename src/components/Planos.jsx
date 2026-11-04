import { useState } from 'react'
import { supabase } from '../supabaseClient'
import PawMeter from './PawMeter'
import PlanModal from './PlanModal'
import { planoStatus, STATUS_LABEL, STATUS_PILL_CLASS, fmtDate } from '../lib/helpers'

export default function Planos({ animais, clienteById, refreshAll, showToast }) {
  const [editando, setEditando] = useState(null)

  async function cancelarPlano(animal) {
    if (!window.confirm(`Cancelar o plano de ${animal.nome}?`)) return
    const { error } = await supabase.from('animais').update({
      plano_tipo: null, plano_banhos_totais: null, plano_banhos_usados: 0,
      plano_data_assinatura: null, plano_data_expiracao: null,
    }).eq('id', animal.id)
    if (error) { showToast('Erro: ' + error.message); return }
    refreshAll()
  }

  return (
    <>
      <div className="card-grid">
        {animais.length === 0 && (
          <div className="empty-state"><div className="ic">🎟️</div><h3>Nenhum animal cadastrado</h3><p>Cadastre um animal para gerenciar o plano de banho dele.</p></div>
        )}
        {animais.map(a => {
          const c = clienteById(a.cliente_id)
          const st = planoStatus(a)
          const cardClass = st === 'expirando' ? 'expiring' : (st === 'expirado' || st === 'esgotado') ? 'expired' : st === 'sem_plano' ? 'none' : ''
          return (
            <div className={`plan-card ${cardClass}`} key={a.id}>
              <div className="head">
                <div>
                  <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16 }}>{a.nome}</div>
                  <div className="meta" style={{ fontSize: 12.5, color: 'var(--texto-suave)' }}>{c?.nome || '—'} · {a.raca}</div>
                </div>
                <span className={`pill ${STATUS_PILL_CLASS[st]}`}>{STATUS_LABEL[st]}</span>
              </div>

              {a.plano_tipo ? (
                <>
                  <div style={{ margin: '12px 0 4px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15 }}>
                    {a.plano_banhos_usados}/{a.plano_banhos_totais} banhos usados
                  </div>
                  <PawMeter usados={a.plano_banhos_usados} total={a.plano_banhos_totais} />
                  <div className="dates">📅 Assinado em {fmtDate(a.plano_data_assinatura)} · Expira em {fmtDate(a.plano_data_expiracao)}</div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className="btn btn-accent btn-sm" onClick={() => setEditando(a)}>Renovar / editar</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => cancelarPlano(a)}>Cancelar plano</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ margin: '10px 0 4px', color: 'var(--texto-suave)', fontSize: 13 }}>Este animal ainda não tem um plano de banho.</div>
                  <button className="btn btn-primary btn-sm" onClick={() => setEditando(a)}>Assinar plano</button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {editando && (
        <PlanModal animal={editando} onClose={() => setEditando(null)} refreshAll={refreshAll} showToast={showToast} />
      )}
    </>
  )
}
