/* Mundo Chispa · main.js */
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const money=n=>'$'+Math.round(n).toLocaleString('es-CO');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FREE=150000;
const CATALOGO=[{"c": "Peluches", "n": "Oso Abrazo", "e": "🧸", "a": "0-2", "p": 49900}, {"c": "Peluches", "n": "Unicornio Nube", "e": "🦄", "a": "3-5", "p": 59900}, {"c": "Peluches", "n": "Dino Rex", "e": "🦖", "a": "3-5", "p": 74900}, {"c": "Construcción", "n": "Bloques Ciudad", "e": "🧱", "a": "3-5", "p": 89900}, {"c": "Construcción", "n": "Cohete Armable", "e": "🚀", "a": "6-8", "p": 119900}, {"c": "Construcción", "n": "Robot Mecano", "e": "🤖", "a": "9+", "p": 149900}, {"c": "Educativos", "n": "Rompecabezas Selva", "e": "🧩", "a": "3-5", "p": 39900}, {"c": "Educativos", "n": "Tablero de Letras", "e": "🔤", "a": "3-5", "p": 54900}, {"c": "Educativos", "n": "Calculadora Divertida", "e": "🧮", "a": "6-8", "p": 44900}, {"c": "Educativos", "n": "Microscopio Junior", "e": "🔬", "a": "9+", "p": 129900}, {"c": "Vehículos", "n": "Tren de Madera", "e": "🚂", "a": "0-2", "p": 69900}, {"c": "Vehículos", "n": "Carro Control Remoto", "e": "🏎️", "a": "6-8", "p": 99900}, {"c": "Vehículos", "n": "Patineta Mini", "e": "🛹", "a": "9+", "p": 139900}, {"c": "Arte", "n": "Crayones Gigantes", "e": "🖍️", "a": "0-2", "p": 24900}, {"c": "Arte", "n": "Set de Pinturas", "e": "🎨", "a": "3-5", "p": 34900}, {"c": "Arte", "n": "Kit de Joyería", "e": "💎", "a": "6-8", "p": 44900}];
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2400)};
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

/* 1. Modo oscuro (se recuerda) */
const themeBtn=$('#theme');
const setTheme=t=>{document.documentElement.dataset.theme=t;themeBtn.textContent=t==='dark'?'Modo claro':'Modo oscuro';themeBtn.setAttribute('aria-label',t==='dark'?'Cambiar a modo claro':'Cambiar a modo oscuro');try{localStorage.setItem('tema',t)}catch(e){}};
let saved='light';try{saved=localStorage.getItem('tema')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}
setTheme(saved);
themeBtn.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));

/* 2. Menú móvil */
const burger=$('#burger'),nav=$('#nav');
burger.addEventListener('click',()=>{const o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});

/* 3. Carrusel de ofertas */
const car=$('#carousel');
if(car){
  const slides=$$('.slide',car),count=$('#count');let i=0,timer;
  const show=n=>{i=(n+slides.length)%slides.length;slides.forEach((s,k)=>s.classList.toggle('on',k===i));count.textContent=`${i+1} de ${slides.length}`};
  const auto=()=>{clearInterval(timer);timer=setInterval(()=>show(i+1),5000)};
  $('#next').addEventListener('click',()=>{show(i+1);auto()});$('#prev').addEventListener('click',()=>{show(i-1);auto()});auto();
}

/* 4. Parallax del Inicio: cada capa (juguetes, formas, título) a su propia velocidad */
const layers=$$('#hero [data-speed]');
if(layers.length&&!reduce){
  let busy=false;
  const move=()=>{busy=false;const y=scrollY;if(y>innerHeight*1.5)return;layers.forEach(el=>{el.style.translate=`0 ${(y*parseFloat(el.dataset.speed)).toFixed(1)}px`})};
  addEventListener('scroll',()=>{if(!busy){busy=true;requestAnimationFrame(move)}},{passive:true});move();
}

/* 5. Contadores animados */
const counters=$$('[data-count]');
if(counters.length){
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;const el=e.target,end=+el.dataset.count,t0=performance.now();io.unobserve(el);
    const tick=t=>{const p=Math.min((t-t0)/1400,1);el.textContent=Math.round(end*(1-Math.pow(1-p,3))).toLocaleString('es-CO');if(p<1)requestAnimationFrame(tick)};
    reduce?el.textContent=end.toLocaleString('es-CO'):requestAnimationFrame(tick);
  }),{threshold:.6});counters.forEach(el=>io.observe(el));
}

