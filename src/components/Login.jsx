import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setLoading(false)
    if (error) setErro('E-mail ou senha inválidos. Confira com o administrador.')
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={entrar}>
        <img src="/unipets.svg" alt="" width="64" height="64" />
        <h1>UniPets</h1>
        <p>Entre com sua conta de funcionário</p>
        {erro && <div className="login-error">{erro}</div>}
        <div className="field" style={{ textAlign: 'left' }}>
          <label htmlFor="login-email">E-mail</label>
          <input id="login-email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required placeholder="voce@exemplo.com" />
        </div>
        <div className="field" style={{ textAlign: 'left' }}>
          <label htmlFor="login-senha">Senha</label>
          <input id="login-senha" type="password" autoComplete="current-password" value={senha} onChange={e => setSenha(e.target.value)} required />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p style={{ fontSize: 11.5, marginTop: 16, color: 'var(--texto-suave)' }}>
          Não tem uma conta? Peça ao administrador para te cadastrar no painel do Supabase.
        </p>
      </form>
    </div>
  )
}
