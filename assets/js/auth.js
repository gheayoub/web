(function(){
  const form=document.querySelector('form[data-form]');if(!form)return;
  const alert=document.querySelector('[data-alert]');const btn=form.querySelector('button[type=submit]');
  function show(msg,type='error'){alert.textContent=msg;alert.className=`alert show alert-${type}`}
  function busy(v){btn.disabled=v;form.classList.toggle('loading',v);btn.dataset.old=btn.dataset.old||btn.textContent;btn.textContent=v?'Memproses...':btn.dataset.old}
  form.addEventListener('submit',async(e)=>{e.preventDefault();alert.className='alert';busy(true);const fd=new FormData(form);const type=form.dataset.form;
    try{
      if(type==='login'){const data=await VMMO_API.login({identity:fd.get('identity'),password:fd.get('password'),device_id:'WEB-'+(navigator.platform||'BROWSER')});VMMO_API.saveToken(data.access_token,fd.get('remember')==='on');location.href='dashboard.html'}
      if(type==='register'){if(fd.get('password')!==fd.get('confirm_password'))throw new Error('Konfirmasi password tidak sama.');const data=await VMMO_API.register({username:fd.get('username'),email:fd.get('email'),password:fd.get('password')});show(data.message||'Pendaftaran berhasil. Silakan login.','success');form.reset();setTimeout(()=>location.href='login.html',1200)}
      if(type==='forgot'){const data=await VMMO_API.forgot(fd.get('email'));show(data.message||'Jika email terdaftar, instruksi reset akan dikirim.','success');form.reset()}
      if(type==='reset'){const token=new URLSearchParams(location.search).get('token')||fd.get('token');if(!token)throw new Error('Token reset tidak ditemukan pada tautan.');if(fd.get('new_password')!==fd.get('confirm_password'))throw new Error('Konfirmasi password tidak sama.');await VMMO_API.reset(token,fd.get('new_password'));show('Password berhasil diubah. Anda akan diarahkan ke halaman login.','success');form.reset();setTimeout(()=>location.href='login.html',1500)}
    }catch(err){show(err.message||'Terjadi kesalahan.')}finally{busy(false)}
  });
})();
