import { useState } from 'react'
import Avatar from './Avatar'
import Icon from './Icon'
import { matchAnimal, planoStatus, STATUS_LABEL, STATUS_PILL_CLASS } from '../lib/helpers'

export default function Busca({ animais, clienteById, openAnimalDetail }) {
  const [q, setQ] = useState('')
  const query = q.trim()
  const results = query ? animais.filter(a => matchAnimal(a, clienteById(a.cliente_id), query)) : animais

  return (
    <>
      <div className="directory-search field">
        <label htmlFor="directory-query">Buscar</label>
        <div className="directory-input">
          <Icon name="busca" />
          <input
            id="directory-query"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Nome, raça, tutor, CPF ou telefone"
          />
        </div>
      </div>

      <section className="list-panel directory" aria-labelledby="directory-title">
        <div className="lp-head">
          <h2 id="directory-title">{query ? 'Resultados da busca' : 'Animais cadastrados'}</h2>
          <span className="directory-count" role="status">
            {results.length} {results.length === 1 ? 'animal' : 'animais'}
          </span>
        </div>
        {results.length === 0 ? (
          <div className="directory-empty">
            <Icon name="busca" />
            <h3>{query ? 'Nenhum animal encontrado' : 'Nenhum animal cadastrado'}</h3>
            <p>{query ? 'Tente outro termo de busca.' : 'Os animais vão aparecer aqui após o cadastro.'}</p>
          </div>
        ) : (
          <>
            <div className="directory-columns" aria-hidden="true">
              <span>Animal</span><span>Tutor</span><span>Contato</span><span>Plano</span>
            </div>
            <ul className="directory-list" aria-label="Animais">
              {results.map(a => {
                const c = clienteById(a.cliente_id)
                const status = planoStatus(a)
                return (
                  <li className="directory-row" key={a.id}>
                    <div className="directory-pet">
                      <Avatar animal={a} size={40} fontSize={16} />
                      <div>
                        <button type="button" className="directory-link" onClick={() => openAnimalDetail(a.id)}>
                          {a.nome}<Icon name="arrow" />
                        </button>
                        {a.raca && <div className="cell-sub">{a.raca}</div>}
                      </div>
                    </div>
                    <div className="directory-tutor"><span className="directory-label">Tutor</span>{c?.nome || '—'}</div>
                    <div className="directory-contact">
                      <span className="directory-label">Contato</span>
                      {c?.telefone || '—'}
                      {c?.cpf && <span className="cell-sub">CPF {c.cpf}</span>}
                    </div>
                    <div className="directory-plan">
                      <span className={`pill ${STATUS_PILL_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>
    </>
  )
}
