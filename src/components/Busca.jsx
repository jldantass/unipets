import { useState } from 'react'
import Avatar from './Avatar'
import { matchAnimal, planoStatus, STATUS_LABEL, STATUS_PILL_CLASS } from '../lib/helpers'

export default function Busca({ animais, clienteById, openAnimalDetail }) {
  const [q, setQ] = useState('')
  const results = q.trim() ? animais.filter(a => matchAnimal(a, clienteById(a.cliente_id), q)) : []

  return (
    <>
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="field" style={{ margin: 0 }}>
          <label>Buscar</label>
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Nome do animal, nome do dono, CPF, raça ou telefone"
            style={{ fontSize: 15, padding: '13px 16px' }}
          />
        </div>
      </div>

      {!q.trim() && (
        <div className="empty-state"><div className="ic">🔎</div><h3>Digite para buscar</h3><p>Encontre qualquer animal ou tutor cadastrado no sistema.</p></div>
      )}
      {q.trim() && results.length === 0 && (
        <div className="empty-state"><div className="ic">🐾</div><h3>Nada encontrado</h3><p>Tente buscar por outro nome, CPF, raça ou telefone.</p></div>
      )}
      {results.length > 0 && (
        <div className="card-grid">
          {results.map(a => {
            const c = clienteById(a.cliente_id)
            const st = planoStatus(a)
            return (
              <div className="bath-card" style={{ borderTopColor: 'var(--azul)', cursor: 'pointer' }} key={a.id} onClick={() => openAnimalDetail(a.id)}>
                <div className="top"><Avatar animal={a} />
                  <div><div className="name">{a.nome}</div><div className="meta">{a.raca} · {c?.nome || '—'}</div></div>
                </div>
                <div style={{ marginTop: 10 }}><span className={`pill ${STATUS_PILL_CLASS[st]}`}>{STATUS_LABEL[st]}</span></div>
                <div className="meta" style={{ marginTop: 8 }}>📞 {c?.telefone || '—'} &nbsp;·&nbsp; CPF {c?.cpf || '—'}</div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
