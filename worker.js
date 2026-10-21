export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
    }
    if (!/\.[a-z0-9]+$/i.test(url.pathname) && url.pathname !== '/' && url.pathname !== '/admin.html') {
      const slug = url.pathname.replace(/^\/+|\/+$/g, '');
      return new Response(null, { status: 302, headers: { Location: `${url.origin}/index.html?slug=${encodeURIComponent(slug)}`, 'Set-Cookie': `lt_slug=${encodeURIComponent(slug)}; Path=/; Max-Age=86400; SameSite=Lax` } });
    }
    return env.ASSETS.fetch(request);
  }
};
