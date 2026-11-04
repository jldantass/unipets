import { useState } from 'react'
import { supabase } from '../supabaseClient'

const CATEGORIAS_SUGERIDAS = ['Banho', 'Tosa', 'Extras']

export default function Precos({ precos, refreshAll, showToast }) {
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [novo, setNovo] = useState({ categoria: 'Banho', nome: '', porte: 'Único', preco: '' })
  const [salvando, setSalvando] = useState(false)

  const categorias = [...new Set(precos.map(p => p.categoria))]

  function iniciarEdicao(p) {
    setEditId(p.id)
    setEditForm({ categoria: p.categoria, nome: p.nome, porte: p.porte || '', preco: p.preco })
  }

  async function salvarEdicao(id) {
    setSalvando(true)
    const { error } = await supabase.from('precos').update({
      categoria: editForm.categoria.trim(), nome: editForm.nome.trim(),
      porte: editForm.porte.trim(), preco: parseFloat(editForm.preco) || 0,
    }).eq('id', id)
    setSalvando(false)
    if (error) { showToast('Erro ao salvar: ' + error.message); return }
    setEditId(null)
    refreshAll()
    showToast('Preço atualizado ✅')
  }

  async function excluir(id) {
    if (!window.confirm('Remover este serviço da tabela de preços?')) return
    const { error } = await supabase.from('precos').delete().eq('id', id)
    if (error) { showToast('Erro: ' + error.message); return }
    refreshAll()
  }

  async function adicionar() {
    if (!novo.nome.trim() || novo.preco === '') { showToast('Preencha o nome e o valor do serviço'); return }
    setSalvando(true)
    const { error } = await supabase.from('precos').insert({
      categoria: novo.categoria.trim() || 'Outros', nome: novo.nome.trim(),
      porte: novo.porte.trim() || 'Único', preco: parseFloat(novo.preco) || 0,
      ordem: precos.length + 1,
    })
    setSalvando(false)
    if (error) { showToast('Erro ao adicionar: ' + error.message); return }
    setNovo({ categoria: 'Banho', nome: '', porte: 'Único', preco: '' })
    refreshAll()
    showToast('Serviço adicionado 🎉')
  }

  return (
    <>
      <div className="panel" style={{ marginBottom: 22 }}>
        <h3>➕ Adicionar serviço</h3>
        <div className="field-row">
          <div className="field"><label>Categoria</label>
            <input list="categorias" value={novo.categoria} onChange={e => setNovo({ ...novo, categoria: e.target.value })} />
            <datalist id="categorias">{CATEGORIAS_SUGERIDAS.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="field"><label>Porte</label><input value={novo.porte} onChange={e => setNovo({ ...novo, porte: e.target.value })} placeholder="Pequeno / Médio / Grande / Único" /></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Nome do serviço</label><input value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })} placeholder="Ex: Banho simples" /></div>
          <div className="field"><label>Valor (R$)</label><input type="number" step="0.01" value={novo.preco} onChange={e => setNovo({ ...novo, preco: e.target.value })} placeholder="45.00" /></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" disabled={salvando} onClick={adicionar}>Adicionar à tabela</button>
        </div>
      </div>

      {categorias.length === 0 && (
        <div className="empty-state"><div className="ic">💲</div><h3>Nenhum preço cadastrado</h3><p>Use o formulário acima para começar sua tabela de preços.</p></div>
      )}

      {categorias.map(cat => (
        <div key={cat}>
          <div className="section-title"><h2>{cat}</h2></div>
          <div className="list-panel" style={{ marginBottom: 22 }}>
            <table>
              <thead><tr><th>Serviço</th><th>Porte</th><th>Valor</th><th></th></tr></thead>
              <tbody>
                {precos.filter(p => p.categoria === cat).map(p => (
                  <tr key={p.id}>
                    {editId === p.id ? (
                      <>
                        <td><input value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} /></td>
                        <td><input value={editForm.porte} onChange={e => setEditForm({ ...editForm, porte: e.target.value })} style={{ width: 100 }} /></td>
                        <td><input type="number" step="0.01" value={editForm.preco} onChange={e => setEditForm({ ...editForm, preco: e.target.value })} style={{ width: 100 }} /></td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => salvarEdicao(p.id)} style={{ marginRight: 6 }}>Salvar</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancelar</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="cell-name">{p.nome}</td>
                        <td>{p.porte}</td>
                        <td style={{ fontWeight: 800, color: 'var(--azul)' }}>R$ {Number(p.preco).toFixed(2).replace('.', ',')}</td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => iniciarEdicao(p)} style={{ marginRight: 6 }}>Editar</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => excluir(p.id)}>Excluir</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  )
}
