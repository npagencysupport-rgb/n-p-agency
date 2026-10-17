(() => {
  const html=document.documentElement;
  let theme='dark';
  try{const saved=localStorage.getItem('montell-theme');if(saved==='light'||saved==='dark')theme=saved;}catch{}
  html.dataset.theme=theme;
  function update(){
    const button=document.querySelector('.theme-toggle');if(!button)return;
    const light=html.dataset.theme==='light',en=html.lang==='en';
    try{localStorage.setItem('montell-theme',html.dataset.theme);}catch{}
    const label=en?(light?'Switch to dark theme':'Switch to light theme'):(light?'Увімкнути темну тему':'Увімкнути світлу тему');
    button.setAttribute('aria-label',label);button.title=label;
    button.innerHTML=light?'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/></svg>':'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',light?'#F4F1DE':'#1A1A1A');
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const button=document.querySelector('.theme-toggle');
    button.addEventListener('click',()=>{
      const change=()=>{html.dataset.theme=html.dataset.theme==='light'?'dark':'light';update();};
      if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.startViewTransition(change);}else{change();}
      try{localStorage.setItem('montell-theme',html.dataset.theme);}catch{}
      update();
    });update();
  });
  addEventListener('storage',e=>{if(e.key==='montell-theme'&&(e.newValue==='light'||e.newValue==='dark')){html.dataset.theme=e.newValue;update();}});
})();
