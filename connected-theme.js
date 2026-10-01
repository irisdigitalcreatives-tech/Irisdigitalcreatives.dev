(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sections=[...document.querySelectorAll('main>.section:not(#about-impact),.about-live-layout')];
 sections.forEach((section,i)=>{const rail=document.createElement('span');rail.className='section-circuit';rail.setAttribute('aria-hidden','true');section.prepend(rail);section.style.setProperty('--signal-delay',`${-i*1.4}s`);});
 if(!('IntersectionObserver' in window)||reduced.matches)return;
 const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>target.classList.toggle('circuit-active',isIntersecting)),{rootMargin:'80px'});
 sections.forEach(section=>observer.observe(section));
 document.addEventListener('visibilitychange',()=>{document.documentElement.classList.toggle('circuit-paused',document.hidden);});
})();
