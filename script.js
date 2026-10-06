/* Burger-Menü */
const b=document.querySelector('.burger'),m=document.getElementById('menu');
b.addEventListener('click',()=>{const o=m.classList.toggle('open');b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Menü schließen':'Menü öffnen')});
m.addEventListener('click',e=>{if(e.target.tagName==='A'){m.classList.remove('open');b.setAttribute('aria-expanded',false)}});
/* Rechtstexte */
document.querySelectorAll('[data-open]').forEach(x=>x.addEventListener('click',()=>document.getElementById(x.dataset.open).showModal()));
/* Formular (nur Demo) */
document.getElementById('cform').addEventListener('submit',e=>{e.preventDefault();document.getElementById('ok').hidden=false;e.target.reset()});

/* Farbroller-Cursor: nur bei Maus/Trackpad, nicht auf Touch-Geräten */
(function(){
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const calm=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const c=document.createElement('div');
  c.className='roller-cursor';c.setAttribute('aria-hidden','true');
  c.innerHTML='<svg viewBox="0 0 48 64"><path d="M38 11h5v14H24v10" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 11h5v14H24v10" fill="none" stroke="#163A2B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="19" y="34" width="10" height="26" rx="4" fill="#B9A58A" stroke="#fff" stroke-width="1.5"/><rect class="paint" x="4" y="3" width="34" height="16" rx="6" fill="#1F4D3A" stroke="#fff" stroke-width="1.5"/><rect x="8" y="6" width="26" height="3" rx="1.5" fill="#fff" opacity=".35"/></svg>';
  document.body.appendChild(c);
  document.body.classList.add('has-roller');
  const svg=c.firstChild;
  let tx=0,ty=0,x=0,y=0,tilt=0,shown=false;
  addEventListener('mousemove',e=>{
    tx=e.clientX;ty=e.clientY;
    if(!shown){x=tx;y=ty;shown=true}
    const t=e.target;
    // Über Textfeldern oder geöffneten Dialogen den normalen Cursor zeigen
    const normal=t.closest('input,textarea')||document.querySelector('dialog[open]');
    document.body.classList.toggle('has-roller',!normal);
    c.classList.toggle('on',!normal);
    c.classList.toggle('hover',!!t.closest('a,button,label'));
  });
  document.addEventListener('mouseleave',()=>c.classList.remove('on'));
  addEventListener('mousedown',()=>c.classList.add('down'));
  addEventListener('mouseup',()=>c.classList.remove('down'));
  (function loop(){
    const px=x;
    x+=(tx-x)*(calm?1:.28);y+=(ty-y)*(calm?1:.28);
    const vx=x-px;
    tilt+=((calm?0:Math.max(-22,Math.min(22,vx*1.6)))-tilt)*.2;
    c.style.transform='translate('+(x-21)+'px,'+(y-11)+'px) rotate('+tilt+'deg)';
    requestAnimationFrame(loop);
  })();
})();


/* Hero: Roller streicht die weiße Fläche – Auf-und-ab-Bewegung, leicht schräg */
(function(){
  const hero=document.querySelector('.hero'),panel=document.querySelector('.paint-panel');
  if(!hero||!panel||matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const rl=panel.querySelector('.rl');
  hero.classList.add('painting');
  const cv=document.createElement('canvas');panel.insertBefore(cv,rl);
  const w=panel.clientWidth,H=panel.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
  cv.width=w*dpr;cv.height=H*dpr;
  const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);
  ctx.fillStyle='#fff';ctx.fillRect(0,0,w,H);               // weiße Fläche
  const W=Math.min(Math.max(w*.2,64),140),h=Math.max(30,W*.28); // Maße des Rollers
  const s=.22,th=Math.atan(s);                               // Schräge der Striche
  const yT=h*.35,yB=H-h*.35;
  const xs=W*.2-s*H/2,drift=w-.4*W+s*H;                      // seitlicher Vorschub
  const n=Math.max(2,Math.ceil(drift/(W*.5)));               // Anzahl Striche (hoch/runter)
  const dur=Math.min(900,Math.max(500,7000/n)),total=n*dur;
  const ease=t=>.5-.5*Math.cos(Math.PI*t);
  rl.style.width=W+'px';rl.style.height=h+'px';
  let t0=null,px=null,py,raf,done=false;
  function pos(t){
    const k=Math.min(n-1,Math.floor(t/dur)),e=ease(Math.min(1,(t-k*dur)/dur));
    const y=k%2===0?yT+(yB-yT)*e:yB-(yB-yT)*e;
    return [xs+drift*Math.min(1,t/total)+s*(y-H/2),y];
  }
  function stamp(x,y,a){                                     // Farbe auftragen
    ctx.globalCompositeOperation='destination-out';
    const steps=px===null?1:Math.max(1,Math.ceil(Math.hypot(x-px,y-py)/5));
    for(let i=1;i<=steps;i++){
      const sx=px===null?x:px+(x-px)*i/steps,sy=px===null?y:py+(y-py)*i/steps;
      ctx.save();ctx.translate(sx,sy);ctx.rotate(a);ctx.fillRect(-W/2-1,-h/2,W+2,h);ctx.restore();
    }
    px=x;py=y;
  }
  function frame(now){
    if(done)return;
    if(t0===null)t0=now;
    const t=Math.min(now-t0,total),p=pos(t),a=-th+Math.sin(t/170)*.025;
    stamp(p[0],p[1],a);
    rl.style.transform='translate('+(p[0]-W/2)+'px,'+(p[1]-h/2)+'px) rotate('+a+'rad)';
    if(t<total)raf=requestAnimationFrame(frame);else finish();
  }
  function finish(){
    if(done)return;done=true;cancelAnimationFrame(raf);
    rl.style.opacity=0;hero.classList.add('painted');
  }
  const iw=innerWidth;
  addEventListener('resize',()=>{if(innerWidth!==iw)finish()});
  setTimeout(()=>{rl.style.opacity=1;raf=requestAnimationFrame(frame)},400);
})();
