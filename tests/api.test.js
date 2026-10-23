const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../server');
let server;
let baseUrl;
before(async () => {
  server = await new Promise(resolve => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});
test('health endpoint returns an OK status', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'OK');
});
test('API returns filtered data and the matching count', async () => {
  const response = await fetch(`${baseUrl}/api/pokemons?name=PIKA&type=electric&legendary=false`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.count, 1);
  assert.equal(body.data[0].name, 'Pikachu');
});
test('known ID returns its Pokemon', async () => {
  const response = await fetch(`${baseUrl}/api/pokemons/1`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.name, 'Pikachu');
});
test('unknown and nonnumeric IDs return 404', async () => {
  for (const id of ['99999', 'not-a-number']) {
    const response = await fetch(`${baseUrl}/api/pokemons/${id}`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).success, false);
  }
});
test('types are unique and sorted', async () => {
  const response = await fetch(`${baseUrl}/api/types`);
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.deepEqual(data, [...new Set(data)].sort());
  assert.ok(data.includes('Electric'));
});
