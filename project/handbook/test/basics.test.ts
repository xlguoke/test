import { expect, it } from 'vitest'
import { jwtDecode } from 'jwt-decode'

function sum(x: number, y: number): number {
  return x + y
}

it('1 + 2 should equals 3', () => {
  expect(sum(1, 2)).toBe(3)
})

const arr = [1, 2, 3]

it('shallow copy of array', () => {
  const copy = [...arr]
  while (arr.length)
    arr.pop()
  expect(copy).toEqual([1, 2, 3])
  expect(arr).toEqual([])
})

const token = 'eyJhbGciOiJIUzI1NiIsIlR5cGUiOiJKd3QiLCJ0eXAiOiJKV1QifQ.eyJzc29OYW1lIjoiY3MwMSIsIlVuaXRDb2RlIjoiZ2Z6eCIsImlzcyI6IkhBTkRCT09LIiwiZXhwIjoxNzEwMzE0NjY2LCJ1c2VySWQiOiI4YThhYjBiMjQ2ZGM4MTEyMDE0NmRjODE4MTk1MDA1MiJ9.oatHSTmnKBHfU8NjLDIJdQAA4qhEykKw0EktDTd8KQo'

it('decodes JWT token', () => {
  const decode = jwtDecode(token)
  expect(decode.exp).toBe(1710314666)
})
