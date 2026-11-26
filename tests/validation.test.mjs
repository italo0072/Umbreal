import test from 'node:test'
import assert from 'node:assert/strict'
import { validEmail, validName, validPassword, validCode, sameOrigin } from '../lib/validation.ts'

test('acepta correos de prueba y rechaza entradas incompletas', () => {
  assert.ok(validEmail('ana+prueba@ejemplo.com'))
  for (const email of ['', 'ana', 'ana@', 'correo con espacios@ejemplo.com', 'a'.repeat(250) + '@x.com']) assert.equal(validEmail(email), false)
})
test('valida los límites del nombre y la contraseña', () => {
  assert.ok(validName('Ana María'))
  assert.equal(validName('   '), false)
  assert.equal(validName('a'.repeat(61)), false)
  assert.ok(validPassword('a'.repeat(12)))
  assert.ok(validPassword('a'.repeat(128)))
  for (const length of [0, 11, 129]) assert.equal(validPassword('a'.repeat(length)), false)
})
test('conserva ceros iniciales en códigos de correo', () => {
  assert.ok(validCode('001234'))
  assert.ok(validCode('0123456789'))
  for (const code of ['12345', '12345678901', 'ABCDEF', ' 012345']) assert.equal(validCode(code), false)
})
test('acepta únicamente el origen configurado completo', () => {
  const expected = 'https://portal.example'
  assert.ok(sameOrigin(expected, expected))
  for (const origin of [null, 'null', 'http://portal.example', 'https://otro.example', 'https://portal.example:444']) {
    assert.equal(sameOrigin(origin, expected), false)
  }
})
