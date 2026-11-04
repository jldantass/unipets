import { useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import Avatar from './Avatar'
import { planoStatus, STATUS_LABEL, STATUS_PILL_CLASS } from '../lib/helpers'

const PORTES = ['Pequeno', 'Médio', 'Grande']

export default function Cadastro({ animais, clientes, clienteById, refreshAll, showToast, openAnimalDetail }) {
  const fotoInputRef = useRef(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({
    c_nome: '', c_cpf: '', c_tel: '', c_end: '',
    a_nome: '', a_raca: '', a_porte: 'Pequeno', a_idade: '', a_restr: '',
  })

  function onField(key, value) { setForm(f => ({ ...f, [key]: value })) }

  function onFotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { showToast('A foto deve ter no máximo 2MB.'); e.target.value = ''; return }
    const reader = new FileReader()
    reader.onload = () => setFotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  async function salvar() {
    if (!form.c_nome.trim() || !form.a_nome.trim()) { showToast('Preencha ao menos o nome do cliente e do animal'); return }
    setSalvando(true)

    const { data: cliente, error: errCliente } = await supabase
      .from('clientes')
      .insert({ nome: form.c_nome.trim(), cpf: form.c_cpf.trim(), telefone: form.c_tel.trim(), endereco: form.c_end.trim() })
      .select().single()

    if (errCliente) { showToast('Erro ao salvar cliente: ' + errCliente.message); setSalvando(false); return }

    // Faz upload da foto para o Supabase Storage (bucket "fotos-pets"), se houver uma selecionada
    let foto_url = null
    const file = fotoInputRef.current?.files?.[0]
    if (file) {
      const path = `${cliente.id}-${Date.now()}-${file.name}`
      const { error: errUpload } = await supabase.storage.from('fotos-pets').upload(path, file)
      if (errUpload) {
        showToast('Cliente salvo, mas a foto falhou: ' + errUpload.message)
      } else {
        foto_url = supabase.storage.from('fotos-pets').getPublicUrl(path).data.publicUrl
      }
    }

    const { error: errAnimal } = await supabase.from('animais').insert({
      cliente_id: cliente.id, nome: form.a_nome.trim(), raca: form.a_raca.trim(),
      porte: form.a_porte, idade: form.a_idade.trim(), restricoes: form.a_restr.trim(), foto_url,
    })
    setSalvando(false)
    if (errAnimal) { showToast('Erro ao salvar animal: ' + errAnimal.message); return }

    setForm({ c_nome: '', c_cpf: '', c_tel: '', c_end: '', a_nome: '', a_raca: '', a_porte: 'Pequeno', a_idade: '', a_restr: '' })
    setFotoPreview(null)
    if (fotoInputRef.current) fotoInputRef.current.value = ''
    refreshAll()
    showToast('Cliente e animal cadastrados 🎉')
  }

  async function excluir(id, nome) {
    if (!window.confirm(`Remover ${nome} e seu histórico de banhos?`)) return
    const { error } = await supabase.from('animais').delete().eq('id', id)
    if (error) { showToast('Erro ao excluir: ' + error.message); return }
    refreshAll()
  }

  return (
    <>
      <div className="grid-2">
        <div className="panel">
          <h3>👤 Novo cliente</h3>
          <div className="field"><label>Nome completo</label>
            <input value={form.c_nome} onChange={e => onField('c_nome', e.target.value)} placeholder="Ex: Marina Alves" />
          </div>
          <div className="field-row">
            <div className="field"><label>CPF</label><input value={form.c_cpf} onChange={e => onField('c_cpf', e.target.value)} placeholder="000.000.000-00" /></div>
            <div className="field"><label>Telefone</label><input value={form.c_tel} onChange={e => onField('c_tel', e.target.value)} placeholder="(88) 90000-0000" /></div>
          </div>
          <div className="field"><label>Endereço</label><input value={form.c_end} onChange={e => onField('c_end', e.target.value)} placeholder="Rua, número, bairro" /></div>
        </div>

        <div className="panel">
          <h3>🐾 Animal do cliente</h3>
          <div className="field"><label>Nome do animal</label><input value={form.a_nome} onChange={e => onField('a_nome', e.target.value)} placeholder="Ex: Thor" /></div>
          <div className="field-row">
            <div className="field"><label>Raça</label><input value={form.a_raca} onChange={e => onField('a_raca', e.target.value)} placeholder="Ex: Golden Retriever" /></div>
            <div className="field"><label>Porte</label>
              <select value={form.a_porte} onChange={e => onField('a_porte', e.target.value)}>
                {PORTES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Idade</label><input value={form.a_idade} onChange={e => onField('a_idade', e.target.value)} placeholder="Ex: 3 anos" /></div>
          <div className="field"><label>Restrições / pedidos especiais</label>
            <textarea value={form.a_restr} onChange={e => onField('a_restr', e.target.value)} placeholder="Ex: alérgico a shampoo perfumado, medo de secador..." />
          </div>
          <div className="field">
            <label>Foto do pet (opcional, até 2MB)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar" style={{ width: 52, height: 52, fontSize: 20 }}>
                {fotoPreview ? <img src={fotoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📷'}
              </div>
              <input type="file" accept="image/*" ref={fotoInputRef} onChange={onFotoChange} style={{ border: 'none', padding: 0 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" disabled={salvando} onClick={salvar}>
          {salvando ? 'Salvando...' : 'Salvar cliente e animal'}
        </button>
      </div>

      <div className="list-panel">
        <div className="lp-head"><h3 style={{ margin: 0, fontSize: 15 }}>Clientes e animais cadastrados ({animais.length})</h3></div>
        <table>
          <thead><tr><th>Animal</th><th>Dono</th><th>Contato</th><th>Plano</th><th></th></tr></thead>
          <tbody>
            {animais.map(a => {
              const c = clienteById(a.cliente_id)
              const st = planoStatus(a)
              return (
                <tr className="rowhover" key={a.id} onClick={() => openAnimalDetail(a.id)}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar animal={a} size={34} fontSize={14} />
                    <div><div className="cell-name">{a.nome}</div><div className="cell-sub">{a.raca} · {a.porte}</div></div>
                  </div></td>
                  <td>{c?.nome || '—'}<div className="cell-sub">{c?.cpf}</div></td>
                  <td>{c?.telefone || '—'}</td>
                  <td><span className={`pill ${STATUS_PILL_CLASS[st]}`}>{STATUS_LABEL[st]}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); excluir(a.id, a.nome) }}>Excluir</button>
                  </td>
                </tr>
              )
            })}
            {animais.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--texto-suave)', padding: 24 }}>Nenhum animal cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
