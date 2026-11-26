/* =====================================================================
   GEEADAS — Application : coquille, navigation, composants, membres
   ===================================================================== */
var U = null;            // utilisateur connecté
var ST = {               // état d'interface
  q:'', f:{cell:'',statut:'',sexe:'',niveau:'',carte:''}, sort:'recent', sel:new Set(), selMode:false,
  dashCell:'', cartesF:'tous', comTab:'annonces', diff:{cell:'',statut:'',sexe:'',niveau:'',age:''}, rTab:'etab', rq:'', usersTab:'regional', jq:''
};
var PREF = (function(){ try{ return JSON.parse(localStorage.getItem('geeadas-pref')||'{}'); }catch(e){ return {}; } })();
function savePref(){ try{ localStorage.setItem('geeadas-pref', JSON.stringify(PREF)); }catch(e){} }
var IN_FRAME = (function(){ try{ return window.self!==window.top; }catch(e){ return true; } })();

/* ---------- Permissions ---------- */
function isReg(){ return U && U.niveau==='regional'; }
function canEdit(){ return U && U.acces!=='lecture'; }
function cellById(id){ return DB.cells.find(function(c){ return c.id===id; }); }
function cellName(id){ var c=cellById(id); return c?c.nom:'Sans cellule'; }
function scopeM(){ return isReg()?DB.members:DB.members.filter(function(m){ return m.celluleId===U.celluleId; }); }
function scopeIns(){ return isReg()?DB.inscriptions:DB.inscriptions.filter(function(x){ return x.celluleId===U.celluleId; }); }
function scopeNotes(){ return isReg()?DB.notes:DB.notes.filter(function(n){ return n.celluleId===U.celluleId; }); }
function log(action, detail, celluleId){ var l={date:nowISO(),auteur:U?U.nom:'Formulaire public',titre:U?U.titre:'',action:action,detail:detail||'',celluleId:celluleId||(U&&U.celluleId)||''}; Store.save('logs', l).catch(function(){}); }

/* ---------- Retours tactiles & micro-interactions ---------- */
function haptic(kind){ if(PREF.haptic===false) return; try{ if(navigator.vibrate) navigator.vibrate(kind==='success'?[14,50,22]:kind==='error'?[40,60,40]:kind==='heavy'?18:9); }catch(e){} }
document.addEventListener('pointerdown', function(e){
  var el=e.target.closest('.btn,.li,.chip,.tile,.task,.qa a,.qa button,.acct,.opt,.bnav a');
  if(!el) return; haptic();
  if(!el.matches('.btn,.li,.tile,.task,.acct')) return;
  var r=el.getBoundingClientRect(), s=Math.max(r.width,r.height), sp=document.createElement('span');
  sp.className='ripple'; sp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';
  if(getComputedStyle(el).position==='static') el.style.position='relative';
  el.appendChild(sp); setTimeout(function(){ sp.remove(); },600);
}, {passive:true});
function toast(msg, kind){
  var box=$('#toasts'), t=document.createElement('div'); t.className='toast '+(kind==='err'?'err':'');
  t.innerHTML='<span class="ti">'+I(kind==='err'?'x':'check')+'</span><span></span>'; t.lastChild.textContent=msg; box.appendChild(t);
  haptic(kind==='err'?'error':'success');
  setTimeout(function(){ t.classList.add('out'); setTimeout(function(){ t.remove(); },300); }, 2800);
}
function countUp(root){
  $$('[data-count]', root).forEach(function(el){ var to=parseFloat(el.dataset.count), dec=(el.dataset.count.split('.')[1]||'').length, t0=performance.now(), d=900;
    (function f(t){ var p=Math.min(1,(t-t0)/d), e=1-Math.pow(1-p,3); el.textContent=(to*e).toLocaleString('fr-FR',{minimumFractionDigits:dec,maximumFractionDigits:dec})+(el.dataset.suf||''); if(p<1) requestAnimationFrame(f); })(t0); });
}
function confetti(){
  var c=document.createElement('div'); c.className='confetti'; var cols=['#0b7a3e','#f4a51c','#14a356','#ffd27a','#2a6fdb'];
  for(var i=0;i<60;i++){ var p=document.createElement('i'); p.style.left=Math.random()*100+'%'; p.style.background=cols[i%cols.length]; p.style.setProperty('--x',(Math.random()*200-100)+'px'); p.style.setProperty('--r',(Math.random()*720)+'deg'); p.style.animationDelay=Math.random()*.3+'s'; c.appendChild(p); }
  document.body.appendChild(c); setTimeout(function(){ c.remove(); },2200);
}
function copyText(txt, okMsg){ (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){ toast(okMsg||'Copié'); }).catch(function(){ showText('Copier', txt); }); }
function showText(title, txt){ openSheet({title:title, auto:true, body:'<p class="sm mut" style="margin-bottom:10px">Sélectionnez puis copiez le contenu.</p><textarea rows="10" readonly id="txtout">'+esc(txt)+'</textarea>', foot:'<button class="btn pri" data-act="copyout">'+I('copy')+'Copier</button>'}); }
function download(name, text){
  if(IN_FRAME){ showText('Export : '+name, text); return; }
  try{ var blob=new Blob(['﻿'+text],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); toast('Fichier téléchargé : '+name); }
  catch(e){ showText('Export : '+name, text); }
}

/* ---------- Feuilles (sheets) & dialogues ---------- */
var sheetStack=[];
function openSheet(o){
  var scrim=document.createElement('div'); scrim.className='scrim';
  var sh=document.createElement('section'); sh.className='sheet'+(o.wide?' wide':'')+(o.auto?' auto':''); sh.setAttribute('role','dialog'); sh.setAttribute('aria-modal','true');
  sh.innerHTML='<div class="grab"></div><header class="sheet-h">'+(o.back?'<button class="btn icon ghost" data-act="closesheet" aria-label="Retour">'+I('chevl')+'</button>':'')+'<h2></h2><button class="btn icon ghost" data-act="closesheet" aria-label="Fermer">'+I('x')+'</button></header><div class="sheet-b">'+(o.body||'')+'</div>'+(o.foot?'<footer class="sheet-f">'+o.foot+'</footer>':'');
  sh.querySelector('h2').textContent=o.title||'';
  document.body.appendChild(scrim); document.body.appendChild(sh);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ scrim.classList.add('on'); sh.classList.add('on'); }); });
  scrim.onclick=closeSheet;
  // glisser vers le bas pour fermer (mobile)
  var g=sh.querySelector('.grab'), y0=null;
  g.addEventListener('pointerdown',function(e){ y0=e.clientY; sh.style.transition='none'; g.setPointerCapture(e.pointerId); });
  g.addEventListener('pointermove',function(e){ if(y0===null) return; var dy=Math.max(0,e.clientY-y0); sh.style.transform='translateY('+dy+'px)'; });
  g.addEventListener('pointerup',function(e){ var dy=e.clientY-y0; y0=null; sh.style.transition=''; sh.style.transform=''; if(dy>110) closeSheet(); });
  sheetStack.push({sh:sh,scrim:scrim,onClose:o.onClose});
  document.body.style.overflow='hidden';
  setTimeout(function(){ var f=sh.querySelector('.sheet-b input:not([type=file]),.sheet-b select'); if(f&&window.innerWidth>899&&o.focus!==false) f.focus({preventScroll:true}); },420);
  return sh;
}
function closeSheet(){ var s=sheetStack.pop(); if(!s) return; s.sh.classList.remove('on'); s.scrim.classList.remove('on'); setTimeout(function(){ s.sh.remove(); s.scrim.remove(); },420); if(!sheetStack.length) document.body.style.overflow=''; if(s.onClose) s.onClose(); }
function closeAllSheets(){ while(sheetStack.length) closeSheet(); }
function topSheet(){ return sheetStack.length?sheetStack[sheetStack.length-1].sh:null; }
function confirmDlg(o){ return new Promise(function(res){
  var scrim=document.createElement('div'); scrim.className='scrim'; scrim.style.zIndex=115;
  var d=document.createElement('div'); d.className='dialog'; d.setAttribute('role','alertdialog');
  d.innerHTML='<div class="ic" style="'+(o.tone==='brand'?'background:var(--brand-50);color:var(--brand)':'')+'">'+I(o.icon||'alert')+'</div><h3></h3><p></p><div class="row"><button class="btn" data-r="0">Annuler</button><button class="btn '+(o.tone==='brand'?'pri':'pri')+'" data-r="1" style="'+(o.tone==='brand'?'':'background:var(--red);border-color:var(--red);box-shadow:none')+'">'+esc(o.ok||'Confirmer')+'</button></div>';
  d.querySelector('h3').textContent=o.title; d.querySelector('p').textContent=o.text||'';
  document.body.appendChild(scrim); document.body.appendChild(d); haptic('heavy');
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ scrim.classList.add('on'); d.classList.add('on'); }); });
  function done(v){ d.classList.remove('on'); scrim.classList.remove('on'); setTimeout(function(){ d.remove(); scrim.remove(); },300); res(v); }
  d.onclick=function(e){ var b=e.target.closest('[data-r]'); if(b) done(b.dataset.r==='1'); }; scrim.onclick=function(){ done(false); };
}); }
function picker(title, opts, current, cb){
  var sh=openSheet({title:title, auto:true, focus:false, body:'<div class="list">'+opts.map(function(o){ return '<div class="li" data-v="'+esc(o[0])+'"><div class="t"><b>'+esc(o[1])+'</b>'+(o[2]?'<span>'+esc(o[2])+'</span>':'')+'</div>'+(String(current)===String(o[0])?'<span style="color:var(--brand)">'+I('check')+'</span>':'')+'</div>'; }).join('')+'</div>'});
  sh.querySelector('.list').onclick=function(e){ var li=e.target.closest('[data-v]'); if(!li) return; closeSheet(); cb(li.dataset.v); };
}

