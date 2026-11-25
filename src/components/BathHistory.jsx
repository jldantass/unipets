import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { fmtDateTime } from '../lib/helpers'
import { formatarReais, nomesDoServico } from '../lib/servicePricing'
import Dialog from './Dialog'
import Icon from './Icon'

const TAMANHO_PAGINA = 20

export function BathHistoryList({ banhos, animalById, clienteById, openAnimalDetail }) {
  if (!banhos.length) return <p className="workflow-message">Nenhum serviço finalizado ainda.</p>

  return (
    <ul className="bath-history-list">
      {banhos.map(banho => {
        const animal = animalById(banho.animal_id)
        const tutor = clienteById(animal?.cliente_id)
        const finalizadoEm = banho.hora_fim || banho.hora_inicio
        return (
          <li key={banho.id} className="bath-history-row">
            <div>
              {animal
                ? <button type="button" className="directory-link" onClick={() => openAnimalDetail(animal.id)}>{animal.nome}<Icon name="arrow" /></button>
                : <strong>Animal indisponível</strong>}
              {tutor?.nome && <div className="cell-sub">{tutor.nome}</div>}
              <div className="cell-sub">{nomesDoServico(banho)}</div>
            </div>
            <div className="service-history-value">
              {banho.valor_total != null && <strong>{formatarReais(banho.valor_total)}</strong>}
              <time dateTime={finalizadoEm || undefined}>{fmtDateTime(finalizadoEm)}</time>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function BathHistory({ animalById, clienteById, openAnimalDetail, onClose }) {
  const [pagina, setPagina] = useState(0)
  const [tentativa, setTentativa] = useState(0)
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    let ativo = true
    const inicio = pagina * TAMANHO_PAGINA

    async function carregar() {
      const { data, error } = await supabase.from('banhos')
        .select('id, animal_id, hora_inicio, hora_fim, servicos, valor_total')
        .eq('status', 'finalizado')
        .order('hora_fim', { ascending: false, nullsFirst: false })
        .order('hora_inicio', { ascending: false, nullsFirst: false })
        .order('id', { ascending: false })
        .range(inicio, inicio + TAMANHO_PAGINA)

      if (ativo) setResultado({ banhos: data || [], erro: !!error })
    }

    carregar()
    return () => { ativo = false }
  }, [pagina, tentativa])

  function navegar(novaPagina) {
    setResultado(null)
    setPagina(novaPagina)
  }

  return (
    <Dialog id="historico-completo" title="Histórico completo de serviços" onClose={onClose} className="bath-history-dialog">
      {!resultado && <p className="workflow-message" role="status">Carregando histórico…</p>}
      {resultado?.erro && (
        <div className="modal-body">
          <p className="cell-sub" role="alert">Não foi possível carregar o histórico.</p>
          <button type="button" className="btn btn-ghost" onClick={() => { setResultado(null); setTentativa(n => n + 1) }}>Tentar novamente</button>
        </div>
      )}
      {resultado && !resultado.erro && (
        <BathHistoryList
          banhos={resultado.banhos.slice(0, TAMANHO_PAGINA)}
          animalById={animalById}
          clienteById={clienteById}
          openAnimalDetail={id => { onClose(); openAnimalDetail(id) }}
        />
      )}
      {(pagina > 0 || resultado?.banhos.length > TAMANHO_PAGINA) && (
        <nav className="bath-history-pagination" aria-label="Páginas do histórico">
          <button type="button" className="btn btn-ghost btn-sm" disabled={!resultado || pagina === 0} onClick={() => navegar(pagina - 1)}>Anterior</button>
          <span className="cell-sub" aria-live="polite">Página {pagina + 1}</span>
          <button type="button" className="btn btn-ghost btn-sm" disabled={!resultado || resultado.banhos.length <= TAMANHO_PAGINA} onClick={() => navegar(pagina + 1)}>Próxima</button>
        </nav>
      )}
    </Dialog>
  )
}
