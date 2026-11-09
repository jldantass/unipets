import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { matchAnimal, planoStatus } from '../../src/lib/helpers.js'

describe('Status do plano de banho', () => {
  const plano = {
    plano_tipo: 'Mensal 4 banhos',
    plano_banhos_totais: 4,
    plano_banhos_usados: 1,
    plano_data_expiracao: '2026-01-18',
  }

  beforeEach(({ mock }) => {
    mock.timers.enable({ apis: ['Date'], now: Date.UTC(2026, 0, 10) })
  })

  test('animal sem assinatura fica sem plano', () => {
    assert.equal(planoStatus({}), 'sem_plano')
  })

  test('plano com saldo e vencimento em oito dias está ativo', () => {
    assert.equal(planoStatus(plano), 'ativo')
  })

  test('plano com vencimento em sete dias está expirando', () => {
    assert.equal(planoStatus({ ...plano, plano_data_expiracao: '2026-01-17' }), 'expirando')
  })

  test('plano com saldo no dia do vencimento está expirando', () => {
    assert.equal(planoStatus({ ...plano, plano_data_expiracao: '2026-01-10' }), 'expirando')
  })

  test('plano vencido há um dia está expirado mesmo com saldo', () => {
    assert.equal(planoStatus({ ...plano, plano_data_expiracao: '2026-01-09' }), 'expirado')
  })

  test('plano fica esgotado ao atingir o total de banhos', () => {
    assert.equal(planoStatus({ ...plano, plano_banhos_usados: 4 }), 'esgotado')
  })

  test('plano vencido e sem saldo aparece como expirado', () => {
    assert.equal(planoStatus({
      ...plano,
      plano_banhos_usados: 4,
      plano_data_expiracao: '2026-01-09',
    }), 'expirado')
  })
})

describe('Busca por pet e tutor', () => {
  const pet = { nome: 'Luna', raca: 'Poodle' }
  const tutor = { nome: 'Ana Lima', cpf: '123.456.789-00', telefone: '(85) 99999-1234' }

  test('encontra o nome do pet com caixa diferente', () => {
    assert.ok(matchAnimal(pet, tutor, 'LUNA'))
  })

  test('encontra parte da raça', () => {
    assert.ok(matchAnimal(pet, tutor, 'pood'))
  })

  test('encontra parte do nome do tutor', () => {
    assert.ok(matchAnimal(pet, tutor, 'lima'))
  })

  test('encontra o CPF pelos dígitos mesmo com máscara no cadastro', () => {
    assert.ok(matchAnimal(pet, tutor, '12345678900'))
  })

  test('encontra o telefone apesar de formatações diferentes', () => {
    assert.ok(matchAnimal(pet, tutor, '85 99999 1234'))
  })

  test('não encontra o pet quando nenhum campo corresponde', () => {
    assert.ok(!matchAnimal(pet, tutor, 'Thor'))
  })
})
