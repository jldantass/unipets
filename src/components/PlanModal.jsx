import { useState } from 'react'
import { supabase } from '../supabaseClient'

function toInputDate(d) { return d.toISOString().slice(0, 10) }

export default function PlanModal({ animal, onClose, refreshAll, showToast }) {
  const hoje = new Date()
  const expPadrao = new Date(hoje); expPadrao.setDate(expPadrao.getDate() + 30)

  const [tipo, setTipo] = useState(animal.plano_tipo || 'Mensal 4 banhos')
  const [total, setTotal] = useState(animal.plano_banhos_totais || 4)
  const [usados, setUsados] = useState(animal.plano_banhos_usados || 0)
  const [assinatura, setAssinatura] = useState(animal.plano_data_assinatura || toInputDate(hoje))
  const [expiracao, setExpiracao] = useState(animal.plano_data_expiracao || toInputDate(expPadrao))
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    setSalvando(true)
    const { error } = await supabase.from('animais').update({
      plano_tipo: tipo.trim() || 'Plano de banho',
      plano_banhos_totais: Math.max(1, parseInt(total) || 1),
      plano_banhos_usados: Math.min(parseInt(usados) || 0, parseInt(total) || 1),
      plano_data_assinatura: assinatura,
      plano_data_expiracao: expiracao,
    }).eq('id', animal.id)
    setSalvando(false)
    if (error) { showToast('Erro ao salvar plano: ' + error.message); return }
    refreshAll()
    showToast('Plano salvo com sucesso 🎉')
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head"><h3>🎟️ Plano de banho · {animal.nome}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="field"><label>Tipo de plano</label><input value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Ex: Mensal 4 banhos" /></div>
          <div className="field-row">
            <div className="field"><label>Total de banhos no plano</label><input type="number" min="1" value={total} onChange={e => setTotal(e.target.value)} /></div>
            <div className="field"><label>Banhos já usados</label><input type="number" min="0" value={usados} onChange={e => setUsados(e.target.value)} /></div>
          </div>
          <div className="field-row">
            <div className="field"><label>Data de assinatura</label><input type="date" value={assinatura} onChange={e => setAssinatura(e.target.value)} /></div>
            <div className="field"><label>Data de expiração</label><input type="date" value={expiracao} onChange={e => setExpiracao(e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" disabled={salvando} onClick={salvar}>{salvando ? 'Salvando...' : 'Salvar plano'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
