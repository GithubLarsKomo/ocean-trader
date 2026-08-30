const GUIDE_HREF='/anleitung.html';

function installGuideLink(){
  const nav=document.querySelector('.bottom-nav');
  if(!nav||nav.querySelector('[data-player-guide]'))return;
  const link=document.createElement('a');
  link.href=GUIDE_HREF;
  link.dataset.playerGuide='true';
  link.className='nav player-guide-nav';
  link.setAttribute('aria-label','Spielanleitung öffnen');
  link.innerHTML='<span aria-hidden="true">?</span><small>Anleitung</small>';
  nav.append(link);
}

const observer=new MutationObserver(installGuideLink);
observer.observe(document.documentElement,{childList:true,subtree:true});
installGuideLink();