/* ---------- Graphiques ---------- */
function avatar(m, cls){ return m.photo?'<img class="av '+(cls||'')+'" src="'+esc(m.photo)+'" alt="">':'<span class="av '+(cls||'')+'" style="background:'+avColor(m.id||m.nom)+'">'+esc(initials(m))+'</span>'; }
function uavatar(u, cls){ var p=String(u.nom||'').split(' '); return '<span class="av '+(cls||'')+'" style="background:'+avColor(u.id||u.nom)+'">'+esc((p[0]||'')[0]||'')+esc((p[1]||'')[0]||'')+'</span>'; }
function donut(parts, center, sub){
  var tot=parts.reduce(function(a,p){ return a+p.v; },0)||1, r=52, C=2*Math.PI*r, off=0;
  var arcs=parts.map(function(p){ var len=p.v/tot*C; var s='<circle class="seg-arc" cx="70" cy="70" r="'+r+'" fill="none" stroke="'+p.c+'" stroke-width="16" stroke-dasharray="'+Math.max(0,len-2)+' '+C+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 70 70)" stroke-linecap="butt"/>'; off+=len; return s; }).join('');
  return '<div class="donut-wrap"><svg viewBox="0 0 140 140" role="img"><circle cx="70" cy="70" r="'+r+'" fill="none" stroke="var(--surface-2)" stroke-width="16"/>'+arcs+'<text x="70" y="68" text-anchor="middle" font-size="24" font-weight="800" fill="currentColor">'+esc(center)+'</text><text x="70" y="88" text-anchor="middle" font-size="11" fill="var(--mut)">'+esc(sub||'')+'</text></svg><div class="dl">'+parts.map(function(p){ return '<div><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:'+p.c+';margin-right:8px"></i>'+esc(p.l)+'</span><b>'+fmtN(p.v)+' <small class="mut" style="font-weight:600">'+Math.round(p.v/tot*100)+'%</small></b></div>'; }).join('')+'</div></div>';
}
function bars(entries, opts){ opts=opts||{}; var max=Math.max.apply(null,[1].concat(entries.map(function(e){ return e[1]; })));
  if(!entries.length) return emptyMini('Aucune donnée');
  return '<div class="bars">'+entries.map(function(e,i){ return '<div class="bar '+(opts.gold?'gold':'')+'" '+(opts.act?'data-act="'+opts.act+'" data-v="'+esc(e[2]||e[0])+'" style="cursor:pointer"':'')+'>'+(opts.rank?'<span class="n">'+(i+1)+'</span>':'<span class="n" style="display:none"></span>')+'<div style="'+(opts.rank?'':'grid-column:1/3')+'"><div class="lab"><span>'+esc(e[0])+'</span></div><div class="trk"><i style="width:'+(e[1]/max*100).toFixed(1)+'%;animation-delay:'+(i*40)+'ms"></i></div></div><span class="v">'+fmtN(e[1])+'</span></div>'; }).join('')+'</div>'; }
function cols(entries, eleveKeys){ var max=Math.max.apply(null,[1].concat(entries.map(function(e){ return e[1]; })));
  return '<div class="cols">'+entries.map(function(e,i){ return '<div class="c '+(eleveKeys&&eleveKeys.indexOf(e[0])<0?'e':'')+'"><b>'+e[1]+'</b><i style="height:'+Math.max(3,e[1]/max*100)+'%;animation-delay:'+(i*35)+'ms"></i><span>'+esc(e[0].replace('Licence ','L').replace('Master ','M').replace('Terminale','Tle').replace('Doctorat','Doc').replace('Formation pro','Pro').replace('CAP / BT','CAP'))+'</span></div>'; }).join('')+'</div>'; }
function areaChart(vals, labels){
  var W=600,H=180,max=Math.max.apply(null,vals.concat([1]))*1.15,min=Math.min.apply(null,vals)*.85, n=vals.length;
  var pts=vals.map(function(v,i){ return [i/(n-1)*W, H-(v-min)/(max-min||1)*H]; });
  var d=pts.map(function(p,i){ if(!i) return 'M'+p[0]+','+p[1]; var q=pts[i-1], cx=(q[0]+p[0])/2; return 'C'+cx+','+q[1]+' '+cx+','+p[1]+' '+p[0]+','+p[1]; }).join(' ');
  var gid='g'+uid();
  return '<div class="area"><svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><defs><linearGradient id="'+gid+'" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0b7a3e" stop-opacity=".28"/><stop offset="1" stop-color="#0b7a3e" stop-opacity="0"/></linearGradient></defs>'+[0.25,.5,.75].map(function(f){ return '<line x1="0" x2="'+W+'" y1="'+H*f+'" y2="'+H*f+'" stroke="var(--line-2)" stroke-dasharray="4 6" vector-effect="non-scaling-stroke"/>'; }).join('')+'<path d="'+d+' L'+W+','+H+' L0,'+H+'Z" fill="url(#'+gid+')"/><path class="ln" d="'+d+'" fill="none" stroke="#0b7a3e" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg><div class="xl">'+labels.map(function(l,i){ return '<span style="'+(window.innerWidth<600&&i%2?'visibility:hidden':'')+'">'+esc(l)+'</span>'; }).join('')+'</div></div>';
}
function sparkline(vals){ var W=200,H=60,max=Math.max.apply(null,vals.concat([1])),min=Math.min.apply(null,vals),n=vals.length;
  var d=vals.map(function(v,i){ return (i?'L':'M')+(i/(n-1)*W).toFixed(1)+','+(H-(v-min)/(max-min||1)*(H-6)-3).toFixed(1); }).join(' ');
  return '<svg class="spark" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><path d="'+d+' L'+W+','+H+' L0,'+H+'Z" fill="rgba(255,255,255,.12)"/><path class="ln" d="'+d+'" fill="none" stroke="#f4a51c" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:2000;stroke-dashoffset:2000;animation:draw 1.6s .2s var(--ease) forwards"/></svg>'; }
function ring(p, col){ var r=19,C=2*Math.PI*r; return '<svg class="ring" viewBox="0 0 48 48"><circle cx="24" cy="24" r="'+r+'" fill="none" stroke="var(--surface-2)" stroke-width="5"/><circle cx="24" cy="24" r="'+r+'" fill="none" stroke="'+(col||'var(--brand)')+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(p/100*C)+' '+C+'" transform="rotate(-90 24 24)"/><text x="24" y="28" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">'+p+'%</text></svg>'; }
function emptyMini(t){ return '<p class="sm mut" style="padding:10px 0">'+esc(t)+'</p>'; }
function emptyState(icon, t, s, btn){ return '<div class="empty"><div class="ill">'+I(icon)+'</div><b>'+esc(t)+'</b><span class="sm">'+esc(s||'')+'</span>'+(btn?'<div style="margin-top:16px">'+btn+'</div>':'')+'</div>'; }
function countBy(arr, fn){ var m=new Map(); arr.forEach(function(x){ var k=fn(x); if(k!=null&&k!=='') m.set(k,(m.get(k)||0)+1); }); return Array.from(m.entries()); }
function monthsBack(n){ var out=[], d=new Date(); d.setDate(1); for(var i=n-1;i>=0;i--){ var x=new Date(d.getFullYear(), d.getMonth()-i, 1); out.push(x); } return out; }
function cumulSeries(M, n){ var ms=monthsBack(n); return { vals: ms.map(function(m){ var end=isoDay(new Date(m.getFullYear(), m.getMonth()+1, 0)); return M.filter(function(x){ return (x.dateInscription||'')<=end; }).length; }), labels: ms.map(function(m){ return m.toLocaleDateString('fr-FR',{month:'short'}).replace('.',''); }) }; }

/* ---------- Navigation ---------- */
var VIEWS={
  accueil:{t:'Accueil',i:'home'}, membres:{t:'Membres',i:'users'}, validations:{t:'Validations',tl:'Inscriptions',i:'inbox'},
  cellules:{t:'Cellules',i:'layers',reg:1}, suivi:{t:'Suivi',i:'heart'}, opportunites:{t:'Nouvelles cellules',i:'pin',reg:1},
  reseau:{t:'Réseau & talents',i:'share'}, cartes:{t:'Cartes & paiements',i:'card'}, communication:{t:'Communication',i:'mega'},
  comptes:{t:'Comptes & accès',i:'key',reg:1}, journal:{t:'Journal d\'activité',i:'list',reg:1}, donnees:{t:'Import / Export',i:'download'},
  parametres:{t:'Paramètres',i:'sliders'}, plus:{t:'Plus',i:'grid'}
};
function vt(k){ var v=VIEWS[k]; return (!isReg()&&v.tl)?v.tl:v.t; }
function navGroups(){ return isReg()
  ? [['Pilotage',['accueil','membres','validations','cellules','suivi']],['Croissance',['opportunites','reseau']],['Gestion',['cartes','communication','comptes','journal','donnees']],['Compte',['parametres']]]
  : [['Ma cellule',['accueil','membres','validations','suivi']],['Outils',['cartes','communication','reseau','donnees']],['Compte',['parametres']]]; }
function bottomNav(){ return isReg()?['accueil','membres','FAB','validations','plus']:['accueil','membres','FAB','suivi','plus']; }
function curView(){ var h=location.hash.slice(1); if(h==='inscription') return h; if(VIEWS[h]&&(!VIEWS[h].reg||isReg())) return h; return 'accueil'; }
function go(v){ if(location.hash.slice(1)===v) render(); else location.hash=v; }

function shell(view, inner){
  var nIns=scopeIns().length, c=cellById(U.celluleId);
  var side='<aside class="sidebar"><div class="sb-brand"><img src="'+LOGO+'" alt=""><div><b>GEEAD '+esc(DB.settings.region||CONFIG.region)+'</b><span>'+(isReg()?'Bureau régional':'Cellule '+esc(c?c.nom:''))+'</span></div></div>'+
    navGroups().map(function(g){ return '<div class="sb-group">'+g[0]+'</div>'+g[1].map(function(k){ return '<a class="sb-link '+(view===k?'on':'')+'" href="#'+k+'">'+I(VIEWS[k].i)+vt(k)+(k==='validations'&&nIns?'<span class="cnt">'+nIns+'</span>':'')+'</a>'; }).join(''); }).join('')+
    '<button class="sb-user" data-act="profile">'+uavatar(U,'sm')+'<div style="flex:1"><b>'+esc(U.nom)+'</b><span>'+esc(U.titre)+'</span></div>'+I('more')+'</button></aside>';
  var bn='<nav class="bnav" aria-label="Navigation">'+bottomNav().map(function(k){ if(k==='FAB') return canEdit()?'<button class="fab" data-act="newmember" aria-label="Nouveau membre">'+I('plus')+'</button>':'<a href="#reseau" class="'+(view==='reseau'?'on':'')+'">'+I('share')+'Réseau</a>';
    return '<a href="#'+k+'" class="'+(view===k||(k==='plus'&&['cellules','opportunites','reseau','cartes','communication','comptes','journal','donnees','parametres'].indexOf(view)>=0&&bottomNav().indexOf(view)<0)?'on':'')+'">'+I(VIEWS[k].i)+(k==='validations'?'Valider':vt(k))+(k==='validations'&&nIns?'<span class="dot">'+nIns+'</span>':'')+'</a>'; }).join('')+'</nav>';
  var top='<header class="topbar" id="topbar"><h1>'+esc(vt(view))+'</h1><div class="gsearch">'+I('search')+'<input id="gsearch" placeholder="Rechercher un membre, un ID…" aria-label="Recherche globale"></div>'+
    (canEdit()&&view!=='membres'?'<button class="btn pri" data-act="newmember" style="display:var(--dsk,inline-flex)">'+I('userplus')+'<span>Nouveau membre</span></button>':'')+
    '<button class="btn icon ghost" data-act="profile" aria-label="Mon profil" style="padding:0">'+uavatar(U,'sm')+'</button></header>';
  return '<div class="app">'+side+'<div class="main">'+top+'<main class="content"><div class="view">'+(Store.mode==='demo'?'<div class="demo-banner">'+I('sparkle')+'<span><b>Démonstration</b> — données fictives, enregistrées sur cet appareil uniquement.</span></div>':'')+inner+'</div></main></div>'+bn+'</div><div class="selbar" id="selbar"></div>';
}

var RENDER={};
function render(){
  closeAllSheets();
  var v=curView();
  if(v==='inscription'){ renderPublic(); return; }
  if(!U){ renderLogin(); return; }
  if(location.hash.slice(1)!==v&&location.hash) { history.replaceState(null,'','#'+v); }
  var r=RENDER[v]();
  $('#root').innerHTML=shell(v, r.html);
  document.title=vt(v)+' · GEEAD '+(DB.settings.region||'');
  if(window.innerWidth<900) $$('.topbar .btn.pri').forEach(function(b){ b.style.display='none'; });
  if(r.mount) r.mount();
  countUp($('#root'));
  var gs=$('#gsearch'); if(gs) gs.onkeydown=function(e){ if(e.key==='Enter'){ ST.q=gs.value; go('membres'); } };
  window.scrollTo({top:0});
}
window.addEventListener('scroll',function(){ var t=$('#topbar'); if(t) t.classList.toggle('scrolled', window.scrollY>6); },{passive:true});
window.addEventListener('hashchange', render);
document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeSheet(); });

