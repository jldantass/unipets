import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calcularServico, precosDoPorte } from '../../src/lib/servicePricing.js'

const banho = { id: '1', nome: 'Banho simples', categoria: 'Banho', porte: 'Médio', preco: 45 }
const hidratacao = { id: '2', nome: 'Banho + hidratação', categoria: 'Banho', porte: 'Médio', preco: 65 }
const tosa = { id: '3', nome: 'Tosa higiênica', categoria: 'Tosa', porte: 'Único', preco: 25 }
const banhoGrande = { ...banho, id: '4', porte: 'Grande', preco: 60 }
const catalogo = [{ id: 'mensal-medio', porte: 'Médio' }]
const animal = {
  porte: 'Médio',
  plano_tipo: 'Mensal',
  plano_catalogo_id: 'mensal-medio',
  plano_banhos_usados: 1,
  plano_banhos_totais: 4,
  plano_data_assinatura: '2026-11-01',
  plano_data_expiracao: '2026-11-24',
}
const hoje = '2026-11-24'
const opcoes = [banho, hidratacao, tosa]

describe('Preço de um atendimento', () => {
  it('lista apenas o porte escolhido e os serviços de porte único', () => {
    assert.deepEqual(precosDoPorte([...opcoes, banhoGrande], 'Médio'), opcoes)
  })

  it('cobre o banho simples no dia do vencimento e mantém a tosa no total', () => {
    assert.deepEqual(calcularServico({ animal, catalogo, opcoes, selecionados: [banho, tosa], hoje }), {
      subtotal: 7000, desconto: 4500, total: 2500,
    })
  })

  it('mantém o valor da hidratação num pacote de banho', () => {
    assert.deepEqual(calcularServico({ animal, catalogo, opcoes, selecionados: [hidratacao, tosa], hoje }), {
      subtotal: 9000, desconto: 4500, total: 4500,
    })
  })

  it('não aplica desconto em um atendimento só de tosa', () => {
    assert.deepEqual(calcularServico({ animal, catalogo, opcoes, selecionados: [tosa], hoje }), {
      subtotal: 2500, desconto: 0, total: 2500,
    })
  })

  it('mantém o preço integral sem saldo, após o vencimento ou antes da assinatura', () => {
    for (const mudancas of [
      { plano_banhos_usados: 4 },
      { plano_data_expiracao: '2026-11-23' },
      { plano_data_assinatura: '2026-11-25' },
    ]) {
      assert.equal(calcularServico({ animal: { ...animal, ...mudancas }, catalogo, opcoes, selecionados: [banho], hoje }).total, 4500)
    }
  })

  it('mantém o preço integral quando o plano vinculado sumiu ou mudou de porte', () => {
    for (const planos of [[], [{ id: 'mensal-medio', porte: 'Grande' }]]) {
      assert.equal(calcularServico({ animal, catalogo: planos, opcoes, selecionados: [banho], hoje }).total, 4500)
    }
  })
})
