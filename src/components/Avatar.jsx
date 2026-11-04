import { initials } from '../lib/helpers'

export default function Avatar({ animal, size = 52, fontSize = 22 }) {
  const style = { width: size, height: size, fontSize }
  if (animal?.foto_url) {
    return (
      <div className="avatar" style={style}>
        <img src={animal.foto_url} alt={animal.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  return <div className="avatar" style={style}>{initials(animal?.nome)}</div>
}
