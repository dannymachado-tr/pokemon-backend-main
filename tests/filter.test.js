const { test } = require('node:test');
const assert = require('node:assert/strict');
const { filterPokemons } = require('../server');

const fixtures = [
  { id: 1, name: 'Pikachu', type: ['Electric'], legendary: false },
  { id: 2, name: 'Zapdos', type: ['Electric', 'Flying'], legendary: true },
  { id: 3, name: 'Mew', type: ['Psychic'], legendary: true }
];

test('name matches case-insensitive substrings', () => {
  assert.deepEqual(filterPokemons(fixtures, { name: 'PIKA' }).map(p => p.id), [1]);
});
test('type matches case-insensitively and exactly', () => {
  assert.deepEqual(filterPokemons(fixtures, { type: 'ELECTRIC' }).map(p => p.id), [1, 2]);
  assert.deepEqual(filterPokemons(fixtures, { type: 'elec' }), []);
});
test('legendary false is applied rather than ignored', () => {
  assert.deepEqual(filterPokemons(fixtures, { legendary: 'false' }).map(p => p.id), [1]);
});
test('all supplied filters are combined', () => {
  assert.deepEqual(filterPokemons(fixtures, { name: 'zap', type: 'electric', legendary: 'true' }).map(p => p.id), [2]);
  assert.deepEqual(filterPokemons(fixtures, { name: 'zap', legendary: 'false' }), []);
});
test('filtering leaves its input unchanged', () => {
  const before = JSON.stringify(fixtures);
  const result = filterPokemons(fixtures);
  assert.deepEqual(result, fixtures);
  assert.notEqual(result, fixtures);
  filterPokemons(fixtures, { name: 'Mew' });
  assert.equal(JSON.stringify(fixtures), before);
});
