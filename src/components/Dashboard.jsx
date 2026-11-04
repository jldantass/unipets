import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Avatar from './Avatar'
import { planoStatus, STATUS_LABEL, STATUS_PILL_CLASS } from '../lib/helpers'

export default function Dashboard({ animais, banhos, clienteById, animalById, refreshAll, showToast, openAnimalDetail }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 30000) // atualiza o cronômetro a cada 30s
    return () => clearInterval(t)
  }, [])

  const ativos = banhos.filter(b => b.status === 'em_andamento')
  const hoje = new Date().toDateString()
  const banhosHoje = banhos.filter(b => new Date(b.hora_inicio).toDateString() === hoje).length
  const expirando = animais.filter(a => planoStatus(a) === 'expirando').length
  const semBanho = animais.filter(a => !ativos.some(b => b.animal_id === a.id))

  async function iniciarBanho(animalId) {
    const animal = animalById(animalId)
    const obs = window.prompt(`Alguma observação para o banho de ${animal.nome}? (opcional)`, '') || ''
    const { error } = await supabase.from('banhos').insert({ animal_id: animalId, observacoes: obs })
    if (error) { showToast('Erro ao iniciar banho: ' + error.message); return }
    refreshAll()
    showToast(`Banho de ${animal.nome} iniciado 🐾`)
  }

  async function finalizarBanho(banho) {
    const animal = animalById(banho.animal_id)
    const { error } = await supabase.from('banhos').update({ status: 'finalizado', hora_fim: new Date().toISOString() }).eq('id', banho.id)
    if (error) { showToast('Erro ao finalizar banho: ' + error.message); return }

    if (animal?.plano_tipo && planoStatus(animal) !== 'expirado' && animal.plano_banhos_usados < animal.plano_banhos_totais) {
      await supabase.from('animais').update({ plano_banhos_usados: animal.plano_banhos_usados + 1 }).eq('id', animal.id)
    }
    refreshAll()
    showToast(`Banho de ${animal?.nome || ''} finalizado ✔️`)
  }

  return (
    <>
      <div className="stats-row">
        <div className="stat-card red"><div className="n">{ativos.length}</div><div className="l">Banhos em andamento</div></div>
        <div className="stat-card"><div className="n">{banhosHoje}</div><div className="l">Banhos hoje</div></div>
        <div className="stat-card yellow"><div className="n">{animais.length}</div><div className="l">Animais cadastrados</div></div>
        <div className="stat-card dark"><div className="n">{expirando}</div><div className="l">Planos expirando</div></div>
      </div>

      <div className="section-title"><h2>🚿 Banhos em andamento</h2></div>
      {ativos.length === 0 ? (
        <div className="empty-state"><div className="ic">🐾</div><h3>Nenhum banho em andamento</h3><p>Assim que iniciar um banho, ele aparece aqui em tempo real para toda a equipe.</p></div>
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
                <div className="timer">⏱ {mins} min</div>
                {a.restricoes && <div className="restr-badge">⚠️ {a.restricoes}</div>}
                {b.observacoes && <div className="meta" style={{ marginTop: 8 }}>📝 {b.observacoes}</div>}
                <div className="actions">
                  <button className="btn btn-primary btn-sm" onClick={() => finalizarBanho(b)}>Finalizar banho</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openAnimalDetail(a.id)}>Ver ficha</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="section-title" style={{ marginTop: 30 }}><h2>🐶 Iniciar novo banho</h2></div>
      {semBanho.length === 0 ? (
        <div className="empty-state"><div className="ic">✅</div><h3>Todos os animais já estão no banho</h3><p></p></div>
      ) : (
        <div className="list-panel">
          <table><tbody>
            {semBanho.map(a => {
              const c = clienteById(a.cliente_id)
              const st = planoStatus(a)
              return (
                <tr className="rowhover" key={a.id} onClick={() => openAnimalDetail(a.id)}>
                  <td style={{ width: 54 }}><Avatar animal={a} size={36} fontSize={15} /></td>
                  <td><div className="cell-name">{a.nome}</div><div className="cell-sub">{a.raca} · {c?.nome || '—'}</div></td>
                  <td><span className={`pill ${STATUS_PILL_CLASS[st]}`}>{STATUS_LABEL[st]}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-accent btn-sm" onClick={e => { e.stopPropagation(); iniciarBanho(a.id) }}>Iniciar banho</button>
                  </td>
                </tr>
              )
            })}
          </tbody></table>
        </div>
      )}
    </>
  )
}
