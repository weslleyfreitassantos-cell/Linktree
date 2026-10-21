(function () {
  const params = new URLSearchParams(location.search);
  // O domínio principal é a plataforma administrativa. Os Linktrees públicos
  // continuam sendo páginas individuais acessadas com ?id=...
  const records = JSON.parse(localStorage.getItem('linktrees') || '[]');
  const pathSlug = decodeURIComponent(params.get('slug') || location.pathname.replace(/^\/+|\/+$/g, ''));
  const slugify = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const pathRecord = pathSlug ? records.find(x => slugify(x.name) === pathSlug) : null;
  const id = params.get('id') || pathRecord?.id;
  if (params.get('slug')) history.replaceState(null, '', `/${slugify(pathRecord?.name || params.get('slug'))}`);
  if (params.get('slug') && !pathRecord && !sessionStorage.getItem('publicConfigLoaded')) { fetch(`/api/linktree/${encodeURIComponent(pathSlug)}`).then(r=>r.ok?r.json():null).then(value=>{if(value){localStorage.setItem('linktrees',JSON.stringify([{id:value.id||crypto.randomUUID(),name:value.name||pathSlug,config:value.config||value}]));sessionStorage.setItem('publicConfigLoaded','1');location.reload()}}).catch(()=>{}); }
  const isInstagramBrowser = /Instagram/i.test(navigator.userAgent || '');
  if (!id && !pathRecord && !params.get('slug') && !isInstagramBrowser && !['localhost', '127.0.0.1'].includes(location.hostname)) {
    location.replace('admin.html');
    return;
  }
  if (params.get('setbg') === 'education') {
    records.forEach(x => { if (x.config?.theme) x.config.theme.backgroundImage = ''; });
    localStorage.setItem('linktrees', JSON.stringify(records));
    const legacyConfig = JSON.parse(localStorage.getItem('linktreeConfig') || 'null');
    if (legacyConfig?.theme) { legacyConfig.theme.backgroundImage = ''; localStorage.setItem('linktreeConfig', JSON.stringify(legacyConfig)); }
    location.replace(`index.html${id ? `?id=${id}` : ''}`);
    return;
  }
  const record = id ? records.find(x => x.id === id) : null;
  const saved = record ? record.config : JSON.parse(localStorage.getItem('linktreeConfig') || 'null');
  const isPlaceholder = saved && saved.links?.[0]?.label === 'Meu site';
  const c = saved && !isPlaceholder ? { ...window.linktreeConfig, ...saved, theme: { ...window.linktreeConfig.theme, ...(saved.theme || {}) }, avatar: { ...window.linktreeConfig.avatar, ...(saved.avatar || {}) } } : window.linktreeConfig;
  c.links = [...(c.links || []), ...(c.socials || [])].filter((link, index, all) => link.url && all.findIndex(x => x.url === link.url && x.label === link.label) === index);
  c.links = c.links.map(link => /tiktok/i.test(link.label || '') || /tiktok\.com\/?$/i.test(link.url || '') ? { ...link, url: 'https://www.tiktok.com/@tecescola_' } : link);
  if (c.links.some(x => (x.url || '').includes('instagram.com/tecescola_')) && !c.links.some(x => (x.url || '').includes('tiktok.com/@tecescola_'))) c.links.push({ label: 'Tik Tok', url: 'https://www.tiktok.com/@tecescola_' });
  const root = document.documentElement;
  root.style.setProperty('--background', c.theme.background);
  const bg = 'assets/background-educacao.png?v=2';
  document.querySelector('.page-shell').style.backgroundImage = `linear-gradient(rgba(8,24,60,.16),rgba(8,24,60,.16)),url(${bg})`;
  root.style.setProperty('--surface', c.theme.button);
  root.style.setProperty('--button-text', c.theme.buttonText);
  root.style.setProperty('--text', c.theme.text);
  if (!c.theme.backgroundImage) root.style.setProperty('--text', '#ffffff');
  root.style.setProperty('--accent', c.theme.accent);
  root.style.setProperty('--font', c.theme.font);
  root.style.setProperty('--radius', c.theme.radius || '28px');
  document.title = `${c.name} | Links`;
  document.getElementById('profileName').textContent = c.name;
  document.getElementById('profileBio').textContent = c.bio;
  const avatar = document.getElementById('avatar');
  if (c.avatar.image) { avatar.textContent = ''; avatar.classList.add('has-image'); avatar.style.backgroundImage = `url(${c.avatar.image})`; avatar.style.backgroundColor = 'transparent'; }
  else if (!c.avatar.text || c.avatar.text === 'Sua\nmarca') avatar.innerHTML = 'Tec<br>Escola';
  else avatar.innerHTML = c.avatar.text.replace(/\n/g, '<br>');
  const iconFor = url => { const u=(url||'').toLowerCase(); const s=(body,view='0 0 24 24')=>`<svg viewBox="${view}" aria-hidden="true" focusable="false">${body}</svg>`; if(u.includes('instagram')) return s('<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.7" r="1.2" fill="currentColor"/>'); if(u.includes('tiktok')) return s('<path fill="currentColor" d="M14.2 3h3c.2 1.7 1.1 3 2.8 3.8v3.1c-1.1-.1-2.1-.5-3-1.1v6.1a5.2 5.2 0 1 1-4.5-5.1v3.1a2.1 2.1 0 1 0 1.7 2V3z"/>'); if(u.includes('whatsapp')||u.includes('wa.me')) return s('<path d="M12 2.5a9.5 9.5 0 1 1-5.1 1.5L3 3l1.2 3.9A9.5 9.5 0 0 1 12 2.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.1 7.4c.4-.4.8-.4 1.1 0l1.2 1.6c.2.3.2.6-.1.9l-.6.6c.7 1.3 1.7 2.3 3 3l.6-.6c.3-.3.6-.3.9-.1l1.6 1.2c.4.3.4.7 0 1.1-.9.9-2.1 1-3.4.4-2.7-1.2-4.8-3.3-6-6-.6-1.3-.5-2.5.4-3.4z" fill="currentColor"/>'); if(u.includes('youtube')) return s('<rect x="2.5" y="5" width="19" height="14" rx="4" fill="currentColor"/><path d="m10 9 5 3-5 3z" fill="white"/>'); if(u.includes('linkedin')) return s('<rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor"/><path d="M8 10v6M8 7.5v.1M11 16v-3.2a2 2 0 0 1 4 0V16M11 10v6" stroke="white" stroke-width="1.8" stroke-linecap="round"/>'); if(u.includes('drive.google')||u.includes('docs.google')||u.includes('sheets.google')) return s('<path d="M8 3h4l8 14h-4z" fill="#2d7ff9"/><path d="M8 3 3 12l2 4 7-13z" fill="#fbbc04"/><path d="m5 16-2 4h14l3-4z" fill="#34a853"/>'); if(u.includes('facebook')) return s('<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M13.5 20v-7h2.4l.4-2.7h-2.8V8.6c0-.8.2-1.4 1.4-1.4h1.5V4.8c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v1.8H8v2.7h2.5v7z" fill="white"/>'); return s('<rect x="2.5" y="3" width="18" height="17" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 8h17M6 5.5h.1M9 5.5h.1M12 5.5h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><text x="5" y="13.5" font-size="5.4" font-family="Arial" font-weight="700" fill="currentColor">WWW</text><path d="m15 14 5.5 5.5-3 .2-1.2 2.4z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>'); };
  document.getElementById('links').innerHTML = c.links.map(link => `<a class="link-card" href="${link.url}" target="_blank" rel="noopener"><span class="link-icon" aria-hidden="true">${iconFor(link.url)}</span><span>${link.label || 'Abrir link'}</span></a>`).join('');
  document.querySelectorAll('#links a[href*="whatsapp"],#links a[href*="wa.me"]').forEach(a=>{const label=a.querySelector('span:last-child')?.textContent||'WhatsApp';a.innerHTML='<span class="link-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2.5a9 9 0 0 1 9 9 9 9 0 0 1-9 9 8.8 8.8 0 0 1-4.8-1.4L3 20.5l1.3-4A9 9 0 1 1 12 2.5z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.1 8.2c.4-.4.8-.3 1.1.1l1 1.5c.2.3.2.6-.1.9l-.5.5c.7 1.2 1.6 2.2 2.8 2.8l.5-.5c.3-.3.6-.3.9-.1l1.5 1c.4.3.4.7 0 1-.8.7-1.8.8-3 .3-2.5-1.1-4.4-3-5.5-5.5-.5-1.2-.4-2.2.3-3z" fill="currentColor"/></svg></span><span>'+label+'</span>'});
  document.getElementById('socials').innerHTML = '';
  document.body.classList.remove('is-loading');
})();
