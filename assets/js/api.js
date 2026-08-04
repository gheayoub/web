(function(){
  const cfg=window.VMMO_CONFIG||{};
  const base=String(cfg.API_BASE_URL||'').replace(/\/$/,'');
  const tokenKey='vmmo_access_token';
  const persistentKey='vmmo_access_token_persistent';
  function getToken(){return sessionStorage.getItem(tokenKey)||localStorage.getItem(persistentKey)||''}
  function saveToken(token,remember){clearToken();(remember?localStorage:sessionStorage).setItem(remember?persistentKey:tokenKey,token)}
  function clearToken(){sessionStorage.removeItem(tokenKey);localStorage.removeItem(persistentKey)}
  async function request(path,options={}){
    const headers={'Content-Type':'application/json',...(options.headers||{})};
    const token=options.auth===false?'':getToken();
    if(token)headers.Authorization=`Bearer ${token}`;
    let response;
    try{response=await fetch(base+path,{...options,headers})}catch(e){throw new Error('Tidak dapat terhubung ke server API. Periksa API_BASE_URL dan koneksi server.')}
    let data={};try{data=await response.json()}catch(e){data={ok:false,error:'invalid_server_response'}}
    if(!response.ok){const err=new Error(data.message||humanError(data.error)||`Server error (${response.status})`);err.status=response.status;err.data=data;throw err}
    return data;
  }
  function humanError(code){return ({invalid_credentials:'Username/email atau password salah.',account_disabled:'Akun dinonaktifkan.',invalid_session:'Sesi tidak valid. Silakan login kembali.',session_expired:'Sesi telah berakhir. Silakan login kembali.',too_many_requests:'Terlalu banyak percobaan. Coba beberapa saat lagi.',email_delivery_failed:'Email reset belum dapat dikirim.',reset_token_expired:'Tautan reset sudah kedaluwarsa.',invalid_reset_token:'Tautan reset tidak valid.',bearer_token_required:'Anda harus login terlebih dahulu.',registration_failed:'Pendaftaran gagal.'})[code]||code||'Terjadi kesalahan.'}
  window.VMMO_API={base,getToken,saveToken,clearToken,humanError,register:(body)=>request('/api/v2/auth/register',{method:'POST',body:JSON.stringify(body),auth:false}),login:(body)=>request('/api/v2/auth/login',{method:'POST',body:JSON.stringify(body),auth:false}),me:()=>request('/api/v2/account/me'),validate:()=>request('/api/v2/auth/validate',{method:'POST',body:JSON.stringify({token:getToken()})}),logout:()=>request('/api/v2/auth/logout',{method:'POST',body:JSON.stringify({token:getToken()})}),forgot:(email)=>request('/api/v2/auth/forgot-password',{method:'POST',body:JSON.stringify({email}),auth:false}),reset:(token,new_password)=>request('/api/v2/auth/reset-password',{method:'POST',body:JSON.stringify({token,new_password}),auth:false})};
})();
