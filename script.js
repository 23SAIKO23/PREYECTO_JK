const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('.menu');
const yearEl=document.getElementById('year');
if(yearEl){yearEl.textContent=new Date().getFullYear();}

// Reveal on scroll
(()=>{
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('reveal-in');
        io.unobserve(e.target);
      }
    });
  },{threshold:0.12}) : null;
  const toReveal=[...document.querySelectorAll('.card,.work-item,.price,.testimonials blockquote,.stack span,.faq-item,.form, .page-hero h1, .page-hero .chips, .page-hero p')];
  toReveal.forEach(el=>{
    el.classList.add('reveal');
    if(io) io.observe(el); else el.classList.add('reveal-in');
  });
})();
if(toggle&&menu){toggle.addEventListener('click',()=>{
  const open=menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded',open? 'true':'false');
});}
const links=[...document.querySelectorAll('a[href^="#"]')];
links.forEach(l=>l.addEventListener('click',e=>{
  const id=l.getAttribute('href');
  if(id&&id.length>1){
    const target=document.querySelector(id);
    if(target){
      e.preventDefault();
      const top=target.getBoundingClientRect().top+window.scrollY-70;
      window.scrollTo({top,behavior:'smooth'});
      menu?.classList.remove('open');
      toggle?.setAttribute('aria-expanded','false');
    }
  }
}));
// Toast helper
function ensureToastWrap(){
  let wrap=document.querySelector('.toast-wrap');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.className='toast-wrap';
    document.body.appendChild(wrap);
  }
  return wrap;
}
function showToast(message){
  const wrap=ensureToastWrap();
  const el=document.createElement('div');
  el.className='toast';
  el.textContent=message;
  wrap.appendChild(el);
  // trigger transition
  requestAnimationFrame(()=>el.classList.add('show'));
  setTimeout(()=>{
    el.classList.remove('show');
    setTimeout(()=>el.remove(),250);
  },3000);
}

const form=document.getElementById('contact-form');
if(form){
  const setError=(input,msg)=>{
    input.classList.add('error');
    let err=input.nextElementSibling;
    if(!(err&&err.classList?.contains('field-error'))){
      err=document.createElement('div');
      err.className='field-error';
      input.parentNode.insertBefore(err,input.nextSibling);
    }
    err.textContent=msg;
  };
  const clearError=(input)=>{
    input.classList.remove('error');
    const err=input.nextElementSibling;
    if(err&&err.classList?.contains('field-error')) err.remove();
  };
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const nombre=form.querySelector('input[name="nombre"]');
    const email=form.querySelector('input[name="email"]');
    const mensaje=form.querySelector('textarea[name="mensaje"]');
    [nombre,email,mensaje].forEach(clearError);
    let ok=true;
    if(!nombre.value.trim()){setError(nombre,'Ingresa tu nombre'); ok=false;}
    const mail=email.value.trim();
    const re=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if(!mail||!re.test(mail)){setError(email,'Email inválido'); ok=false;}
    if(!mensaje.value.trim()){setError(mensaje,'Cuéntanos tu idea'); ok=false;}
    if(!ok){showToast('Revisa los campos resaltados'); return;}
    showToast(`Gracias ${nombre.value||''}! Te contactaremos pronto.`);
    form.reset();
  });
}
// FAQs accordion
const faqButtons=[...document.querySelectorAll('.faq-q')];
if(faqButtons.length){
  faqButtons.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const item=btn.closest('.faq-item');
      const open=item?.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i=>{
        i.classList.remove('open');
        const q=i.querySelector('.faq-q');
        q?.setAttribute('aria-expanded','false');
      });
      if(!open){
        item?.classList.add('open');
        btn.setAttribute('aria-expanded','true');
      } else {
        btn.setAttribute('aria-expanded','false');
      }
    });
  });
}
