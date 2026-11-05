const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../index');
const { generateToken } = require('../utils/jwt');
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

function extractRoutes(stack, prefix = '') {
  let routes = [];
  for (const layer of stack) {
    if (layer.route) {
      const fullPath = (prefix + layer.route.path).replace(/\/+/g, '/');
      for (const method of Object.keys(layer.route.methods)) {
        routes.push({ method: method.toUpperCase(), path: fullPath });
      }
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      let routerPrefix = '';
      if (layer.regexp) {
        let src = layer.regexp.source;
        src = src.replace(/^\^/, '').replace(/\\\/\?\(\?=\\\/\|\$\)\/?$/, '');
        src = src.replace(/\\\//g, '/');
        if (src && !src.startsWith('/')) src = '/' + src;
        routerPrefix = src;
      }
      routes = routes.concat(extractRoutes(layer.handle.stack, prefix + routerPrefix));
    }
  }
  return routes;
}

test('Demo Route Coverage - All non-GET routes reject demo token with 403 DEMO_MODE', async (t) => {
  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });

  t.after(() => {
    if (server) server.close();
  });

  const demoToken = generateToken({
    userId: 'mock-demo-user-id',
    role: 'ADMIN',
    isDemo: true,
  });

  const allRoutes = extractRoutes(app._router.stack);
  const nonGetRoutes = allRoutes.filter(
    (r) => !['GET', 'HEAD', 'OPTIONS'].includes(r.method) && !r.path.includes('/logout')
  );

  assert.ok(nonGetRoutes.length > 50, `Expected router to contain >50 non-GET routes, found ${nonGetRoutes.length}`);

  for (const r of nonGetRoutes) {
    const testPath = r.path.replace(/:[a-zA-Z0-9_]+/g, 'test-id-123');
    const res = await fetch(`${baseUrl}${testPath}`, {
      method: r.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({}),
    });

    const data = await res.json().catch(() => null);
    assert.equal(
      res.status,
      403,
      `Expected 403 for ${r.method} ${r.path}, got ${res.status} (${JSON.stringify(data)})`
    );
    assert.equal(
      data?.code,
      'DEMO_MODE',
      `Expected code DEMO_MODE for ${r.method} ${r.path}, got ${data?.code}`
    );
  }
});

