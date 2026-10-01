(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const targets = document.querySelectorAll('.help-card,.build-item,.method-flow li,.impact-grid article,.credibility-highlights p,.about-learning li');
 if ('IntersectionObserver' in window && !reduced.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
   if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), {threshold:.08});
  targets.forEach((el,i) => {el.classList.add('about-reveal');el.style.setProperty('--reveal-delay',`${i%3*80}ms`);observer.observe(el);});
  document.documentElement.classList.add('about-motion-ready');
  reduced.addEventListener('change',()=> {if(reduced.matches){targets.forEach(el=>el.classList.add('is-visible'));observer.disconnect();}});
 }
 const art=document.querySelector('.about-art-crop');
 if (art) {
  art.addEventListener('pointermove',event=>{
   if(reduced.matches || !matchMedia('(pointer:fine)').matches)return;
   const box=art.getBoundingClientRect();
   art.style.setProperty('--art-x',`${(event.clientX-box.left-box.width/2)*.006}px`);
   art.style.setProperty('--art-y',`${(event.clientY-box.top-box.height/2)*.006}px`);
  },{passive:true});
  art.addEventListener('pointerleave',()=>{art.style.setProperty('--art-x','0px');art.style.setProperty('--art-y','0px');});
 }
})();
