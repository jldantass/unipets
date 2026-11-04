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
        <img src="/logo.png" alt="Hobby Biches" />
        <h1>Hobby Biches</h1>
        <p>Entre com sua conta de funcionário</p>
        {erro && <div className="login-error">{erro}</div>}
        <div className="field" style={{ textAlign: 'left' }}>
          <label>E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="voce@hobbybiches.com" />
        </div>
        <div className="field" style={{ textAlign: 'left' }}>
          <label>Senha</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required placeholder="••••••••" />
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
