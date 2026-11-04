import { useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import Avatar from './Avatar'
import PawMeter from './PawMeter'
import PlanModal from './PlanModal'
import { planoStatus, STATUS_LABEL, STATUS_PILL_CLASS, fmtDate, fmtDateTime } from '../lib/helpers'

export default function AnimalModal({ animal, cliente, banhos, onClose, refreshAll, showToast }) {
  const fotoInputRef = useRef(null)
  const [trocandoFoto, setTrocandoFoto] = useState(false)
  const [mostrarPlano, setMostrarPlano] = useState(false)

  if (!animal) return null
  const st = planoStatus(animal)
  const historico = [...banhos].sort((a, b) => new Date(b.hora_inicio) - new Date(a.hora_inicio))
  const emAndamento = historico.find(b => b.status === 'em_andamento')

  async function trocarFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { showToast('A foto deve ter no máximo 2MB.'); return }
    setTrocandoFoto(true)
    const path = `${animal.id}-${Date.now()}-${file.name}`
    const { error: errUpload } = await supabase.storage.from('fotos-pets').upload(path, file)
    if (errUpload) { showToast('Erro ao enviar foto: ' + errUpload.message); setTrocandoFoto(false); return }
    const url = supabase.storage.from('fotos-pets').getPublicUrl(path).data.publicUrl
    const { error } = await supabase.from('animais').update({ foto_url: url }).eq('id', animal.id)
    setTrocandoFoto(false)
    if (error) { showToast('Erro ao salvar foto: ' + error.message); return }
    refreshAll()
    showToast('Foto atualizada 📷')
  }

  async function iniciarBanho() {
    const obs = window.prompt(`Alguma observação para o banho de ${animal.nome}? (opcional)`, '') || ''
    const { error } = await supabase.from('banhos').insert({ animal_id: animal.id, observacoes: obs })
    if (error) { showToast('Erro: ' + error.message); return }
    refreshAll()
  }

  async function finalizarBanho(banho) {
    const { error } = await supabase.from('banhos').update({ status: 'finalizado', hora_fim: new Date().toISOString() }).eq('id', banho.id)
    if (error) { showToast('Erro: ' + error.message); return }
    if (animal.plano_tipo && planoStatus(animal) !== 'expirado' && animal.plano_banhos_usados < animal.plano_banhos_totais) {
      await supabase.from('animais').update({ plano_banhos_usados: animal.plano_banhos_usados + 1 }).eq('id', animal.id)
    }
    refreshAll()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head"><h3>Ficha do animal</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="detail-hero">
            <Avatar animal={animal} size={64} fontSize={26} />
            <div>
              <div className="dn">{animal.nome}</div>
              <div className="ds">{animal.raca} · {animal.porte || '—'} · {animal.idade || '—'}</div>
              <label className="btn btn-ghost btn-sm" style={{ marginTop: 6, display: 'inline-flex' }}>
                {trocandoFoto ? 'Enviando...' : '📷 Trocar foto'}
                <input type="file" accept="image/*" style={{ display: 'none' }} ref={fotoInputRef} onChange={trocarFoto} disabled={trocandoFoto} />
              </label>
            </div>
          </div>

          <div className="info-grid">
            <div><b>Tutor</b><span>{cliente?.nome || '—'}</span></div>
            <div><b>Telefone</b><span>{cliente?.telefone || '—'}</span></div>
            <div><b>CPF</b><span>{cliente?.cpf || '—'}</span></div>
            <div><b>Endereço</b><span>{cliente?.endereco || '—'}</span></div>
          </div>
          {animal.restricoes && <div className="restr-badge">⚠️ Restrição / pedido: {animal.restricoes}</div>}

          <div className="divider" />
          <h3 style={{ margin: '0 0 10px', fontSize: 14 }}>🎟️ Plano de banho</h3>
          {animal.plano_tipo ? (
            <div className="panel" style={{ boxShadow: 'none', border: '1px solid var(--borda)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontFamily: 'Fredoka' }}>{animal.plano_tipo}</b>
                <span className={`pill ${STATUS_PILL_CLASS[st]}`}>{STATUS_LABEL[st]}</span>
              </div>
              <div style={{ margin: '10px 0 4px' }}><PawMeter usados={animal.plano_banhos_usados} total={animal.plano_banhos_totais} /></div>
              <div className="cell-sub">{animal.plano_banhos_usados}/{animal.plano_banhos_totais} banhos usados · expira em {fmtDate(animal.plano_data_expiracao)}</div>
            </div>
          ) : (
            <div className="panel" style={{ boxShadow: 'none', border: '1px solid var(--borda)', padding: 16, textAlign: 'center' }}>
              <div className="cell-sub" style={{ marginBottom: 10 }}>Sem plano de banho ativo</div>
              <button className="btn btn-primary btn-sm" onClick={() => setMostrarPlano(true)}>Assinar plano</button>
            </div>
          )}

          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 14 }}>🚿 Banho</h3>
            {emAndamento
              ? <button className="btn btn-primary btn-sm" onClick={() => finalizarBanho(emAndamento)}>Finalizar banho</button>
              : <button className="btn btn-accent btn-sm" onClick={iniciarBanho}>Iniciar banho</button>}
          </div>

          <h3 style={{ margin: '14px 0 6px', fontSize: 14 }}>📜 Histórico de banhos</h3>
          {historico.length === 0
            ? <div className="cell-sub">Nenhum banho registrado ainda.</div>
            : historico.slice(0, 8).map(b => (
              <div className="hist-item" key={b.id}>
                <span>{fmtDateTime(b.hora_inicio)}</span>
                <span className={`pill ${b.status === 'em_andamento' ? 'pill-red' : 'pill-green'}`}>
                  {b.status === 'em_andamento' ? 'Em andamento' : 'Finalizado'}
                </span>
              </div>
            ))}
        </div>
      </div>

      {mostrarPlano && (
        <PlanModal animal={animal} onClose={() => setMostrarPlano(false)} refreshAll={refreshAll} showToast={showToast} />
      )}
    </div>
  )
}