/* ---------- Connexion ---------- */
function renderLogin(err){
  var nM=DB.members.length, nC=DB.cells.length, nE=new Set(DB.members.map(function(m){ return norm(m.etablissement); })).size;
  var art='<div class="auth-art"><div class="lg"><img src="'+LOGO+'" alt="Logo GEEAD"><div><b style="font-size:15px">GEEAD Côte d\'Ivoire</b><div style="opacity:.75;font-size:13px">Région '+esc(DB.settings.region||CONFIG.region)+'</div></div></div>'+
    '<div><h1>Chaque GEEADISTE <em>connu</em>, suivi et accompagné.</h1><p>Recensement, suivi spirituel et académique, cartes de membre et statistiques de la région, dans une seule application.</p></div>'+
    (Store.mode==='demo'?'<div class="auth-stats"><div><b>'+fmtN(nM)+'</b><span>membres recensés</span></div><div><b>'+nC+'</b><span>cellules</span></div><div><b>'+nE+'</b><span>établissements</span></div></div>':'<div class="auth-stats"><div><span>L\'École, Notre Champ Missionnaire</span></div></div>')+'</div>';
  var form;
  if(Store.mode==='demo'){
    var g=function(lvl){ return DB.users.filter(function(u){ return u.niveau===lvl&&u.actif!==false; }).map(function(u){ var c=cellById(u.celluleId); return '<button class="acct" data-act="demologin" data-id="'+esc(u.id)+'">'+uavatar(u)+'<div class="t"><b>'+esc(u.nom)+'</b><span>'+esc(u.titre)+(c?' · '+esc(c.nom):'')+(u.acces==='lecture'?' · lecture seule':'')+'</span></div>'+I('chevr')+'</button>'; }).join(''); };
    form='<div class="auth-form"><h2>Connexion</h2><p class="lead">Mode démonstration : choisissez un compte pour découvrir chaque niveau d\'accès.</p><div class="seg-label">Bureau régional</div>'+g('regional')+'<div class="seg-label">Bureaux locaux</div>'+g('local')+'<p class="sm mut" style="margin-top:18px;text-align:center"><a href="#inscription">Je suis membre : je m\'inscris</a></p></div>';
  } else {
    form='<form class="auth-form" id="loginf"><h2>Connexion</h2><p class="lead">Espace réservé au bureau régional et aux bureaux des cellules.</p><button type="button" class="btn block" data-act="googlelogin" style="min-height:52px;font-size:15px"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8.1z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6.1-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.9 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1A11 11 0 0 0 2.2 7.1l3.7 2.8C6.8 7.3 9.2 5.4 12 5.4z"/></svg>Continuer avec Google</button><div class="seg-label" style="text-align:center;margin:18px 0 6px">ou avec e-mail et mot de passe</div><label class="field"><span>Adresse e-mail</span><input id="le" type="email" required autocomplete="username" placeholder="nom@exemple.com"></label><label class="field" style="margin-top:14px"><span>Mot de passe</span><input id="lp" type="password" required autocomplete="current-password"></label>'+(err?'<p style="color:var(--red);margin-top:10px" class="sm">'+esc(err)+'</p>':'')+'<button class="btn pri block" style="margin-top:20px;min-height:52px">Se connecter</button><button type="button" class="btn ghost block" data-act="resetpwd" style="margin-top:6px">Mot de passe oublié ?</button><p class="sm mut" style="margin-top:18px;text-align:center"><a href="#inscription">Je suis membre : je m\'inscris</a></p></form>';
  }
  $('#root').innerHTML='<div class="auth view">'+art+form+'</div>';
  var lf=$('#loginf'); if(lf) lf.onsubmit=async function(e){ e.preventDefault(); var b=lf.querySelector('.pri'); b.disabled=true; b.textContent='Connexion…'; try{ await Store.fb.auth.signInWithEmailAndPassword($('#le').value.trim(),$('#lp').value); }catch(er){ haptic('error'); renderLogin('E-mail ou mot de passe incorrect.'); } };
}
function setSession(u){ U=u; try{ if(Store.mode==='demo') localStorage.setItem('geeadas-session',u?u.id:''); }catch(e){} }

/* =====================================================================
   ACCUEIL
   ===================================================================== */
