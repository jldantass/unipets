import { useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { calcularServico, ehBanho, formatarReais, precosDoPorte } from '../lib/servicePricing'
import { matchAnimal } from '../lib/helpers'
import Dialog from './Dialog'

export default function ServiceDialog({
  animais, precos, catalogo, clienteById, animalInicial = '', refreshAll, refreshCatalogo, onClose, showToast,
}) {
  const [animalId, setAnimalId] = useState(animalInicial)
  const [busca, setBusca] = useState('')
  const [selecionadosIds, setSelecionadosIds] = useState([])
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState('')
  const [iniciando, setIniciando] = useState(false)
  const pedido = useRef(null)
  const animal = animais.find(a => a.id === animalId)
  const termo = busca.trim()
  const resultados = !animal && termo
    ? animais.filter(a => matchAnimal(a, clienteById(a.cliente_id), termo))
    : []
  const opcoes = animal ? precosDoPorte(precos, animal.porte) : []
  const selecionados = opcoes.filter(item => selecionadosIds.includes(item.id))
  const categorias = [...new Set(opcoes.map(item => item.categoria))]
  const { subtotal, desconto, total } = calcularServico({ animal, catalogo, opcoes, selecionados })

  function escolherAnimal(id) {
    setAnimalId(id)
    setBusca('')
    setSelecionadosIds([])
    setErro('')
    pedido.current = null
  }

  function marcar(item) {
    setSelecionadosIds(ids => {
      if (ids.includes(item.id)) return ids.filter(id => id !== item.id)
      const outros = ehBanho(item) ? ids.filter(id => !opcoes.some(opcao => opcao.id === id && ehBanho(opcao))) : ids
      return [...outros, item.id]
    })
    setErro('')
  }

  async function iniciar(e) {
    e.preventDefault()
    if (!animal || !selecionados.length || iniciando) return
    setIniciando(true)
    setErro('')
    pedido.current ||= crypto.randomUUID()
    const { error } = await supabase.rpc('iniciar_servico', {
      p_id: pedido.current,
      p_animal_id: animal.id,
      p_servicos: selecionados.map(item => item.id),
      p_observacoes: observacoes.trim(),
      p_total_centavos: total,
      p_desconto_centavos: desconto,
    })
    await Promise.all([refreshAll(), refreshCatalogo()])
    setIniciando(false)
    if (error) {
      setErro(error.code === 'PGRST202'
        ? 'Atualize o banco do Supabase para liberar os serviços. O passo está no README.'
        : error.message)
      return
    }
    showToast('Serviço de ' + animal.nome + ' iniciado.')
    onClose()
  }

  return (
    <Dialog id="novo-servico" title="Iniciar serviço" onClose={onClose} busy={iniciando}>
      <form className="modal-body start-service-form" onSubmit={iniciar}>
        {animais.length ? (
          <fieldset disabled={iniciando}>
            {animal ? (
              <div className="service-pet-selected">
                <div>
                  <div className="cell-sub">Cachorro selecionado</div>
                  <strong>{animal.nome}</strong>
                  <div className="cell-sub">{[clienteById(animal.cliente_id)?.nome, animal.porte].filter(Boolean).join(' · ')}</div>
                </div>
                {!animalInicial && <button type="button" className="btn btn-ghost btn-sm" onClick={() => escolherAnimal('')}>Trocar cachorro</button>}
              </div>
            ) : (
              <div className="field">
                <label htmlFor="novo-servico-animal">Buscar cachorro</label>
                <input id="novo-servico-animal" type="search" autoComplete="off" value={busca}
                  onChange={e => setBusca(e.target.value)} placeholder="Nome do cachorro ou do tutor" />
                {termo && resultados.length === 0 && <p className="cell-sub" role="status">Nenhum cachorro disponível encontrado.</p>}
                {resultados.length > 0 && (
                  <ul className="service-pet-results" aria-label="Cachorros encontrados">
                    {resultados.map(a => {
                      const detalhes = [clienteById(a.cliente_id)?.nome, a.porte].filter(Boolean).join(' · ')
                      return (
                        <li key={a.id}>
                          <button type="button" onClick={() => escolherAnimal(a.id)}>
                            <strong>{a.nome}</strong>
                            {detalhes && <span className="cell-sub">{detalhes}</span>}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}
            {animal && opcoes.length === 0 && <p className="cell-sub">Nenhum serviço disponível para este porte. Confira a aba Preços.</p>}
            {categorias.length > 0 && (
              <div className="service-options">
                {categorias.map(categoria => (
                  <fieldset className="service-category" key={categoria}>
                    <legend>{categoria}</legend>
                    {opcoes.filter(item => item.categoria === categoria).map(item => (
                      <label className="service-option" key={item.id}>
                        <input type="checkbox" checked={selecionadosIds.includes(item.id)} onChange={() => marcar(item)} />
                        <span>{item.nome}</span>
                        <strong>{formatarReais(item.preco)}</strong>
                      </label>
                    ))}
                  </fieldset>
                ))}
              </div>
            )}
            <div className="field">
              <label htmlFor="novo-servico-obs">Observações (opcional)</label>
              <textarea id="novo-servico-obs" value={observacoes} onChange={e => setObservacoes(e.target.value)} />
            </div>
            <dl className="service-total" aria-live="polite">
              {desconto > 0 && (
                <>
                  <div><dt>Subtotal</dt><dd>{formatarReais(subtotal / 100)}</dd></div>
                  <div><dt>Banho coberto pelo plano</dt><dd>− {formatarReais(desconto / 100)}</dd></div>
                </>
              )}
              <div className="service-total-final"><dt>Total</dt><dd>{formatarReais(total / 100)}</dd></div>
            </dl>
            <div className="workflow-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={!animal || selecionados.length === 0}>{iniciando ? 'Iniciando…' : 'Confirmar início'}</button>
            </div>
          </fieldset>
        ) : <p className="cell-sub">Nenhum cachorro disponível para iniciar um serviço.</p>}
        {erro && <p className="cell-sub" role="alert">{erro}</p>}
      </form>
    </Dialog>
  )
}
