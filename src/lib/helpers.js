export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function daysUntil(iso) {
  if (!iso) return null
  const d = new Date(iso)
  const now = new Date()
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24))
}

export function onlyDigits(s) {
  return (s || '').replace(/\D/g, '')
}

export function initials(name) {
  return (name || '?').trim().charAt(0).toUpperCase()
}

// Calcula o status do plano de banho de um animal
export function planoStatus(animal) {
  if (!animal.plano_tipo) return 'sem_plano'
  const dLeft = daysUntil(animal.plano_data_expiracao)
  if (dLeft !== null && dLeft < 0) return 'expirado'
  if (animal.plano_banhos_usados >= animal.plano_banhos_totais) return 'esgotado'
  if (dLeft !== null && dLeft <= 7) return 'expirando'
  return 'ativo'
}

export const STATUS_LABEL = {
  ativo: 'Plano ativo',
  expirando: 'Expira em breve',
  expirado: 'Plano expirado',
  esgotado: 'Banhos esgotados',
  sem_plano: 'Sem plano ativo',
}

export const STATUS_PILL_CLASS = {
  ativo: 'pill-green',
  expirando: 'pill-yellow',
  expirado: 'pill-red',
  esgotado: 'pill-red',
  sem_plano: 'pill-blue',
}

export function matchAnimal(animal, cliente, q) {
  const query = q.toLowerCase()
  const qd = onlyDigits(q)
  return (
    (animal.nome || '').toLowerCase().includes(query) ||
    (animal.raca || '').toLowerCase().includes(query) ||
    (cliente && (cliente.nome || '').toLowerCase().includes(query)) ||
    (cliente && qd && onlyDigits(cliente.cpf).includes(qd)) ||
    (cliente && qd && onlyDigits(cliente.telefone).includes(qd))
  )
}
