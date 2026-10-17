(() => {
  const current = document.documentElement.lang === 'en' ? 'en' : 'uk';
  const explicit = new URLSearchParams(location.search).get('lang');
  let preferred;
  try {
    if (explicit === 'uk' || explicit === 'en') {
      localStorage.setItem('montell-language', explicit);
      preferred = explicit;
    } else if (location.pathname.endsWith('/en.html')) {
      preferred = 'en';
      localStorage.setItem('montell-language', 'en');
    } else preferred = localStorage.getItem('montell-language');
  } catch { preferred = explicit; }
  if ((preferred === 'uk' || preferred === 'en') && preferred !== current) {
    const target = new URL(location.href);
    target.pathname = preferred === 'en' ? '/en.html' : '/';
    target.searchParams.set('lang', preferred);
    location.replace(target.href);
    return;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.language-switch a').forEach(link => {
      const target = new URL(link.href);
      target.hash = location.hash;
      link.href = target.href;
      link.addEventListener('click', event => {
        if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        event.preventDefault();
        if(link.hreflang===current)return;
        if(document.documentElement.classList.contains('language-changing'))return;
        try { localStorage.setItem('montell-language', link.hreflang); } catch {}
        document.documentElement.classList.add('language-changing');
        link.parentElement.dataset.selected=link.hreflang;
        const destination=new URL(link.href);destination.hash=location.hash;
        setTimeout(()=>location.assign(destination.href),matchMedia('(prefers-reduced-motion: reduce)').matches?0:320);
      });
    });
  });
})();

addEventListener('pageshow',()=>{document.documentElement.classList.remove('language-changing');document.querySelector('.language-switch')?.removeAttribute('data-selected');});