/* 6. Carrito lateral: cantidades, total y barra de envío gratis */
let cart=load('carritoJ',{});
const cartBtn=$('#cart'),cartN=$('#cartN');
document.body.insertAdjacentHTML('beforeend',`<div class="ov" id="ov"></div><aside class="drawer" id="drawer" role="dialog" aria-label="Carrito de compras" aria-hidden="true"><header><h2>Tu carrito</h2><button class="btn alt" id="dClose" style="padding:.3rem 1rem">Cerrar</button></header><ul id="dList"></ul><footer><div class="bar" aria-hidden="true"><i id="dBar"></i></div><p id="dShip"></p><p id="dTotal"></p><div class="row"><button class="btn alt" id="dClear">Vaciar</button><button class="btn" id="dPay">Finalizar compra</button></div></footer></aside>`);
const drawer=$('#drawer'),ov=$('#ov');
const totals=()=>Object.values(cart).reduce((a,i)=>({n:a.n+i.q,t:a.t+i.q*i.p}),{n:0,t:0});
const paint=()=>{
  const {n,t}=totals();cartN.textContent=n;save('carritoJ',cart);
  $('#dList').innerHTML=n?Object.entries(cart).map(([name,i])=>`<li><b>${name}</b><span class="sub">${money(i.p*i.q)}</span><span class="qty"><button data-act="minus" data-n="${name}" aria-label="Quitar uno">−</button><span>${i.q}</span><button data-act="plus" data-n="${name}" aria-label="Añadir uno">+</button></span><button class="rm" data-act="rm" data-n="${name}">Quitar</button></li>`).join(''):'<li class="empty-c">Tu carrito está vacío. Elige un juguete y aparecerá aquí.</li>';
  $('#dTotal').textContent=`Total: ${money(t)}`;
  $('#dBar').style.width=Math.min(100,t/FREE*100)+'%';
  $('#dShip').textContent=t>=FREE?'Tu envío es gratis.':`Te faltan ${money(FREE-t)} para envío gratis.`;
};
const openCart=o=>{drawer.classList.toggle('show',o);ov.classList.toggle('show',o);drawer.setAttribute('aria-hidden',!o);if(o)$('#dClose').focus();else cartBtn.focus()};
cartBtn.addEventListener('click',()=>openCart(true));ov.addEventListener('click',()=>openCart(false));$('#dClose').addEventListener('click',()=>openCart(false));
addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('show'))openCart(false)});
$('#dClear').addEventListener('click',()=>{cart={};paint()});
$('#dPay').addEventListener('click',()=>{if(!totals().n)return toast('Añade un juguete antes de finalizar.');cart={};paint();openCart(false);toast('¡Gracias! Esto es una demostración: no se hizo ningún cobro.')});
drawer.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const n=b.dataset.n,i=cart[n];if(!i)return;
  if(b.dataset.act==='plus')i.q++;else if(b.dataset.act==='minus'){if(--i.q<=0)delete cart[n]}else delete cart[n];
  paint();
});
document.addEventListener('click',e=>{
  const b=e.target.closest('.add');if(!b)return;
  const n=b.dataset.name;cart[n]=cart[n]||{p:+b.dataset.price,q:0};cart[n].q++;paint();
  cartBtn.classList.remove('bump');void cartBtn.offsetWidth;cartBtn.classList.add('bump');
  toast(`${n} añadido al carrito`);
});
paint();

/* 7. Favoritos (corazón) */
let favs=load('favoritosJ',[]);
$$('.fav').forEach(b=>{const on=favs.includes(b.dataset.name);b.setAttribute('aria-pressed',on);b.textContent=on?'♥':'♡'});
document.addEventListener('click',e=>{
  const b=e.target.closest('.fav');if(!b)return;const n=b.dataset.name,on=!favs.includes(n);
  favs=on?[...favs,n]:favs.filter(x=>x!==n);save('favoritosJ',favs);
  $$('.fav').filter(x=>x.dataset.name===n).forEach(x=>{x.setAttribute('aria-pressed',on);x.textContent=on?'♥':'♡'});
  toast(on?`${n} guardado en favoritos (${favs.length})`:`${n} quitado de favoritos`);
});

