(()=>{
const en=document.documentElement.lang==='en',menu=document.querySelector('.menu-toggle'),links=document.querySelector('#main-menu');
const closeMenu=()=>{menu?.setAttribute('aria-expanded','false');if(links)links.dataset.open='false'};
const disclosure=new Map();
document.querySelectorAll('.service-menu').forEach(drop=>{
 const summary=drop.querySelector('summary'),panel=drop.querySelector('.service-dropdown');let timer,animation,wanted=false;
 const setOpen=open=>{clearTimeout(timer);if(wanted===open)return;wanted=open;const style=getComputedStyle(panel),from=drop.open?{opacity:style.opacity,transform:style.transform}:{opacity:0,transform:'translateY(-8px)'};animation?.cancel();summary.setAttribute('aria-expanded',String(open));panel.inert=!open;if(open)drop.open=true;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){drop.open=open;return}
 animation=panel.animate([from,{opacity:open?1:0,transform:open?'translateY(0)':'translateY(-8px)'}],{duration:260,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});animation.onfinish=()=>{drop.open=wanted;animation.cancel();animation=null};};
 disclosure.set(drop,setOpen);summary.setAttribute('aria-expanded','false');summary.addEventListener('click',e=>{e.preventDefault();setOpen(!wanted)});
 drop.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&matchMedia('(hover:hover) and (min-width:951px)').matches){clearTimeout(timer);setOpen(true)}});
 drop.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')timer=setTimeout(()=>setOpen(false),140)});
 drop.addEventListener('focusin',()=>clearTimeout(timer));drop.addEventListener('focusout',()=>setTimeout(()=>{if(!drop.contains(document.activeElement)&&!drop.matches(':hover'))setOpen(false)},0));
});
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));links.dataset.open=String(open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();document.querySelectorAll('.service-menu[open]').forEach(x=>{if(x.contains(document.activeElement))x.querySelector('summary').focus();disclosure.get(x)(false)})}});
document.addEventListener('click',e=>{document.querySelectorAll('.service-menu[open]').forEach(x=>{if(!x.contains(e.target))disclosure.get(x)(false)});if(links?.contains(e.target)&&e.target.closest('a'))closeMenu()});
document.querySelectorAll('.faq-item').forEach(d=>{const summary=d.querySelector('summary'),p=d.querySelector('p');if(!p)return;const wrap=document.createElement('div');wrap.className='faq-content';p.before(wrap);wrap.append(p);let animation;summary.addEventListener('click',e=>{e.preventDefault();if(animation)return;const opening=!d.open,start=d.getBoundingClientRect().height;if(opening)d.open=true;const end=opening?d.getBoundingClientRect().height:summary.getBoundingClientRect().height;if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.open=opening;return}animation=d.animate([{height:start+'px'},{height:end+'px'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});animation.onfinish=()=>{d.open=opening;animation=null}})});
document.querySelectorAll('.enquiry-form').forEach(form=>{form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity()||form.dataset.sending==='true')return;const button=form.querySelector('button[type=submit]'),status=form.querySelector('.form-status');const data=Object.fromEntries(new FormData(form));data.lang=en?'en':'uk';data.page=location.pathname;form.dataset.sending='true';button.disabled=true;status.dataset.state='pending';status.textContent=en?'Sending your enquiry…':'Надсилаємо заявку…';try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});const result=await response.json();if(!response.ok||!result.ok)throw Error('send');form.reset();status.dataset.state='success';status.textContent=en?'Your enquiry has been sent. We will reply using the contact you provided.':'Заявку надіслано. Відповімо за вказаним вами контактом.'}catch{status.dataset.state='error';status.textContent=en?'We could not confirm delivery. Your text is saved here. Please retry or contact us by phone, email or Telegram.':'Не вдалося підтвердити доставку. Ваш текст залишився у формі. Спробуйте ще раз або зв’яжіться телефоном, email чи в Telegram.'}finally{button.disabled=false;delete form.dataset.sending}})});
})();


// Continuous, frame-rate-independent wheel easing with subpixel accumulation.
(()=>{
 const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');
 let frame=0,target=0,position=0,last=0;
 const stop=()=>{cancelAnimationFrame(frame);frame=0;root.classList.remove('wheel-scrolling')};
 const tick=time=>{
  const dt=Math.min(64,Math.max(1,time-last));last=time;
  target=Math.max(0,Math.min(root.scrollHeight-innerHeight,target));
  position+=(target-position)*(1-Math.exp(-dt/180));
  const done=Math.abs(target-position)<.25;if(done)position=target;
  window.scrollTo({top:position,behavior:'instant'});
  if(done)stop();else frame=requestAnimationFrame(tick);
 };
 addEventListener('wheel',e=>{
  if(reduce.matches||!fine.matches||e.ctrlKey||e.metaKey||!e.cancelable||Math.abs(e.deltaX)>Math.abs(e.deltaY)){stop();return}
  let node=e.target;
  while(node instanceof Element&&node!==document.body){
   const style=getComputedStyle(node);
   if(/auto|scroll/.test(style.overflowY)&&node.scrollHeight>node.clientHeight){stop();return}
   node=node.parentElement;
  }
  const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
  if(!delta)return;
  if(!frame){position=scrollY;target=position}
  // Drop accumulated travel when direction changes, without a position jump.
  if((target-position)*delta<0)target=position;
  target=Math.max(0,Math.min(root.scrollHeight-innerHeight,target+delta));
  if(target===position&&!frame)return;
  e.preventDefault();
  if(!frame){root.classList.add('wheel-scrolling');last=performance.now();frame=requestAnimationFrame(tick)}
 },{passive:false});
 ['pointerdown','touchstart','keydown','pagehide'].forEach(name=>addEventListener(name,stop,{passive:true}));
 reduce.addEventListener('change',stop);fine.addEventListener('change',stop);
})();
