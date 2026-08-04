(function(){
  document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
  document.querySelectorAll('[data-logout]').forEach(btn=>btn.addEventListener('click',async()=>{try{await VMMO_API.logout()}catch(e){}VMMO_API.clearToken();location.href='login.html'}));
  const menu=document.querySelector('.mobile-toggle');if(menu)menu.addEventListener('click',()=>{const links=document.querySelector('.nav-links');if(!links)return;links.style.display=links.style.display==='flex'?'none':'flex';links.style.position='absolute';links.style.top='66px';links.style.left='11px';links.style.right='11px';links.style.flexDirection='column';links.style.padding='12px';links.style.background='#0d1930';links.style.border='1px solid rgba(255,255,255,.1)';links.style.borderRadius='16px'});
  const auth=!!VMMO_API.getToken();document.querySelectorAll('[data-auth-only]').forEach(e=>e.style.display=auth?'inline-flex':'none');document.querySelectorAll('[data-guest-only]').forEach(e=>e.style.display=auth?'none':'inline-flex');
})();