/* 8. Juguetes: búsqueda + categoría + edad + orden */
const items=$('#items');
if(items){
  const q=$('#q'),age=$('#age'),sort=$('#sort'),found=$('#found'),empty=$('#empty');
  $$('.toy',items).forEach((g,i)=>g.dataset.i=i);
  const apply=()=>{
    const f=$('#filters .on').dataset.f,term=q.value.trim().toLowerCase();let n=0;
    $$('.toy',items).forEach(g=>{const ok=(f==='todos'||g.dataset.c===f)&&(!age.value||g.dataset.a===age.value)&&g.dataset.n.includes(term);g.classList.toggle('hide',!ok);if(ok)n++});
    found.textContent=`${n} juguete${n===1?'':'s'}`;empty.hidden=n>0;
  };
  const order=()=>{const l=$$('.toy',items);l.sort((a,b)=>sort.value==='asc'?a.dataset.p-b.dataset.p:sort.value==='desc'?b.dataset.p-a.dataset.p:a.dataset.i-b.dataset.i);l.forEach(g=>items.appendChild(g))};
  $('#filters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('#filters button').forEach(x=>x.classList.toggle('on',x===b));apply()});
  q.addEventListener('input',apply);age.addEventListener('change',apply);sort.addEventListener('change',order);apply();
}

/* 9. Buscador de regalos (Inicio) */
const quiz=$('#quiz');
if(quiz)quiz.addEventListener('submit',e=>{
  e.preventDefault();const a=$('#qEdad').value,c=$('#qGusto').value;
  const t=CATALOGO.find(x=>x.c===c&&x.a===a)||CATALOGO.find(x=>x.c===c);
  $('#qOut').innerHTML=`<span class="e" aria-hidden="true">${t.e}</span><span>Te sugerimos <b>${t.n}</b> (${t.a} años) por ${money(t.p)}.</span><button type="button" class="btn add" data-name="${t.n}" data-price="${t.p}">Añadir al carrito</button>`;
});

/* 10. Reservar taller (Servicios) */
document.addEventListener('click',e=>{const b=e.target.closest('.res');if(b){b.textContent='Reservado';b.disabled=true;toast(`Reservaste un cupo en "${b.dataset.n}". Te confirmamos por correo.`)}});

/* 11. Calculadora de regalo (Servicios) */
const calc=$('#calc');
if(calc)calc.addEventListener('submit',e=>{
  e.preventDefault();const v=Math.max(0,parseInt($('#cValor').value)||0);$('#cValor').value=v;
  const extra=($('#cWrap').checked?6000:0)+($('#cCard').checked?4000:0),ship=v>=FREE?0:+$('#cShip').value;
  $('#cOut').textContent=`Total: ${money(v+extra+ship)}${ship===0&&v>=FREE?' (envío gratis incluido)':''}. Juguetes ${money(v)}, extras ${money(extra)}, envío ${money(ship)}.`;
});

/* 12. Suscripción */
const news=$('#news');
if(news)news.addEventListener('submit',e=>{
  e.preventDefault();const f=news.elements.email,ok=/^\S+@\S+\.\S+$/.test(f.value),m=$('#newsMsg');
  f.classList.toggle('bad',!ok);m.textContent=ok?'Listo, quedaste suscrito. Revisa tu correo.':'Escribe un correo válido, por ejemplo nombre@correo.com.';
  m.style.color=ok?'var(--green)':'var(--pink)';if(ok)news.reset();
});

/* 13. Validación del formulario de contacto */
const form=$('#form');
if(form)form.addEventListener('submit',e=>{
  e.preventDefault();let ok=true;
  const rules={
    nombre:v=>v.trim().length>=3||'Escribe tu nombre (mínimo 3 letras).',
    correo:v=>/^\S+@\S+\.\S+$/.test(v)||'Escribe un correo válido, por ejemplo nombre@correo.com.',
    tema:v=>v!==''||'Elige un tema.',
    mensaje:v=>v.trim().length>=10||'Cuéntanos un poco más (mínimo 10 caracteres).'
  };
  for(const [name,rule] of Object.entries(rules)){
    const f=form.elements[name],r=rule(f.value),bad=r!==true;
    f.classList.toggle('bad',bad);f.nextElementSibling.textContent=bad?r:'';if(bad)ok=false;
  }
  $('#ok').textContent=ok?'Mensaje enviado. Te respondemos en menos de 2 horas.':'';
  if(ok)form.reset();
});
