export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isFile = /\.[a-z0-9]+$/i.test(url.pathname);
    const isAdmin = url.pathname === '/' || url.pathname === '/admin' || url.pathname === '/admin.html' || url.pathname === '/favicon.svg';
    if (!isFile && !isAdmin) {
      const slug = url.pathname.replace(/^\/+|\/+$/g, '');
      url.pathname = '/index.html';
      url.searchParams.set('slug', slug);
      return env.ASSETS.fetch(new Request(url.toString(), { method: request.method, headers: request.headers }));
    }
    return env.ASSETS.fetch(request);
  }
};
