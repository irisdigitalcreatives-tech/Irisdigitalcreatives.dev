(() => {
 'use strict';
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer = matchMedia('(pointer: fine)');
 const canvas = document.getElementById('neural-canvas');
 const ctx = canvas?.getContext('2d', { alpha: true });
 const light = document.querySelector('.ambient-light');
 const portrait = document.querySelector('.portrait-frame');
 let width = 0, height = 0, nodes = [], frame = 0, previous = 0, time = 0;
 let mx = .66, my = .3, tx = .66, ty = .3, scroll = window.scrollY, targetScroll = scroll;
 let portraitVisible = true;
 // Small deterministic network: no assets, frameworks or layout reads per frame.
 function resize() {
  if (!ctx) return;
  width = innerWidth; height = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const count = width < 700 ? 22 : 45;
  nodes = Array.from({length:count}, (_,i) => ({
   x: ((i*0.61803398875)%1)*width,
   y: ((i*0.41421356237+.17)%1)*height,
   phase:i*1.7, speed: .5+(i%4)*.16
  }));
  if (reduced.matches) draw(0);
 }
 function draw(t) {
  if (!ctx) return;
  ctx.clearRect(0,0,width,height);
  // Quiet moving grid, with shorter circuit paths riding its intersections.
  const cell = width < 700 ? 86 : 106;
  const shift = (t*3 + scroll*.055)%cell;
  ctx.lineWidth=.6; ctx.strokeStyle='rgba(30,191,255,.065)';
  ctx.beginPath();
  for(let x=-cell;x<width+cell;x+=cell){ctx.moveTo(x+shift,0);ctx.lineTo(x+shift,height);}
  for(let y=-cell;y<height+cell;y+=cell){ctx.moveTo(0,y+shift);ctx.lineTo(width,y+shift);}
  ctx.stroke();
  for(let i=0;i<5;i++){
   const x=((i*3+1)*cell+shift)%(width+cell)-cell;
   const y=((i*2+1)*cell+shift)%(height+cell)-cell;
   ctx.strokeStyle='rgba(30,191,255,.13)';ctx.lineWidth=1;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+cell*.65,y);ctx.lineTo(x+cell*.65,y+cell*.45);ctx.lineTo(x+cell*1.3,y+cell*.45);ctx.stroke();
   const progress=(t*.085+i*.21)%1;
   ctx.fillStyle='rgba(133,239,255,.5)';ctx.beginPath();ctx.arc(x+cell*.65*progress,y,1.6,0,Math.PI*2);ctx.fill();
  }
  // Three flowing light paths with traveling highlights, drawn at the capped frame rate.
  for(let k=0;k<3;k++){
   const y=height*(.22+k*.31)+Math.sin(t*.12+k)*30;
   const gradient=ctx.createLinearGradient(0,y,width,y);
   gradient.addColorStop(0,'rgba(0,102,255,0)');
   gradient.addColorStop(.4,'rgba(0,153,255,.08)');
   gradient.addColorStop(.7,'rgba(65,232,255,.22)');
   gradient.addColorStop(1,'rgba(0,102,255,0)');
   ctx.strokeStyle=gradient;ctx.lineWidth=k===1?1.5:.8;
   ctx.beginPath();ctx.moveTo(-60,y+100);ctx.bezierCurveTo(width*.3,y-150,width*.65,y+150,width+60,y-100);ctx.stroke();
   const u=(t*.035+k*.33)%1,x=u*width;
   const py=y+100*(1-u)**3-450*(1-u)**2*u+450*(1-u)*u*u-100*u**3;
   const glint=ctx.createRadialGradient(x,py,0,x,py,14);
   glint.addColorStop(0,'rgba(151,249,255,.7)');glint.addColorStop(.18,'rgba(32,198,255,.35)');glint.addColorStop(1,'rgba(0,140,255,0)');
   ctx.fillStyle=glint;ctx.fillRect(x-14,py-14,28,28);
  }
  const points=nodes.map(n=>({x:n.x+Math.sin(t*.07*n.speed+n.phase)*22+(mx-.5)*8,y:(n.y+Math.cos(t*.055+n.phase)*18-scroll*.025+height*100)%height}));
  const reach=width<700?115:165;
  for(let i=0;i<points.length;i++){
   const p=points[i];
   for(let j=i+1;j<points.length;j++){
    const q=points[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);
    if(d<reach){ctx.strokeStyle=`rgba(30,191,255,${(1-d/reach)*.19})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
   }
   const near=Math.max(0,1-Math.hypot(p.x-mx*width,p.y-my*height)/230);
   const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,7+near*5);
   glow.addColorStop(0,`rgba(30,191,255,${.22+near*.22})`);glow.addColorStop(1,'rgba(30,191,255,0)');
   ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,7+near*5,0,Math.PI*2);ctx.fill();
   ctx.fillStyle=`rgba(133,239,255,${.28+near*.35})`;ctx.beginPath();ctx.arc(p.x,p.y,i%5===0?1.7:1,0,Math.PI*2);ctx.fill();
  }
 }
 function tick(stamp) {
  frame=0;
  if(document.hidden || reduced.matches)return;
  if(stamp-previous>=33){
   const dt=Math.min((stamp-previous)/1000,.06);previous=stamp;time+=dt;
   mx+=(tx-mx)*.08;my+=(ty-my)*.08;scroll+=(targetScroll-scroll)*.08;
   draw(time);
   if(finePointer.matches){
    light?.style.setProperty('--light-x',`${mx*100}%`);
    light?.style.setProperty('--light-y',`${my*100}%`);
    if(portraitVisible){portrait?.style.setProperty('--portrait-x',`${(mx-.5)*9}px`);portrait?.style.setProperty('--portrait-y',`${(my-.5)*9}px`);}
   }
  }
  frame=requestAnimationFrame(tick);
 }
 function syncMotion(){
  cancelAnimationFrame(frame);frame=0;
  if(reduced.matches){draw(0);document.querySelectorAll('.scroll-reveal').forEach(el=>el.classList.add('is-visible'));}
  else if(!document.hidden){previous=performance.now();frame=requestAnimationFrame(tick);}
 }
 window.addEventListener('pointermove',e=>{if(finePointer.matches&&!reduced.matches){tx=e.clientX/width;ty=e.clientY/height;}},{passive:true});
 window.addEventListener('scroll',()=>{targetScroll=window.scrollY;},{passive:true});
 let resizePending=false;
 window.addEventListener('resize',()=>{if(!resizePending){resizePending=true;requestAnimationFrame(()=>{resizePending=false;resize();});}},{passive:true});
 document.addEventListener('visibilitychange',syncMotion);
 reduced.addEventListener('change',syncMotion);
 if('IntersectionObserver' in window){
  const reveal = new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}
  }),{threshold:.08,rootMargin:'0px 0px 40px 0px'});
  document.querySelectorAll('.case-study,.proof-grid article,.process-grid li,.section-heading,.about>div,.service,.project-card,.experience,.development>div,.testimonials>h2,.testimonial-empty,.contact>h2').forEach(el=>{
   el.classList.add('scroll-reveal');reveal.observe(el);
  });
  document.documentElement.classList.add('motion-ready');
  if(portrait)new IntersectionObserver(entries=>{portraitVisible=entries[0].isIntersecting;}).observe(portrait);
 }
 resize();syncMotion();
})();
