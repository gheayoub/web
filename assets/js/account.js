(async function(){
  if(!VMMO_API.getToken()){location.href='login.html?next='+encodeURIComponent(location.pathname);return}
  function txt(sel,val){document.querySelectorAll(sel).forEach(e=>e.textContent=(val===null||val===undefined||val==='')?'—':val)}
  function date(v){if(!v)return '—';const d=new Date(v);return isNaN(d)?v:d.toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})}
  try{
    const data=await VMMO_API.me(),a=data.account||{},l=data.license||{},p=data.permissions||{};
    txt('[data-username]',a.username);txt('[data-email]',a.email);txt('[data-plan]',String(a.plan||'free').toUpperCase());txt('[data-status]',a.status);txt('[data-created]',date(a.created_at));txt('[data-last-login]',date(a.last_login_at));txt('[data-expiry]',l.expires_at?date(l.expires_at):(a.plan==='lifetime'?'Seumur hidup':'Tidak kedaluwarsa'));txt('[data-tabs]',p.max_tabs);txt('[data-characters]',p.max_characters);txt('[data-avatar]',String(a.username||'V').slice(0,2).toUpperCase());
    document.querySelectorAll('[data-permission]').forEach(el=>{const key=el.dataset.permission;const enabled=!!p[key];el.classList.toggle('enabled',enabled);const val=el.querySelector('[data-state-text]');if(val)val.textContent=enabled?'Aktif':'Tidak aktif'});
    const raw=document.querySelector('[data-raw-account]');if(raw)raw.textContent=JSON.stringify(a,null,2);
  }catch(e){if(e.status===401){VMMO_API.clearToken();location.href='login.html';return}const alert=document.querySelector('[data-alert]');if(alert){alert.textContent=e.message;alert.className='alert show alert-error'}}
})();
