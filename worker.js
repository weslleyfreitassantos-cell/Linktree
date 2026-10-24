export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/' && !url.searchParams.has('slug')) return Response.redirect(`${url.origin}/admin.html`, 302);
    if (url.pathname.startsWith('/api/linktree/')) {
      const slug = decodeURIComponent(url.pathname.slice('/api/linktree/'.length));
      if (request.method === 'GET') {
        const value = await env.LINKTREE_DATA.get(slug, 'json');
        return value ? Response.json(value) : new Response('Not found', { status: 404 });
      }
      if (request.method === 'PUT' || request.method === 'POST') {
        const value = await request.json();
        await env.LINKTREE_DATA.put(slug, JSON.stringify(value));
        return Response.json({ ok: true, slug });
      }
      if (request.method === 'DELETE') {
        await env.LINKTREE_DATA.delete(slug);
        return Response.json({ ok: true, slug, deleted: true });
      }
    }
    if (!/\.[a-z0-9]+$/i.test(url.pathname) && url.pathname !== '/' && url.pathname !== '/admin.html') {
      const slug = url.pathname.replace(/^\/+|\/+$/g, '');
      const publicRecord = await env.LINKTREE_DATA.get(slug, 'json');
      if (!publicRecord) return new Response('Linktree não encontrado ou indisponível.', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
      return new Response(null, { status: 302, headers: { Location: `${url.origin}/index.html?slug=${encodeURIComponent(slug)}&v=${Date.now()}`, 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Set-Cookie': `lt_slug=${encodeURIComponent(slug)}; Path=/; Max-Age=86400; SameSite=Lax` } });
    }
    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);
    if (url.pathname === '/index.html' || url.pathname === '/style.css' || url.pathname === '/script.js' || url.pathname === '/admin.html' || url.pathname === '/admin.js') headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return new Response(assetResponse.body, { status: assetResponse.status, statusText: assetResponse.statusText, headers });
  }
};