RENDER.accueil=function(){ return isReg()?accueilReg():accueilLocal(); };
function greet(){ var h=new Date().getHours(); return (h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir')+', '+firstName(U.nom.split(' ').slice(-1)[0]===U.nom.split(' ')[0]?U.nom:U.nom.split(' ')[0]); }
function greetLine(){ var parts=U.nom.split(' '); var prenom=parts[0]===parts[0].toUpperCase()&&parts.length>1?parts.slice(1).join(' '):parts[0]; var h=new Date().getHours(); return (h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir')+' '+prenom; }
function tasksFor(M){
  var t=[], ins=scopeIns().length; if(ins) t.push(['inbox','gold',ins,'Inscriptions à valider','Fiches envoyées par les membres','validations']);
  var np=M.filter(function(m){ return !(m.carte&&m.carte.paye); }).length; if(np) t.push(['wallet','red',np,'Cartes non payées','Relancer les membres concernés','cartes']);
  var inc=M.filter(function(m){ return completude(m)<70; }).length; if(inc) t.push(['edit','blue',inc,'Fiches incomplètes','Photo, filière ou contacts manquants','membres-incomplets']);
  if(isReg()){ var o=opportunities().filter(function(x){ return x.membres.length>=DB.settings.seuil; }).length; if(o) t.push(['pin','',o,'Cellules à créer','Établissements prêts','opportunites']);
    var iso=DB.members.filter(function(m){ return !m.celluleId; }).length; if(iso) t.push(['alert','red',iso,'Jeunes isolés','Recensés sans cellule','opportunites']); }
  var rc=aRecontacter(M).length; if(rc) t.push(['heart','',rc,'À recontacter','Aucun suivi depuis 60 jours','suivi']);
  return t;
}
function tasksHTML(t){ return t.length?t.map(function(x){ return '<div class="task tap" data-act="goto" data-v="'+x[5]+'"><span class="ic '+x[1]+'">'+I(x[0])+'</span><div class="t"><b>'+esc(x[3])+'</b><span>'+esc(x[4])+'</span></div><span class="num">'+x[2]+'</span>'+I('chevr','mut')+'</div>'; }).join(''):emptyState('checkc','Tout est à jour','Aucune action en attente.'); }
function annoncesFor(){ return DB.annonces.filter(function(a){ return isReg()||a.cible==='all'||a.cible===U.celluleId; }).sort(function(a,b){ return b.date.localeCompare(a.date); }); }
function annonceCard(a, del){ return '<div class="task" style="cursor:default;align-items:flex-start"><span class="ic '+(a.important?'gold':'')+'">'+I('mega')+'</span><div class="t"><b>'+esc(a.titre)+(a.important?' <span class="badge gold">Important</span>':'')+'</b><span style="display:block;color:var(--ink-2);margin:4px 0 6px;font-size:13.5px">'+esc(a.texte)+'</span><span>'+esc(a.auteur)+' · '+esc(a.titre_auteur||'')+' · '+fmtD(a.date)+(isReg()?' · '+(a.cible==='all'?'Toutes les cellules':esc(cellName(a.cible))):'')+'</span></div>'+(del?'<button class="btn icon ghost sm" data-act="delannonce" data-id="'+esc(a.id)+'" aria-label="Supprimer">'+I('trash')+'</button>':'')+'</div>'; }

function statsBlock(M){
  var n=M.length, f=M.filter(function(m){ return m.sexe==='F'; }).length, el=M.filter(function(m){ return m.statut==='Élève'; }).length;
  var ages=M.map(function(m){ return ageOf(m.naissance); }).filter(function(a){ return a!==null; });
  var moy=ages.length?(ages.reduce(function(a,b){ return a+b; },0)/ages.length):0;
  var mois=isoDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  var nouveaux=M.filter(function(m){ return (m.dateInscription||'')>=mois; }).length;
  var payes=M.filter(function(m){ return m.carte&&m.carte.paye; }).length;
  var etabs=new Set(M.map(function(m){ return norm(m.etablissement); }).filter(Boolean)).size;
  return {n:n,f:f,g:n-f,el:el,et:n-el,ages:ages,moy:moy,nouveaux:nouveaux,payes:payes,etabs:etabs,mineurs:ages.filter(function(a){ return a<18; }).length};
}
function accueilReg(){
  var M=ST.dashCell?DB.members.filter(function(m){ return m.celluleId===ST.dashCell; }):DB.members, s=statsBlock(M), cs=cumulSeries(M,12);
  var classement=DB.cells.map(function(c){ var L=DB.members.filter(function(m){ return m.celluleId===c.id; }); return [c.nom,L.length,c.id]; }).sort(function(a,b){ return b[1]-a[1]; });
  var parNiv=countBy(M,function(m){ return m.niveau; }).sort(function(a,b){ return ORDRE_NIV.indexOf(a[0])-ORDRE_NIV.indexOf(b[0]); });
  var etabMap=new Map(); M.forEach(function(m){ var k=norm(m.etablissement); if(!k) return; var e=etabMap.get(k)||[m.etablissement,0]; e[1]++; etabMap.set(k,e); });
  var topEtab=Array.from(etabMap.values()).sort(function(a,b){ return b[1]-a[1]; }).slice(0,7);
  var tr=[['Moins de 15 ans',0,14],['15 – 17 ans',15,17],['18 – 20 ans',18,20],['21 – 24 ans',21,24],['25 ans et +',25,200]].map(function(t){ return [t[0],s.ages.filter(function(a){ return a>=t[1]&&a<=t[2]; }).length]; });
  var be=M.filter(function(m){ return m.baptemeEau; }).length, bs=M.filter(function(m){ return m.baptemeEsprit; }).length;
  var c=cellById(ST.dashCell);
  var html='<div class="row between" style="margin:4px 0 16px"><div><h2 style="font-size:24px;font-weight:800">'+esc(greetLine())+'</h2><p class="mut sm" style="margin-top:4px">'+esc(U.titre)+' · '+new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+'</p></div>'+
    '<button class="chip '+(ST.dashCell?'on':'')+'" data-act="dashcell">'+I('filter')+(c?esc(c.nom):'Toute la région')+I('chevd')+'</button></div>'+
    '<div class="grid g3"><div class="hero span2"><div class="hi">'+(c?'Cellule '+esc(c.nom):'GEEADISTES recensés · Région '+esc(DB.settings.region))+'</div><div class="big" data-count="'+s.n+'">0</div><div class="cap">'+fmtN(s.el)+' élèves · '+fmtN(s.et)+' étudiants · '+s.etabs+' établissements</div><span class="pill">'+I('trend')+'+'+s.nouveaux+' ce mois-ci</span>'+sparkline(cs.vals)+
      '<div class="acts">'+(canEdit()?'<button class="btn w" data-act="newmember">'+I('userplus')+'Ajouter</button>':'')+'<button class="btn" data-act="goto" data-v="validations">'+I('inbox')+'Valider ('+scopeIns().length+')</button><button class="btn" data-act="exportall">'+I('download')+'Exporter</button></div></div>'+
    '<div class="card"><div class="card-h"><div><h3>À traiter</h3><div class="sub">Actions en attente dans la région</div></div></div>'+tasksHTML(tasksFor(M).slice(0,5))+'</div></div>'+
    '<div class="grid g4" style="margin-top:16px">'+
      kpi('layers','',ST.dashCell?(classement.findIndex(function(x){ return x[2]===ST.dashCell; })+1)+'e':DB.cells.length, ST.dashCell?'Rang sur '+DB.cells.length+' cellules':'Cellules actives')+
      kpi('heart','gold',s.n?Math.round(s.f/s.n*100):0,'Filles ('+s.f+') · '+s.g+' garçons','%')+
      kpi('wallet','blue',s.n?Math.round(s.payes/s.n*100):0,'Cartes payées ('+s.payes+')','%')+
      kpi('cake','red',s.moy.toFixed(1),'Âge moyen · '+s.mineurs+' mineurs')+'</div>'+
    '<div class="grid g3" style="margin-top:16px"><div class="card span2"><div class="card-h"><div><h3>Évolution des effectifs</h3><div class="sub">Membres cumulés sur 12 mois</div></div><span class="badge">'+I('trend')+' +'+fmtN(cs.vals[11]-cs.vals[0])+' en 12 mois</span></div><div style="padding-bottom:24px">'+areaChart(cs.vals,cs.labels)+'</div></div>'+
      '<div class="card"><div class="card-h"><h3>Garçons et filles</h3></div>'+donut([{l:'Filles',v:s.f,c:'#f4a51c'},{l:'Garçons',v:s.g,c:'#0b7a3e'}],fmtN(s.n),'membres')+'<div style="height:16px"></div>'+donut([{l:'Élèves',v:s.el,c:'#0b7a3e'},{l:'Étudiants',v:s.et,c:'#2a6fdb'}],s.n?Math.round(s.el/s.n*100)+'%':'0%','élèves')+'</div></div>'+
    '<div class="grid g2" style="margin-top:16px">'+(ST.dashCell?'':'<div class="card"><div class="card-h"><div><h3>Classement des cellules</h3><div class="sub">Par nombre de membres</div></div><a class="btn sm" href="#cellules">Tout voir</a></div>'+bars(classement.slice(0,8),{rank:1,act:'cellsheet'})+'</div>')+
      '<div class="card"><div class="card-h"><div><h3>Niveaux d\'étude</h3><div class="sub"><span class="legend"><span><i style="background:#0b7a3e"></i>Élèves</span><span><i style="background:#f4a51c"></i>Étudiants</span></span></div></div></div>'+cols(parNiv,NIVEAUX['Élève'])+'</div>'+
      '<div class="card"><div class="card-h"><h3>Établissements les plus représentés</h3></div>'+bars(topEtab)+'</div>'+
      '<div class="card"><div class="card-h"><h3>Tranches d\'âge</h3></div>'+bars(tr,{gold:1})+'<div class="sec-t">Vie spirituelle</div>'+bars([['Baptisés d\'eau',be],['Baptisés du Saint-Esprit',bs],['Engagés dans un service',M.filter(function(m){ return (m.engagements||[]).length; }).length]])+'</div></div>';
  return {html:html};
}
function kpi(icon, tone, val, label, suf){ return '<div class="card kpi"><div class="ic '+tone+'">'+I(icon)+'</div><div class="v"><span data-count="'+(typeof val==='number'||/^[\d.]+$/.test(val)?val:'')+'" data-suf="'+(suf||'')+'">'+(typeof val==='number'||/^[\d.]+$/.test(val)?'0':esc(val))+'</span></div><div class="l">'+esc(label)+'</div></div>'; }
function accueilLocal(){
  var M=scopeM(), s=statsBlock(M), c=cellById(U.celluleId)||{nom:''}, cs=cumulSeries(M,8);
  var rank=DB.cells.map(function(x){ return [x.id, DB.members.filter(function(m){ return m.celluleId===x.id; }).length]; }).sort(function(a,b){ return b[1]-a[1]; }).findIndex(function(x){ return x[0]===U.celluleId; })+1;
  var mo=new Date().getMonth()+1, anniv=M.filter(function(m){ return m.naissance&&+m.naissance.slice(5,7)===mo; }).sort(function(a,b){ return a.naissance.slice(8).localeCompare(b.naissance.slice(8)); });
  var recents=M.slice().sort(function(a,b){ return (b.dateInscription||'').localeCompare(a.dateInscription||''); }).slice(0,5);
  var parNiv=countBy(M,function(m){ return m.niveau; }).sort(function(a,b){ return ORDRE_NIV.indexOf(a[0])-ORDRE_NIV.indexOf(b[0]); });
  var ann=annoncesFor().slice(0,3);
  var html='<div style="margin:4px 0 16px"><h2 style="font-size:24px;font-weight:800">'+esc(greetLine())+'</h2><p class="mut sm" style="margin-top:4px">'+esc(U.titre)+' · Cellule '+esc(c.nom)+'</p></div>'+
    '<div class="grid g3"><div class="hero span2"><div class="hi">Cellule '+esc(c.code||'')+' · '+esc(c.nom)+'</div><div class="big" data-count="'+s.n+'">0</div><div class="cap">GEEADISTES dans votre cellule · '+rank+'e sur '+DB.cells.length+' cellules</div><span class="pill">'+I('trend')+'+'+s.nouveaux+' ce mois-ci</span>'+sparkline(cs.vals)+
      '<div class="acts">'+(canEdit()?'<button class="btn w" data-act="newmember">'+I('userplus')+'Enregistrer un GEEADISTE</button>':'')+'<button class="btn" data-act="sharelink">'+I('share')+'Lien d\'inscription</button></div></div>'+
    '<div class="card"><div class="card-h"><h3>À traiter</h3></div>'+tasksHTML(tasksFor(M))+'</div></div>'+
    '<div class="grid g4" style="margin-top:16px">'+kpi('users','',s.el,'Élèves')+kpi('cap','blue',s.et,'Étudiants')+kpi('wallet','gold',s.payes,'Cartes payées')+kpi('heart','red',scopeNotes().filter(function(n){ return n.date>=isoDay(new Date(Date.now()-30*86400000)); }).length,'Suivis ce mois')+'</div>'+
    '<div class="grid g2" style="margin-top:16px"><div class="card"><div class="card-h"><div><h3>Annonces du bureau régional</h3></div><a class="btn sm" href="#communication">Tout voir</a></div>'+(ann.length?ann.map(function(a){ return annonceCard(a); }).join(''):emptyMini('Aucune annonce.'))+'</div>'+
      '<div class="card"><div class="card-h"><div><h3>Anniversaires du mois</h3><div class="sub">'+anniv.length+' GEEADISTE(s)</div></div>'+I('cake','mut')+'</div><div class="list">'+(anniv.slice(0,6).map(function(m){ return memberLi(m,'<span class="badge gold">'+m.naissance.slice(8)+'/'+m.naissance.slice(5,7)+'</span>'); }).join('')||emptyMini('Aucun anniversaire ce mois-ci.'))+'</div></div>'+
      '<div class="card"><div class="card-h"><h3>Répartition</h3></div>'+donut([{l:'Filles',v:s.f,c:'#f4a51c'},{l:'Garçons',v:s.g,c:'#0b7a3e'}],fmtN(s.n),'membres')+'<div class="sec-t">Niveaux</div>'+cols(parNiv,NIVEAUX['Élève'])+'</div>'+
      '<div class="card"><div class="card-h"><h3>Derniers inscrits</h3><a class="btn sm" href="#membres">Tous</a></div><div class="list">'+(recents.map(function(m){ return memberLi(m); }).join('')||emptyMini('Aucun membre.'))+'</div></div></div>';
  return {html:html};
}

/* =====================================================================
   MEMBRES
   ===================================================================== */
function memberLi(m, right, sel){
  return '<div class="li '+(sel?'sel':'')+'" data-act="'+(ST.selMode?'togglesel':'member')+'" data-id="'+esc(m.id)+'">'+(ST.selMode?'<span class="ck">'+I('check')+'</span>':'')+avatar(m)+'<div class="t"><b>'+esc(fullName(m))+'</b><span><span class="mono">'+esc(m.id)+'</span> · '+esc(m.etablissement||'—')+'</span></div><div class="r">'+(right!=null?right:'<span class="badge '+(m.statut==='Étudiant'?'blue':'')+'">'+esc(m.niveau||'—')+'</span>'+(isReg()&&!m.celluleId?'<span class="badge red">Isolé</span>':''))+'</div></div>';
}
function filteredMembers(){
  var q=norm(ST.q), f=ST.f;
  var L=scopeM().filter(function(m){
    if(q&&norm([m.id,m.nom,m.prenoms,m.etablissement,m.telephone,m.filiere,m.eglise].join(' ')).indexOf(q)<0) return false;
    if(f.cell&&(f.cell==='_none'?m.celluleId:m.celluleId!==f.cell)) return false;
    if(f.statut&&m.statut!==f.statut) return false; if(f.sexe&&m.sexe!==f.sexe) return false; if(f.niveau&&m.niveau!==f.niveau) return false;
    if(f.carte==='nonpaye'&&m.carte&&m.carte.paye) return false; if(f.carte==='paye'&&!(m.carte&&m.carte.paye)) return false;
    if(f.carte==='incomplet'&&completude(m)>=70) return false;
    return true; });
  var s=ST.sort; L.sort(function(a,b){ return s==='nom'?fullName(a).localeCompare(fullName(b)):s==='id'?a.id.localeCompare(b.id):(b.dateInscription||'').localeCompare(a.dateInscription||'')||b.id.localeCompare(a.id); });
  return L;
}
RENDER.membres=function(){
  var f=ST.f, c=cellById(f.cell);
  var chip=function(on,act,label,v){ return '<button class="chip '+(on?'on':'')+'" data-act="'+act+'" '+(v!=null?'data-v="'+esc(v)+'"':'')+'>'+label+'</button>'; };
  var html='<div class="toolbar"><div class="search">'+I('search')+'<input id="mq" placeholder="Nom, identifiant, école, téléphone…" value="'+esc(ST.q)+'" aria-label="Rechercher" autocomplete="off">'+(ST.q?'<button class="btn icon ghost sm clr" data-act="clearq" aria-label="Effacer">'+I('x')+'</button>':'')+'</div>'+
    '<div class="chips">'+chip(!f.statut,'fstatut','Tous','')+chip(f.statut==='Élève','fstatut','Élèves','Élève')+chip(f.statut==='Étudiant','fstatut','Étudiants','Étudiant')+chip(f.sexe==='F','fsexe','Filles','F')+chip(f.sexe==='M','fsexe','Garçons','M')+
    chip(!!f.niveau,'fniveau',(f.niveau||'Niveau')+' '+I('chevd'))+(isReg()?chip(!!f.cell,'fcell',(f.cell==='_none'?'Sans cellule':c?esc(c.nom):'Cellule')+' '+I('chevd')):'')+chip(!!f.carte,'fcarte',({paye:'Carte payée',nonpaye:'Carte non payée',incomplet:'Fiche incomplète'}[f.carte]||'Statut')+' '+I('chevd'))+
    (f.statut||f.sexe||f.niveau||f.cell||f.carte?chip(false,'freset',I('x')+'Effacer'):'')+'</div></div>'+
    '<div class="row between" style="margin-bottom:8px"><span class="sm mut" id="mcount"></span><div class="row"><button class="btn sm ghost" data-act="sort">'+I('swap')+({recent:'Plus récents',nom:'Nom A → Z',id:'Identifiant'}[ST.sort])+'</button>'+(canEdit()?'<button class="btn sm '+(ST.selMode?'pri':'')+'" data-act="selmode">'+I('checkc')+(ST.selMode?'Terminer':'Sélectionner')+'</button>':'')+'<button class="btn sm pri dsk-only" data-act="newmember" style="'+(canEdit()?'':'display:none')+'">'+I('userplus')+'<span>Ajouter</span></button></div></div>'+
    '<div class="card" style="padding:8px 10px"><div class="list" id="mlist"></div></div>';
  return {html:html, mount:function(){ drawMembers(); var q=$('#mq'); q.oninput=function(){ ST.q=q.value; drawMembers(); }; }};
};
var PAGE=80;
function drawMembers(limit){
  var L=filteredMembers(), lim=limit||PAGE;
  $('#mcount').textContent=fmtN(L.length)+' membre'+(L.length>1?'s':'')+(L.length!==scopeM().length?' sur '+fmtN(scopeM().length):'');
  $('#mlist').innerHTML=L.length?L.slice(0,lim).map(function(m){ return memberLi(m,null,ST.sel.has(m.id)); }).join('')+(L.length>lim?'<button class="btn block ghost" data-act="more" data-v="'+(lim+PAGE)+'" style="margin-top:6px">Afficher plus ('+(L.length-lim)+')</button>':''):emptyState('search','Aucun résultat','Modifiez la recherche ou les filtres.', canEdit()?'<button class="btn pri" data-act="newmember">'+I('userplus')+'Nouveau membre</button>':'');
  drawSelbar();
}
function drawSelbar(){
  var b=$('#selbar'); if(!b) return; var n=ST.sel.size;
  b.classList.toggle('on', ST.selMode&&n>0);
  b.innerHTML='<b style="white-space:nowrap">'+n+' sélectionné'+(n>1?'s':'')+'</b>'+(isReg()?'<button class="btn sm" data-act="bulktransfer">'+I('swap')+'Transférer</button>':'')+'<button class="btn sm" data-act="bulkpaye">'+I('wallet')+'Carte payée</button><button class="btn sm" data-act="bulkwa">'+I('msg')+'Contacts</button><button class="btn sm" data-act="bulkexport">'+I('download')+'Exporter</button><button class="btn sm" data-act="bulkall">'+I('checkc')+'Tout</button>';
}

/* ---------- Fiche membre ---------- */
function openMember(id, tab){
  var m=DB.members.find(function(x){ return x.id===id; }); if(!m) return;
  var sh=openSheet({title:'Fiche membre', wide:true, focus:false, body:'<div id="mb"></div>'});
  drawMember(sh, m, tab||'profil');
}
function drawMember(sh, m, tab){
  var a=ageOf(m.naissance), wa=telIntl(m.whatsapp||m.telephone), c=cellById(m.celluleId);
  var notes=DB.notes.filter(function(n){ return n.membreId===m.id; }).sort(function(x,y){ return y.date.localeCompare(x.date); });
  var body='<div class="prof-h">'+avatar(m,'lg')+'<h2>'+esc(fullName(m))+'</h2><div class="row" style="justify-content:center;margin-top:8px"><span class="badge '+(m.sexe==='F'?'gold':'')+'">'+(m.sexe==='F'?'Fille':'Garçon')+'</span>'+(a!=null?'<span class="badge grey">'+a+' ans'+(a<18?' · mineur':'')+'</span>':'')+'<span class="badge blue">'+esc(m.statut)+' · '+esc(m.niveau)+'</span>'+(c?'':'<span class="badge red">Sans cellule</span>')+'</div><button class="idc" data-act="copy" data-v="'+esc(m.id)+'">'+I('qr')+'<span class="mono">'+esc(m.id)+'</span>'+I('copy')+'</button></div>'+
    '<div class="qa"><a href="tel:'+esc(String(m.telephone||'').replace(/\s/g,''))+'"><span class="ci">'+I('phone')+'</span>Appeler</a><a href="'+(wa?'https://wa.me/'+wa:'#')+'" target="_blank" rel="noopener"><span class="ci wa">'+I('msg')+'</span>WhatsApp</a>'+(canEdit()?'<button data-act="editmember" data-id="'+esc(m.id)+'"><span class="ci">'+I('edit')+'</span>Modifier</button>':'<button data-act="mtab" data-v="carte"><span class="ci">'+I('card')+'</span>Carte</button>')+(canEdit()?'<button data-act="addnote" data-id="'+esc(m.id)+'"><span class="ci">'+I('heart')+'</span>Suivi</button>':'<button data-act="mtab" data-v="suivi"><span class="ci">'+I('heart')+'</span>Suivi</button>')+'</div>'+
    '<div class="seg full" style="margin-bottom:16px">'+[['profil','Profil'],['suivi','Suivi ('+notes.length+')'],['carte','Carte'],['historique','Historique']].map(function(t){ return '<button class="'+(tab===t[0]?'on':'')+'" data-act="mtab" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div><div id="mtab" class="stepv">';
  if(tab==='profil'){
    var kv=function(rows){ return '<div class="card" style="padding:4px 16px"><dl class="kv">'+rows.map(function(r){ return '<dt>'+r[0]+'</dt><dd>'+(r[1]||'—')+'</dd>'; }).join('')+'</dl></div>'; };
    body+='<div class="sec-t">Scolarité</div>'+kv([['Établissement',esc(m.etablissement)],['Niveau',esc(m.niveau)],['Série / filière',esc(m.filiere)]])+
      '<div class="sec-t">Église et cellule</div>'+kv([['Cellule',c?esc(c.code+' · '+c.nom):'<span style="color:var(--red)">Non rattaché</span>'],['Église locale',esc(m.eglise)],['Baptême',[m.baptemeEau?'Eau':'',m.baptemeEsprit?'Saint-Esprit':''].filter(Boolean).join(' · ')],['Engagements',esc((m.engagements||[]).join(', '))],['Talents',esc(m.talents)]])+
      '<div class="sec-t">Contacts</div>'+kv([['Téléphone',esc(fmtTel(m.telephone))],['WhatsApp',esc(fmtTel(m.whatsapp))],['E-mail',esc(m.email)],['Commune',esc([m.commune,m.quartier].filter(Boolean).join(', '))],['Parent / tuteur',m.parentNom?esc(m.parentNom)+'<br><span class="mut">'+esc(fmtTel(m.parentTel))+'</span>':'']])+
      '<div class="sec-t">Fiche</div>'+kv([['Inscrit le',fmtD(m.dateInscription)],['Enregistré par',esc(m.creePar)],['Complétude',completude(m)+' %'],['Annuaire du réseau',m.annuaire!==false?'Visible':'Masqué']]);
    if(canEdit()) body+='<div class="row" style="margin-top:18px">'+(isReg()?'<button class="btn" data-act="transfer" data-id="'+esc(m.id)+'">'+I('swap')+'Transférer</button>':'<button class="btn" data-act="transfer" data-id="'+esc(m.id)+'">'+I('swap')+'Changer de cellule</button>')+(isReg()?'<button class="btn danger" data-act="delmember" data-id="'+esc(m.id)+'">'+I('trash')+'Supprimer</button>':'')+'</div>';
  } else if(tab==='suivi'){
    body+=(canEdit()?'<button class="btn pri block" data-act="addnote" data-id="'+esc(m.id)+'" style="margin-bottom:18px">'+I('plus')+'Ajouter une note de suivi</button>':'')+(notes.length?'<ul class="tl">'+notes.map(function(n){ return '<li><b>'+esc(n.type)+'</b><div class="m">'+fmtD(n.date)+' · '+esc(n.par)+'</div><p>'+esc(n.txt)+'</p></li>'; }).join('')+'</ul>':emptyState('heart','Aucun suivi','Les visites, appels et accompagnements apparaîtront ici.'));
  } else if(tab==='carte'){
    var k=m.carte||{paye:false,statut:'À produire'};
    body+='<div class="cardwrap">'+cardHTML(m)+'</div><div class="card" style="margin-top:16px;padding:6px 16px">'+
      '<label class="sw"><div class="t"><b>Carte payée</b><span>'+fmtN(DB.settings.prixCarte)+' F CFA</span></div><input type="checkbox" data-act="cartepaye" data-id="'+esc(m.id)+'" '+(k.paye?'checked':'')+' '+(canEdit()?'':'disabled')+'><span class="k"></span></label>'+
      '<div class="sw" style="cursor:default"><div class="t"><b>Production</b><span>Suivi de la carte PVC</span></div><div class="seg">'+STATUT_CARTE.map(function(s){ return '<button class="'+(k.statut===s?'on':'')+'" data-act="cartestatut" data-id="'+esc(m.id)+'" data-v="'+s+'" '+(canEdit()?'':'disabled')+'>'+s+'</button>'; }).join('')+'</div></div></div>'+
      '<button class="btn block" data-act="printone" data-id="'+esc(m.id)+'" style="margin-top:14px">'+I('printer')+'Imprimer la carte</button>';
  } else {
    var h=(m.historique||[]).slice().reverse();
    body+=h.length?'<ul class="tl">'+h.map(function(x){ return '<li><b>'+esc(x.champ)+'</b><div class="m">'+fmtD(x.date)+' · '+esc(x.par||'')+'</div><p>'+esc(x.de)+' → <b>'+esc(x.a)+'</b></p></li>'; }).join('')+'</ul>':emptyState('list','Aucun changement','Changements d\'école, de cellule, de niveau ou d\'église.');
  }
  body+='</div>';
  sh.querySelector('.sheet-b').innerHTML=body; sh.dataset.mid=m.id; sh.dataset.tab=tab;
  if(tab==='carte') fillQR(sh);
}
function refreshMemberSheet(){ var sh=topSheet(); if(sh&&sh.dataset.mid){ var m=DB.members.find(function(x){ return x.id===sh.dataset.mid; }); if(m) drawMember(sh,m,sh.dataset.tab); } }

/* ---------- Carte de membre ---------- */
function cardHTML(m){ var c=cellById(m.celluleId), y=new Date().getFullYear();
  return '<div class="idcard"><div class="bg"></div><div class="hd"><img src="'+LOGO+'" alt=""><div><b>GEEAD CÔTE D\'IVOIRE<br>RÉGION '+esc(String(DB.settings.region||CONFIG.region).toUpperCase())+'</b><small>Carte de membre · L\'École, Notre Champ Missionnaire</small></div></div>'+
  '<div class="bd">'+(m.photo?'<img class="ph" src="'+esc(m.photo)+'" alt="">':'<div class="ph">'+esc(initials(m))+'</div>')+'<div><div class="nm">'+esc(m.nom)+'<span>'+esc(m.prenoms)+'</span></div><div class="if"><b>Cellule</b> '+esc(c?c.code+' · '+c.nom:'—')+'<br><b>École</b> '+esc(m.etablissement)+'<br><b>Niveau</b> '+esc(m.niveau)+'<br><b>Église</b> '+esc(m.eglise)+'</div></div><div class="qr" data-qr="'+esc(m.id)+'"></div></div>'+
  '<div class="ft"><span>VALIDE '+y+' – '+(y+1)+'</span><span class="mono">'+esc(m.id)+'</span></div></div>'; }
function fillQR(root){ $$('[data-qr]',root).forEach(function(el){ el.innerHTML=''; var m=DB.members.find(function(x){ return x.id===el.dataset.qr; });
  var txt='GEEADAS|'+el.dataset.qr+'|'+(m?fullName(m):'');
  if(window.QRCode){ try{ new QRCode(el,{text:txt,width:120,height:120,colorDark:'#04331a',correctLevel:QRCode.CorrectLevel.M}); }catch(e){} } else el.innerHTML='<span class="mono" style="font-size:7px">'+esc(el.dataset.qr)+'</span>'; }); }
function printCards(list){
  if(!list.length){ toast('Aucune carte à imprimer','err'); return; }
  var z=$('#printzone'); z.innerHTML=list.map(cardHTML).join(''); fillQR(z);
  setTimeout(function(){ try{ window.print(); }catch(e){} setTimeout(function(){ z.innerHTML=''; },800); },400);
  if(IN_FRAME) toast('Aperçu : l\'impression fonctionne sur la version installée');
}

/* ---------- Assistant d'enregistrement ---------- */
function blankMember(){ return {nom:'',prenoms:'',sexe:'',naissance:'',photo:'',telephone:'',whatsapp:'',memeWa:true,email:'',commune:'',quartier:'',parentNom:'',parentTel:'',statut:'Élève',niveau:'',etablissement:'',filiere:'',eglise:'',celluleId:(U&&!isReg())?U.celluleId:'',baptemeEau:false,baptemeEsprit:false,engagements:[],talents:'',annuaire:true,consentement:false}; }
function Wizard(o){ this.o=o; this.d=Object.assign(blankMember(), JSON.parse(JSON.stringify(o.data||{}))); if(this.d.whatsapp&&this.d.whatsapp!==this.d.telephone) this.d.memeWa=false; this.i=0; this.dir=1; }
Wizard.prototype.steps=[
  {t:'Identité',h:'Qui est ce GEEADISTE ?',req:['nom','prenoms','sexe','naissance']},
  {t:'Contacts',h:'Comment le joindre ?',req:['telephone']},
  {t:'Scolarité',h:'Où étudie-t-il ?',req:['niveau','etablissement']},
  {t:'Église',h:'Vie d\'église et engagement',req:['eglise']}
];
Wizard.prototype.html=function(){
  var d=this.d, s=this.steps[this.i], pub=this.o.mode==='public', self=this;
  var inp=function(k,label,attrs,req){ return '<label class="field"><span>'+label+(req?' <i>*</i>':'')+'</span><input data-k="'+k+'" value="'+esc(d[k])+'" '+(attrs||'')+'></label>'; };
  var h='<div class="steps">'+this.steps.map(function(x,i){ return '<i class="'+(i<=self.i?'on':'')+'"></i>'; }).join('')+'</div><div class="stepv '+(this.dir<0?'back':'')+'"><div class="step-t">Étape '+(this.i+1)+' sur '+this.steps.length+' · '+s.t+'</div><div class="step-h">'+s.h+'</div>';
  if(this.i===0){
    var a=ageOf(d.naissance);
    h+='<div class="photo-up"><label>'+(d.photo?'<img src="'+esc(d.photo)+'" alt="">':I('camera'))+'<input type="file" accept="image/*" capture="user" data-photo></label><div><b>Photo d\'identité</b><p class="sm mut">Fond clair, visage dégagé. Elle figurera sur la carte de membre.</p>'+(d.photo?'<button class="btn sm ghost danger" data-wact="rmphoto" style="padding:0;margin-top:4px">Retirer</button>':'')+'</div></div>'+
      '<div class="fgrid">'+inp('nom','Nom','autocomplete="family-name" style="text-transform:uppercase"',1)+inp('prenoms','Prénoms','autocomplete="given-name"',1)+
      '<div class="full"><span class="field"><span>Sexe <i>*</i></span></span><div class="big-opt">'+[['F','Fille'],['M','Garçon']].map(function(x){ return '<button type="button" class="opt '+(d.sexe===x[0]?'on':'')+'" data-wset="sexe" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div><input type="hidden" data-k="sexe" value="'+esc(d.sexe)+'"></div>'+
      '<label class="field full"><span>Date de naissance <i>*</i></span><input type="date" data-k="naissance" value="'+esc(d.naissance)+'" max="'+today()+'"></label>'+(a!=null?'<p class="sm full" style="margin-top:-6px;color:var(--brand);font-weight:700">'+a+' ans'+(a<18?' · mineur : les coordonnées d\'un parent seront demandées':'')+'</p>':'')+'</div>';
  } else if(this.i===1){
    var mineur=(ageOf(d.naissance)||99)<18;
    h+='<div class="fgrid">'+inp('telephone','Téléphone','type="tel" inputmode="tel" autocomplete="tel" placeholder="07 00 00 00 00"',1)+
      '<div class="full card" style="padding:2px 14px;box-shadow:none"><label class="sw"><div class="t"><b>Même numéro sur WhatsApp</b><span>Pour les messages du bureau</span></div><input type="checkbox" data-kb="memeWa" '+(d.memeWa?'checked':'')+'><span class="k"></span></label></div>'+
      (d.memeWa?'':inp('whatsapp','Numéro WhatsApp','type="tel" inputmode="tel"'))+inp('email','E-mail','type="email" inputmode="email" autocomplete="email"')+inp('commune','Commune','list="dl-com"')+inp('quartier','Quartier')+
      '<datalist id="dl-com">'+['Port-Bouët','Koumassi','Marcory','Treichville','Grand-Bassam'].map(function(x){ return '<option value="'+x+'">'; }).join('')+'</datalist>'+
      (mineur?'<div class="full sec-t" style="margin:6px 0 0">Parent ou tuteur</div>'+inp('parentNom','Nom du parent / tuteur','',1)+inp('parentTel','Téléphone du parent','type="tel" inputmode="tel"',1):'')+'</div>';
  } else if(this.i===2){
    var etabs=Array.from(new Set(DB.members.map(function(m){ return m.etablissement; }).filter(Boolean))).sort();
    h+='<span class="field"><span>Statut <i>*</i></span></span><div class="big-opt" style="margin-bottom:16px">'+['Élève','Étudiant'].map(function(x){ return '<button type="button" class="opt '+(d.statut===x?'on':'')+'" data-wset="statut" data-v="'+x+'">'+I(x==='Élève'?'users':'cap')+x+'</button>'; }).join('')+'</div>'+
      '<span class="field"><span>Niveau <i>*</i></span></span><div class="opt-grid" style="margin-bottom:16px">'+NIVEAUX[d.statut].map(function(x){ return '<button type="button" class="opt '+(d.niveau===x?'on':'')+'" data-wset="niveau" data-v="'+esc(x)+'">'+esc(x)+'</button>'; }).join('')+'</div><input type="hidden" data-k="niveau" value="'+esc(d.niveau)+'">'+
      '<div class="fgrid">'+inp('etablissement','École / université','list="dl-etab" autocomplete="off" placeholder="Ex. Lycée Moderne de Koumassi"',1)+inp('filiere',d.statut==='Élève'?'Série':'Filière','placeholder="'+(d.statut==='Élève'?'Série A, C, D…':'Droit, Informatique…')+'"')+'<datalist id="dl-etab">'+etabs.map(function(x){ return '<option value="'+esc(x)+'">'; }).join('')+'</datalist></div>';
  } else {
    var cellsOpt=(isReg()||pub)?DB.cells:DB.cells.filter(function(c){ return c.id===U.celluleId; });
    h+='<div class="fgrid">'+inp('eglise','Église locale','placeholder="AD …" list="dl-egl"',1)+'<datalist id="dl-egl">'+DB.cells.map(function(c){ return '<option value="'+esc(c.eglise)+'">'; }).join('')+'</datalist>'+
      '<label class="field"><span>Cellule GEEAD</span><select data-k="celluleId" '+(!isReg()&&!pub?'disabled':'')+'>'+((isReg()||pub)?'<option value="">'+(pub?'Je ne sais pas':'Aucune (isolé)')+'</option>':'')+cellsOpt.map(function(c){ return '<option value="'+esc(c.id)+'" '+(d.celluleId===c.id?'selected':'')+'>'+esc(c.code+' · '+c.nom)+'</option>'; }).join('')+'</select></label></div>'+
      '<div class="card" style="padding:2px 14px;box-shadow:none;margin-top:16px"><label class="sw"><div class="t"><b>Baptisé(e) d\'eau</b></div><input type="checkbox" data-kb="baptemeEau" '+(d.baptemeEau?'checked':'')+'><span class="k"></span></label><label class="sw"><div class="t"><b>Baptisé(e) du Saint-Esprit</b></div><input type="checkbox" data-kb="baptemeEsprit" '+(d.baptemeEsprit?'checked':'')+'><span class="k"></span></label><label class="sw"><div class="t"><b>Visible dans l\'annuaire</b><span>Mise en relation avec d\'autres GEEADISTES</span></div><input type="checkbox" data-kb="annuaire" '+(d.annuaire?'checked':'')+'><span class="k"></span></label></div>'+
      '<span class="field" style="margin-top:16px"><span>Engagements et services</span></span><div class="chips" style="flex-wrap:wrap">'+ENGAGEMENTS.map(function(x){ return '<button type="button" class="chip '+(d.engagements.indexOf(x)>=0?'on':'')+'" data-wtog="'+esc(x)+'">'+esc(x)+'</button>'; }).join('')+'</div>'+
      '<label class="field" style="margin-top:16px"><span>Talents et compétences</span><input data-k="talents" value="'+esc(d.talents)+'" placeholder="Guitare, graphisme, informatique…"></label>'+
      (pub?'<div class="card" style="padding:2px 14px;box-shadow:none;margin-top:16px"><label class="sw"><div class="t"><b>J\'accepte l\'enregistrement de mes informations <i style="color:var(--red);font-style:normal">*</i></b><span>Utilisées uniquement par le GEEAD Abidjan Sud pour mon suivi. Pour un mineur : avec l\'accord d\'un parent.</span></div><input type="checkbox" data-kb="consentement" '+(d.consentement?'checked':'')+'><span class="k"></span></label></div>':'');
  }
  return h+'</div>';
};
Wizard.prototype.foot=function(){ var last=this.i===this.steps.length-1;
  return (this.i>0?'<button class="btn" data-wact="prev">'+I('chevl')+'Retour</button>':(this.o.mode==='public'?'':'<button class="btn" data-act="closesheet">Annuler</button>'))+
    '<button class="btn pri" data-wact="'+(last?'submit':'next')+'">'+(last?I('check')+(this.o.submitLabel||'Enregistrer'):'Continuer'+I('chevr'))+'</button>'; };
Wizard.prototype.mount=function(body, foot){
  var self=this; this.body=body; this.footEl=foot;
  body.innerHTML=this.html(); foot.innerHTML=this.foot();
  body.oninput=function(e){ var k=e.target.dataset.k; if(k){ self.d[k]=e.target.value; e.target.classList.remove('err'); } };
  body.onchange=async function(e){ var t=e.target;
    if(t.dataset.kb){ self.d[t.dataset.kb]=t.checked; haptic(); if(t.dataset.kb==='memeWa') self.redraw(true); }
    if(t.dataset.k==='naissance'){ self.d.naissance=t.value; self.redraw(true); }
    if(t.dataset.k==='celluleId'){ self.d.celluleId=t.value; var c=cellById(t.value); if(c&&!self.d.eglise){ self.d.eglise=c.eglise; self.redraw(true); } }
    if(t.dataset.photo!==undefined&&t.files[0]){ try{ self.d.photo=await resizePhoto(t.files[0]); haptic('success'); self.redraw(true); }catch(er){ toast('Photo illisible','err'); } } };
  body.onclick=function(e){ var b=e.target.closest('[data-wset],[data-wtog],[data-wact]'); if(!b) return;
    if(b.dataset.wset){ self.d[b.dataset.wset]=b.dataset.v; if(b.dataset.wset==='statut'&&NIVEAUX[b.dataset.v].indexOf(self.d.niveau)<0) self.d.niveau=''; self.redraw(true); }
    if(b.dataset.wtog){ var a=self.d.engagements, v=b.dataset.wtog; self.d.engagements=a.indexOf(v)>=0?a.filter(function(x){ return x!==v; }):a.concat([v]); b.classList.toggle('on'); }
    if(b.dataset.wact==='rmphoto'){ self.d.photo=''; self.redraw(true); } };
  foot.onclick=function(e){ var b=e.target.closest('[data-wact]'); if(!b) return; var a=b.dataset.wact;
    if(a==='prev'){ self.i--; self.dir=-1; self.redraw(); }
    if(a==='next'){ if(self.check()){ self.i++; self.dir=1; self.redraw(); } }
    if(a==='submit'){ if(self.check()) self.submit(b); } };
};
Wizard.prototype.redraw=function(keep){ var y=this.body.scrollTop; var dir=this.dir; if(keep) this.dir=0; this.body.innerHTML=this.html(); this.footEl.innerHTML=this.foot(); this.dir=dir; if(keep){ this.body.scrollTop=y; var sv=this.body.querySelector('.stepv'); if(sv) sv.style.animation='none'; } else { this.body.scrollTop=0; if(this.o.mode==='public') window.scrollTo({top:0,behavior:'smooth'}); } };
Wizard.prototype.check=function(){ var d=this.d, s=this.steps[this.i], miss=s.req.filter(function(k){ return !String(d[k]||'').trim(); });
  if(this.i===1&&(ageOf(d.naissance)||99)<18){ ['parentNom','parentTel'].forEach(function(k){ if(!String(d[k]||'').trim()) miss.push(k); }); }
  if(this.i===3&&this.o.mode==='public'&&!d.consentement){ toast('Merci d\'accepter l\'enregistrement de vos informations','err'); return false; }
  if(this.i===1&&d.telephone.replace(/\D/g,'').length<8){ miss.push('telephone'); }
  var self=this;
  miss.forEach(function(k){ var el=self.body.querySelector('[data-k="'+k+'"]'); if(el){ if(el.type==='hidden'){ var p=el.previousElementSibling; if(p){ p.style.animation='shake .35s'; setTimeout(function(){ p.style.animation=''; },400); } } else { el.classList.remove('err'); void el.offsetWidth; el.classList.add('err'); } } });
  if(miss.length){ toast('Complétez les champs obligatoires','err'); var f=self.body.querySelector('.err'); if(f) f.focus(); return false; }
  return true; };
Wizard.prototype.submit=async function(btn){ btn.disabled=true; btn.innerHTML='<span>Enregistrement…</span>'; var d=Object.assign({},this.d);
  d.nom=d.nom.trim().toUpperCase(); d.prenoms=d.prenoms.trim(); if(d.memeWa) d.whatsapp=d.telephone; delete d.memeWa;
  try{ await this.o.onSubmit(d); }catch(er){ console.error(er); toast('Erreur : '+(er.message||er),'err'); btn.disabled=false; btn.innerHTML=I('check')+'Réessayer'; } };

function openWizard(member, opts){
  opts=opts||{}; var isNew=!member||!member.id||opts.fromIns;
  var sh=openSheet({title:opts.title||(isNew?'Nouveau GEEADISTE':'Modifier la fiche'), focus:false, body:'', foot:' '});
  var w=new Wizard({data:member, mode:opts.mode||'staff', submitLabel:opts.submitLabel||(isNew?'Enregistrer et générer l\'ID':'Enregistrer'), onSubmit: async function(d){
    if(isNew){
      var m=Object.assign(d,{id:'',historique:[],carte:{paye:false,statut:'À produire'},dateInscription:today(),creePar:U.nom});
      delete m.consentement; if(opts.fromIns){ m.consentement=true; }
      m=await Store.save('members', m);
      if(opts.fromIns){ await Store.remove('inscriptions', opts.fromIns); log('Inscription validée', m.id+' · '+fullName(m), m.celluleId); }
      else log('Membre ajouté', m.id+' · '+fullName(m), m.celluleId);
      showSuccess(sh, m);
    } else {
      var old=DB.members.find(function(x){ return x.id===member.id; }); var res=Object.assign({},old,d); res.historique=(old.historique||[]).slice();
      [['celluleId','Cellule'],['etablissement','Établissement'],['niveau','Niveau'],['eglise','Église']].forEach(function(p){ if((old[p[0]]||'')!==(res[p[0]]||'')) res.historique.push({date:today(),champ:p[1],de:p[0]==='celluleId'?cellName(old[p[0]]):(old[p[0]]||'—'),a:p[0]==='celluleId'?cellName(res[p[0]]):(res[p[0]]||'—'),par:U.nom}); });
      await Store.save('members', res); log('Fiche modifiée', res.id+' · '+fullName(res), res.celluleId);
      closeSheet(); toast('Fiche mise à jour'); rerenderSoft(); refreshMemberSheet();
    } } });
  if(!isNew) w.steps=w.steps; // l'édition garde l'assistant (navigation libre)
  w.mount(sh.querySelector('.sheet-b'), sh.querySelector('.sheet-f'));
}
function showSuccess(sh, m){
  confetti(); haptic('success');
  sh.querySelector('.sheet-h h2').textContent='GEEADISTE enregistré';
  sh.querySelector('.sheet-b').innerHTML='<div class="success"><div class="ok"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2 style="font-size:22px;font-weight:800">'+esc(fullName(m))+'</h2><p class="mut" style="margin-top:6px">Identifiant unique attribué automatiquement</p><div class="idbig mono">'+esc(m.id)+'</div><div class="cardwrap">'+cardHTML(m)+'</div></div>';
  sh.querySelector('.sheet-f').innerHTML='<button class="btn" data-act="newmember-again">'+I('userplus')+'Ajouter un autre</button><button class="btn pri" data-act="member-from-success" data-id="'+esc(m.id)+'">Voir la fiche'+I('chevr')+'</button>';
  sh.querySelector('.sheet-f').onclick=null; fillQR(sh); rerenderSoft();
}
function rerenderSoft(){ var v=curView(); if(v==='membres'&&$('#mlist')) drawMembers(); else if(!sheetStack.length||true){ var r=RENDER[v]&&RENDER[v](); if(r&&$('.content .view')){ var keep=sheetStack.slice(); $('.content .view').innerHTML=(Store.mode==='demo'?'<div class="demo-banner">'+I('sparkle')+'<span><b>Démonstration</b> — données fictives, enregistrées sur cet appareil uniquement.</span></div>':'')+r.html; $('.content .view').style.animation='none'; if(r.mount) r.mount(); countUp($('.content')); } }
  // badges de navigation
  var n=scopeIns().length; $$('.sb-link[href="#validations"] .cnt, .bnav a[href="#validations"] .dot').forEach(function(e){ if(n) e.textContent=n; else e.remove(); }); }

/* ---------- Note de suivi ---------- */
function openNote(id){
  var m=DB.members.find(function(x){ return x.id===id; });
  var sh=openSheet({title:'Note de suivi', auto:true, body:'<div class="li" style="cursor:default;padding:0 0 14px">'+avatar(m)+'<div class="t"><b>'+esc(fullName(m))+'</b><span>'+esc(m.id)+'</span></div></div><span class="field"><span>Type</span></span><div class="chips" style="flex-wrap:wrap;margin-bottom:14px" id="ntypes">'+TYPES_SUIVI.map(function(t,i){ return '<button type="button" class="chip '+(i===0?'on':'')+'" data-v="'+esc(t)+'">'+esc(t)+'</button>'; }).join('')+'</div><label class="field"><span>Note</span><textarea id="ntxt" placeholder="Ce qui a été fait, besoins exprimés, prochaine étape…"></textarea></label>',
    foot:'<button class="btn" data-act="closesheet">Annuler</button><button class="btn pri" id="nsave">'+I('check')+'Enregistrer</button>'});
  var type=TYPES_SUIVI[0];
  sh.querySelector('#ntypes').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; type=b.dataset.v; $$('#ntypes .chip').forEach(function(c){ c.classList.toggle('on',c===b); }); };
  sh.querySelector('#nsave').onclick=async function(){ var t=sh.querySelector('#ntxt').value.trim(); if(!t){ sh.querySelector('#ntxt').classList.add('err'); toast('Écrivez la note','err'); return; }
    await Store.save('notes',{membreId:m.id,celluleId:m.celluleId||'',type:type,txt:t,date:today(),par:U.nom}); log('Suivi ajouté', m.id+' · '+type, m.celluleId);
    closeSheet(); toast('Note de suivi enregistrée'); var s=topSheet(); if(s&&s.dataset.mid){ s.dataset.tab='suivi'; refreshMemberSheet(); } else rerenderSoft(); };
}
