const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dataLocal = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Fortaleza' })

const normalizar = valor => String(valor ?? '').trim().toLowerCase()
const centavos = valor => Math.round(Number(valor) * 100)

export function formatarReais(valor) {
  return moeda.format(Number(valor))
}

export function ehBanho(item) {
  return normalizar(item.categoria) === 'banho'
}

export function precosDoPorte(precos, porte) {
  return precos.filter(item => {
    const tamanho = normalizar(item.porte)
    return Number(item.preco) >= 0 && Number(item.preco) <= 99999999.99 &&
      (tamanho === normalizar(porte) || ['', 'único', 'unico'].includes(tamanho))
  })
}

export function calcularServico({ animal, catalogo, opcoes, selecionados, hoje = dataLocal.format(new Date()) }) {
  const subtotal = selecionados.reduce((soma, item) => soma + centavos(item.preco), 0)
  const banho = selecionados.find(ehBanho)
  const planoValido = animal?.plano_tipo
    && (animal.plano_banhos_usados ?? 0) < animal.plano_banhos_totais
    && animal.plano_data_expiracao >= hoje
    && (!animal.plano_data_assinatura || animal.plano_data_assinatura <= hoje)
    && catalogo.some(plano => plano.id === animal.plano_catalogo_id && plano.porte === animal.porte)

  const bases = opcoes.filter(item => ehBanho(item) && ['banho simples', 'banho'].includes(normalizar(item.nome)))
  bases.sort((a, b) =>
    Number(normalizar(b.porte) === normalizar(animal?.porte)) - Number(normalizar(a.porte) === normalizar(animal?.porte)) ||
    (a.ordem ?? Infinity) - (b.ordem ?? Infinity) ||
    a.id.localeCompare(b.id)
  )
  const desconto = banho && planoValido && bases.length
    ? Math.min(centavos(banho.preco), centavos(bases[0].preco))
    : 0
  return { subtotal, desconto, total: subtotal - desconto }
}

export function nomesDoServico(registro) {
  return registro.servicos?.map(item => item.nome).join(' · ') || 'Banho'
}
