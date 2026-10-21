export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!/\.[a-z0-9]+$/i.test(url.pathname) && url.pathname !== '/' && url.pathname !== '/admin.html') {
      const slug = url.pathname.replace(/^\/+|\/+$/g, '');
      return env.ASSETS.fetch(new Request(`${url.origin}/index.html?slug=${encodeURIComponent(slug)}`, { method: 'GET' }));
    }
    return env.ASSETS.fetch(request);
  }
};
