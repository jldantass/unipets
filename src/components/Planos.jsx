import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { PORTES } from '../lib/helpers'

const novoPlano = { nome: '', porte: '', total_banhos: '', validade_dias: '', preco: '' }
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Planos({ catalogo, erroCatalogo, refreshCatalogo, showToast }) {
  const [form, setForm] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  function editar(plano) {
    setErro('')
    setForm(plano)
  }

  function alterar(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function salvar(e) {
    e.preventDefault()
    const nome = form.nome.trim()
    if (!PORTES.includes(form.porte)) { setErro('Selecione o porte do animal.'); return }
    if (!nome) { setErro('Informe o nome do plano.'); return }
    const campos = {
      nome,
      porte: form.porte,
      total_banhos: Number(form.total_banhos),
      validade_dias: Number(form.validade_dias),
      preco: Number(form.preco),
    }
    setOcupado(true)
    setErro('')
    const tabela = supabase.from('planos_banho')
    const { data, error } = await (form.id
      ? tabela.update(campos).eq('id', form.id)
      : tabela.insert(campos)).select('id').maybeSingle()
    if (error || !data) {
      setErro(error?.code === '23505' ? 'Já existe um plano com esse nome para o porte selecionado.' : error?.message || 'Esse plano já foi removido.')
      if (!data && !error) await refreshCatalogo()
    } else {
      await refreshCatalogo()
      setForm(null)
      showToast(form.id ? 'Plano atualizado.' : 'Plano criado.')
    }
    setOcupado(false)
  }

  async function excluir(plano) {
    if (!window.confirm(`Excluir o plano "${plano.nome}" para porte ${plano.porte}? As assinaturas existentes serão mantidas.`)) return
    setOcupado(true)
    setErro('')
    const { error } = await supabase.from('planos_banho').delete().eq('id', plano.id)
    if (error) setErro('Erro ao excluir plano: ' + error.message)
    else {
      await refreshCatalogo()
      showToast('Plano excluído do catálogo.')
    }
    setOcupado(false)
  }

  if (catalogo === null) return <div className="panel" role="status">Carregando planos…</div>

  if (erroCatalogo) {
    return <div className="panel" role="alert">{erroCatalogo}</div>
  }

  return (
    <>
      <section className="list-panel workflow-list" aria-labelledby="catalogo-title">
        <div className="lp-head">
          <h2 id="catalogo-title">Planos disponíveis</h2>
          <button type="button" className="btn btn-primary" disabled={ocupado || !!form} onClick={() => editar(novoPlano)}>Criar plano</button>
        </div>
        {!form && erro && <p className="workflow-message" role="alert">{erro}</p>}
        {form && (
          <form className="workflow-form" onSubmit={salvar} aria-labelledby="plano-form-title">
            <h3 id="plano-form-title">{form.id ? 'Editar plano' : 'Novo plano'}</h3>
            <fieldset disabled={ocupado}>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="catalogo-nome">Nome do plano</label>
                  <input id="catalogo-nome" name="nome" autoFocus required maxLength={80} value={form.nome} onChange={alterar} />
                </div>
                <div className="field">
                  <label htmlFor="catalogo-porte">Porte</label>
                  <select id="catalogo-porte" name="porte" required value={form.porte} onChange={alterar}>
                    <option value="">Selecione o porte</option>
                    {PORTES.map(porte => <option key={porte}>{porte}</option>)}
                  </select>
                </div>
              </div>
              <div className="catalogo-fields">
                <div className="field">
                  <label htmlFor="catalogo-banhos">Quantidade de banhos</label>
                  <input id="catalogo-banhos" name="total_banhos" type="number" min="1" max="365" required value={form.total_banhos} onChange={alterar} />
                </div>
                <div className="field">
                  <label htmlFor="catalogo-validade">Validade em dias</label>
                  <input id="catalogo-validade" name="validade_dias" type="number" min="1" max="3650" required value={form.validade_dias} onChange={alterar} />
                </div>
                <div className="field">
                  <label htmlFor="catalogo-preco">Preço (R$)</label>
                  <input id="catalogo-preco" name="preco" type="number" min="0" max="99999999.99" step="0.01" required value={form.preco} onChange={alterar} />
                </div>
              </div>
              {erro && <p className="cell-sub" role="alert">{erro}</p>}
              <div className="workflow-actions">
                <button type="button" className="btn btn-ghost" onClick={() => editar(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{ocupado ? 'Salvando…' : 'Salvar plano'}</button>
              </div>
            </fieldset>
          </form>
        )}
      </section>

      <div className="catalogo-grupos">
        {PORTES.map((porte, index) => {
          const planos = catalogo.filter(plano => plano.porte === porte)
          const tituloId = 'catalogo-porte-' + index
          return (
            <section className="list-panel workflow-list catalogo-grupo" aria-labelledby={tituloId} key={porte}>
              <div className="lp-head"><h3 id={tituloId}>Porte {porte}</h3></div>
              {planos.length ? (
                <div className="workflow-table">
                  <table aria-labelledby={tituloId}>
                    <thead><tr><th scope="col">Plano</th><th scope="col">Banhos</th><th scope="col">Validade</th><th scope="col">Preço</th><th scope="col">Ações</th></tr></thead>
                    <tbody>
                      {planos.map(plano => (
                        <tr key={plano.id}>
                          <td className="cell-name">{plano.nome}</td>
                          <td>{plano.total_banhos}</td>
                          <td>{plano.validade_dias} {plano.validade_dias === 1 ? 'dia' : 'dias'}</td>
                          <td>{moeda.format(plano.preco)}</td>
                          <td>
                            <div className="workflow-actions">
                              <button type="button" className="btn btn-ghost btn-sm" aria-label={`Editar ${plano.nome} para porte ${porte}`} disabled={ocupado || !!form} onClick={() => editar(plano)}>Editar</button>
                              <button type="button" className="btn btn-ghost btn-sm" aria-label={`Excluir ${plano.nome} para porte ${porte}`} disabled={ocupado || !!form} onClick={() => excluir(plano)}>Excluir</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="workflow-message">Nenhum plano para este porte.</p>}
            </section>
          )
        })}
      </div>
    </>
  )
}
